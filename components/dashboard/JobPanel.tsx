'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Job } from '@/lib/types'
import JobCard from './JobCard'
import JobDetail from './JobDetail'
import { Archive, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface JobPanelProps {
  initialJobs: Job[]
  activeJobId?: string
}

type ConfirmAction = { type: 'archive' | 'unarchive' | 'delete'; job: Job }

export default function JobPanel({ initialJobs, activeJobId }: JobPanelProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [selectedId, setSelectedId] = useState<string | null>(
    activeJobId ?? initialJobs[0]?.id ?? null
  )
  const [showArchived, setShowArchived] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setJobs(prev => [payload.new as Job, ...prev])
          setSelectedId((payload.new as Job).id)
        } else if (payload.eventType === 'UPDATE') {
          setJobs(prev => prev.map(j => {
            if (j.id !== (payload.new as Job).id) return j
            const n = payload.new as Job
            return { ...j, ...n, result: n.result ?? j.result }
          }))
        } else if (payload.eventType === 'DELETE') {
          setJobs(prev => prev.filter(j => j.id !== (payload.old as Job).id))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    if (activeJobId) setSelectedId(activeJobId)
  }, [activeJobId])

  function handleJobUpdated(updated: Job) {
    setJobs(prev => prev.map(j => j.id === updated.id ? updated : j))
  }

  const visibleJobs = jobs.filter(j => showArchived ? !!j.archived_at : !j.archived_at)
  const selectedJob = jobs.find(j => j.id === selectedId)
  const archivedCount = jobs.filter(j => !!j.archived_at).length

  async function handleConfirm() {
    if (!confirmAction || isProcessing) return
    setIsProcessing(true)
    const { type, job } = confirmAction
    try {
      if (type === 'delete') {
        await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' })
        setJobs(prev => prev.filter(j => j.id !== job.id))
        if (selectedId === job.id) {
          setSelectedId(visibleJobs.find(j => j.id !== job.id)?.id ?? null)
        }
      } else {
        const archived = type === 'archive'
        const res = await fetch(`/api/jobs/${job.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archived }),
        })
        const updated = await res.json()
        setJobs(prev => prev.map(j => j.id === updated.id ? updated : j))
        if (selectedId === job.id && !showArchived && archived) {
          setSelectedId(visibleJobs.find(j => j.id !== job.id)?.id ?? null)
        }
      }
    } finally {
      setIsProcessing(false)
      setConfirmAction(null)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full min-h-0">

      {/* Job list */}
      <div className="lg:w-64 xl:w-72 flex-shrink-0 glass-neuro overflow-hidden flex flex-col">
        {/* List header */}
        <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between flex-shrink-0 bg-black/20">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
            İş Geçmişi
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted-foreground">{visibleJobs.length}</span>
            {archivedCount > 0 && (
              <button
                onClick={() => { setShowArchived(v => !v); setSelectedId(null) }}
                className={cn(
                  'w-6 h-6 flex items-center justify-center transition-colors cursor-pointer',
                  showArchived ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
                aria-label={showArchived ? 'Aktif işleri göster' : 'Arşivi göster'}
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {showArchived && (
          <div className="px-3 py-1.5 border-b border-white/8 bg-primary/5">
            <p className="text-[10px] text-primary font-mono font-bold text-center uppercase tracking-widest">
              ARŞİV — {archivedCount} kampanya
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-border">
          {visibleJobs.length === 0 ? (
            <div className="flex items-center justify-center h-36 p-4">
              <p className="text-xs text-muted-foreground font-mono text-center">
                {showArchived ? 'Arşiv boş' : 'Henüz kampanya yok'}
              </p>
            </div>
          ) : (
            visibleJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                isActive={job.id === selectedId}
                onClick={() => setSelectedId(job.id)}
                onArchive={() => setConfirmAction({ type: job.archived_at ? 'unarchive' : 'archive', job })}
                onDelete={() => setConfirmAction({ type: 'delete', job })}
              />
            ))
          )}
        </div>
      </div>

      {/* Job detail */}
      <div className="flex-1 glass-neuro overflow-hidden min-h-[400px] lg:min-h-0">
        {selectedJob ? (
          <JobDetail key={selectedJob.id} job={selectedJob} onJobUpdated={handleJobUpdated} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
            <p className="text-muted-foreground text-sm font-mono">Bir kampanya seçin</p>
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      <Dialog open={!!confirmAction} onOpenChange={(open: boolean) => { if (!open) setConfirmAction(null) }}>
        <DialogContent className="glass-elevated border-white/10 rounded-none sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground font-black tracking-tight">
              {confirmAction?.type === 'delete' && 'Kampanyayı Sil'}
              {confirmAction?.type === 'archive' && 'Arşive Al'}
              {confirmAction?.type === 'unarchive' && 'Arşivden Çıkar'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {confirmAction?.type === 'delete' && 'Bu kampanya kalıcı olarak silinecek. Geri alınamaz.'}
              {confirmAction?.type === 'archive' && 'Bu kampanya arşive taşınacak.'}
              {confirmAction?.type === 'unarchive' && 'Bu kampanya arşivden çıkarılacak.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isProcessing} className="rounded-none" />}>
              İptal
            </DialogClose>
            <Button
              variant={confirmAction?.type === 'delete' ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={isProcessing}
              className="rounded-none"
            >
              {isProcessing
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : confirmAction?.type === 'delete' ? 'Sil'
                : confirmAction?.type === 'archive' ? 'Arşive Al'
                : 'Arşivden Çıkar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
