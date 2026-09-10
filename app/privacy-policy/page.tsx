import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  UserCheck,
  Mail,
  ArrowLeft,
  Camera,
  CheckCircle2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi (Privacy Policy)',
  description:
    'Kebijakan privasi Margasera Photography. Pelajari bagaimana kami melindungi data pribadi, dokumentasi foto, dan informasi klien dengan standar keamanan dan etika profesional.',
  alternates: {
    canonical: '/privacy-policy',
  },
  openGraph: {
    title: 'Kebijakan Privasi | Margasera Photography',
    description:
      'Kebijakan privasi dan perlindungan data dokumentasi visual klien di Margasera Photography, Pamekasan - Madura.',
    url: '/privacy-policy',
    siteName: 'Margasera Photography',
    locale: 'id_ID',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = '10 September 2026';

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors py-16 sm:py-24 px-4 sm:px-6 md:px-12 overflow-hidden">
      {/* Ambient background light orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-gradient-to-b from-[#0066CC]/15 via-indigo-600/5 to-transparent blur-3xl opacity-70 dark:opacity-80 rounded-full" />
        <div className="absolute top-1/3 -right-32 w-[350px] h-[350px] bg-blue-500/5 dark:bg-[#0066CC]/10 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-zinc-500 dark:text-zinc-400 hover:text-[#0066CC] dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 dark:border-blue-500/30 backdrop-blur-md w-fit">
            <ShieldCheck className="w-4 h-4 text-[#0066CC] dark:text-blue-400" />
            <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#0066CC] dark:text-blue-400">
              LEGALITAS &amp; PRIVASI
            </span>
          </div>

          <h1 className="font-serif-editorial text-3xl sm:text-5xl text-zinc-900 dark:text-white font-light tracking-wide uppercase">
            Kebijakan Privasi
          </h1>

          <p className="font-serif text-sm sm:text-base text-amber-600 dark:text-amber-400 italic">
            &ldquo;Moment Satu Hari Untuk Selamanya&rdquo;
          </p>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
            Terakhir diperbarui: <span className="font-mono text-zinc-800 dark:text-zinc-200">{lastUpdated}</span>.
            Margasera Photography menghormati dan berkomitmen penuh untuk menjaga kerahasiaan data pribadi serta karya dokumentasi setiap klien kami di Pamekasan, Madura, dan sekitarnya.
          </p>
        </div>

        {/* Policy Content Sections */}
        <div className="flex flex-col gap-8 text-sm text-zinc-700 dark:text-zinc-300 font-light leading-relaxed">
          {/* Section 1 */}
          <div className="p-6 sm:p-8 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-xs dark:shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-zinc-900 dark:text-white">
              <div className="w-10 h-10 rounded-xl bg-[#0066CC]/10 dark:bg-blue-950/50 text-[#0066CC] dark:text-blue-400 flex items-center justify-center shrink-0 border border-[#0066CC]/20">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold tracking-tight font-sans">
                1. Informasi yang Kami Kumpulkan
              </h2>
            </div>
            <p>
              Saat Anda melakukan pemesanan sesi, konsultasi, ataupun mengirimkan ulasan melalui platform Margasera Photography, kami mengumpulkan beberapa data yang Anda berikan secara sukarela, antara lain:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs">
              <li className="flex items-start gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Identitas:</strong> Nama lengkap dan nama pasangan/keluarga.</span>
              </li>
              <li className="flex items-start gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Kontak:</strong> Nomor telepon / WhatsApp aktif dan email.</span>
              </li>
              <li className="flex items-start gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Detail Acara:</strong> Tanggal acara, lokasi pemotretan, &amp; paket layanan.</span>
              </li>
              <li className="flex items-start gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Ulasan &amp; Testimoni:</strong> Cerita pengalaman, rating kepuasan, dan foto opsional.</span>
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="p-6 sm:p-8 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-xs dark:shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-zinc-900 dark:text-white">
              <div className="w-10 h-10 rounded-xl bg-[#0066CC]/10 dark:bg-blue-950/50 text-[#0066CC] dark:text-blue-400 flex items-center justify-center shrink-0 border border-[#0066CC]/20">
                <Eye className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold tracking-tight font-sans">
                2. Penggunaan Informasi Klien
              </h2>
            </div>
            <p>Informasi yang terkumpul digunakan semata-mata untuk kepentingan operasional dokumentasi visual, mencakup:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
              <li>Memproses reservasi tanggal, koordinasi kru, dan konfirmasi jadwal sesi pemotretan.</li>
              <li>Penyusunan invoice resmi, kwitansi pembayaran, serta catatan deposit (DP) dan pelunasan.</li>
              <li>Pengiriman file preview foto dan penyerahan link Google Drive / galeri final beresolusi tinggi.</li>
              <li>Verifikasi ulasan testimoni klien resmi agar ulasan yang tampil di website adalah 100% otentik.</li>
              <li>Layanan pelanggan, konsultasi konsep busana/lokasi, dan tindak lanjut pasca-acara.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="p-6 sm:p-8 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-xs dark:shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-zinc-900 dark:text-white">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                <Camera className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold tracking-tight font-sans">
                3. Hak Cipta &amp; Penayangan Portofolio
              </h2>
            </div>
            <p>
              Sebagai studio kreatif, Margasera Photography memegang hak cipta artistik atas seluruh karya foto dan video yang dihasilkan sesuai hukum hak cipta yang berlaku di Indonesia.
            </p>
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
              <strong>Privasi Klien Prioritas Utama:</strong> Jika Anda menghendaki sesi dokumentasi Anda bersifat privat (tidak ditampilkan pada portofolio website atau media sosial Instagram/TikTok kami), Anda berhak memberitahukan tim kami sebelum atau saat sesi pemesanan disepakati tanpa biaya tambahan.
            </div>
          </div>

          {/* Section 4 */}
          <div className="p-6 sm:p-8 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-xs dark:shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-zinc-900 dark:text-white">
              <div className="w-10 h-10 rounded-xl bg-[#0066CC]/10 dark:bg-blue-950/50 text-[#0066CC] dark:text-blue-400 flex items-center justify-center shrink-0 border border-[#0066CC]/20">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold tracking-tight font-sans">
                4. Keamanan &amp; Penyimpanan Data
              </h2>
            </div>
            <p>
              Kami menerapkan standar enkripsi SSL/TLS, otentikasi database terisolasi melalui Supabase, serta protokol akses terbatas bagi tim internal. Kami tidak pernah dan tidak akan menjual, menyewakan, atau membagikan data kontak Anda kepada pihak ketiga manapun untuk tujuan pemasaran komersial.
            </p>
          </div>

          {/* Section 5 */}
          <div className="p-6 sm:p-8 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-xs dark:shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-zinc-900 dark:text-white">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold tracking-tight font-sans">
                5. Hak &amp; Permintaan Klien
              </h2>
            </div>
            <p>
              Setiap klien memiliki hak penuh untuk meminta pembaruan data kontak, meminta arsip file foto ulang jika terjadi kehilangan pada batas waktu garansi, ataupun meminta penurunan foto dari showcase publik.
            </p>
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#0066CC] text-white hover:bg-[#0052A3] transition-colors shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Hubungi Layanan Bantuan Klien</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
