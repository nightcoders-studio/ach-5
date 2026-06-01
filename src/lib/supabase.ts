import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = 
  supabaseUrl.trim() !== '' && 
  supabaseAnonKey.trim() !== '' &&
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase credentials are missing or placeholder. Running in demo Mock Fallback mode.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type ReservasiInsert = {
  nama_pelanggan: string;
  nomor_hp: string;
  tanggal: string;   // format: "2026-06-15"
  waktu: string;     // format: "14:30"
  jumlah_orang: number;
  nomor_meja: number;
  catatan?: string;
};

export type ReservasiRow = ReservasiInsert & {
  id: string;
  status: 'menunggu' | 'dikonfirmasi' | 'selesai' | 'dibatalkan';
  created_at: string;
};
