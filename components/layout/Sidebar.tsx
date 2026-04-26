'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Coins, LogOut, ShieldCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  credits: number
  onClose?: () => void
  isAdmin?: boolean
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/credits', label: 'Krediler', icon: Coins },
]

export default function Sidebar({ credits, onClose, isAdmin }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex flex-col h-full glass-sidebar w-56">

      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-border flex-shrink-0">
        <Link
          href="/dashboard"
          className="font-black text-sm tracking-widest hover:opacity-70 transition-opacity"
          onClick={onClose}
        >
          mobilens
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer lg:hidden"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} onClick={onClose}>
              <div
                className={cn(
                  'flex items-center gap-2.5 px-2 py-2.5 text-[13px] font-medium transition-colors cursor-pointer border-l-2',
                  active
                    ? 'text-foreground border-l-primary bg-card pl-3'
                    : 'text-muted-foreground border-l-transparent hover:text-foreground hover:bg-card pl-3'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </div>
            </Link>
          )
        })}

        {isAdmin && (
          <Link href="/admin" onClick={onClose}>
            <div
              className={cn(
                'flex items-center gap-2.5 px-2 py-2.5 text-[13px] font-medium transition-colors cursor-pointer border-l-2',
                pathname === '/admin'
                  ? 'text-foreground border-l-primary bg-card pl-3'
                  : 'text-muted-foreground border-l-transparent hover:text-foreground hover:bg-card pl-3'
              )}
            >
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              Admin
            </div>
          </Link>
        )}
      </nav>

      {/* Credit balance */}
      <div className="px-5 py-4 border-t border-border">
        <Link href="/credits" onClick={onClose}>
          <div className="group cursor-pointer">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Bakiye
            </p>
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-xl text-foreground">{credits}</span>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                kredi →
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-border pt-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-card transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
