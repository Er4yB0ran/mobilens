import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreateJobForm from '@/components/dashboard/CreateJobForm'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [creditsRes, jobsRes] = await Promise.all([
    supabase.from('credits').select('balance').eq('user_id', user.id).single(),
    supabase.from('jobs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
  ])

  const credits = creditsRes.data?.balance ?? 0
  const jobs = jobsRes.data ?? []

  return (
    <DashboardClient credits={credits} jobs={jobs} />
  )
}
