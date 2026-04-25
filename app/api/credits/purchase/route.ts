import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const amount = Number(body.amount) // number of credits to purchase
  if (!amount || amount < 1 || amount > 100) {
    return NextResponse.json({ error: 'Geçersiz miktar' }, { status: 400 })
  }

  const totalTry = amount * 150

  // Mock payment: always succeeds
  const service = await createServiceClient()

  // Record transaction
  await service.from('transactions').insert({
    user_id: user.id,
    credits: amount,
    amount_try: totalTry,
    description: `${amount} kredi satın alma (mock ödeme)`,
    status: 'completed',
  })

  // Update balance
  const { data: current } = await service
    .from('credits')
    .select('balance')
    .eq('user_id', user.id)
    .single()

  await service
    .from('credits')
    .update({ balance: (current?.balance ?? 0) + amount, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  return NextResponse.json({ success: true, added: amount, total_try: totalTry })
}
