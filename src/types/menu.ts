export type KategoriMenu =
  | 'kopi_panas'
  | 'kopi_dingin'
  | 'non_kopi'
  | 'makanan_berat'
  | 'snack';

export type MoodType =
  | 'happy'
  | 'ngantuk'
  | 'belajar'
  | 'kerja'
  | 'nongkrong';

export interface MenuRating {
  manis: number;
  kekuatan_kopi: number;
  asam: number;
}

export interface MenuItem {
  id: string;
  nama: string;
  kategori: KategoriMenu;
  harga: number;
  deskripsi: string;
  gambar_emoji: string;
  rating: MenuRating;
  tags: string[];
  mood_cocok: MoodType[];
  tersedia: boolean;
  is_favorit: boolean;
  is_baru: boolean;
}
