'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  User,
  Phone,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import Navbar from '@/components/Navbar';

// ─── Constants ────────────────────────────────────────────────────────────────

// Layout peta meja: setiap array adalah satu baris
// null = spasi kosong, number = nomor meja
const MEJA_LAYOUT: (number | null)[][] = [
  [1, 2, 3, null, null, 7, 8],
  [4, 5, 6, null, null, 9, 10],
  [null, 11, 12, 13, null, null, null],
  [null, null, 14, null, 15, null, null],
];

// Generate time slots 08:00 – 22:30 dengan interval 30 menit
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 8; h <= 22; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 22) slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  slots.push('22:30');
  return slots;
}
const TIME_SLOTS = generateTimeSlots();

// Minimum date = hari ini, Max = 30 hari ke depan
function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}
function getMaxDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
}

// Format tanggal untuk tampilan
function formatTanggalDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  nama_pelanggan: string;
  nomor_hp: string;
  tanggal: string;
  waktu: string;
  jumlah_orang: number;
  nomor_meja: number | null;
  catatan: string;
}

interface FormErrors {
  nama_pelanggan?: string;
  nomor_hp?: string;
  tanggal?: string;
  waktu?: string;
  nomor_meja?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ReservasiPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    nama_pelanggan: '',
    nomor_hp: '',
    tanggal: '',
    waktu: '',
    jumlah_orang: 2,
    nomor_meja: null,
    catatan: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [mejaDibooking, setMejaDibooking] = useState<number[]>([]);
  const [isLoadingMeja, setIsLoadingMeja] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch meja yang sudah dibooking saat tanggal+waktu berubah
  const fetchMejaDibooking = useCallback(async (tanggal: string, waktu: string) => {
    if (!tanggal || !waktu) return;
    setIsLoadingMeja(true);
    try {
      const res = await fetch(`/api/reservasi?tanggal=${tanggal}&waktu=${waktu}`);
      const data = await res.json();
      setMejaDibooking(data.meja_dibooking ?? []);
      // Reset meja yang dipilih jika ternyata sudah dibooking
      setForm(prev => {
        if (prev.nomor_meja && (data.meja_dibooking ?? []).includes(prev.nomor_meja)) {
          return { ...prev, nomor_meja: null };
        }
        return prev;
      });
    } catch {
      setMejaDibooking([]);
    } finally {
      setIsLoadingMeja(false);
    }
  }, []);

  useEffect(() => {
    if (form.tanggal && form.waktu) {
      fetchMejaDibooking(form.tanggal, form.waktu);
    }
  }, [form.tanggal, form.waktu, fetchMejaDibooking]);

