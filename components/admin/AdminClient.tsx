'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import {
  Users, RefreshCw, UserPlus, Loader2, Eye, EyeOff
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from '@/lib/date'

interface AdminUser {
  id: string
  email: string
  full_name: string
  created_at: string
  credits: number
}

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

export default function AdminClient() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [creditUser, setCreditUser] = useState<AdminUser | null>(null)

  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newName, setNewName] = useState('')
  const [newCredits, setNewCredits] = useState('1')
  const [showPw, setShowPw] = useState(false)
  const [creating, setCreating] = useState(false)

  const [creditValue, setCreditValue] = useState('1')
  const [savingCredits, setSavingCredits] = useState(false)

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) setUsers(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])
  useEffect(() => { if (creditUser) setCreditValue('1') }, [creditUser?.id])

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) { toast.error('Şifre en az 6 karakter'); return }
    setCreating(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          full_name: newName,
          initial_credits: parseInt(newCredits) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success(`${newEmail} oluşturuldu!`)
      setCreateOpen(false)
      setNewEmail(''); setNewPassword(''); setNewName(''); setNewCredits('1')
      fetchUsers()
    } finally {
      setCreating(false)
    }
  }

  async function handleAddCredits() {
    if (!creditUser) return
    const amount = parseInt(creditValue)
    if (!amount || amount <= 0) { toast.error('Geçerli pozitif bir miktar girin'); return }
    setSavingCredits(true)
    try {
      const res = await fetch(`/api/admin/users/${creditUser.id}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success(`+${amount} kredi eklendi → toplam ${data.new_balance}`)
      setUsers(prev => prev.map(u => u.id === creditUser.id ? { ...u, credits: data.new_balance } : u))
      setCreditUser(null)
    } finally {
      setSavingCredits(false)
    }
  }

  const totalCredits = users.reduce((s, u) => s + u.credits, 0)

  return (
    <div className="max-w-4xl mx-auto p-5 lg:p-7 space-y-8">

      {/* Header */}
      <div className="border-b border-border pb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-mono text-primary uppercase tracking-widest mb-2">Admin</p>
          <h1 className="text-2xl font-black tracking-tight">Yönetim Paneli</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-1.5 h-9 px-3 text-xs font-mono text-muted-foreground border border-border hover:text-foreground hover:bg-card transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </button>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger
              render={
                <button className="flex items-center gap-1.5 h-9 px-4 text-xs font-black text-primary-foreground bg-primary hover:opacity-90 transition-opacity cursor-pointer glow-primary-sm">
                  <UserPlus className="w-3.5 h-3.5" />
                  Kullanıcı Ekle
                </button>
              }
            />
            <DialogContent className="glass-elevated border-white/10 rounded-none sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-black tracking-tight">Yeni Kullanıcı Oluştur</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Ad Soyad</Label>
                  <Input
                    placeholder="Kullanıcı Adı"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="h-10 rounded-none border-border bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">E-posta *</Label>
                  <Input
                    type="email"
                    placeholder="ornek@email.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    required
                    className="h-10 rounded-none border-border bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Şifre *</Label>
                  <div className="relative">
                    <Input
                      type={showPw ? 'text' : 'password'}
                      placeholder="En az 6 karakter"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      className="h-10 pr-10 rounded-none border-border bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Başlangıç Kredisi</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 1, 3, 5, 10].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNewCredits(String(n))}
                        className={`h-9 text-sm font-mono font-black border transition-colors cursor-pointer ${
                          newCredits === String(n)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Özel miktar..."
                    value={![0,1,3,5,10].includes(parseInt(newCredits)) && newCredits !== '' ? newCredits : ''}
                    onChange={e => setNewCredits(e.target.value)}
                    className="h-10 rounded-none border-border bg-background"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-10 bg-primary text-primary-foreground text-sm font-black hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer mt-2"
                  disabled={creating}
                >
                  {creating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Oluşturuluyor...
                    </span>
                  ) : 'Kullanıcı Oluştur →'}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-px border border-white/6 bg-white/6">
        {[
          { label: 'Kullanıcı',     value: users.length.toString() },
          { label: 'Toplam Token',  value: totalCredits.toString() },
          { label: 'Değer',         value: `₺${totalCredits * 150}` },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-5">
            <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2">
              {stat.label}
            </p>
            <p className="text-4xl font-black font-mono">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* User list */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-card">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
            Kullanıcılar
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">{users.length} hesap</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users className="w-8 h-8 text-muted-foreground opacity-30" />
            <p className="text-sm font-mono text-muted-foreground">Henüz kullanıcı yok</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {users.map(user => (
              <div key={user.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-8 h-8 bg-card border border-border flex items-center justify-center flex-shrink-0 font-black text-sm font-mono">
                  {(user.full_name || user.email).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold truncate max-w-[160px]">
                      {user.full_name || '—'}
                    </span>
                    {user.email === ADMIN_EMAIL && (
                      <span className="text-[10px] font-mono font-black px-1.5 py-0.5 bg-primary text-primary-foreground uppercase tracking-widest">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-muted-foreground truncate">{user.email}</p>
                  <p className="text-[11px] font-mono text-muted-foreground/50">
                    {formatDistanceToNow(user.created_at)} kayıt
                  </p>
                </div>
                <span className="font-mono font-black text-xl tabular-nums flex-shrink-0">
                  {user.credits}
                </span>
                <button
                  className="h-8 px-3 text-xs font-mono font-bold border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors cursor-pointer flex-shrink-0"
                  onClick={() => setCreditUser(user)}
                >
                  + Token
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add credits dialog */}
      <Dialog open={!!creditUser} onOpenChange={open => !open && setCreditUser(null)}>
        <DialogContent className="glass-elevated border-white/10 rounded-none sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-black tracking-tight">Token Ekle</DialogTitle>
          </DialogHeader>
          {creditUser && (
            <div className="space-y-5 mt-1">
              <div className="border border-border px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-background border border-border flex items-center justify-center font-black text-sm font-mono flex-shrink-0">
                  {(creditUser.full_name || creditUser.email).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black truncate">
                    {creditUser.full_name || creditUser.email}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    Mevcut:{' '}
                    <span className="font-black text-foreground">{creditUser.credits} token</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                  Eklenecek Miktar
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 3, 5, 10].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCreditValue(String(n))}
                      className={`h-10 font-mono font-black text-sm border cursor-pointer transition-colors ${
                        creditValue === String(n)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                      }`}
                    >
                      +{n}
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  min="1"
                  value={![1,3,5,10].includes(parseInt(creditValue)) && creditValue !== '' ? creditValue : ''}
                  onChange={e => setCreditValue(e.target.value)}
                  placeholder="Özel miktar..."
                  className="h-10 text-center text-base font-mono font-black rounded-none border-border bg-background"
                />
                {creditValue && parseInt(creditValue) > 0 && (
                  <div className="border border-primary/30 px-3 py-2 text-center">
                    <span className="text-xs font-mono text-muted-foreground">Yeni bakiye: </span>
                    <span className="font-black font-mono text-primary">
                      {creditUser.credits + parseInt(creditValue)} token
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  className="flex-1 h-10 bg-primary text-primary-foreground text-sm font-black hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer"
                  onClick={handleAddCredits}
                  disabled={savingCredits || !creditValue || parseInt(creditValue) <= 0}
                >
                  {savingCredits ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Ekleniyor...
                    </span>
                  ) : 'Token Ekle →'}
                </button>
                <button
                  className="h-10 px-4 border border-border text-muted-foreground hover:text-foreground text-sm hover:bg-card transition-colors cursor-pointer"
                  onClick={() => setCreditUser(null)}
                >
                  İptal
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
