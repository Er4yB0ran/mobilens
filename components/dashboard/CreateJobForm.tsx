'use client'

import { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link2, Upload, ImageIcon, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

interface CreateJobFormProps {
  credits: number
  onJobCreated: (jobId: string) => void
}

export default function CreateJobForm({ credits, onJobCreated }: CreateJobFormProps) {
  const [url, setUrl] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Sadece görsel dosyaları yükleyebilirsiniz')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya 10MB'dan küçük olmalı")
      return
    }
    setUploadedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function removeFile() {
    setUploadedFile(null)
    setPreviewUrl(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(type: 'url' | 'upload') {
    if (credits < 1) {
      toast.error('Yetersiz kredi! Lütfen kredi satın alın.')
      return
    }
    setLoading(true)
    try {
      let payload: any = { type }

      if (type === 'url') {
        if (!url.trim()) { toast.error('URL gerekli'); setLoading(false); return }
        payload.input_url = url.trim()
      } else {
        if (!uploadedFile) { toast.error('Görsel seçin'); setLoading(false); return }
        setUploading(true)
        const formData = new FormData()
        formData.append('file', uploadedFile)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        setUploading(false)
        if (!uploadRes.ok) { toast.error('Yükleme başarısız'); setLoading(false); return }
        const { url: fileUrl } = await uploadRes.json()
        payload.input_file_url = fileUrl
      }

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'İş oluşturulamadı'); return }

      toast.success('Kampanya oluşturuldu!')
      setUrl('')
      removeFile()
      onJobCreated(data.job_id)
    } catch {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-neuro h-full flex flex-col">

      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-white/8 flex-shrink-0 bg-black/20">
        <p className="text-xs font-mono text-primary uppercase tracking-widest mb-2">Yeni</p>
        <h2 className="font-black text-lg tracking-tight">Kampanya Oluştur</h2>
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-muted-foreground">AI ile profesyonel reklam içeriği</p>
          <span className={`text-xs font-mono font-bold ${credits < 1 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {credits < 1 ? 'Kredi yok' : `${credits} kredi`}
          </span>
        </div>
      </div>

      {/* Form body */}
      <div className="p-4 flex-1">
        <Tabs defaultValue="url">
          <TabsList className="grid grid-cols-2 mb-5 h-9 rounded-none p-0 bg-background border border-border">
            <TabsTrigger
              value="url"
              className="gap-2 text-xs rounded-none font-medium transition-colors border-r border-border
                text-muted-foreground
                data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <Link2 className="w-3.5 h-3.5" />
              URL
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              className="gap-2 text-xs rounded-none font-medium transition-colors
                text-muted-foreground
                data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <Upload className="w-3.5 h-3.5" />
              Görsel
            </TabsTrigger>
          </TabsList>

          {/* URL Tab */}
          <TabsContent value="url" className="space-y-4 mt-0">
            <div className="space-y-2">
              <Label
                htmlFor="url"
                className="text-xs uppercase tracking-widest text-muted-foreground font-semibold"
              >
                Ürün URL
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/urun"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="h-10 rounded-none text-sm border-border bg-background"
                disabled={loading}
              />
              <p className="text-[11px] text-muted-foreground font-mono">
                Herhangi bir e-ticaret ürün sayfası
              </p>
            </div>
            <SubmitButton
              onClick={() => handleSubmit('url')}
              loading={loading}
              disabled={loading || credits < 1}
            />
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4 mt-0">
            {previewUrl ? (
              <div className="relative border border-border aspect-video overflow-hidden bg-black">
                <img src={previewUrl} alt="Önizleme" className="w-full h-full object-contain" />
                <button
                  onClick={removeFile}
                  className="absolute top-2 right-2 w-7 h-7 bg-background border border-border flex items-center justify-center hover:bg-card transition-colors cursor-pointer"
                  aria-label="Görseli kaldır"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full aspect-video border border-dashed border-border hover:border-muted-foreground transition-colors flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-foreground group cursor-pointer"
                disabled={loading}
              >
                <ImageIcon className="w-6 h-6" />
                <div className="text-center">
                  <p className="text-sm font-medium">Görsel yükle</p>
                  <p className="text-[11px] mt-1 font-mono">PNG, JPG, WEBP — maks 10MB</p>
                </div>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <SubmitButton
              onClick={() => handleSubmit('upload')}
              loading={loading}
              uploading={uploading}
              disabled={loading || !uploadedFile || credits < 1}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function SubmitButton({
  onClick, loading, uploading = false, disabled,
}: {
  onClick: () => void
  loading: boolean
  uploading?: boolean
  disabled: boolean
}) {
  return (
    <button
      className="w-full h-11 text-sm font-black text-primary-foreground bg-primary
        flex items-center justify-center gap-2 glow-primary-sm
        transition-opacity hover:opacity-90 active:opacity-75
        disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      onClick={onClick}
      disabled={disabled}
    >
      {uploading ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor...</>
      ) : loading ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Oluşturuluyor...</>
      ) : (
        <>Kampanya Oluştur — 1 Kredi</>
      )}
    </button>
  )
}
