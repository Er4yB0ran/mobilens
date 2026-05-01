import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const FAL_KEY = process.env.FAL_KEY!
const KLING_MODEL = 'fal-ai/kling-video/v2.1/pro/image-to-video'

async function fetchKlingStatus(requestId: string): Promise<{ status: string; video_url: string }> {
  const url = `https://queue.fal.run/${KLING_MODEL}/requests/${requestId}/status`
  const res = await fetch(url, {
    headers: { Authorization: `Key ${FAL_KEY}` },
    cache: 'no-store',
  })
  if (!res.ok) return { status: 'unknown', video_url: '' }

  const data = await res.json()
  const statusStr = (data?.status ?? '').toUpperCase()

  if (statusStr === 'COMPLETED') {
    // Fetch the result to get the video URL
    const resultRes = await fetch(`https://queue.fal.run/${KLING_MODEL}/requests/${requestId}`, {
      headers: { Authorization: `Key ${FAL_KEY}` },
      cache: 'no-store',
    })
    if (!resultRes.ok) return { status: 'completed', video_url: '' }
    const result = await resultRes.json()
    const videoUrl =
      result?.video?.url ?? result?.video_url ?? result?.url ?? ''
    return { status: 'completed', video_url: videoUrl }
  }

  if (statusStr === 'FAILED' || statusStr === 'ERROR') {
    return { status: 'failed', video_url: '' }
  }

  return { status: 'in_progress', video_url: '' }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = await createServiceClient()
  const { data: job } = await service
    .from('jobs')
    .select('id, result, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!job) return NextResponse.json({ error: 'İş bulunamadı' }, { status: 404 })

  const requestId: string = job.result?.kling_request_id ?? ''
  if (!requestId) {
    return NextResponse.json({ status: 'no_request_id' })
  }

  // If video URL already stored, return it immediately
  if (job.result?.videos?.length > 0) {
    return NextResponse.json({ status: 'completed', video_url: job.result.videos[0] })
  }

  const kling = await fetchKlingStatus(requestId)

  if (kling.status === 'completed' && kling.video_url) {
    // Persist video URL to DB
    const updatedResult = {
      ...job.result,
      videos: [kling.video_url],
    }
    await service
      .from('jobs')
      .update({ result: updatedResult })
      .eq('id', id)

    return NextResponse.json({ status: 'completed', video_url: kling.video_url })
  }

  return NextResponse.json({ status: kling.status })
}
