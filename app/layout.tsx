import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

import { LayoutWrapper } from '@/components/navigation/layout-wrapper';
import { Footer } from '@/components/navigation/footer';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/ui/toast-context';
import { GoogleAnalytics } from '@next/third-parties/google';

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://margasera.id';
const gaId = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Margasera Photography - Editorial & Cinematic Visual Stories',
    template: '%s - Margasera Photography',
  },
  description: 'Platform portofolio fotografi sinematik & pemesanan tanggal untuk wedding, pre-wedding, couple, graduation & portrait di Madura dan sekitarnya.',
  keywords: [
    'Margasera Photography',
    'Fotografer Wedding Madura',
    'Prewedding Madura',
    'Photography Booking Madura',
    'Fotografer Pernikahan Madura',
    'Editorial Photography',
  ],
  authors: [{ name: 'Margasera Photography', url: siteUrl }],
  creator: 'Margasera Photography',
  publisher: 'Margasera Photography',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'Margasera Photography - Editorial & Cinematic Visual Stories',
    description: 'Platform portofolio fotografi sinematik & pemesanan tanggal untuk wedding, pre-wedding, couple, & portrait di Madura dan sekitarnya.',
    url: siteUrl,
    siteName: 'Margasera Photography',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Margasera Photography',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Margasera Photography',
    description: 'Editorial & Cinematic Visual Stories in Madura & Beyond',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Margasera Photography',
    url: siteUrl,
    image: `${siteUrl}/og-image.png`,
    description: 'Platform portofolio fotografi sinematik & pemesanan tanggal untuk wedding, pre-wedding, couple, & portrait di Madura dan sekitarnya.',
    areaServed: 'Madura & Indonesia',
  };

  return (
    <html lang="id" className={`${cormorant.variable} ${jakarta.variable} dark scroll-smooth`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased selection:bg-[#0066CC] selection:text-white transition-colors duration-300">
        <ThemeProvider>
          <ToastProvider>
            <LayoutWrapper footer={<Footer />}>
              {children}
            </LayoutWrapper>
          </ToastProvider>
        </ThemeProvider>
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}

