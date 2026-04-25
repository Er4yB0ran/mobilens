'use client'

import { useState } from 'react'
import { Transaction } from '@/lib/types'
import { Loader2, Plus, Check, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from '@/lib/date'

interface Props {
  initialBalance: number
  transactions: Transaction[]
}

const packages = [
  { amount: 1,  price: 150,  label: 'Başlangıç', popular: false },
  { amount: 5,  price: 750,  label: 'Standart',   popular: true  },
  { amount: 10, price: 1500, label: 'Pro',         popular: false },
  { amount: 25, price: 3750, label: 'İş',          popular: false },
]

export default function CreditsClient({ initialBalance, transactions: initialTx }: Props) {
  const [balance, setBalance] = useState(initialBalance)
  const [transactions, setTransactions] = useState<Transaction[]>(initialTx)
  const [loading, setLoading] = useState<number | null>(null)

  async function handlePurchase(amount: number, price: number) {
    setLoading(amount)
    try {
      const res = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      setBalance(prev => prev + amount)
      const newTx: Transaction = {
        id: Math.random().toString(),
        user_id: '',
        credits: amount,
        amount_try: price,
        description: `${amount} kredi satın alma`,
        status: 'completed',
        created_at: new Date().toISOString(),
      }
      setTransactions(prev => [newTx, ...prev])
      toast.success(`${amount} kredi eklendi!`)
    } catch {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-5 lg:p-7 space-y-8">

      {/* Page header */}
      <div className="border-b border-border pb-5">
        <p className="text-xs font-mono text-primary uppercase tracking-widest mb-2">Kredi Yönetimi</p>
        <h1 className="text-2xl font-black tracking-tight">Krediler</h1>
      </div>

      {/* Balance card */}
      <div className="glass-elevated p-6">
        <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-4">
          Mevcut Bakiye
        </p>
        <div className="flex items-end gap-3">
          <span className="text-6xl font-black font-mono">{balance}</span>
          <span className="text-muted-foreground text-lg mb-1">kredi</span>
        </div>
        <p className="text-xs font-mono text-muted-foreground mt-2">= {balance * 150}₺ değerinde içerik</p>
        <div className="mt-5 pt-5 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">1 kredi ile üretilir:</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1.5">
            {['2 profesyonel görsel', '1 reklam videosu', 'Türkçe reklam metinleri'].map(item => (
              <span key={item} className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                <Check className="w-3 h-3 text-primary flex-shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Package grid */}
      <div>
        <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-4">
          Kredi Satın Al
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {packages.map(pkg => (
            <div
              key={pkg.amount}
              className={`glass-card p-5 relative ${pkg.popular ? 'shimmer-border accent-border-top' : ''}`}
              style={pkg.popular ? { border: '1px solid oklch(0.620 0.220 30 / 35%)' } : undefined}
            >
              {pkg.popular && (
                <span className="absolute -top-px left-4 bg-primary text-primary-foreground text-[10px] font-mono font-black px-2 py-0.5 uppercase tracking-widest">
                  Popüler
                </span>
              )}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    {pkg.label}
                  </p>
                  <p className="text-4xl font-black font-mono">{pkg.amount}</p>
                  <p className="text-xs text-muted-foreground font-mono">kredi</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black font-mono">{pkg.price}₺</p>
                  <p className="text-[11px] font-mono text-muted-foreground">150₺/kredi</p>
                </div>
              </div>
              <button
                className={`w-full h-9 text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-40 cursor-pointer
                  ${pkg.popular ? 'bg-primary text-primary-foreground glow-primary-sm' : 'bg-card text-foreground border border-white/10'}`}
                onClick={() => handlePurchase(pkg.amount, pkg.price)}
                disabled={loading !== null}
              >
                {loading === pkg.amount ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    İşleniyor...
                  </span>
                ) : (
                  `${pkg.price}₺ Öde`
                )}
              </button>
            </div>
          ))}
        </div>
        <p className="text-[11px] font-mono text-muted-foreground text-center mt-3">
          Mock ödeme sistemi — gerçek para çekilmez
        </p>
      </div>

      {/* Transaction history */}
      <div>
        <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-4">
          İşlem Geçmişi
        </p>
        <div className="glass-card overflow-hidden">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <Clock className="w-8 h-8 opacity-30" />
              <p className="text-sm font-mono">Henüz işlem yok</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3.5">
                  <Plus className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description}</p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {formatDistanceToNow(tx.created_at)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-mono font-black text-primary">+{tx.credits}</p>
                    <p className="text-xs font-mono text-muted-foreground">{tx.amount_try}₺</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
