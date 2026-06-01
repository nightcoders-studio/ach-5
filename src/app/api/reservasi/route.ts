import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, type ReservasiInsert } from '@/lib/supabase';

// Generate kode booking WK-XXXX
function generateKodeBooking(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `WK-${digits}`;
}

// ─── GET /api/reservasi?tanggal=2026-06-15&waktu=14:00 ───────────────────────
// Mengembalikan daftar nomor meja yang sudah dibooking pada tanggal + waktu (±1 jam)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tanggal = searchParams.get('tanggal');
  const waktu = searchParams.get('waktu');

  if (!tanggal || !waktu) {
    return NextResponse.json({ error: 'Parameter tanggal dan waktu wajib diisi.' }, { status: 400 });
  }

  // Kalau Supabase belum dikonfigurasi, return array kosong (mode demo)
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ meja_dibooking: [] });
  }

  try {
    // Cek meja yang dibooking dalam rentang tanggal + waktu ±1 jam
    const [hour, minute] = waktu.split(':').map(Number);
    const startHour = Math.max(0, hour - 1);
    const endHour = Math.min(23, hour + 1);
    const startWaktu = `${String(startHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const endWaktu = `${String(endHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('reservasi')
      .select('nomor_meja')
      .eq('tanggal', tanggal)
      .gte('waktu', startWaktu)
      .lte('waktu', endWaktu)
      .in('status', ['menunggu', 'dikonfirmasi']);

    if (error) throw error;

    const mejaDibooking = data?.map((r) => r.nomor_meja) ?? [];
    return NextResponse.json({ meja_dibooking: mejaDibooking });
  } catch (err: any) {
    console.error('GET /api/reservasi error:', err);
    return NextResponse.json({ error: err.message || 'Gagal mengambil data meja.' }, { status: 500 });
  }
}

// ─── POST /api/reservasi ──────────────────────────────────────────────────────
// Insert reservasi baru ke Supabase
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nama_pelanggan,
      nomor_hp,
      tanggal,
      waktu,
      jumlah_orang,
      nomor_meja,
      catatan,
    }: ReservasiInsert = body;

    // Validasi field wajib
    if (!nama_pelanggan || !nomor_hp || !tanggal || !waktu || !jumlah_orang || !nomor_meja) {
      return NextResponse.json(
        { success: false, error: 'Semua field wajib harus diisi.' },
        { status: 400 }
      );
    }

    if (nomor_hp.replace(/\D/g, '').length < 10) {
      return NextResponse.json(
        { success: false, error: 'Nomor HP minimal 10 digit.' },
        { status: 400 }
      );
    }

    if (jumlah_orang < 1 || jumlah_orang > 20) {
      return NextResponse.json(
        { success: false, error: 'Jumlah orang harus antara 1 dan 20.' },
        { status: 400 }
      );
    }

    if (nomor_meja < 1 || nomor_meja > 15) {
      return NextResponse.json(
        { success: false, error: 'Nomor meja harus antara 1 dan 15.' },
        { status: 400 }
      );
    }

    // Mode demo: Supabase belum dikonfigurasi
    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase tidak dikonfigurasi – running in demo mode.');
      return NextResponse.json({
        success: true,
        kode_booking: generateKodeBooking(),
        demo_mode: true,
      });
    }

    // Cek konflik meja (±1 jam di hari yang sama)
    const [hour, minute] = waktu.split(':').map(Number);
    const startHour = Math.max(0, hour - 1);
    const endHour = Math.min(23, hour + 1);
    const startWaktu = `${String(startHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const endWaktu = `${String(endHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    const { data: existing, error: checkError } = await supabase
      .from('reservasi')
      .select('id')
      .eq('tanggal', tanggal)
      .eq('nomor_meja', nomor_meja)
      .gte('waktu', startWaktu)
      .lte('waktu', endWaktu)
      .in('status', ['menunggu', 'dikonfirmasi'])
      .limit(1);

    if (checkError) throw checkError;

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Meja sudah dibooking di waktu tersebut. Coba meja atau waktu lain.' },
        { status: 409 }
      );
    }

    // Insert ke Supabase
    const { error: insertError } = await supabase.from('reservasi').insert({
      nama_pelanggan,
      nomor_hp,
      tanggal,
      waktu,
      jumlah_orang,
      nomor_meja,
      catatan: catatan || null,
    });

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      kode_booking: generateKodeBooking(),
    });
  } catch (err: any) {
    console.error('POST /api/reservasi error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Gagal menyimpan reservasi.' },
      { status: 500 }
    );
  }
}
