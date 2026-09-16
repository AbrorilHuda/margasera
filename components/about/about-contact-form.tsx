'use client';

import React, { useState } from 'react';
import { Send, MessageSquareText } from 'lucide-react';

interface AboutContactFormProps {
  whatsappNumber?: string;
}

const SERVICE_OPTIONS = [
  'Wedding',
  'Pre-Wedding',
  'Engagement',
  'Siraman',
  'Wisuda Outdoor',
  'Sidang Skripsi',
  'Tasyakuran 40 Hari Bayi',
  'Lainnya / Sesi Kustom',
];

export function AboutContactForm({ whatsappNumber = '085806138955' }: AboutContactFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('Wedding');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanWaNumber = whatsappNumber.replace(/\D/g, '');
    const targetNumber = cleanWaNumber.startsWith('0') ? '62' + cleanWaNumber.slice(1) : cleanWaNumber;

    const formattedText = `Halo Margasera Photography, saya ${name.trim()}.
Nomor WhatsApp: ${phone.trim()}
Layanan / Momen: ${service}
Catatan / Pertanyaan: ${message.trim() || 'Mohon informasi ketersediaan jadwal dan detail paketnya.'}

Saya ingin berkonsultasi mengenai dokumentasi acara bersama tim Margasera.`;

    const waUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent(formattedText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/90 rounded-2xl p-6 sm:p-8 md:p-10 shadow-sm dark:shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-zinc-100 dark:border-zinc-800">
        <div className="w-9 h-9 rounded-xl bg-[#0066CC]/10 text-[#0066CC] flex items-center justify-center">
          <MessageSquareText className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Kirim Pertanyaan / Diskusi
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Pesan otomatis terhubung ke WhatsApp resmi studio
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="contact-name" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 tracking-wider uppercase">
              Nama Lengkap <span className="text-[#0066CC]">*</span>
            </label>
            <input
              id="contact-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Sarah & Dimas"
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-[#0066CC] text-zinc-900 dark:text-zinc-100 p-3.5 rounded-xl text-xs focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="contact-phone" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 tracking-wider uppercase">
              Nomor WhatsApp <span className="text-[#0066CC]">*</span>
            </label>
            <input
              id="contact-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0812xxxxxxxx"
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-[#0066CC] text-zinc-900 dark:text-zinc-100 p-3.5 rounded-xl text-xs focus:outline-none transition-colors font-mono"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-service" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 tracking-wider uppercase">
            Pilihan Layanan / Kebutuhan Acara
          </label>
          <select
            id="contact-service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-[#0066CC] text-zinc-900 dark:text-zinc-100 p-3.5 rounded-xl text-xs focus:outline-none transition-colors cursor-pointer"
          >
            {SERVICE_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-message" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 tracking-wider uppercase">
            Pesan atau Catatan Tambahan
          </label>
          <textarea
            id="contact-message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tuliskan tanggal acara, lokasi pemotretan, atau pertanyaan Anda di sini..."
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-[#0066CC] text-zinc-900 dark:text-zinc-100 p-3.5 rounded-xl text-xs focus:outline-none transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-bold tracking-widest uppercase rounded-xl transition-all shadow-md shadow-[#0066CC]/25 hover:shadow-lg hover:shadow-[#0066CC]/35 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
        >
          <Send className="w-4 h-4" />
          <span>Kirim via WhatsApp Resmi</span>
        </button>

        <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400 font-light">
          Respons cepat dalam hitungan jam kerja • Bebas konsultasi konsep
        </p>
      </form>
    </div>
  );
}
