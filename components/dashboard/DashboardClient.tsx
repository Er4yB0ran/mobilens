'use client'

import { useState } from 'react'
import { Job } from '@/lib/types'
import CreateJobForm from './CreateJobForm'
import JobPanel from './JobPanel'

interface Props {
  credits: number
  jobs: Job[]
}

export default function DashboardClient({ credits, jobs }: Props) {
  const [currentCredits, setCurrentCredits] = useState(credits)
  const [activeJobId, setActiveJobId] = useState<string | undefined>()

  function handleJobCreated(jobId: string) {
    setCurrentCredits(prev => prev - 1)
    setActiveJobId(jobId)
  }

  return (
    <div className="h-full flex flex-col min-h-0 p-5 lg:p-7 gap-6">

      {/* Page header */}
      <div className="flex-shrink-0 flex items-end justify-between gap-4 border-b border-white/8 pb-5">
        <div>
          <p className="text-xs font-mono text-primary uppercase tracking-widest mb-2">Kampanyalar</p>
          <h1 className="text-2xl font-black tracking-tight">Reklam İçerikleri</h1>
        </div>
        <div className="hidden lg:flex items-center gap-2 pb-1">
          <span className="relative flex items-center justify-center w-2 h-2 flex-shrink-0">
            <span className="absolute w-2 h-2 rounded-full bg-primary animate-ping opacity-60" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block glow-primary-sm" />
          </span>
          <span className="text-xs font-mono font-bold text-primary">Sistem aktif</span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0">
        <div className="lg:w-80 xl:w-[360px] flex-shrink-0">
          <CreateJobForm credits={currentCredits} onJobCreated={handleJobCreated} />
        </div>
        <div className="flex-1 min-h-[500px] lg:min-h-0">
          <JobPanel initialJobs={jobs} activeJobId={activeJobId} />
        </div>
      </div>
    </div>
  )
}
