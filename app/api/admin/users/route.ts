import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null
  return user
}

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: { users }, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: credits } = await admin.from('credits').select('user_id, balance')
  const creditMap = Object.fromEntries((credits ?? []).map(c => [c.user_id, c.balance]))

  const result = users.map(u => ({
    id: u.id,
    email: u.email ?? '',
    full_name: (u.user_metadata?.full_name as string) ?? '',
    created_at: u.created_at,
    credits: creditMap[u.id] ?? 0,
  }))

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, password, full_name, initial_credits } = await request.json()
  if (!email || !password) return NextResponse.json({ error: 'E-posta ve şifre gerekli' }, { status: 400 })

  const admin = createAdminClient()

  const { data: { user }, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name ?? '' },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!user) return NextResponse.json({ error: 'Kullanıcı oluşturulamadı' }, { status: 500 })

  const credits = parseInt(initial_credits) || 0
  if (credits > 0) {
    await admin.from('credits').upsert({ user_id: user.id, balance: credits, updated_at: new Date().toISOString() })
    await admin.from('transactions').insert({
      user_id: user.id,
      credits,
      amount_try: credits * 150,
      description: 'Admin tarafından oluşturuldu',
      status: 'completed',
    })
  }

  return NextResponse.json({ success: true, user_id: user.id })
}
