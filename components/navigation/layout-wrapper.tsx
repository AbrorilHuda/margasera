'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navigation/navbar';

export function LayoutWrapper({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isGallery = pathname?.startsWith('/g/');

  if (isAdmin || isGallery) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans antialiased selection:bg-[#0066CC] selection:text-white transition-colors duration-300">
        {children}
      </div>
    );
  }

  const isHome = pathname === '/';

  return (
    <>
      <Navbar />
      <main className={`flex-1 w-full ${isHome ? '' : 'pt-[calc(env(safe-area-inset-top,0px)+5rem)]'}`}>
        {children}
      </main>
      {footer}
    </>
  );
}
