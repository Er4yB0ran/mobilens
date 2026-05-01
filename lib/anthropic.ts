import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const AGENT_ID = process.env.ANTHROPIC_AGENT_ID!
const ENVIRONMENT_ID = process.env.ANTHROPIC_ENVIRONMENT_ID

const SESSION_TIMEOUT_MS = 270_000 // 4.5 min — leaves 30s for DB cleanup before Vercel's 300s limit

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
    let toolCallActive = false  // true after tool_use, false after next agent.message

    for await (const event of stream) {
      const type = event?.type as string | undefined
      if (!type) continue

      if (type === 'agent.tool_use' || type === 'agent.mcp_tool_use') {
        toolCallActive = true
        // Tool calls intentionally not logged — only agent text is shown in the right panel
      } else if (type === 'agent.message') {
        toolCallActive = false  // agent responded — tool cycle complete
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
          throw new Error(`Session hatası: ${(event as any).error?.message ?? (event as any).message ?? type}`)
        }
        // Terminal states — exit immediately
        if (type === 'session.status_terminated' || type === 'session.deleted') {
          break
        }
        // session.status_idle = agent finished its turn.
        // Only break if no tool call is in-flight — a bash error can trigger session.status_idle
        // before the agent processes the tool result and sends its recovery message.
        // If toolCallActive, arm the watchdog and keep listening for the agent's next message.
        if (type === 'session.status_idle') {
          if (hasOutput && !toolCallActive) { idleWithOutputResolve!(); break }
          idleResolve!()  // start 20s countdown
        }
      }
    }
    return 'done' as const
  })()

  const raceResult = await Promise.race([streamPromise, timeoutPromise, idleWatchdog, idleWithOutputDone])

  if (raceResult === 'timeout') {
    // If the agent accumulated output before timing out (e.g. image URL + kling_request_id),
    // treat it as a partial success so the results are not lost.
    if (output.trim()) {
      return { sessionId, output, collectedUrls: [] }
    }
    throw new Error('Agent zaman aşımına uğradı. Lütfen tekrar deneyin.')
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

// Agent must NOT wait for Kling video — it takes 5-15 min and would timeout the session.
// Instead, capture the request_id so the server can poll Kling separately.
const URL_LISTING = `\n\nSON ADIM — ZORUNLU: Tüm işlemler bitince yanıtının EN SONUNA şu formatı AYNEN ekle.\nÖNEMLİ: Kling video asenkron işleniyor — URL bekleme, sadece request_id'yi yaz:\n\nÜRETİLEN_GÖRSELLER:\n<her üretilen görsel URL'si ayrı satırda>\n\nKLING_REQUEST_ID:\n<video_uret() sonucundaki request_id değeri, video gönderilmediyse "yok">`

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
