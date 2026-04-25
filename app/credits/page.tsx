import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreditsClient from '@/components/credits/CreditsClient'

export default async function CreditsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [creditsRes, transactionsRes] = await Promise.all([
    supabase.from('credits').select('balance').eq('user_id', user.id).single(),
    supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
  ])

  return (
    <CreditsClient
      initialBalance={creditsRes.data?.balance ?? 0}
      transactions={transactionsRes.data ?? []}
    />
  )
}