  // Update field helper
  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
    if (key === 'nomor_meja') setSubmitError(null);
  };

  // Stepper untuk jumlah orang
  const handleStepper = (delta: number) => {
    setForm(prev => ({
      ...prev,
      jumlah_orang: Math.min(20, Math.max(1, prev.jumlah_orang + delta)),
    }));
  };

  // Klik meja
  const handleMejaClick = (nomorMeja: number) => {
    if (mejaDibooking.includes(nomorMeja)) return; // sudah dibooking, tidak bisa dipilih
    setField('nomor_meja', form.nomor_meja === nomorMeja ? null : nomorMeja);
    setErrors(prev => ({ ...prev, nomor_meja: undefined }));
  };

  // Validasi
  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.nama_pelanggan.trim()) errs.nama_pelanggan = 'Nama harus diisi.';
    if (!form.nomor_hp.trim()) {
      errs.nomor_hp = 'Nomor HP harus diisi.';
    } else if (form.nomor_hp.replace(/\D/g, '').length < 10) {
      errs.nomor_hp = 'Nomor HP minimal 10 digit.';
    }
    if (!form.tanggal) errs.tanggal = 'Tanggal harus dipilih.';
    if (!form.waktu) errs.waktu = 'Waktu harus dipilih.';
    if (!form.nomor_meja) errs.nomor_meja = 'Pilih meja dari denah di atas.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/reservasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          nomor_meja: form.nomor_meja!,
          catatan: form.catatan.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan reservasi.');
      }

      // Redirect ke halaman sukses dengan query params
      const params = new URLSearchParams({
        kode: data.kode_booking,
        nama: form.nama_pelanggan,
        tanggal: form.tanggal,
        waktu: form.waktu,
        meja: String(form.nomor_meja),
        orang: String(form.jumlah_orang),
        catatan: form.catatan.trim(),
      });
      router.push(`/reservasi/sukses?${params.toString()}`);
    } catch (err: any) {
      setSubmitError(err.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    form.nama_pelanggan.trim() &&
    form.nomor_hp.replace(/\D/g, '').length >= 10 &&
    form.tanggal &&
    form.waktu &&
    form.nomor_meja !== null;

  // Meja status helper
  const getMejaStatus = (n: number): 'available' | 'selected' | 'booked' => {
    if (mejaDibooking.includes(n)) return 'booked';
    if (form.nomor_meja === n) return 'selected';
    return 'available';
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg)', paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>

      {/* ── Sticky Header ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(250,250,247,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <Link href="/" style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'white', border: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none', boxShadow: 'var(--shadow-card)',
          flexShrink: 0,
        }}>
          <ChevronLeft size={20} strokeWidth={2.5} color="#57534E" />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 16, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Booking Meja
          </h1>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>
            Isi data di bawah, meja siap menunggumu ☕
          </p>
        </div>
        <img src="/smart-coffee.svg" alt="KUPITA" style={{ height: 28, width: 'auto' }} />
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ padding: '16px 16px 0' }}>

          {/* ── Section 1: Pilih Tanggal & Waktu dulu ── */}
          <div style={{
            background: 'white', borderRadius: 16, border: '1px solid var(--color-border)',
            padding: 16, marginBottom: 12, boxShadow: 'var(--shadow-card)',
          }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} color="var(--color-primary)" /> Kapan Kamu Datang?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {/* Tanggal */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
                  Tanggal <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={14} color="var(--color-text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type="date"
                    value={form.tanggal}
                    min={getTodayStr()}
                    max={getMaxDateStr()}
                    onChange={e => setField('tanggal', e.target.value)}
                    style={{
                      width: '100%', height: 44, paddingLeft: 30, paddingRight: 10,
                      border: `1.5px solid ${errors.tanggal ? 'var(--color-error)' : 'var(--color-border)'}`,
                      borderRadius: 10, fontSize: 13, background: 'var(--color-bg-elevated)',
                      outline: 'none', color: form.tanggal ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                {errors.tanggal && <p style={{ fontSize: 11, color: 'var(--color-error)', marginTop: 4 }}>{errors.tanggal}</p>}
              </div>

              {/* Waktu */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
                  Waktu <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Clock size={14} color="var(--color-text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <select
                    value={form.waktu}
                    onChange={e => setField('waktu', e.target.value)}
                    style={{
                      width: '100%', height: 44, paddingLeft: 30, paddingRight: 10,
                      border: `1.5px solid ${errors.waktu ? 'var(--color-error)' : 'var(--color-border)'}`,
                      borderRadius: 10, fontSize: 13, background: 'var(--color-bg-elevated)',
                      outline: 'none', color: form.waktu ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                      appearance: 'none', WebkitAppearance: 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">Pilih waktu</option>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {errors.waktu && <p style={{ fontSize: 11, color: 'var(--color-error)', marginTop: 4 }}>{errors.waktu}</p>}
              </div>
            </div>
            {(form.tanggal || form.waktu) && (
              <div style={{
                marginTop: 10,
                padding: '8px 12px',
                background: 'var(--color-primary-light)',
                borderRadius: 8,
                border: '1px solid #FDE68A',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <span style={{ fontSize: 13 }}>📅</span>
                <span style={{ fontSize: 12, color: '#92400E', fontWeight: 650 }}>
                  Rencana Datang: {form.tanggal ? formatTanggalDisplay(form.tanggal) : 'Belum pilih tanggal'}
                  {form.waktu ? ` pukul ${form.waktu} WIB` : ''}
                </span>
              </div>
            )}
          </div>

          {/* ── Section 2: Peta Meja Visual ── */}
          <div style={{
            background: 'white', borderRadius: 16, border: '1px solid var(--color-border)',
            padding: 16, marginBottom: 12, boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                <MapPin size={14} color="var(--color-primary)" /> Pilih Meja
              </h2>
              {isLoadingMeja && (
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                  Memuat status meja...
                </span>
              )}
            </div>

            {/* Denah cafe */}
            <div style={{
              background: 'var(--color-bg-elevated)',
              borderRadius: 12,
              padding: '12px 8px',
              border: '1px solid var(--color-border)',
              marginBottom: 12,
              overflow: 'hidden',
            }}>
              {/* Label cafe area */}
              <div style={{ textAlign: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  DENAH WARKOP KITA
                </span>
              </div>

              {/* Baris meja */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {MEJA_LAYOUT.map((row, rowIdx) => (
                  <div key={rowIdx} style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                    {row.map((cell, cellIdx) => {
                      if (cell === null) {
                        return <div key={`gap-${rowIdx}-${cellIdx}`} style={{ width: 36, height: 36, flexShrink: 0 }} />;
                      }
                      const status = getMejaStatus(cell);
                      const isBooked = status === 'booked';
                      const isSelected = status === 'selected';
                      const isAvail = status === 'available';

                      return (
                        <button
                          key={`meja-${cell}`}
                          type="button"
                          onClick={() => handleMejaClick(cell)}
                          disabled={isBooked}
                          title={isBooked ? `Meja ${cell} — Sudah dibooking` : `Meja ${cell}`}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            border: isSelected
                              ? '2px solid var(--color-primary)'
                              : isBooked
                              ? '1.5px solid #D4D4D4'
                              : '1.5px solid #BBF7D0',
                            background: isSelected
                              ? 'var(--color-primary)'
                              : isBooked
                              ? '#F4F4F5'
                              : '#DCFCE7',
                            color: isSelected
                              ? 'white'
                              : isBooked
                              ? '#A1A1AA'
                              : '#15803D',
                            fontSize: 10,
                            fontWeight: 700,
                            cursor: isBooked ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0,
                            flexShrink: 0,
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected ? '0 2px 8px rgba(194, 102, 10, 0.35)' : isAvail ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                            transform: isSelected ? 'scale(1.06)' : 'scale(1)',
                          }}
                        >
                          <span style={{ fontSize: 8, opacity: 0.7, lineHeight: 1 }}>M</span>
                          <span style={{ fontSize: 11, lineHeight: 1.1, fontWeight: 800 }}>{cell}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Area counter */}
              <div style={{ textAlign: 'center', marginTop: 8, padding: '5px', background: 'rgba(0,0,0,0.03)', borderRadius: 8 }}>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
                  PINTU MASUK
                </span>
              </div>
            </div>

            {/* Legenda */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-secondary)' }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: '#DCFCE7', border: '1px solid #BBF7D0', display: 'inline-block' }} />
                Tersedia
              </span>
              <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-secondary)' }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--color-primary)', display: 'inline-block' }} />
                Dipilih
              </span>
              <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-secondary)' }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: '#F4F4F5', border: '1px solid #D4D4D4', display: 'inline-block' }} />
                Sudah Dibooking
              </span>
            </div>

            {/* Selected meja info */}
            {form.nomor_meja && (
              <div style={{
                marginTop: 10, padding: '8px 12px',
                background: 'var(--color-primary-light)', borderRadius: 8,
                border: '1px solid #FDE68A',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <CheckCircle2 size={14} color="var(--color-primary)" />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)' }}>
                  Meja {form.nomor_meja} dipilih
                  {form.tanggal && form.waktu && ` · ${form.waktu} — ${formatTanggalDisplay(form.tanggal)}`}
                </span>
              </div>
            )}
            {errors.nomor_meja && !form.nomor_meja && (
              <p style={{ fontSize: 11, color: 'var(--color-error)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertCircle size={12} /> {errors.nomor_meja}
              </p>
            )}
          </div>

          {/* ── Section 3: Data Pribadi ── */}
          <div style={{
            background: 'white', borderRadius: 16, border: '1px solid var(--color-border)',
            padding: 16, marginBottom: 12, boxShadow: 'var(--shadow-card)',
          }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={14} color="var(--color-primary)" /> Data Pemesanan
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Nama */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
                  Nama Lengkap <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={14} color="var(--color-text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    value={form.nama_pelanggan}
                    onChange={e => setField('nama_pelanggan', e.target.value)}
                    placeholder="Nama kamu"
                    style={{
                      width: '100%', height: 44, paddingLeft: 34, paddingRight: 12,
                      border: `1.5px solid ${errors.nama_pelanggan ? 'var(--color-error)' : 'var(--color-border)'}`,
                      borderRadius: 10, fontSize: 14, background: 'var(--color-bg-elevated)',
                      outline: 'none', color: 'var(--color-text-primary)', boxSizing: 'border-box',
                    }}
                  />
                </div>
                {errors.nama_pelanggan && <p style={{ fontSize: 11, color: 'var(--color-error)', marginTop: 4 }}>{errors.nama_pelanggan}</p>}
              </div>

              {/* Nomor HP */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
                  Nomor HP <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} color="var(--color-text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type="tel"
                    value={form.nomor_hp}
                    onChange={e => setField('nomor_hp', e.target.value)}
                    placeholder="08xx-xxxx-xxxx"
                    style={{
                      width: '100%', height: 44, paddingLeft: 34, paddingRight: 12,
                      border: `1.5px solid ${errors.nomor_hp ? 'var(--color-error)' : 'var(--color-border)'}`,
                      borderRadius: 10, fontSize: 14, background: 'var(--color-bg-elevated)',
                      outline: 'none', color: 'var(--color-text-primary)', boxSizing: 'border-box',
                    }}
                  />
                </div>
                {errors.nomor_hp
                  ? <p style={{ fontSize: 11, color: 'var(--color-error)', marginTop: 4 }}>{errors.nomor_hp}</p>
                  : <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>Untuk konfirmasi reservasi</p>
                }
              </div>

              {/* Jumlah Orang Stepper */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
                  <Users size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                  Jumlah Orang
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: 'fit-content' }}>
                  <button
                    type="button"
                    onClick={() => handleStepper(-1)}
                    disabled={form.jumlah_orang <= 1}
                    style={{
                      width: 44, height: 44, borderRadius: '10px 0 0 10px',
                      border: '1.5px solid var(--color-border)', borderRight: 'none',
                      background: form.jumlah_orang <= 1 ? 'var(--color-bg-elevated)' : 'white',
                      color: form.jumlah_orang <= 1 ? 'var(--color-text-muted)' : 'var(--color-primary)',
                      fontSize: 20, fontWeight: 700, cursor: form.jumlah_orang <= 1 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >−</button>
                  <div style={{
                    width: 64, height: 44, borderTop: '1.5px solid var(--color-border)', borderBottom: '1.5px solid var(--color-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)',
                    background: 'white',
                  }}>
                    {form.jumlah_orang}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStepper(1)}
                    disabled={form.jumlah_orang >= 20}
                    style={{
                      width: 44, height: 44, borderRadius: '0 10px 10px 0',
                      border: '1.5px solid var(--color-border)', borderLeft: 'none',
                      background: form.jumlah_orang >= 20 ? 'var(--color-bg-elevated)' : 'white',
                      color: form.jumlah_orang >= 20 ? 'var(--color-text-muted)' : 'var(--color-primary)',
                      fontSize: 20, fontWeight: 700, cursor: form.jumlah_orang >= 20 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >+</button>
                  <span style={{ marginLeft: 10, fontSize: 13, color: 'var(--color-text-secondary)' }}>orang</span>
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
                  <MessageSquare size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                  Catatan Khusus <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(opsional)</span>
                </label>
                <textarea
                  value={form.catatan}
                  onChange={e => {
                    if (e.target.value.length <= 200) setField('catatan', e.target.value);
                  }}
                  placeholder="Ulang tahun, butuh kursi tinggi, dll..."
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 10, fontSize: 13, background: 'var(--color-bg-elevated)',
                    outline: 'none', color: 'var(--color-text-primary)',
                    resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                    lineHeight: 1.5,
                  }}
                />
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2, textAlign: 'right' }}>
                  {form.catatan.length}/200
                </p>
              </div>
            </div>
          </div>

          {/* ── Error global ── */}
          {submitError && (
            <div style={{
              background: 'var(--color-error-bg)', border: '1.5px solid var(--color-error)',
              borderRadius: 12, padding: '12px 14px', marginBottom: 12,
              display: 'flex', gap: 8, alignItems: 'flex-start',
            }}>
              <AlertCircle size={16} color="var(--color-error)" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: 'var(--color-error)', margin: 0, lineHeight: 1.4 }}>{submitError}</p>
            </div>
          )}

          {/* ── Tombol Submit ── */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            style={{
              width: '100%', height: 52, borderRadius: 14,
              border: 'none',
              background: !isFormValid || isSubmitting
                ? 'var(--color-bg-sunken)'
                : 'var(--color-primary)',
              color: !isFormValid || isSubmitting ? 'var(--color-text-muted)' : 'white',
              fontSize: 15, fontWeight: 700,
              cursor: !isFormValid || isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginBottom: 24,
              transition: 'all 0.15s ease',
              boxShadow: !isFormValid || isSubmitting ? 'none' : '0 4px 16px rgba(194,102,10,0.3)',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Memproses...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Konfirmasi Booking
              </>
            )}
          </button>
        </div>
      </form>

      <Navbar />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
