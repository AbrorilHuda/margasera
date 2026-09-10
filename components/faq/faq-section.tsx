'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

export const HOME_FAQS: FAQItem[] = [
  {
    question: 'Apakah Margasera Photography berbasis di Pamekasan, Madura?',
    answer: 'Ya. Margasera Photography adalah studio fotografi profesional yang berbasis di Pamekasan, Madura. Mengusung slogan "Moment Satu Hari Untuk Selamanya", kami melayani dokumentasi di seluruh wilayah Madura (Pamekasan, Sumenep, Sampang, Bangkalan), Jawa Timur, hingga berbagai daerah di Indonesia.',
  },
  {
    question: 'Layanan fotografi apa saja yang disediakan oleh Margasera Photography?',
    answer: 'Margasera Photography melayani 7 kategori dokumentasi utama: Wedding, Pre-Wedding, Engagement, Siraman, Wisuda Outdoor, Sidang Skripsi, serta Tasyakuran 40 Hari Bayi. Seluruh layanan diproduksi dengan standar visual editorial dan sinematik.',
  },
  {
    question: 'Apa makna dari slogan Margasera "Moment Satu Hari Untuk Selamanya"?',
    answer: '"Moment Satu Hari Untuk Selamanya" adalah komitmen kami bahwa hari bahagia Anda—baik pernikahan, siraman, wisuda, maupun tasyakuran buah hati—mungkin hanya berlangsung dalam satu hari, namun kenangan, rasa haru, dan kejujuran emosinya dirajut menjadi karya visual abadi yang dapat dikenang lintas generasi.',
  },
  {
    question: 'Berapa lama proses editing dan penyerahan hasil foto?',
    answer: 'Preview edit awal (highlight) biasanya kami kirimkan dalam 2–5 hari kerja. Penyerahan seluruh file resolusi tinggi (Google Drive / USB Flashdrive eksklusif) dan cetak album flushmount diselesaikan dalam 14–30 hari kerja.',
  },
  {
    question: 'Bagaimana cara booking tanggal dan mengecek ketersediaan jadwal?',
    answer: 'Anda dapat langsung memeriksa kalender ketersediaan tanggal secara real-time di menu Kalender Ketersediaan, memilih paket yang diinginkan di halaman Layanan, lalu mengisi formulir pemesanan online atau berkonsultasi via WhatsApp resmi kami.',
  },
  {
    question: 'Apakah Margasera melayani pemotretan di luar Pamekasan dan Madura?',
    answer: 'Tentu saja. Tim kami sangat terbuka untuk destination wedding, pre-wedding luar kota (Surabaya, Malang, Bali, Yogyakarta, Danau Toba), maupun sesi acara di kota-kota lainnya di seluruh Indonesia.',
  },
];

export function FAQSection({ items = HOME_FAQS }: { items?: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 md:px-12 max-w-5xl mx-auto border-t border-zinc-200 dark:border-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="w-full text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0066CC]/10 border border-[#0066CC]/30 text-[#0066CC] text-[10px] tracking-[0.3em] uppercase mb-4">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Pertanyaan Umum</span>
        </div>
        <h2 className="font-serif-editorial text-3xl sm:text-5xl text-zinc-900 dark:text-zinc-100 font-light tracking-wide uppercase">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light mt-2">
          Informasi seputar layanan, lokasi sesi, dan proses kerja Margasera Photography di Pamekasan &amp; Madura.
        </p>
      </div>

      <div className="w-full flex flex-col gap-3 items-stretch">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`w-full block border transition-colors duration-200 rounded-sm overflow-hidden ${isOpen
                  ? 'border-[#0066CC] dark:border-[#0066CC]/60 bg-white dark:bg-zinc-900/80 shadow-xs dark:shadow-[0_0_25px_rgba(0,102,204,0.08)]'
                  : 'border-zinc-200/90 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700/80 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/50'
                }`}
            >
              <button
                type="button"
                onClick={() => toggleFAQ(idx)}
                className="w-full text-left px-5 py-4 sm:px-6 sm:py-4.5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none transition-colors"
                aria-expanded={isOpen}
              >
                <span
                  className={`flex-1 min-w-0 pr-2 text-sm sm:text-base leading-snug transition-colors duration-200 ${isOpen
                      ? 'text-[#0066CC] dark:text-white font-medium'
                      : 'text-zinc-800 dark:text-zinc-200 font-normal'
                    }`}
                >
                  {item.question}
                </span>
                <div
                  className="shrink-0 w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-[#0066CC] transition-transform duration-300"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: 'auto',
                      opacity: 1,
                      transition: {
                        height: { duration: 0.32, ease: [0.25, 1, 0.5, 1] },
                        opacity: { duration: 0.22, ease: 'easeOut', delay: 0.04 },
                      },
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                      transition: {
                        height: { duration: 0.26, ease: [0.25, 1, 0.5, 1] },
                        opacity: { duration: 0.15, ease: 'easeIn' },
                      },
                    }}
                    className="w-full overflow-hidden"
                  >
                    <div className="w-full px-5 pb-5 pt-2 sm:px-6 sm:pb-5 sm:pt-2.5 text-xs sm:text-[13.5px] leading-relaxed text-zinc-600 dark:text-zinc-300 font-light border-t border-zinc-200/80 dark:border-zinc-800/40">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
