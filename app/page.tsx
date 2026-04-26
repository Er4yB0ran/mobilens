import Link from 'next/link'
import { ArrowRight, Check, Zap, Image, Video, FileText, Link2, Upload } from 'lucide-react'

const outputs = [
  {
    label: 'Lifestyle Görsel',
    desc: 'Mobilyayı gerçek yaşam ortamında gösteren AI fotoğrafı',
    gradient: 'from-blue-950/80 via-blue-900/40 to-transparent',
    accent: '#3b82f6',
    icon: Image,
  },
  {
    label: 'Video Thumbnail',
    desc: 'Dikkat çeken profesyonel ürün kapak görseli',
    gradient: 'from-orange-950/80 via-orange-900/40 to-transparent',
    accent: 'oklch(0.620 0.220 30)',
    icon: Video,
  },
  {
    label: 'Reklam Videosu',
    desc: 'Sinematik ürün tanıtım videosu, sosyal medyaya hazır',
    gradient: 'from-emerald-950/80 via-emerald-900/40 to-transparent',
    accent: '#10b981',
    icon: Video,
  },
  {
    label: 'Türkçe Reklam Metni',
    desc: 'Platform bazlı optimize reklam kopyaları',
    gradient: 'from-violet-950/80 via-violet-900/40 to-transparent',
    accent: '#8b5cf6',
    icon: FileText,
  },
  {
    label: 'Instagram Görseli',
    desc: 'Kare format, yüksek etkileşim için hazırlanmış',
    gradient: 'from-pink-950/80 via-pink-900/40 to-transparent',
    accent: '#ec4899',
    icon: Image,
  },
  {
    label: 'Ürün Analizi',
    desc: 'AI ile otomatik çıkarılan ürün bilgileri ve özellikler',
    gradient: 'from-sky-950/80 via-sky-900/40 to-transparent',
    accent: '#0ea5e9',
    icon: FileText,
  },
  {
    label: 'Facebook Reklamı',
    desc: 'Hedef kitleye özel reklam içeriği ve görsel',
    gradient: 'from-indigo-950/80 via-indigo-900/40 to-transparent',
    accent: '#6366f1',
    icon: Image,
  },
  {
    label: 'Kampanya Raporu',
    desc: 'Tüm üretilen içeriklerin detaylı özeti',
    gradient: 'from-amber-950/80 via-amber-900/40 to-transparent',
    accent: '#f59e0b',
    icon: FileText,
  },
]

