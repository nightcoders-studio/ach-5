import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, Phone, Coffee, UtensilsCrossed, Bot, CalendarDays, QrCode, Sparkles, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'KUPITA — Selamat Datang',
  description: 'Scan QR, pilih menu favoritmu, dan booking meja dengan mudah di KUPITA.',
};

const infoChips = [
  { icon: QrCode, label: 'Smart QR Order' },
  { icon: Sparkles, label: 'Gemini AI Assistant' },
  { icon: Zap, label: 'Real-time Booking' },
];

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── Header ── */}
      <header className="animate-fade-in-up" style={{ padding: '52px 20px 28px', textAlign: 'center' }}>

        {/* Cafe identity */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <img 
            src="/smart-coffee.svg" 
            alt="KUPITA Logo" 
            style={{ 
              height: 84, 
              width: 'auto',
              filter: 'drop-shadow(0 6px 16px oklch(0.66 0.155 75 / 0.15))'
            }} 
          />
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}>
          KUPITA
        </h1>
        <p style={{
          fontSize: 15,
          color: 'var(--color-muted)',
          margin: '0 auto 24px',
          maxWidth: '36ch',
        }}>
          Platform Smart QR Menu, AI Assistant & Reservasi Meja untuk Warkop Modern
        </p>

        {/* Info chips */}
        <div className="animate-fade-in-up delay-75" style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          {infoChips.map(({ icon: Icon, label }) => (
            <span key={label} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: 'white',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '5px 11px',
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              fontWeight: 500,
              boxShadow: 'var(--shadow-card)',
            }}>
              <Icon size={12} strokeWidth={2} color="var(--color-muted)" />
              {label}
            </span>
          ))}
        </div>
      </header>

      {/* ── Navigation Cards ── */}
      <main style={{ padding: '0 20px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Hero card — Menu (primary action) */}
        <Link href="/menu" className="nav-card-hero animate-fade-in-up delay-150" style={{
          display: 'block',
          textDecoration: 'none',
          background: 'var(--color-primary)',
          borderRadius: 20,
          padding: '22px 22px',
          boxShadow: 'var(--shadow-hero)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative ring */}
          <div style={{
            position: 'absolute',
            right: -24,
            top: -24,
            width: 110,
            height: 110,
            borderRadius: '50%',
            border: '2px solid oklch(1 0 0 / 0.15)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            right: -8,
            top: -8,
            width: 72,
            height: 72,
            borderRadius: '50%',
            border: '2px solid oklch(1 0 0 / 0.10)',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: 'oklch(1 0 0 / 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <UtensilsCrossed size={26} color="white" strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 3, letterSpacing: '-0.02em' }}>
                Lihat Menu
              </div>
              <div style={{ fontSize: 13, color: 'oklch(1 0 0 / 0.75)' }}>
                15 menu tersedia · kopi, minuman & makanan
              </div>
            </div>
            <ChevronRight size={20} color="oklch(1 0 0 / 0.7)" strokeWidth={2.5} />
          </div>
        </Link>

        {/* Secondary cards — AI + Booking */}
        <div className="animate-fade-in-up delay-225" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

          {/* AI Assistant card */}
          <Link href="/ai-assistant" className="nav-card" style={{
            display: 'block',
            textDecoration: 'none',
            background: 'white',
            border: '1.5px solid var(--color-border)',
            borderRadius: 18,
            padding: '18px 16px',
            boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--color-success-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Bot size={24} color="var(--color-success)" strokeWidth={2} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4, letterSpacing: '-0.015em' }}>
              Tanya AI
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.4 }}>
              Bantu pilih menu sesuai mood
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'oklch(0.55 0.15 145)' }}>
                Coba sekarang
              </span>
              <ChevronRight size={13} color="oklch(0.55 0.15 145)" strokeWidth={2.5} />
            </div>
          </Link>

          {/* Booking card */}
          <Link href="/reservasi" className="nav-card" style={{
            display: 'block',
            textDecoration: 'none',
            background: 'white',
            border: '1.5px solid var(--color-border)',
            borderRadius: 18,
            padding: '18px 16px',
            boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <CalendarDays size={24} color="var(--color-primary)" strokeWidth={2} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4, letterSpacing: '-0.015em' }}>
              Booking Meja
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.4 }}>
              Pilih meja, tanpa antri
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-primary)' }}>
                Reservasi
              </span>
              <ChevronRight size={13} color="var(--color-primary)" strokeWidth={2.5} />
            </div>
          </Link>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="animate-fade-in-up delay-300" style={{ padding: '12px 20px 32px', textAlign: 'center' }}>
        <a
          href="https://wa.me/6281112345678"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            background: 'white',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            padding: '9px 15px',
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
            textDecoration: 'none',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <Phone size={13} color="var(--color-muted)" strokeWidth={2} />
          Hubungi Tim Sales
        </a>

        <p style={{ fontSize: 11, color: 'var(--color-placeholder)', marginTop: 14 }}>
          Powered by{' '}
          <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>KUPITA</span>
        </p>
      </footer>
    </div>
  );
}
