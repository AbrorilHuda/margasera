'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AlertCircle, MessageCircle, ArrowLeft, Home, HelpCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface GalleryNotFoundViewProps {
  slug: string;
  whatsappContact?: string;
}

export function GalleryNotFoundView({ slug, whatsappContact = '6285806138955' }: GalleryNotFoundViewProps) {
  const cleanWa = whatsappContact.replace(/\D/g, '');
  const targetWa = cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa;

  const waMessage = encodeURIComponent(
    `Halo Margasera Photography, saya mengalami kendala saat membuka link galeri personal: /g/${slug}. Mohon bantuannya ya kak.`
  );
  const waUrl = `https://wa.me/${targetWa}?text=${waMessage}`;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 transition-colors duration-300 relative">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle className="w-9 h-9 rounded-xl" />
      </div>

      <div className="w-full max-w-lg mx-auto space-y-6 text-center">
        {/* Studio Logo */}
        <div className="flex justify-center pb-2">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Margasera Photography"
              width={140}
              height={40}
              className="h-8 sm:h-9 w-auto object-contain dark:brightness-110 hover:opacity-90 transition-opacity"
              priority
            />
          </Link>
        </div>

        {/* Not Found Icon Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl transform scale-150" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-400 p-0.5 shadow-xl">
            <div className="w-full h-full rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
              <AlertCircle className="w-10 h-10 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono tracking-widest uppercase text-amber-600 dark:text-amber-400 font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 inline-block">
            Galeri Tidak Ditemukan
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif-editorial font-normal tracking-tight text-zinc-900 dark:text-zinc-100">
            Tautan Galeri Tidak Valid
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            Tautan galeri personal dengan kode{' '}
            <code className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
              /g/{slug}
            </code>{' '}
            tidak ditemukan atau belum terdaftar di sistem Margasera Photography.
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-left space-y-3 shadow-md text-xs text-zinc-700 dark:text-zinc-300">
          <div className="flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-[#0066CC] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block text-zinc-900 dark:text-zinc-100">
                Kemungkinan penyebab:
              </span>
              <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                <li>Tautan terpotong atau salah ketik saat disalin dari WhatsApp.</li>
                <li>Admin studio belum selesai menautkan folder foto untuk sesi ini.</li>
                <li>Tautan galeri telah diperbarui oleh studio dengan kode yang baru.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-6 rounded-xl font-semibold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Hubungi Admin Studio via WhatsApp</span>
          </a>

          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-2 transition-colors inline-flex"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda Margasera</span>
          </Link>
        </div>

        <p className="text-[11px] text-zinc-400 dark:text-zinc-600 italic">
          "Moment Satu Hari Untuk Selamanya" — Margasera Photography
        </p>
      </div>
    </div>
  );
}
