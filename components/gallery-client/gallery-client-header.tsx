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
  // Format deadline date & waktu lokal (WIB)
  const deadlineDate = new Date(session.deadline);
  const formattedDeadlineDate = deadlineDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const deadlineHours = String(deadlineDate.getHours()).padStart(2, '0');
  const deadlineMinutes = String(deadlineDate.getMinutes()).padStart(2, '0');
  const formattedDeadlineTime = `${deadlineHours}:${deadlineMinutes} WIB`;

  // Realtime countdown ticker
  const [now, setNow] = React.useState<number>(() => Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const diffMs = deadlineDate.getTime() - now;
  const isExpired = diffMs <= 0;

  // Breakdown sisa waktu
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const diffDays = Math.floor(totalSeconds / 86400);
  const diffHours = Math.floor((totalSeconds % 86400) / 3600);
  const diffMinutes = Math.floor((totalSeconds % 3600) / 60);
  const diffSecs = totalSeconds % 60;

  const isUrgent = !isExpired && diffDays === 0; // Kurang dari 24 jam

  let remainingText = '';
  if (isExpired) {
    remainingText = 'Waktu Habis';
  } else if (diffDays > 1) {
    remainingText = `Sisa ${diffDays} hari ${diffHours} jam`;
  } else if (diffDays === 1) {
    remainingText = `Sisa 1 hari ${diffHours} jam ${diffMinutes} mnt`;
  } else if (diffHours > 0) {
    remainingText = `Sisa ${diffHours} jam ${diffMinutes} mnt ${diffSecs} dtk`;
  } else {
    remainingText = `Sisa ${diffMinutes} mnt ${diffSecs} dtk`;
  }

  // Build clean WhatsApp link
  const rawWa = session.whatsappContact || '085806138955';
  const cleanWa = rawWa.replace(/\D/g, '');
  const targetWa = cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa;

  const waMessage = encodeURIComponent(
    `Halo Margasera Photography, saya ${session.clientName} ingin bertanya mengenai proses pilih foto sesi ${session.eventTitle}.`
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
              Galeri Foto Klien
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
              {session.clientName}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{session.eventTitle}</span>
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

          {/* Sisa Waktu & Batas Pilih Foto Badge */}
          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/90 text-xs shrink-0 shadow-sm">
            <Clock
              className={`w-5 h-5 shrink-0 ${isExpired
                ? 'text-rose-500 dark:text-rose-400'
                : isUrgent
                  ? 'text-amber-500 dark:text-amber-400 animate-pulse'
                  : 'text-[#0066CC]'
                }`}
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                Batas Waktu Pilih Foto
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs sm:text-[13px]">
                  {formattedDeadlineDate}, {formattedDeadlineTime}
                </span>
                <span
                  className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full inline-block ${isExpired
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
                    : isUrgent
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60'
                      : 'bg-blue-50 dark:bg-blue-950/50 text-[#0066CC] dark:text-sky-400 border border-blue-200 dark:border-blue-900/40'
                    }`}
                >
                  {remainingText}
                </span>
              </div>
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
