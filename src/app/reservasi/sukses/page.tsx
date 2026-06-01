'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, User, Calendar, TableProperties, Users, MessageSquare, Copy, Home, UtensilsCrossed } from 'lucide-react';

function formatTanggal(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function SuksesContent() {
  const params = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  const kode = params.get('kode') || 'WK-0000';
  const nama = params.get('nama') || '-';
  const tanggal = params.get('tanggal') || '';
  const waktu = params.get('waktu') || '-';
  const meja = params.get('meja') || '-';
  const orang = params.get('orang') || '-';
  const catatan = params.get('catatan') || '';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/reservasi/sukses?kode=${encodeURIComponent(kode)}&nama=${encodeURIComponent(nama)}&tanggal=${encodeURIComponent(tanggal)}&waktu=${encodeURIComponent(waktu)}&meja=${encodeURIComponent(meja)}&orang=${encodeURIComponent(orang)}${catatan ? `&catatan=${encodeURIComponent(catatan)}` : ''}`;
      setQrUrl(url);
    }
  }, [kode, nama, tanggal, waktu, meja, orang, catatan]);

  const handleCopyKode = async () => {
    try {
      await navigator.clipboard.writeText(kode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail
    }
  };

  const detailItems = [
    { icon: User, label: 'Nama', value: nama },
    { icon: Calendar, label: 'Tanggal & Waktu', value: `${formatTanggal(tanggal)}, ${waktu}` },
    { icon: TableProperties, label: 'Nomor Meja', value: `Meja no. ${meja}` },
    { icon: Users, label: 'Jumlah Orang', value: `${orang} orang` },
    ...(catatan ? [{ icon: MessageSquare, label: 'Catatan', value: catatan }] : []),
  ];

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px 40px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* ── Checkmark animasi ── */}
        <div className="animate-check" style={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 8px 32px rgba(22, 163, 74, 0.2)',
        }}>
          <CheckCircle2 size={44} color="#16A34A" strokeWidth={1.8} />
        </div>

        {/* ── Judul ── */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>
            Reservasi Berhasil! 🎉
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: 0 }}>
            Datang tepat waktu ya! Tim kami sudah siapkan mejamu.
          </p>
        </div>

        {/* ── Kode Booking Card ── */}
        <div style={{
          background: 'var(--color-primary)',
          borderRadius: 16,
          padding: '16px 20px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 6px 24px rgba(194, 102, 10, 0.3)',
        }}>
          <div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: '0 0 2px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Kode Booking
            </p>
            <span style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: 28,
              fontWeight: 800,
              color: 'white',
              letterSpacing: '0.08em',
            }}>
              {kode}
            </span>
          </div>
          <button
            onClick={handleCopyKode}
            style={{
              background: copied ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255,255,255,0.18)',
              border: copied ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(255,255,255,0.3)',
              borderRadius: 10,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer',
              color: 'white',
              fontSize: 12,
              fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
          >
            {copied ? (
              <>
                <span style={{ fontSize: 13, lineHeight: 1 }}>✓</span>
                Tersalin
              </>
            ) : (
              <>
                <Copy size={14} />
                Salin
              </>
            )}
          </button>
        </div>

        {/* ── QR Code Card ── */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          padding: '16px',
          marginBottom: 16,
          textAlign: 'center',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}>
          <div style={{
            background: '#F5F5F0',
            padding: '10px',
            borderRadius: 12,
            border: '1px solid var(--color-border-light)',
            display: 'inline-block',
          }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=c2660a&data=${encodeURIComponent(qrUrl || kode)}`} 
              alt="QR Kode Booking"
              width={120}
              height={120}
              style={{ display: 'block', borderRadius: 6 }}
            />
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0, fontWeight: 600 }}>
            Scan di Kasir untuk Check-In
          </p>
        </div>

        {/* ── Detail Reservasi ── */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
          marginBottom: 20,
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)' }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Detail Reservasi
            </h2>
          </div>
          <div style={{ padding: '4px 0' }}>
            {detailItems.map(({ icon: Icon, label, value }, i) => {
              const isDateTime = label === 'Tanggal & Waktu';
              return (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 16px',
                  borderBottom: i < detailItems.length - 1 ? '1px solid var(--color-border)' : 'none',
                  background: isDateTime ? '#FEF3C7' : 'transparent', // light warm amber background
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: isDateTime ? 'var(--color-primary)' : 'var(--color-primary-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}>
                    <Icon size={15} color={isDateTime ? 'white' : 'var(--color-primary)'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      fontSize: 11, 
                      color: isDateTime ? 'var(--color-primary)' : 'var(--color-text-muted)', 
                      margin: '0 0 1px', 
                      fontWeight: isDateTime ? 700 : 500,
                      textTransform: isDateTime ? 'uppercase' : 'none',
                      letterSpacing: isDateTime ? '0.02em' : 'normal'
                    }}>{label}</p>
                    <p style={{ 
                      fontSize: isDateTime ? 15 : 14, 
                      color: isDateTime ? '#92400E' : 'var(--color-text-primary)', 
                      margin: 0, 
                      fontWeight: isDateTime ? 700 : 600, 
                      lineHeight: 1.4 
                    }}>{value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Catatan reminder ── */}
        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: 12,
          padding: '10px 14px',
          marginBottom: 20,
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <p style={{ fontSize: 12, color: '#92400E', margin: 0, lineHeight: 1.5 }}>
            <strong>Simpan kode booking kamu!</strong> Tunjukkan ke kasir saat tiba untuk konfirmasi meja.
          </p>
        </div>

        {/* ── Action buttons ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link
            href="/menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              height: 52,
              background: 'var(--color-primary)',
              color: 'white',
              borderRadius: 14,
              textDecoration: 'none',
              fontSize: 15,
              fontWeight: 700,
              boxShadow: '0 4px 16px rgba(194,102,10,0.3)',
            }}
          >
            <UtensilsCrossed size={18} />
            Lihat Menu Lagi
          </Link>

          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              height: 48,
              background: 'white',
              color: 'var(--color-text-secondary)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 14,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <Home size={16} />
            Kembali ke Beranda
          </Link>
        </div>

        {/* ── Footer ── */}
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 24 }}>
          Powered by <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>KUPITA</span>
        </p>
      </div>
    </div>
  );
}

export default function SuksesPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Memuat konfirmasi...</p>
        </div>
      </div>
    }>
      <SuksesContent />
    </Suspense>
  );
}
