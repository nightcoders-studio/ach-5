<!-- KUPITA -->
<div align="center">

<img src="public/smart-coffee.svg" alt="KUPITA Logo" width="180" />

# KUPITA

### *Kopi Untuk Pikiran Terindah Anda*

Platform QR Menu Digital + AI Assistant + Reservasi Meja  
untuk cafe & warkop modern di Aceh

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**[🚀 Live Demo](#)** • **[📋 Fitur](#-fitur-utama)** • **[⚡ Quick Start](#-quick-start)** • **[🗄️ Database](#️-database-schema)**

</div>

---

## 💡 Tentang KUPITA

**KUPITA** (Kopi Untuk Pikiran Terindah Anda) adalah platform pemesanan digital cerdas yang dirancang khusus untuk cafe dan warkop modern di Aceh. Pelanggan cukup **scan QR code** di meja, langsung bisa melihat menu lengkap, berkonsultasi dengan **AI Assistant berbasis Gemini**, hingga melakukan **reservasi meja** — semua dari satu platform yang responsif dan mudah digunakan.

> Dibangun dalam 12 jam untuk **Aceh Hackathon 2026** oleh tim Night Coders Studio.

---

## 🚀 Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 📋 **Smart Digital Menu** | Menu interaktif dengan rating visual (manis/kopi/asam), filter kategori, search, dan sort |
| 🤖 **AI Menu Assistant** | Chat dengan Gemini AI yang merekomendasikan menu sesuai preferensi & mood pelanggan |
| 😊 **Mood-Based Recommendation** | Pilih mood (Happy, Ngantuk, Belajar, Kerja, Nongkrong) → AI langsung rekomendasikan menu yang cocok |
| 📅 **Reservasi Meja** | Booking meja dengan denah visual interaktif, cek ketersediaan real-time dari Supabase |
| ✅ **Konfirmasi Booking** | Halaman sukses dengan kode booking unik (WK-XXXX) |
| 📱 **Mobile-First** | Dioptimalkan untuk smartphone — perfect setelah scan QR |

---

## 🛠️ Tech Stack

```
Framework   : Next.js 14 (App Router)
Language    : TypeScript
Styling     : Tailwind CSS
AI Engine   : Google Gemini API (gemini-2.0-flash)
Database    : Supabase (PostgreSQL)
Deploy      : Vercel
Font        : Inter (Google Fonts)
Icons       : Lucide React
```

---

## 📁 Struktur Proyek

```
src/
├── app/
│   ├── layout.tsx                  ← Root layout + font
│   ├── page.tsx                    ← Landing / QR entry page
│   ├── menu/page.tsx               ← Smart Digital Menu
│   ├── ai-assistant/page.tsx       ← AI Chat + Mood Picker
│   ├── reservasi/
│   │   ├── page.tsx                ← Form Reservasi Meja
│   │   └── sukses/page.tsx         ← Halaman konfirmasi
│   └── api/
│       ├── chat/route.ts           ← Gemini API endpoint
│       └── reservasi/route.ts      ← Supabase CRUD endpoint
├── components/
│   ├── Navbar.tsx                  ← Bottom navigation bar
│   ├── MenuCard.tsx                ← Card item menu
│   ├── RatingBar.tsx               ← Visual rating bar
│   ├── MoodPicker.tsx              ← Tombol pilih mood
│   └── ChatBubble.tsx              ← Chat bubble component
└── data/
    └── menu.json                   ← Data menu (15 item)
```

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/nightcoders-studio/ach-5.git
cd ach-5
npm install
```

### 2. Setup Environment Variables

Buat file `.env.local` di root project:

```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

| Variable | Cara Mendapatkan |
|---|---|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `NEXT_PUBLIC_SUPABASE_URL` | Dashboard Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dashboard Supabase → Settings → API |

### 3. Setup Database Supabase

Jalankan SQL berikut di **Supabase SQL Editor**:

```sql
create table reservasi (
  id uuid default gen_random_uuid() primary key,
  nama_pelanggan text not null,
  nomor_hp text not null,
  tanggal date not null,
  waktu time not null,
  jumlah_orang integer not null check (jumlah_orang between 1 and 20),
  nomor_meja integer not null check (nomor_meja between 1 and 15),
  catatan text,
  status text default 'menunggu' check (status in ('menunggu', 'dikonfirmasi', 'selesai', 'dibatalkan')),
  created_at timestamp with time zone default now()
);
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser. ✨

---

## 🗄️ Database Schema

### Tabel `reservasi`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid | Primary key (auto-generated) |
| `nama_pelanggan` | text | Nama lengkap pelanggan |
| `nomor_hp` | text | Nomor HP untuk konfirmasi |
| `tanggal` | date | Tanggal reservasi |
| `waktu` | time | Waktu reservasi |
| `jumlah_orang` | integer | Jumlah tamu (1-20) |
| `nomor_meja` | integer | Nomor meja yang dipesan (1-15) |
| `catatan` | text | Catatan khusus (opsional) |
| `status` | text | menunggu / dikonfirmasi / selesai / dibatalkan |
| `created_at` | timestamptz | Waktu booking dibuat |

---

## 🎯 User Flow

```
[Scan QR Code]
      |
      v
[Landing Page] --------------------------+
      |                                  |
      v                                  v
[Smart Menu]                    [AI Assistant]
  - Filter kategori               - Pilih mood
  - Search & sort                 - Chat dengan Gemini
  - Rating visual                 - Rekomendasi personal
      |                                  |
      +--------------+-----------------+
                     |
                     v
              [Reservasi]
                - Denah meja visual
                - Form booking
                     |
                     v
              [Booking Sukses]
                - Kode WK-XXXX
```

---

## 🌐 Deploy ke Vercel

1. Push kode ke GitHub
2. Import repo di [vercel.com/new](https://vercel.com/new)
3. Tambahkan environment variables di Vercel dashboard
4. Deploy otomatis! 🚀

---

## 📦 Dependencies

```bash
npm install @google/generative-ai @supabase/supabase-js lucide-react
```

---

## 👥 Tim

Dibuat dengan ☕ oleh **Night Coders Studio** untuk **Aceh Hackathon 2026**.

---

## 📄 Lisensi

[MIT License](LICENSE) — bebas digunakan dan dimodifikasi.

---

<div align="center">
  <p>Made with ☕ and love in Banda Aceh</p>
  <p><strong>KUPITA</strong> — Scan. Pilih. Pesan.</p>
</div>
