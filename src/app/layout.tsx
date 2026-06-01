import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
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
  themeColor: '#C2660A',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="bg-[#FAFAF7] min-h-screen">
        <div className="mobile-shell">
          <main className="pb-16 md:pb-0">
            {children}
          </main>
          <Navbar />
        </div>
      </body>
    </html>
  );
}
