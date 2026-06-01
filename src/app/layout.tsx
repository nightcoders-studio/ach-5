import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'KUPITA — Kopi Untuk Pikiran Terindah Anda',
    template: '%s | KUPITA',
  },
  description:
    'Platform QR menu digital dengan AI assistant untuk membantu kamu memilih menu sesuai mood. Reservasi meja juga bisa langsung dari sini!',
  keywords: ['kopi', 'cafe', 'menu digital', 'reservasi', 'AI assistant', 'Banda Aceh'],
  authors: [{ name: 'Night Coders Studio' }],
  openGraph: {
    title: 'KUPITA — Kopi Untuk Pikiran Terindah Anda',
    description: 'Scan QR → Pilih Menu → Pesan. Sesederhana itu.',
    type: 'website',
    locale: 'id_ID',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#D97706',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body>
        <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', position: 'relative' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
