import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = await createServiceClient()

  // Check credits
  const { data: credits } = await service
    .from('credits')
    .select('balance')
    .eq('user_id', user.id)
    .single()

  if (!credits || credits.balance < 1) {
    return NextResponse.json({ error: 'Yetersiz kredi bakiyesi' }, { status: 402 })
  }

  const body = await request.json()
  const { type, input_url, input_file_url } = body

  if (type === 'url' && !input_url) {
    return NextResponse.json({ error: 'URL gerekli' }, { status: 400 })
  }
  if (type === 'upload' && !input_file_url) {
    return NextResponse.json({ error: 'Görsel URL gerekli' }, { status: 400 })
  }

  // Deduct 1 credit immediately
  await service
    .from('credits')
    .update({ balance: credits.balance - 1, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  // Create job record
  const { data: job } = await service
    .from('jobs')
    .insert({
      user_id: user.id,
      type,
      input_url: input_url ?? null,
      input_file_url: input_file_url ?? null,
      status: 'pending',
      credits_used: 1,
    })
    .select()
    .single()

  return NextResponse.json({ job_id: job!.id })
}