const steps = [
  {
    num: '01',
    title: 'URL veya fotoğraf ekle',
    desc: "E-ticaret sayfanızın URL'ini yapıştırın ya da ürün fotoğraflarınızı yükleyin.",
  },
  {
    num: '02',
    title: 'AI ürünü analiz eder',
    desc: 'Yapay zeka ürün bilgilerini, özelliklerini ve görsel detaylarını otomatik çıkarır.',
  },
  {
    num: '03',
    title: 'İçerikler üretilir',
    desc: 'Fal.ai motoru ile lifestyle görseller, thumbnail ve sinematik reklam videosu oluşturulur.',
  },
  {
    num: '04',
    title: 'İndir ve yayınla',
    desc: 'Tüm içerikleri tek tıkla indirin, doğrudan sosyal medyada paylaşın.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className="h-16 flex items-center px-6 lg:px-12 justify-between sticky top-0 z-50 glass-nav">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" strokeWidth={2.5} />
          <span className="font-black text-sm tracking-widest">mobilens</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#nasil-calisir" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
            Nasıl Çalışır
          </a>
          <a href="#fiyatlandirma" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
            Fiyatlar
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 text-xs font-bold tracking-wide hover:opacity-90 transition-opacity glow-primary-sm"
          >
            Başla
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-6 py-24 relative">
        {/* Radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, oklch(0.620 0.220 30 / 8%) 0%, transparent 65%)',
          }}
        />

        {/* Availability badge */}
        <div className="animate-fade-up flex items-center gap-2 mb-8">
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-widest border"
            style={{
              background: 'oklch(0.620 0.220 30 / 10%)',
              borderColor: 'oklch(0.620 0.220 30 / 30%)',
              color: 'oklch(0.800 0.150 30)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full pulse-dot"
              style={{ background: 'oklch(0.700 0.220 145)', display: 'inline-block' }}
            />
            AI ile güçlendirilmiş — şu an aktif
          </span>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up-1 text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black leading-none tracking-tighter mb-6 max-w-4xl"
        >
          Mobilya reklamları,
          <br />
          <span className="text-muted-foreground font-black">saniyeler içinde</span>
          <br />
          <span style={{ color: 'oklch(0.620 0.220 30)' }}>yapay zeka ile.</span>
        </h1>

        {/* Sub */}
        <p className="animate-fade-up-2 text-muted-foreground text-lg max-w-xl mb-10 leading-relaxed font-light">
          Ürün URL&apos;inizi yapıştırın veya fotoğraf yükleyin. AI otomatik olarak
          lifestyle görseller, video thumbnail&apos;ler ve sinematik reklam videoları üretsin.
        </p>

        {/* CTAs */}
        <div className="animate-fade-up-3 flex flex-col sm:flex-row items-center gap-3 mb-8">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 font-bold text-sm hover:opacity-90 transition-all glow-primary-sm hover:scale-[1.02] active:scale-[0.99]"
          >
            <Zap className="w-4 h-4" strokeWidth={2.5} />
            Ücretsiz Başla
          </Link>
          <a
            href="#nasil-calisir"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:border-foreground/20 transition-all"
          >
            Nasıl çalışır? →
          </a>
        </div>

        {/* Pricing note */}
        <p className="animate-fade-up-4 text-xs font-mono text-muted-foreground/60 uppercase tracking-widest">
          Kredi başına <span className="text-muted-foreground font-bold">₺150</span> — abonelik yok, kart zorunluluğu yok
        </p>
      </section>

      {/* ── OUTPUTS SHOWCASE ────────────────────────────── */}
      <section className="py-20 border-t border-border">
        <div className="px-6 lg:px-12 mb-10">
          <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">
            02 — Neler Üretilir
          </p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter max-w-xl">
            Bir kampanyada üretilen tüm içerikler
          </h2>
        </div>

        {/* Horizontal scroll strip */}
        <div className="scroll-fade-edges">
          <div
            className="flex gap-4 px-6 lg:px-12 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {outputs.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="flex-none w-52 glass-card hover:border-white/15 transition-all duration-300 hover:-translate-y-1 cursor-default group"
                >
                  {/* Gradient preview area */}
                  <div
                    className={`h-36 bg-gradient-to-br ${item.gradient} flex items-center justify-center relative overflow-hidden`}
                    style={{ borderBottom: `1px solid rgba(255,255,255,0.06)` }}
                  >
                    <Icon
                      className="w-8 h-8 opacity-30 group-hover:opacity-50 transition-opacity"
                      style={{ color: item.accent }}
                    />
                    {/* Corner accent */}
                    <div
                      className="absolute top-0 right-0 w-16 h-16 opacity-20"
                      style={{
                        background: `radial-gradient(circle at top right, ${item.accent}, transparent)`,
                      }}
                    />
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <div className="text-sm font-bold mb-1 tracking-tight">{item.label}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── MODE CARDS ──────────────────────────────────── */}
      <section className="px-6 lg:px-12 py-20 border-t border-border">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
          03 — Nasıl Başlarsınız
        </p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-12 max-w-xl">
          İki yol, aynı sonuç: profesyonel içerik
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
          {/* URL Mode */}
          <div className="glass-elevated accent-line-top p-8 flex flex-col hover:border-white/15 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-9 h-9 flex items-center justify-center"
                style={{ background: 'oklch(0.620 0.220 30 / 12%)', border: '1px solid oklch(0.620 0.220 30 / 25%)' }}
              >
                <Link2 className="w-4 h-4" style={{ color: 'oklch(0.750 0.180 30)' }} />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'oklch(0.750 0.180 30)' }}>
                URL ile Oluştur
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tight mb-6">
              E-ticaret sayfası<br />URL&apos;ini yapıştır
            </h3>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                'Ürün bilgileri otomatik çıkarılır',
                'Fotoğraflar sayfadan alınır',
                'Trendyol, Hepsiburada, N11 destekli',
                'Sıfır manuel veri girişi',
                '1 kampanya = 1 kredi',
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Check
                    className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                    style={{ color: 'oklch(0.620 0.220 30)' }}
                  />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div>
                <div className="font-black font-mono text-lg">₺150 / kredi</div>
                <div className="text-xs text-muted-foreground mt-0.5">Sabit fiyat</div>
              </div>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Başla →
              </Link>
            </div>
          </div>

          {/* Photo Mode */}
          <div className="glass-card p-8 flex flex-col hover:border-white/15 transition-all duration-300 group" style={{ borderTop: '2px solid rgba(255,255,255,0.10)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-9 h-9 flex items-center justify-center"
                style={{ background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.22)' }}
              >
                <Upload className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-blue-400">
                Fotoğraf ile Oluştur
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tight mb-6">
              Ürün fotoğraflarını<br />doğrudan yükle
            </h3>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                'PNG, JPG, WEBP destekli',
                'Birden fazla fotoğraf yüklenir',
                'AI en uygun açıyı seçer',
                'URL gerekmez, offline çalışır',
                '1 kampanya = 1 kredi',
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div>
                <div className="font-black font-mono text-lg">₺150 / kredi</div>
                <div className="text-xs text-muted-foreground mt-0.5">Sabit fiyat</div>
              </div>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 bg-foreground text-background px-4 py-2 text-xs font-bold hover:opacity-85 transition-opacity"
              >
                Başla →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section id="nasil-calisir" className="px-6 lg:px-12 py-20 border-t border-border">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
          04 — Süreç
        </p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-12">
          Nasıl çalışır?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px border border-border bg-border max-w-5xl">
          {steps.map((step, i) => (
            <div key={step.num} className="bg-background p-8 hover:bg-card transition-colors duration-300 group">
              <div
                className="text-6xl font-black font-mono mb-6 leading-none tracking-tighter"
                style={{ color: 'oklch(0.155 0 0)' }}
              >
                {step.num}
              </div>
              <div className="h-px mb-6" style={{ background: 'oklch(0.155 0 0)' }} />
              <h3 className="font-black text-sm mb-3 tracking-tight leading-snug">{step.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VALUE PROP ──────────────────────────────────── */}
      <section className="px-6 lg:px-12 py-24 border-t border-border text-center relative overflow-hidden">
        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 60%, oklch(0.620 0.220 30 / 6%) 0%, transparent 60%)',
          }}
        />

        <p className="text-xs font-mono text-primary uppercase tracking-widest mb-6 relative">
          05 — Neden mobilens
        </p>
        <h2
          className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none mb-6 relative max-w-4xl mx-auto"
        >
          Hız rekabet
          <br />
          <span style={{ color: 'oklch(0.620 0.220 30)' }}>avantajıdır.</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-md mx-auto mb-12 relative leading-relaxed font-light">
          Rakipleriniz ajans süreçlerinde günler kaybederken, siz saniyeler içinde
          profesyonel reklam içerikleri yayınlayın.
        </p>

        {/* Stats */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-px border border-border bg-border max-w-2xl mx-auto mb-12"
        >
          {[
            { num: '~60sn', label: 'Üretim süresi' },
            { num: '3+', label: 'Çıktı türü' },
            { num: '₺150', label: 'Sabit fiyat' },
            { num: '∞', label: 'Platform desteği' },
          ].map((s) => (
            <div key={s.label} className="bg-background px-6 py-6 text-center">
              <div className="text-2xl font-black font-mono mb-1">{s.num}</div>
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 font-bold text-sm hover:opacity-90 transition-all glow-primary-sm"
          >
            <Zap className="w-4 h-4" strokeWidth={2.5} />
            Hemen Başla
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm text-muted-foreground hover:text-foreground border border-border hover:border-foreground/20 transition-all"
          >
            Hesabım var →
          </Link>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────── */}
      <section id="fiyatlandirma" className="px-6 lg:px-12 py-20 border-t border-border">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
          06 — Fiyatlandırma
        </p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-12">
          Sade ve şeffaf fiyat
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
          {[
            { credits: 1, price: 150, popular: false },
            { credits: 5, price: 650, popular: true },
            { credits: 10, price: 1200, popular: false },
          ].map((pkg) => (
            <div
              key={pkg.credits}
              className={`relative p-7 flex flex-col transition-all duration-300 ${
                pkg.popular
                  ? 'glass-elevated shimmer-border accent-border-top hover:border-white/20'
                  : 'glass-card hover:border-white/12'
              }`}
              style={pkg.popular ? { border: '1px solid oklch(0.620 0.220 30 / 30%)' } : {}}
            >
              {pkg.popular && (
                <span
                  className="absolute -top-3 left-6 text-xs font-mono px-2 py-0.5 font-bold uppercase tracking-widest"
                  style={{
                    background: 'oklch(0.620 0.220 30)',
                    color: 'oklch(0.98 0 0)',
                  }}
                >
                  Popüler
                </span>
              )}
              <div className="font-mono font-black text-4xl mb-0.5">
                ₺{pkg.price}
              </div>
              <div className="text-xs text-muted-foreground font-mono mb-6">
                {pkg.credits} kredi
                {pkg.credits > 1 && (
                  <span className="ml-2" style={{ color: 'oklch(0.700 0.220 145)' }}>
                    (₺{Math.round(pkg.price / pkg.credits)}/kredi)
                  </span>
                )}
              </div>
              <ul className="space-y-2.5 mb-7 flex-1">
                {[
                  `${pkg.credits} tam kampanya`,
                  `${pkg.credits * 2} profesyonel görsel`,
                  `${pkg.credits} reklam videosu`,
                  'Türkçe reklam metinleri',
                  'İndirilmeye hazır çıktılar',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Check
                      className="w-3 h-3 flex-shrink-0"
                      style={{ color: pkg.popular ? 'oklch(0.620 0.220 30)' : 'oklch(0.480 0 0)' }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`block text-center py-2.5 text-xs font-bold transition-opacity hover:opacity-85 ${
                  pkg.popular
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                Satın Al →
              </Link>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-6 font-mono">
          İhtiyacınız kadar kredi satın alın. Abonelik yok, son kullanma tarihi yok.
        </p>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="px-6 lg:px-12 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-4xl">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-primary" strokeWidth={2.5} />
              <span className="font-black text-sm tracking-widest">mobilens</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs font-light">
              Mobilya markalarına özel AI reklam otomasyonu. URL veya fotoğraftan
              anında profesyonel içerik.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Bağlantılar</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                { label: 'Giriş Yap', href: '/login' },
                { label: 'Kayıt Ol', href: '/register' },
                { label: 'Dashboard', href: '/dashboard' },
              ].map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-border px-6 lg:px-12 py-5 flex items-center justify-between">
          <span className="font-black text-xs tracking-widest text-muted-foreground/50">mobilens</span>
          <div className="flex items-center gap-4">
            <span
              className="flex items-center gap-1.5 text-xs font-mono"
              style={{ color: 'oklch(0.700 0.220 145)' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'oklch(0.700 0.220 145)', display: 'inline-block' }}
              />
              Sistemler çalışıyor
            </span>
            <p className="text-muted-foreground/40 text-xs font-mono">© 2025 mobilens</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
