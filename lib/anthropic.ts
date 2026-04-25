import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const AGENT_ID = process.env.ANTHROPIC_AGENT_ID!
const ENVIRONMENT_ID = process.env.ANTHROPIC_ENVIRONMENT_ID

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
  const collectedUrls: string[] = []

  for await (const event of stream) {
    const type = event?.type as string | undefined
    if (!type) continue

    // Scan every event's JSON for media URLs (tool results carry FAL URLs)
    try {
      const raw = JSON.stringify(event)
      const found = raw.match(/https?:\/\/[^\s"'\\]+/g) ?? []
      collectedUrls.push(...found)
    } catch {}

    if (type === 'agent.tool_use' || type === 'agent.mcp_tool_use') {
      await onLog(toolLabel(event.name ?? ''))
    } else if (type === 'agent.message') {
      output = (event.content as Array<{ text: string }>)
        ?.map((c) => c.text)
        .join('') ?? ''
    } else if (
      type === 'session.status_idle' ||
      type === 'session.status_terminated' ||
      type === 'session.deleted' ||
      type === 'session.error'
    ) {
      break
    }
  }

  return { sessionId, output, collectedUrls }
}

function toolLabel(name: string): string {
  const map: Record<string, string> = {
    urun_bilgisi_cek: 'Ürün bilgisi çekiliyor...',
    urun_analiz_et: 'Ürün analiz ediliyor...',
    reklam_metni_olustur: 'Reklam metinleri yazılıyor...',
    gorsel_uret: 'Görseller üretiliyor...',
    video_uret: 'Video üretiliyor...',
    tam_kampanya_olustur: 'Tam kampanya oluşturuluyor...',
    manuel_kampanya_olustur: 'Manuel kampanya oluşturuluyor...',
  }
  return map[name] ?? `${name} çalışıyor...`
}

const AUTO_PROCEED = `\n\nÖNEMLİ: Bu istek otomatik SaaS sisteminden geliyor. Kullanıcıdan onay BEKLEME — ürünü bulduktan hemen sonra fotoğraf ve video üretimine geç.`

export function buildTask(type: 'url' | 'upload', input: string): string {
  if (type === 'url') {
    return (
      `Ürün URL: ${input}\n\n` +
      `Sadece bu ürün için aşağıdakileri üret:\n` +
      `1. 1 adet lifestyle fotoğrafı (ürünü gerçek ortamda gösteren)\n` +
      `2. 1 adet video thumbnail görseli\n` +
      `3. 1 adet kısa tanıtım videosu\n\n` +
      `Başka ürün ekleme, karşılaştırma yapma. Yalnızca bu ürünü işle.` +
      AUTO_PROCEED
    )
  }
  return (
    `Ürün görseli: ${input}\n\n` +
    `Sadece bu ürün için aşağıdakileri üret:\n` +
    `1. 1 adet lifestyle fotoğrafı (ürünü gerçek ortamda gösteren)\n` +
    `2. 1 adet video thumbnail görseli\n` +
    `3. 1 adet kısa tanıtım videosu\n\n` +
    `Başka ürün ekleme, karşılaştırma yapma. Yalnızca bu ürünü işle.` +
    AUTO_PROCEED
  )
}
