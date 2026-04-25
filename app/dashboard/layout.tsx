import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: credits } = await supabase
    .from('credits')
    .select('balance')
    .eq('user_id', user.id)
    .single()

  const isAdmin = user.email === process.env.ADMIN_EMAIL

  return (
    <AppShell credits={credits?.balance ?? 0} isAdmin={isAdmin}>
      {children}
    </AppShell>
  )
}
