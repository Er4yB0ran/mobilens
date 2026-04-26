import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const AGENT_ID = process.env.ANTHROPIC_AGENT_ID!
const ENVIRONMENT_ID = process.env.ANTHROPIC_ENVIRONMENT_ID

const SESSION_TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes

export async function runAgentSession(
  task: string,
  onLog: (message: string) => Promise<void>
): Promise<{ sessionId: string; output: string; collectedUrls: string[] }> {
  const createParams: any = { agent: AGENT_ID }
  if (ENVIRONMENT_ID) createParams.environment_id = ENVIRONMENT_ID

  const session = await (anthropic.beta.sessions as any).create(createParams)
  const sessionId: string = session.id
  await onLog(`Session: ${sessionId}`)

  // Open stream before sending message so no events are missed
  const stream = await (anthropic.beta.sessions.events as any).stream(sessionId)

  await (anthropic.beta.sessions.events as any).send(sessionId, {
    events: [{
      type: 'user.message',
      content: [{ type: 'text', text: task }],
    }],
  })

  let output = ''
  let hasOutput = false
  let idleResolve: (() => void) | null = null
  // Fires 20s after session.idle if we still have no output — avoids hanging forever
  const idleWatchdog = new Promise<'idle-timeout'>((resolve) => {
    idleResolve = () => setTimeout(() => resolve('idle-timeout'), 20_000)
  })

  // Fast-path: resolves immediately when session.idle fires WITH output already collected.
  // Guards against for-await cleanup hanging after break (iterator.return() can block on some
  // SDK versions), which would cause runAgentSession to never return and the SSE stream to stay open.
  let idleWithOutputResolve: (() => void) | null = null
  const idleWithOutputDone = new Promise<'done'>((resolve) => {
    idleWithOutputResolve = () => resolve('done')
  })

  const timeoutPromise = new Promise<'timeout'>((resolve) =>
    setTimeout(() => resolve('timeout'), SESSION_TIMEOUT_MS)
  )

  const streamPromise = (async () => {
    for await (const event of stream) {
      const type = event?.type as string | undefined
      if (!type) continue

      if (type === 'agent.tool_use' || type === 'agent.mcp_tool_use') {
        // Tool calls intentionally not logged — only agent text is shown in the right panel
      } else if (type === 'agent.message') {
        // Content may be Array<{type,text}> or plain string depending on SDK version
        const content = (event as any).content
        let text = ''
        if (Array.isArray(content)) {
          text = content.map((c: any) => c.text ?? '').join('')
        } else if (typeof content === 'string') {
          text = content
        }
        if (text) {
          // Send the first meaningful line so the right panel shows agent narration
          const firstLine = text.split(/\r?\n/).find(l => l.trim())?.trim()
          if (firstLine) await onLog(firstLine.slice(0, 150))
          output = text
          hasOutput = true
        }
      } else if (type.startsWith('session.')) {
        if (type === 'session.error') {
          throw new Error(`Session hatası: ${(event as any).message ?? type}`)
        }
        // Terminal states — exit immediately
        if (type === 'session.terminated' || type === 'session.deleted' || type === 'session.interrupted') {
          break
        }
        // session.idle = agent finished its turn. If we have output, done. Otherwise arm watchdog.
        if (type === 'session.idle') {
          if (hasOutput) { idleWithOutputResolve!(); break }
          idleResolve!()  // start 20s countdown
        }
      }
    }
    return 'done' as const
  })()

  const raceResult = await Promise.race([streamPromise, timeoutPromise, idleWatchdog, idleWithOutputDone])

  if (raceResult === 'timeout') {
    throw new Error('Agent zaman aşımına uğradı (15 dakika). Lütfen tekrar deneyin.')
  }

  if (!output.trim()) {
    const reason = raceResult === 'idle-timeout'
      ? 'Agent session tamamlandı ancak metin yanıtı alınamadı (session.idle sonrası 20s beklendi).'
      : 'Agent yanıt üretmedi — session beklenmedik şekilde kapandı.'
    throw new Error(`${reason} Lütfen tekrar deneyin.`)
  }

  return { sessionId, output, collectedUrls: [] }
}

const AUTO_PROCEED = `\n\nÖNEMLİ: Bu istek otomatik SaaS sisteminden geliyor. Kullanıcıdan onay BEKLEME — ürünü bulduktan hemen sonra fotoğraf ve video üretimine geç.`

const URL_LISTING = `\n\nSON ADIM — ZORUNLU: Tüm işlemler bitince yanıtının EN SONUNA şu formatı AYNEN ekle (başka URL ekleme, sadece fal.ai tarafından üretilenleri yaz):\n\nÜRETİLEN_GÖRSELLER:\n<her üretilen görsel URL'si ayrı satırda>\n\nÜRETİLEN_VİDEOLAR:\n<video URL'si>`

export function buildTask(type: 'url' | 'upload', input: string): string {
  if (type === 'url') {
    return (
      `Ürün URL: ${input}\n\n` +
      `Sadece bu ürün için aşağıdakileri üret:\n` +
      `1. 1 adet lifestyle fotoğrafı (ürünü gerçek ortamda gösteren)\n` +
      `2. 1 adet kısa tanıtım videosu\n\n` +
      `Başka ürün ekleme, karşılaştırma yapma. Yalnızca bu ürünü işle.` +
      AUTO_PROCEED +
      URL_LISTING
    )
  }
  return (
    `Ürün görseli: ${input}\n\n` +
    `Sadece bu ürün için aşağıdakileri üret:\n` +
    `1. 1 adet lifestyle fotoğrafı (ürünü gerçek ortamda gösteren)\n` +
    `2. 1 adet kısa tanıtım videosu\n\n` +
    `Başka ürün ekleme, karşılaştırma yapma. Yalnızca bu ürünü işle.` +
    AUTO_PROCEED +
    URL_LISTING
  )
}
