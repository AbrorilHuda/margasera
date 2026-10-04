'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, MapPin, FileText, AlertCircle } from 'lucide-react';
import { InstagramIcon } from '@/components/ui/icons';
import type { Service } from '@/lib/types';
import { isCoupleService } from '../booking-utils';

interface Step3ClientInfoProps {
  selectedService?: Service;
  customerName: string;
  partnerName: string;
  whatsapp: string;
  email: string;
  instagram: string;
  location: string;
  notes: string;
  fieldErrors: {
    customerName?: string;
    partnerName?: string;
    whatsapp?: string;
    instagram?: string;
    location?: string;
  };
  onChangeCustomerName: (val: string) => void;
  onChangePartnerName: (val: string) => void;
  onChangeWhatsapp: (val: string) => void;
  onChangeEmail: (val: string) => void;
  onChangeInstagram: (val: string) => void;
  onChangeLocation: (val: string) => void;
  onChangeNotes: (val: string) => void;
}

export function Step3ClientInfo({
  selectedService,
  customerName,
  partnerName,
  whatsapp,
  email,
  instagram,
  location,
  notes,
  fieldErrors,
  onChangeCustomerName,
  onChangePartnerName,
  onChangeWhatsapp,
  onChangeEmail,
  onChangeInstagram,
  onChangeLocation,
  onChangeNotes,
}: Step3ClientInfoProps) {
  const isCouple = isCoupleService(selectedService);

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >
      <div>
        <span className="text-xs font-semibold tracking-widest uppercase text-[#0066CC]">Langkah 3 dari 4</span>
        <h3 className="font-serif-editorial text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100 font-light mt-1">
          Isi Data Diri Pelanggan
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-1">
          Lengkapi informasi kontak agar tim Marga Sera dapat menghubungi Anda untuk konfirmasi jadwal dan koordinasi sesi foto.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#0066CC]" /> Nama Lengkap Client *
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Min. 3 Karakter</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Ahmad Rizky Pratama"
            value={customerName}
            onChange={(e) => onChangeCustomerName(e.target.value)}
            className={`w-full bg-white dark:bg-zinc-900 border ${
              fieldErrors.customerName
                ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-zinc-300 dark:border-zinc-800 focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC]'
            } text-zinc-900 dark:text-zinc-100 p-3.5 rounded-xl text-sm focus:outline-none transition-colors`}
          />
          {fieldErrors.customerName && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 mt-0.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.customerName}</span>
            </div>
          )}
        </div>

        {/* Partner Name (if applicable) */}
        {isCouple && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#0066CC]" /> Nama Pasangan *
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Min. 3 Karakter</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Anisa Putri Rahmawati"
              value={partnerName}
              onChange={(e) => onChangePartnerName(e.target.value)}
              className={`w-full bg-white dark:bg-zinc-900 border ${
                fieldErrors.partnerName
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-zinc-300 dark:border-zinc-800 focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC]'
              } text-zinc-900 dark:text-zinc-100 p-3.5 rounded-xl text-sm focus:outline-none transition-colors`}
            />
            {fieldErrors.partnerName && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.partnerName}</span>
              </div>
            )}
          </div>
        )}

        {/* Indonesian WhatsApp Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#0066CC]" /> Nomor WhatsApp *
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">10 – 14 Digit (08xx / 628xx)</span>
          </label>
          <input
            type="tel"
            required
            placeholder="Contoh: 081234567890"
            value={whatsapp}
            onChange={(e) => onChangeWhatsapp(e.target.value)}
            className={`w-full bg-white dark:bg-zinc-900 border ${
              fieldErrors.whatsapp
                ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-zinc-300 dark:border-zinc-800 focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC]'
            } text-zinc-900 dark:text-zinc-100 p-3.5 rounded-xl text-sm focus:outline-none transition-colors`}
          />
          {fieldErrors.whatsapp ? (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 mt-0.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.whatsapp}</span>
            </div>
          ) : (
            <span className="text-[10px] text-zinc-500">
              Gunakan nomor WhatsApp aktif untuk verifikasi jadwal dan pengiriman invoice.
            </span>
          )}
        </div>

        {/* Email Address */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#0066CC]" /> Alamat Email (Opsional)
          </label>
          <input
            type="email"
            placeholder="Contoh: ahmad@example.com (opsional)"
            value={email}
            onChange={(e) => onChangeEmail(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] text-zinc-900 dark:text-zinc-100 p-3.5 rounded-xl text-sm focus:outline-none transition-colors"
          />
        </div>

        {/* Instagram Username */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center justify-between">
            <span className="flex items-center gap-2">
              <InstagramIcon className="w-3.5 h-3.5 text-[#0066CC]" /> Instagram Client *
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Format: @username</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: @margasera.studio"
            value={instagram}
            onChange={(e) => onChangeInstagram(e.target.value)}
            className={`w-full bg-white dark:bg-zinc-900 border ${
              fieldErrors.instagram
                ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-zinc-300 dark:border-zinc-800 focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC]'
            } text-zinc-900 dark:text-zinc-100 p-3.5 rounded-xl text-sm focus:outline-none transition-colors`}
          />
          {fieldErrors.instagram && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 mt-0.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.instagram}</span>
            </div>
          )}
        </div>

        {/* Event Location */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#0066CC]" /> Lokasi Acara / Venue *
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Min. 3 Karakter</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Gedung Serbaguna Pamekasan"
            value={location}
            onChange={(e) => onChangeLocation(e.target.value)}
            className={`w-full bg-white dark:bg-zinc-900 border ${
              fieldErrors.location
                ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-zinc-300 dark:border-zinc-800 focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC]'
            } text-zinc-900 dark:text-zinc-100 p-3.5 rounded-xl text-sm focus:outline-none transition-colors`}
          />
          {fieldErrors.location && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 mt-0.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{fieldErrors.location}</span>
            </div>
          )}
        </div>

        {/* Special Notes */}
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-zinc-400" /> Catatan / Permintaan Khusus (Opsional)
          </label>
          <textarea
            rows={3}
            placeholder="Tuliskan jika ada lokasi spesifik, outfit khusus, atau momen penting yang wajib didokumentasikan..."
            value={notes}
            onChange={(e) => onChangeNotes(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] text-zinc-900 dark:text-zinc-100 p-3.5 rounded-xl text-sm focus:outline-none transition-colors"
          />
        </div>
      </div>
    </motion.div>
  );
}
