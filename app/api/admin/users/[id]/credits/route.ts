import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null
  return user
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { amount } = await request.json()

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Geçerli bir artırma miktarı girin' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: current } = await admin.from('credits').select('balance').eq('user_id', id).single()
  const newBalance = (current?.balance ?? 0) + amount

  await admin.from('credits').upsert({
    user_id: id,
    balance: newBalance,
    updated_at: new Date().toISOString(),
  })

  await admin.from('transactions').insert({
    user_id: id,
    credits: amount,
    amount_try: amount * 150,
    description: `Admin: +${amount} kredi eklendi`,
    status: 'completed',
  })

  return NextResponse.json({ success: true, new_balance: newBalance })
}
