'use client'

import { Job } from '@/lib/types'
import { Link2, Upload, Archive, ArchiveRestore, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from '@/lib/date'

interface JobCardProps {
  job: Job
  isActive?: boolean
  onClick: () => void
  onArchive?: () => void
  onDelete?: () => void
}

const statusConfig = {
  pending:   { label: 'Bekliyor',    color: 'text-yellow-400' },
  running:   { label: 'Çalışıyor',   color: 'text-primary' },
  completed: { label: 'Tamamlandı',  color: 'text-green-400' },
  failed:    { label: 'Hata',        color: 'text-red-400' },
}

export default function JobCard({ job, isActive, onClick, onArchive, onDelete }: JobCardProps) {
  const s = statusConfig[job.status]
  const isArchived = !!job.archived_at

  return (
    <div
      onClick={onClick}
      style={isActive ? {
        boxShadow: 'inset 3px 3px 10px rgba(0,0,0,0.45), inset -2px -2px 6px rgba(255,255,255,0.025), inset 4px 0 20px oklch(0.620 0.220 30 / 14%)'
      } : undefined}
      className={cn(
        'relative border-l-2 transition-all duration-200 p-3 group cursor-pointer select-none',
        isActive
          ? 'border-l-primary bg-card/80'
          : 'border-l-transparent hover:bg-card/50',
        isArchived && 'opacity-40'
      )}
    >
      <div className="flex items-start gap-2.5">
        {/* Type icon */}
        <div className="mt-0.5 text-muted-foreground flex-shrink-0">
          {job.type === 'url'
            ? <Link2 className="w-3.5 h-3.5" />
            : <Upload className="w-3.5 h-3.5" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium truncate leading-snug">
            {job.input_url
              ? job.input_url.replace(/^https?:\/\/(www\.)?/, '')
              : job.input_file_url
                ? 'Yüklenen görsel'
                : 'İş #' + job.id.slice(0, 8)}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn('text-[11px] font-mono font-bold', s.color)}>
              {s.label}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              · {formatDistanceToNow(job.created_at)}
            </span>
          </div>
        </div>

        {/* Hover actions */}
        <div
          className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onArchive}
            title={isArchived ? 'Arşivden çıkar' : 'Arşive al'}
            className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {isArchived
              ? <ArchiveRestore className="w-3.5 h-3.5" />
              : <Archive className="w-3.5 h-3.5" />
            }
          </button>
          <button
            onClick={onDelete}
            title="Sil"
            className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
