'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Phone, Mail } from 'lucide-react';
import { getStudioSettings, updateStudioSettings } from '@/lib/actions/settings';
import { DEFAULT_STUDIO_SETTINGS } from '@/lib/constants';
import type { StudioSettings } from '@/lib/types';

export default function SettingsPage() {
  const [studioSettings, setStudioSettings] = useState<StudioSettings>(DEFAULT_STUDIO_SETTINGS);
  const [loadingData, setLoadingData] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoadingData(true);
    try {
      const data = await getStudioSettings();
      setStudioSettings(data);
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateStudioSettings(studioSettings);
    if (res.success) {
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } else {
      alert(`Gagal menyimpan pengaturan: ${res.error}`);
    }
  };

  if (loadingData) {
    return (
      <div className="max-w-3xl animate-pulse">
        <div className="h-96 bg-zinc-900/60 border border-zinc-800/60 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="p-8 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex flex-col gap-6 shadow-xl">
        <div>
          <span className="text-[10px] font-mono text-[#0066CC] uppercase tracking-widest font-semibold">Studio Profile Settings</span>
          <h3 className="font-sans text-xl sm:text-2xl font-bold text-zinc-100 uppercase tracking-tight">
            Informasi Kontak Studio
          </h3>
          <p className="text-xs text-zinc-400 font-light mt-1">
            Data ini yang tampil di website — footer, halaman booking, info pembayaran, dan kontak cepat.
          </p>
        </div>

        {settingsSaved && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Pengaturan studio berhasil diperbarui dan tersimpan ke database!</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
          {/* Identitas Studio */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-2">
              Identitas Studio
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Nama Brand Studio *</label>
                <input
                  type="text"
                  required
                  value={studioSettings.studioName}
                  onChange={(e) => setStudioSettings({ ...studioSettings, studioName: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3 rounded-lg text-xs focus:outline-none transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Nama Owner / Lead Photographer</label>
                <input
                  type="text"
                  value={studioSettings.ownerName}
                  onChange={(e) => setStudioSettings({ ...studioSettings, ownerName: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3 rounded-lg text-xs focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Alamat Lengkap Studio</label>
              <input
                type="text"
                value={studioSettings.address}
                onChange={(e) => setStudioSettings({ ...studioSettings, address: e.target.value })}
                className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3 rounded-lg text-xs focus:outline-none transition-colors"
                placeholder="Jl. Raya Madura No. 88, Madura, Jawa Timur"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Link Google Maps</label>
              <input
                type="url"
                value={studioSettings.googleMapsUrl}
                onChange={(e) => setStudioSettings({ ...studioSettings, googleMapsUrl: e.target.value })}
                className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3 rounded-lg text-xs focus:outline-none transition-colors"
                placeholder="https://maps.google.com/..."
              />
            </div>
          </div>

          {/* Kontak & Social Media */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-2">
              Kontak & Social Media
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" /> WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={studioSettings.whatsapp}
                  onChange={(e) => setStudioSettings({ ...studioSettings, whatsapp: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3 rounded-lg text-xs focus:outline-none transition-colors"
                  placeholder="081234567890"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#0066CC]" /> Email
                </label>
                <input
                  type="email"
                  value={studioSettings.email}
                  onChange={(e) => setStudioSettings({ ...studioSettings, email: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3 rounded-lg text-xs focus:outline-none transition-colors"
                  placeholder="hello@margasera.id"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Instagram URL</label>
                <input
                  type="url"
                  value={studioSettings.instagram}
                  onChange={(e) => setStudioSettings({ ...studioSettings, instagram: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3 rounded-lg text-xs focus:outline-none transition-colors"
                  placeholder="https://instagram.com/margasera.id"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">TikTok URL</label>
                <input
                  type="url"
                  value={studioSettings.tiktok}
                  onChange={(e) => setStudioSettings({ ...studioSettings, tiktok: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3 rounded-lg text-xs focus:outline-none transition-colors"
                  placeholder="https://www.tiktok.com/@margasera"
                />
              </div>
            </div>
          </div>

          {/* Rekening Pembayaran */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-2">
              Rekening Pembayaran (Tampil di Halaman Booking & Status)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Nama Bank *</label>
                <input
                  type="text"
                  required
                  value={studioSettings.bankName}
                  onChange={(e) => setStudioSettings({ ...studioSettings, bankName: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3 rounded-lg text-xs focus:outline-none transition-colors"
                  placeholder="BCA / BRI / Mandiri"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Nomor Rekening *</label>
                <input
                  type="text"
                  required
                  value={studioSettings.bankAccountNumber}
                  onChange={(e) => setStudioSettings({ ...studioSettings, bankAccountNumber: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3 rounded-lg text-xs focus:outline-none transition-colors"
                  placeholder="1234567890"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Atas Nama *</label>
                <input
                  type="text"
                  required
                  value={studioSettings.bankAccountHolder}
                  onChange={(e) => setStudioSettings({ ...studioSettings, bankAccountHolder: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3 rounded-lg text-xs focus:outline-none transition-colors"
                  placeholder="MARGASERA CREATIVE"
                />
              </div>
            </div>
            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-[10px] text-amber-300 font-mono">
              ⚠ Data rekening ini akan otomatis tampil pada halaman konfirmasi booking dan status pembayaran pelanggan.
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 py-3.5 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-widest rounded-lg transition-all shadow-[0_0_15px_rgba(0,102,204,0.3)]"
          >
            Simpan Semua Perubahan ke Database
          </button>
        </form>
      </div>
    </div>
  );
}
