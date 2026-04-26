'use client'

import { useEffect, useRef, useState } from 'react'
import { Job } from '@/lib/types'
import { Progress } from '@/components/ui/progress'
import {
  Play, Download, Copy, XCircle,
  Loader2, Clock, FileText, Video,
  CheckCircle2, ChevronDown, ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface JobDetailProps {
  job: Job
  onJobUpdated: (job: Job) => void
}

interface LogEntry {
  type: string
  message?: string
  status?: string
  result?: any
}

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif']
const VIDEO_EXTS = ['mp4', 'webm', 'mov']
const STEP_PROGRESS_PER_STEP = 8

function clientExtractUrls(text: string, exts: string[]): string[] {
  const urls = text.match(/https?:\/\/[^\s"'<>)\]\\]+/g) ?? []
  return [...new Set(urls.filter(u => {
    const clean = u.split('?')[0].toLowerCase().split('#')[0]
    return exts.some(e => clean.endsWith(`.${e}`))
  }))]
}

const isToolStep = (msg: string) => /\.\.\.$|…$/.test(msg.trim())

export default function JobDetail({ job, onJobUpdated }: JobDetailProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [streaming, setStreaming] = useState(false)
  const [started, setStarted] = useState(false)
  const [currentJob, setCurrentJob] = useState<Job>(job)
  const [showRawOutput, setShowRawOutput] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentJob(job)
    setLogs([])
    setStarted(false)
    setStreaming(false)
    setShowRawOutput(false)
  }, [job.id])

  // Supabase realtime veya bağlantı kopması sonrası status/result senkronizasyonu
  useEffect(() => {
    setCurrentJob(prev => ({ ...prev, status: job.status, result: job.result }))
  }, [job.status, job.result])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Stream koparsa ya da önceki oturumdan 'running' geldiyse: 3s'de bir DB'yi sorgula
  // 40 denemeden sonra (2 dak) hâlâ running ise 'failed' olarak işaretle
  useEffect(() => {
    if (currentJob.status !== 'running' || streaming) return
    const jobId = currentJob.id
    let attempts = 0
    const MAX = 40
    const timer = setInterval(async () => {
      attempts++
      try {
        const res = await fetch(`/api/jobs/${jobId}`)
        if (!res.ok) return
        const updated = await res.json()
        if (updated.status !== 'running') {
          clearInterval(timer)
          setCurrentJob(prev => ({ ...prev, status: updated.status, result: updated.result }))
          return
        }
      } catch {}
      if (attempts >= MAX) {
        clearInterval(timer)
        setCurrentJob(prev => ({
          ...prev,
          status: 'failed',
          error_message: 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.',
        }))
      }
    }, 3000)
    return () => clearInterval(timer)
  }, [currentJob.status, currentJob.id, streaming])

  async function startJob() {
    if (started || streaming) return
    setStarted(true)
    setStreaming(true)
    setLogs([])

    const res = await fetch(`/api/jobs/${currentJob.id}/stream`, { method: 'POST' })
    if (!res.ok || !res.body) {
      toast.error('Agent başlatılamadı')
      setStreaming(false)
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const entry: LogEntry = JSON.parse(line.slice(6))
          setLogs(prev => [...prev, entry])
          if (entry.type === 'status') {
            setCurrentJob(prev => ({ ...prev, status: entry.status as any }))
            onJobUpdated({ ...currentJob, status: entry.status as any })
          }
          if (entry.type === 'done') setStreaming(false)
          if (entry.type === 'result') {
            setCurrentJob(prev => ({ ...prev, result: entry.result }))
          }
        } catch {}
      }
    }
    setStreaming(false)
  }

  const toolSteps = logs.filter(l => l.type === 'log' && isToolStep(l.message ?? ''))
  const hasActivity = started || currentJob.status !== 'pending'
  const isCompleted = currentJob.status === 'completed'
  const isFailed = currentJob.status === 'failed'
  const isRunning = currentJob.status === 'running'

  const progressValue =
    isCompleted ? 100
    : isFailed ? 100
    : isRunning ? Math.min(92, 10 + toolSteps.length * STEP_PROGRESS_PER_STEP)
    : 0

  const result = currentJob.result

  const displayImages: string[] = result?.images?.length
    ? result.images
    : clientExtractUrls(result?.raw_output ?? '', IMAGE_EXTS)
  const displayVideos: string[] = result?.videos?.length
    ? result.videos
    : clientExtractUrls(result?.raw_output ?? '', VIDEO_EXTS)

  const hasMedia = displayImages.length > 0 || displayVideos.length > 0

  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="px-5 py-4 border-b border-white/8 flex-shrink-0 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1">
              #{currentJob.id.slice(0, 8)}
            </p>
            <p className="text-xs text-muted-foreground truncate max-w-[240px] font-mono">
              {currentJob.input_url || currentJob.input_file_url || 'Görsel yüklendi'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {currentJob.status === 'pending' && !started && (
              <button
                onClick={startJob}
                className="flex items-center gap-1.5 h-8 px-4 text-xs font-black text-primary-foreground bg-primary hover:opacity-90 transition-opacity cursor-pointer glow-primary-sm"
              >
                <Play className="w-3 h-3" />
                Başlat
              </button>
            )}

            {streaming && (
              <div className="flex items-center gap-2 px-3 py-1.5 border border-primary/30 bg-primary/5 glow-primary-sm">
                <div className="flex gap-0.5 items-center h-3">
                  <span className="stream-dot w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="stream-dot w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="stream-dot w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <span className="text-[11px] font-mono font-bold text-primary">Çalışıyor</span>
              </div>
            )}

            {isRunning && !streaming && (
              <div className="flex items-center gap-2 px-3 py-1.5 border border-white/15 bg-black/20">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                <span className="text-[11px] font-mono font-bold text-muted-foreground">İşleniyor</span>
              </div>
            )}

            {isCompleted && !streaming && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 border border-border">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                <span className="text-[11px] font-mono font-bold text-green-400">Tamamlandı</span>
              </div>
            )}
          </div>
        </div>

        {hasActivity && (
          <div className="mt-3 space-y-1">
            <Progress
              value={progressValue}
              className={cn(
                'h-[2px] rounded-none bg-border',
                isFailed
                  ? '[&>div]:bg-red-400'
                  : '[&>div]:bg-primary [&>div]:shadow-[0_0_8px_oklch(0.620_0.220_30_/_50%)]'
              )}
            />
            {isRunning && (
              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                <span>
                  {toolSteps.length > 0
                    ? `Adım ${toolSteps.length}`
                    : streaming ? 'Başlatılıyor' : 'İşleniyor'}
                </span>
                <span>{progressValue}%</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* Result view */}
        {isCompleted && result && (
          <div className="p-4 space-y-5">

            {displayImages.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                    Görseller
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">{displayImages.length} adet</span>
                </div>
                <div className={cn('grid gap-2', displayImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
                  {displayImages.map((url, i) => (
                    <div
                      key={i}
                      className="group relative border border-border overflow-hidden bg-black"
                      style={{ aspectRatio: '4/3' }}
                    >
                      <img src={url} alt={`Görsel ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <a
                          href={url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="w-9 h-9 bg-background border border-border flex items-center justify-center hover:opacity-90 transition-opacity"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {displayVideos.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                    Videolar
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">{displayVideos.length} adet</span>
                </div>
                <div className="space-y-2">
                  {displayVideos.map((url, i) => (
                    <div key={i} className="border border-border overflow-hidden bg-black">
                      <video controls className="w-full max-h-64 object-contain" src={url} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!hasMedia && (
              <div className="border border-border px-3 py-2.5">
                <span className="text-xs text-muted-foreground font-mono">
                  Medya bulunamadı — agent yanıtı aşağıda.
                </span>
              </div>
            )}

            {result.raw_output && (
              <section>
                <button
                  onClick={() => setShowRawOutput(v => !v)}
                  className="w-full flex items-center justify-between px-3 py-2.5 border border-border hover:bg-background transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                      Agent Yanıtı
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                      onClick={e => {
                        e.stopPropagation()
                        navigator.clipboard.writeText(result.raw_output ?? '')
                        toast.success('Kopyalandı!')
                      }}
                    >
                      <Copy className="w-2.5 h-2.5" />
                      Kopyala
                    </span>
                    {showRawOutput
                      ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                      : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    }
                  </div>
                </button>
                {showRawOutput && (
                  <div className="border border-t-0 border-border p-4 bg-background">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                      {result.raw_output}
                    </pre>
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {/* Step log */}
        {!(isCompleted && result) && (
          <div className="p-4">
            {!hasActivity && (
              <div className="flex flex-col items-center justify-center h-48 gap-4 text-center">
                <div className="w-12 h-12 border border-border flex items-center justify-center bg-card/50 backdrop-blur-sm">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-black text-sm tracking-tight">Agent Hazır</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    Başlat butonuna basarak kampanya üretimini başlatın
                  </p>
                </div>
              </div>
            )}

            {hasActivity && (
              <div className="space-y-1.5">
                {isRunning && toolSteps.length === 0 && (
                  <div
                    className={cn(
                      'step-in flex items-center gap-3 px-3 py-3 border',
                      streaming
                        ? 'border-primary/40 bg-primary/5 glow-primary-sm'
                        : 'border-white/8 bg-black/20'
                    )}
                    style={{ boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(255,255,255,0.02)' }}
                  >
                    <Loader2 className={cn('w-4 h-4 animate-spin flex-shrink-0', streaming ? 'text-primary' : 'text-muted-foreground')} />
                    <p className="text-[13px] font-mono text-muted-foreground">
                      {streaming ? 'Hazırlanıyor...' : 'Sonuç bekleniyor...'}
                    </p>
                  </div>
                )}

                {toolSteps.map((step, i) => {
                  const isActive = i === toolSteps.length - 1 && streaming
                  return (
                    <div
                      key={i}
                      style={!isActive ? { boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.30), inset -1px -1px 3px rgba(255,255,255,0.015)' } : undefined}
                      className={cn(
                        'step-in flex items-center gap-3 px-3 py-3 border transition-all duration-200',
                        isActive ? 'border-primary/40 bg-primary/5 glow-primary-sm' : 'border-white/7 bg-black/15'
                      )}
                    >
                      {isActive
                        ? <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
                        : <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      }
                      <p className={cn(
                        'text-[13px] font-mono truncate',
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {step.message?.replace(/\.{3}$|…$/, '')}
                      </p>
                    </div>
                  )
                })}

                {isCompleted && !streaming && (
                  <div className="step-in flex items-center gap-3 px-3 py-3 border border-green-400/20 bg-green-400/5">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-mono font-bold text-green-400">Kampanya Hazır</p>
                      <p className="text-xs font-mono text-muted-foreground">
                        {toolSteps.length} adım tamamlandı
                      </p>
                    </div>
                  </div>
                )}

                {isFailed && (
                  <div className="step-in border border-red-400/20 bg-red-400/5 px-3 py-3 flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                    <span className="text-[13px] font-mono text-red-400">
                      {currentJob.error_message || 'Bilinmeyen bir hata oluştu'}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  )
}
