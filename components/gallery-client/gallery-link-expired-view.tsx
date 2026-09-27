'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, MessageCircle, Home, ShieldCheck, Sparkles } from 'lucide-react';
import { ClientGallerySession } from '@/lib/types';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface GalleryLinkExpiredViewProps {
  session: ClientGallerySession;
  whatsappContact?: string;
}

export function GalleryLinkExpiredView({
  session,
  whatsappContact = '6285806138955',
}: GalleryLinkExpiredViewProps) {
  const cleanWa = whatsappContact.replace(/\D/g, '');
  const targetWa = cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa;

  const waMessage = encodeURIComponent(
    `Halo Margasera Photography, saya ${session.clientName} ingin menanyakan akses galeri sesi "${session.eventTitle}" yang masa aktif 30 harinya telah berakhir. Apakah saya bisa meminta akses atau arsip fotonya kembali? Terima kasih.`
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

        {/* Expired Clock Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-xl transform scale-150" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-400 p-0.5 shadow-xl">
            <div className="w-full h-full rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner">
              <Clock className="w-10 h-10 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Masa Aktif Tautan Selesai (30 Hari)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif-editorial font-normal tracking-tight text-zinc-900 dark:text-zinc-100">
            Tautan Galeri Telah Berakhir
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            Masa aktif galeri seleksi foto untuk{' '}
            <span className="text-zinc-900 dark:text-zinc-200 font-semibold">"{session.eventTitle}"</span> ({session.clientName})
            telah melewati batas waktu 30 hari.
          </p>
        </div>

        {/* Policy & Explanation Card */}
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-left space-y-3 shadow-md text-xs text-zinc-700 dark:text-zinc-300">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block text-zinc-900 dark:text-zinc-100">
                Kebijakan Privasi & Penyimpanan Data Studio:
              </span>
              <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                <li>Demi menjaga privasi klien, tautan akses publik galeri otomatis ditutup setelah 30 hari.</li>
                <li>Data pilihan foto yang sudah pernah Anda kirimkan telah tersimpan aman di sistem studio kami.</li>
                <li>Jika Anda memerlukan perpanjangan akses atau file foto kembali, tim studio kami siap membantu.</li>
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
            <span>Minta Bantuan / Perpanjangan Akses via WhatsApp</span>
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
