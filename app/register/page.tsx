'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalı')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('Hesap oluşturuldu!')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="h-14 flex items-center px-6 glass-nav">
        <Link href="/" className="font-black text-sm tracking-widest hover:opacity-70 transition-opacity">
          FALAI
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h1 className="text-3xl font-black tracking-tight mb-2">Hesap Oluştur</h1>
            <p className="text-muted-foreground text-sm">Ücretsiz başla, ihtiyacın kadar kredi al.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-xs uppercase tracking-widest text-muted-foreground font-semibold"
              >
                Ad Soyad
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Adınız"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="h-11 bg-card border-border rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs uppercase tracking-widest text-muted-foreground font-semibold"
              >
                E-posta
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="ad@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-11 bg-card border-border rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs uppercase tracking-widest text-muted-foreground font-semibold"
              >
                Şifre
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="En az 6 karakter"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-11 pr-11 bg-card border-border rounded-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full h-11 bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer glow-primary-sm"
              disabled={loading}
            >
              {loading ? 'Oluşturuluyor...' : 'Hesap Oluştur →'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Zaten hesabın var mı?{' '}
            <Link href="/login" className="text-primary hover:underline font-bold">
              Giriş yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
