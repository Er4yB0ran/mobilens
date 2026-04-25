import type { Metadata } from 'next'
import { Syne, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const syne = Syne({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FALAI — Reklam Otomasyonu',
  description: 'AI ile saniyeler içinde profesyonel reklam kampanyaları oluşturun.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="h-full">
      <body className={`${syne.variable} ${jetbrainsMono.variable} antialiased min-h-full flex flex-col`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
