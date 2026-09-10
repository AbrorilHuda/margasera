import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FileText,
  CalendarCheck,
  CreditCard,
  RotateCcw,
  Clock,
  Camera,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan Layanan (Terms of Service)',
  description:
    'Syarat dan ketentuan pemesanan layanan dokumentasi fotografi Margasera Photography di Pamekasan & Madura — "Moment Satu Hari Untuk Selamanya".',
  alternates: {
    canonical: '/terms-of-service',
  },
  openGraph: {
    title: 'Syarat & Ketentuan Layanan | Margasera Photography',
    description:
      'Syarat, prosedur booking, jadwal, serta hak cipta dokumentasi fotografi di Margasera Photography Pamekasan Madura.',
    url: '/terms-of-service',
    siteName: 'Margasera Photography',
    locale: 'id_ID',
    type: 'website',
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = '10 September 2026';

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors py-16 sm:py-24 px-4 sm:px-6 md:px-12 overflow-hidden">
      {/* Ambient background light orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-gradient-to-b from-[#0066CC]/15 via-indigo-600/5 to-transparent blur-3xl opacity-70 dark:opacity-80 rounded-full" />
        <div className="absolute top-1/2 -left-32 w-[350px] h-[350px] bg-amber-500/5 dark:bg-amber-500/8 blur-3xl rounded-full" />
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
            <FileText className="w-4 h-4 text-[#0066CC] dark:text-blue-400" />
            <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#0066CC] dark:text-blue-400">
              KESEPAKATAN LAYANAN
            </span>
          </div>

          <h1 className="font-serif-editorial text-3xl sm:text-5xl text-zinc-900 dark:text-white font-light tracking-wide uppercase">
            Syarat &amp; Ketentuan Layanan
          </h1>

          <p className="font-serif text-sm sm:text-base text-amber-600 dark:text-amber-400 italic">
            &ldquo;Moment Satu Hari Untuk Selamanya&rdquo;
          </p>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
            Terakhir diperbarui: <span className="font-mono text-zinc-800 dark:text-zinc-200">{lastUpdated}</span>.
            Dengan melakukan pemesanan (booking) ataupun menggunakan jasa Margasera Photography, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan layanan di bawah ini.
          </p>
        </div>

        {/* Terms Content Sections */}
        <div className="flex flex-col gap-8 text-sm text-zinc-700 dark:text-zinc-300 font-light leading-relaxed">
          {/* Section 1 */}
          <div className="p-6 sm:p-8 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-xs dark:shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-zinc-900 dark:text-white">
              <div className="w-10 h-10 rounded-xl bg-[#0066CC]/10 dark:bg-blue-950/50 text-[#0066CC] dark:text-blue-400 flex items-center justify-center shrink-0 border border-[#0066CC]/20">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold tracking-tight font-sans">
                1. Pemesanan Jadwal &amp; Uang Muka (Deposit / DP)
              </h2>
            </div>
            <p>
              Setiap pemesanan sesi dokumentasi resmi di Margasera Photography tunduk pada ketentuan reservasi berikut:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
              <li>Jadwal tanggal acara dinyatakan terkunci resmi (*locked booking*) setelah klien melakukan pembayaran Uang Muka (DP) sesuai nominal paket yang dipilih.</li>
              <li>Sebelum pembayaran DP dilakukan, tanggal yang Anda inginkan tetap berstatus terbuka dan dapat dipesan oleh calon klien lain sewaktu-waktu.</li>
              <li>Setelah DP diverifikasi, sistem akan menerbitkan <strong>Kode Booking Resmi</strong> (contoh: <code>MS-260815-123</code>) yang dapat digunakan untuk memeriksa status secara online dan verifikasi ulasan.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="p-6 sm:p-8 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-xs dark:shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-zinc-900 dark:text-white">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold tracking-tight font-sans">
                2. Ketentuan Pelunasan Pembayaran
              </h2>
            </div>
            <p>
              Pelunasan sisa biaya dokumentasi dapat diselesaikan maksimal pada hari H pelaksanaan acara pemotretan atau sebelum penyerahan seluruh file master akhir (high-resolution). Invoice digital resmi akan dikirimkan sebagai bukti pembayaran sah.
            </p>
          </div>

          {/* Section 3 */}
          <div className="p-6 sm:p-8 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-xs dark:shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-zinc-900 dark:text-white">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold tracking-tight font-sans">
                3. Kebijakan Reschedule &amp; Pembatalan
              </h2>
            </div>
            <p>
              Kami memahami adanya kemungkinan perubahan rencana dalam sebuah perayaan. Kebijakan pergantian jadwal diatur sebagai berikut:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-1.5">
                <span className="font-semibold text-zinc-900 dark:text-white">Perubahan Jadwal (Reschedule):</span>
                <span>Pemberitahuan perubahan tanggal minimal <strong>14 hari kerja</strong> sebelum hari H tanpa denda, selama jadwal baru fotografer Margasera masih tersedia.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-1.5">
                <span className="font-semibold text-zinc-900 dark:text-white">Pembatalan (Cancellation):</span>
                <span>Uang muka (DP) yang telah disetorkan bersifat <em>non-refundable</em> (tidak dapat dikembalikan), karena tanggal tersebut telah dialokasikan khusus dan menolak penawaran lain.</span>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="p-6 sm:p-8 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-xs dark:shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-zinc-900 dark:text-white">
              <div className="w-10 h-10 rounded-xl bg-[#0066CC]/10 dark:bg-blue-950/50 text-[#0066CC] dark:text-blue-400 flex items-center justify-center shrink-0 border border-[#0066CC]/20">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold tracking-tight font-sans">
                4. Pasca-Produksi &amp; Waktu Penyerahan File
              </h2>
            </div>
            <p>
              Setiap foto yang dihasilkan melewati proses kurasi dan <em>color grading</em> estetik editorial khas Margasera Studio:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm">
              <li><strong>Preview Cepat:</strong> Foto cuplikan terbaik (preview) dikirimkan dalam 2–4 hari setelah acara untuk kebutuhan unggahan media sosial klien.</li>
              <li><strong>File Lengkap:</strong> Seluruh foto hasil editing warna beresolusi tinggi diserahkan melalui Google Drive dalam waktu 7–14 hari kerja.</li>
              <li><strong>Masa Penyimpanan:</strong> Link unduhan dijamin aktif minimal 3 (tiga) bulan. Klien disarankan mengunduh dan mencadangkan file ke media penyimpanan pribadi.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="p-6 sm:p-8 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-xs dark:shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-zinc-900 dark:text-white">
              <div className="w-10 h-10 rounded-xl bg-[#0066CC]/10 dark:bg-blue-950/50 text-[#0066CC] dark:text-blue-400 flex items-center justify-center shrink-0 border border-[#0066CC]/20">
                <Camera className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold tracking-tight font-sans">
                5. Hak Cipta &amp; Izin Penggunaan Karya
              </h2>
            </div>
            <p>
              Klien diberikan hak pakai non-komersial seumur hidup untuk mencetak, membagikan, dan mengunggah foto ke media sosial pribadi. Hak cipta pencipta tetap dimiliki oleh Margasera Photography. Margasera berhak menampilkan hasil karya pada portofolio, pameran seni, website, dan media sosial resmi, kecuali ada perjanjian tertulis sebelumnya mengenai sesi privat.
            </p>
          </div>

          {/* Section 6 */}
          <div className="p-6 sm:p-8 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-xs dark:shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-zinc-900 dark:text-white">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold tracking-tight font-sans">
                6. Batasan Tanggung Jawab &amp; Force Majeure
              </h2>
            </div>
            <p>
              Margasera selalu menyiapkan perangkat kamera profesional ganda (backup camera &amp; dual card slot recording) untuk mencegah risiko kegagalan teknis. Namun demikian, dalam keadaan di luar kendali manusia (*force majeure*) seperti bencana alam, kerusuhan, kecelakaan, atau pembatasan darurat pemerintah, tanggung jawab maksimal dibatasi sebatas pengembalian dana yang telah disetorkan.
            </p>
          </div>

          {/* Bottom Consultation CTA */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-blue-50/50 to-white dark:from-zinc-900/90 dark:to-zinc-950 border border-blue-100 dark:border-zinc-800/90 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                Punya Pertanyaan Mengenai Ketentuan Layanan?
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-1">
                Tim Margasera siap menjelaskan setiap detail kebutuhan dokumentasi hari istimewa Anda.
              </p>
            </div>
            <Link
              href="/booking"
              className="shrink-0 px-5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider bg-[#0066CC] hover:bg-[#0052A3] text-white transition-all shadow-md shadow-[#0066CC]/20 active:scale-95"
            >
              Konsultasi Jadwal Acara
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
