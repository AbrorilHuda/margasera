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

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased selection:bg-[#0066CC] selection:text-white">
        {children}
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full pt-20">
        {children}
      </main>
      {footer}
    </>
  );
}
