import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Control Center - Margasera Admin',
    template: '%s | Margasera Admin',
  },
  description: 'Control Center & Dashboard Manajemen Margasera Photography Studio',
  manifest: '/admin-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Margasera Admin',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0066CC',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <head>
        <link rel="manifest" href="/admin-manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Margasera Admin" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      {children}
    </>
  );
}

