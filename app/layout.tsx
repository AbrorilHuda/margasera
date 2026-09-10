import type { Metadata, Viewport } from 'next';
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

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Margasera Photography | Fotografer Pamekasan & Madura',
    template: '%s | Margasera Photography',
  },
  description: 'Margasera Photography adalah fotografer profesional di Pamekasan, Madura dengan slogan "Moment Satu Hari Untuk Selamanya". Melayani Wedding, Pre-Wedding, Engagement, Siraman, Wisuda Outdoor, Sidang Skripsi, serta Tasyakuran 40 Hari Bayi.',
  keywords: [
    'Margasera Photography',
    'Moment Satu Hari Untuk Selamanya',
    'Margasera',
    'Margasera Photo',
    'Margasera Foto',
    'Margasera Pamekasan',
    'Margasera Madura',
    'Margasera Photography Pamekasan',
    'Margasera Photography Madura',
    'Fotografer Pamekasan',
    'Fotografer Madura',
    'Wedding Photography Pamekasan',
    'Pre-Wedding Pamekasan',
    'Engagement Pamekasan',
    'Fotografer Siraman Pamekasan',
    'Foto Wisuda Outdoor Madura',
    'Foto Sidang Skripsi Pamekasan',
    'Tasyakuran 40 Hari Bayi Madura',
    'Studio Foto Pamekasan',
  ],
  authors: [{ name: 'Margasera Photography', url: siteUrl }],
  creator: 'Margasera Photography',
  publisher: 'Margasera Photography',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'Margasera Photography | Fotografer Pamekasan & Madura',
    description: 'Fotografer profesional di Pamekasan, Madura — "Moment Satu Hari Untuk Selamanya". Melayani Wedding, Pre-Wedding, Engagement, Siraman, Wisuda Outdoor, Sidang Skripsi, dan Tasyakuran 40 Hari Bayi.',
    url: siteUrl,
    siteName: 'Margasera Photography',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Margasera Photography - Moment Satu Hari Untuk Selamanya',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Margasera Photography | Fotografer Pamekasan & Madura',
    description: 'Moment Satu Hari Untuk Selamanya — Fotografer profesional di Pamekasan, Madura.',
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
    '@type': ['PhotographyBusiness', 'LocalBusiness'],
    '@id': `${siteUrl}/#organization`,
    name: 'Margasera Photography',
    alternateName: ['Margasera', 'Margasera Photo', 'Margasera Foto'],
    slogan: 'Moment Satu Hari Untuk Selamanya',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    image: `${siteUrl}/og-image.png`,
    description: 'Creative photography studio profesional di Pamekasan, Madura dengan slogan "Moment Satu Hari Untuk Selamanya". Melayani Wedding, Pre-Wedding, Engagement, Siraman, Wisuda Outdoor, Sidang Skripsi, serta Tasyakuran 40 Hari Bayi.',
    telephone: '+6285806138955',
    email: 'hello@margasera.id',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Pamekasan',
      addressRegion: 'Jawa Timur',
      addressCountry: 'ID',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -7.1611,
      longitude: 113.4799,
    },
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Pamekasan' },
      { '@type': 'AdministrativeArea', name: 'Madura' },
      { '@type': 'AdministrativeArea', name: 'Bangkalan' },
      { '@type': 'AdministrativeArea', name: 'Sampang' },
      { '@type': 'AdministrativeArea', name: 'Sumenep' },
      { '@type': 'AdministrativeArea', name: 'Jawa Timur' },
      { '@type': 'Country', name: 'Indonesia' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Layanan Fotografi Margasera Photography',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Wedding',
            description: 'Dokumentasi sinematik momen pernikahan (Akad & Resepsi) dengan sentuhan editorial dan emosi timeless di Pamekasan & Madura.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Pre-Wedding',
            description: 'Sesi foto pre-wedding intim berkonsep editorial di lokasi outdoor/studio pilihan di Madura dan sekitarnya.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Engagement',
            description: 'Potret romantis dan momen lamaran / tunangan yang menangkap gestur alami pasangan.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Siraman',
            description: 'Dokumentasi prosesi adat siraman sakral penuh kekhidmatan keluarga di Pamekasan & Madura.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Wisuda Outdoor',
            description: 'Dokumentasi kelulusan outdoor estetik bersama keluarga dan kerabat terdekat.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Sidang Skripsi',
            description: 'Abadikan momen bersejarah keberhasilan kelulusan ujian skripsi bersama sahabat dan keluarga.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Tasyakuran 40 Hari Bayi',
            description: 'Dokumentasi kehangatan masa kehamilan dan tasyakuran aqiqah / 40 hari kelahiran buah hati tercinta.',
          },
        },
      ],
    },
    sameAs: [
      'https://instagram.com/margasera.id',
      'https://www.tiktok.com/@margasera',
    ],
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

