import { createClient, createServiceClient } from '@/lib/supabase/server'
import { buildTask, runAgentSession } from '@/lib/anthropic'
import { NextResponse } from 'next/server'

export const maxDuration = 300

const FAL_DOMAINS = ['fal.media', 'fal.run', 'cdn.fal.ai']

function isFalUrl(url: string): boolean {
  return FAL_DOMAINS.some(d => url.includes(d))
}

function extractMediaUrls(sources: string[], extensions: string[]): string[] {
  const seen = new Set<string>()
  const results: string[] = []
  for (const text of sources) {
    const urls = text.match(/https?:\/\/[^\s"'<>)\]\\]+/g) ?? []
    for (const url of urls) {
      const clean = url.split('?')[0].toLowerCase().split('#')[0]
      if (extensions.some(ext => clean.endsWith(`.${ext}`)) && isFalUrl(url) && !seen.has(url)) {
        seen.add(url)
        results.push(url)
      }
    }
  }
  return results
}

// Parse URLs from the structured block the agent writes at the end of its response
function parseStructuredMedia(output: string): { images: string[]; videos: string[] } {
  const images: string[] = []
  const videos: string[] = []

  const imgBlock = output.match(/ÜRETİLEN_GÖRSELLER:\s*([\s\S]*?)(?=ÜRETİLEN_VİDEOLAR:|$)/i)
  const vidBlock = output.match(/ÜRETİLEN_VİDEOLAR:\s*([\s\S]*?)$/i)

  const extractUrls = (block: string) =>
    (block.match(/https?:\/\/[^\s"'<>)\]\\]+/g) ?? []).filter(isFalUrl)

  if (imgBlock?.[1]) images.push(...extractUrls(imgBlock[1]))
  if (vidBlock?.[1]) videos.push(...extractUrls(vidBlock[1]))

  return { images, videos }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = await createServiceClient()

  const { data: job } = await service
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!job) return NextResponse.json({ error: 'İş bulunamadı' }, { status: 404 })

  // Atomic status geçişi: yalnızca status='pending' olan satırı günceller.
  // İki eşzamanlı istek gelirse biri null döner → çift çalışma engellenir.
  const { data: claimed } = await service
    .from('jobs')
    .update({ status: 'running' })
    .eq('id', id)
    .eq('status', 'pending')
    .select('id')
    .single()

  if (!claimed) {
    return NextResponse.json({ error: 'Bu iş zaten çalıştırıldı' }, { status: 400 })
  }

  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  const send = async (data: object) => {
    await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
  }

  ;(async () => {
    try {
      // status zaten 'running' olarak işaretlendi (yukarıda atomic olarak)
      await send({ type: 'status', status: 'running', message: 'Agent başlatılıyor...' })

      const input = job.type === 'url' ? job.input_url! : job.input_file_url!
      const task = buildTask(job.type, input)

      const { sessionId, output } = await runAgentSession(
        task,
        async (message) => { await send({ type: 'log', message }) }
      )

      // Primary: parse the structured block the agent writes at the end of its response
      const structured = parseStructuredMedia(output)
      // Fallback: scan the full output text for fal.ai URLs (filter applied inside extractMediaUrls)
      const imageUrls = structured.images.length
        ? structured.images
        : extractMediaUrls([output], ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'])
      const videoUrls = structured.videos.length
        ? structured.videos
        : extractMediaUrls([output], ['mp4', 'webm', 'mov'])

      const result: Record<string, any> = { raw_output: output }
      if (imageUrls.length > 0) result.images = imageUrls
      if (videoUrls.length > 0) result.videos = videoUrls

      await service
        .from('jobs')
        .update({ status: 'completed', session_id: sessionId, result })
        .eq('id', id)

      await send({ type: 'status', status: 'completed', message: 'Tamamlandı!' })
      await send({ type: 'result', result })
    } catch (err: any) {
      const msg = err?.message ?? 'Bilinmeyen hata'
      await service
        .from('jobs')
        .update({ status: 'failed', error_message: msg })
        .eq('id', id)

      const { data: credits } = await service
        .from('credits')
        .select('balance')
        .eq('user_id', user.id)
        .single()
      if (credits) {
        await service
          .from('credits')
          .update({ balance: credits.balance + 1, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
      }
      await send({ type: 'status', status: 'failed', message: msg })
    } finally {
      await send({ type: 'done' })
      await writer.close()
    }
  })()

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
