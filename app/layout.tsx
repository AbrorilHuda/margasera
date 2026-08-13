import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-serif',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Margasera Photography - Editorial & Cinematic Visual Stories',
  description: 'Platform portofolio photography sinematik & pemesanan tanggal untuk wedding, pre-wedding, couple, & portrait di Madura dan sekitarnya.',
  keywords: ['Margasera Photography', 'Wedding Photographer Madura', 'Prewedding Madura', 'Photography Booking Madura'],
  openGraph: {
    title: 'Margasera Photography',
    description: 'Editorial & Cinematic Visual Stories in Madura & Beyond',
    url: 'https://margasera.id',
    siteName: 'Margasera Photography',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${cormorant.variable} ${jakarta.variable} dark scroll-smooth`}>
      <body className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased selection:bg-amber-400 selection:text-black">
        <Navbar />
        <main className="flex-1 w-full pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
