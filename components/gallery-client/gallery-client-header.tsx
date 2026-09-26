'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar, Clock, MapPin, MessageCircle, Sparkles, Lightbulb } from 'lucide-react';
import { ClientGallerySession } from '@/lib/types';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface GalleryClientHeaderProps {
  session: ClientGallerySession;
}

export function GalleryClientHeader({ session }: GalleryClientHeaderProps) {
  // Format deadline date
  const deadlineDate = new Date(session.deadline);
  const formattedDeadline = deadlineDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calculate days remaining
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isUrgent = diffDays <= 1 && diffDays >= 0;
  const isExpired = diffDays < 0;

  // Build clean WhatsApp link
  const rawWa = session.whatsappContact || '085806138955';
  const cleanWa = rawWa.replace(/\D/g, '');
  const targetWa = cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa;

  const waMessage = encodeURIComponent(
    `Halo Margasera Photography, saya ${session.clientName} ingin bertanya mengenai proses seleksi foto sesi ${session.eventTitle}.`
  );
  const waUrl = `https://wa.me/${targetWa}?text=${waMessage}`;

  return (
    <header className="relative w-full border-b border-zinc-200 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transition-colors duration-300">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-radial-gradient from-blue-500/5 dark:from-blue-900/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-6">
        {/* Top Studio Brand Bar */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-900">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Margasera Photography"
              width={130}
              height={36}
              className="h-7 sm:h-8 w-auto object-contain dark:brightness-110"
              priority
            />
            <span className="hidden sm:inline-block w-px h-4 bg-zinc-300 dark:bg-zinc-800" />
            <span className="hidden sm:inline-block text-[11px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-medium">
              Galeri Seleksi Klien
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle className="w-8 h-8 rounded-lg" />

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-[11px] sm:text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden xs:inline">Bantuan Studio</span>
              <span className="xs:hidden">Bantuan</span>
            </a>
          </div>
        </div>

        {/* Client Sesi & Event Header */}
        <div className="mt-5 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#0066CC] font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Moment Satu Hari Untuk Selamanya</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif-editorial text-zinc-900 dark:text-zinc-100 font-normal tracking-tight">
              {session.eventTitle}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{session.clientName}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                {session.eventDate}
              </span>
              {session.location && (
                <>
                  <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                    {session.location}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Sisa Waktu & Batas Seleksi Badge */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/90 text-xs shrink-0 shadow-sm">
            <Clock
              className={`w-4 h-4 shrink-0 ${isExpired
                  ? 'text-rose-500 dark:text-rose-400'
                  : isUrgent
                    ? 'text-amber-500 dark:text-amber-400 animate-pulse'
                    : 'text-[#0066CC]'
                }`}
            />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                Batas Akhir Seleksi
              </span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {formattedDeadline}
                {!isExpired && (
                  <span
                    className={`ml-1.5 font-normal ${isUrgent
                        ? 'text-amber-600 dark:text-amber-400 font-medium'
                        : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                  >
                    ({diffDays === 0 ? 'Hari ini terakhir' : `tersisa ${diffDays} hari`})
                  </span>
                )}
                {isExpired && <span className="ml-1.5 text-rose-500 dark:text-rose-400">(Telah Berakhir)</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Petunjuk Seleksi Singkat */}
        {session.notes && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50/90 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 text-xs text-blue-950 dark:text-blue-200/90 leading-relaxed flex items-start gap-2 shadow-xs">
            <span className="text-base leading-none"><Lightbulb /></span>
            <p>{session.notes}</p>
          </div>
        )}
      </div>
    </header>
  );
}
