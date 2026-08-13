import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Camera, MessageCircle, Mail, MapPin, ArrowUpRight } from 'lucide-react';
import { InstagramIcon, TikTokIcon } from '@/components/ui/icons';
import { fetchStudioSettings } from '@/lib/data/settings';

export async function Footer() {
  const s = await fetchStudioSettings();

  // Build WA link: strip non-digits and prepend 62
  const waNumber = s.whatsapp.replace(/\D/g, '');
  const waLink = `https://wa.me/${waNumber.startsWith('0') ? '62' + waNumber.slice(1) : waNumber}`;

  // Extract instagram handle
  const igHandle = s.instagram
    ? '@' + s.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\/?/, '').replace(/\/$/, '')
    : '@margasera.id';

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-400 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-zinc-900">
          {/* Brand Bio */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="MargaSera Logo"
                width={160}
                height={48}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-zinc-400 font-light leading-relaxed max-w-md">
              Margasera Photography mengabadikan cerita visual sinematik dengan estetika editorial, minimalis, dan penuh emosi. Melayani wedding, pre-wedding, couple, &amp; portraiture profesional di Medan dan seluruh Indonesia.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {s.instagram && (
                <a
                  href={s.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-[#0066CC] hover:border-[#0066CC]/50 transition-colors"
                  aria-label="Instagram Marga Sera"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {s.tiktok && (
                <a
                  href={s.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-[#0066CC] hover:border-[#0066CC]/50 transition-colors"
                  aria-label="TikTok Marga Sera"
                >
                  <TikTokIcon className="w-4 h-4" />
                </a>
              )}
              {s.whatsapp && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-[#0066CC] hover:border-[#0066CC]/50 transition-colors"
                  aria-label="WhatsApp Marga Sera"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {s.email && (
                <a
                  href={`mailto:${s.email}`}
                  className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-[#0066CC] hover:border-[#0066CC]/50 transition-colors"
                  aria-label="Email Marga Sera"
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[#0066CC]">
              Navigasi Utama
            </h4>
            <ul className="flex flex-col gap-3 text-sm font-light text-zinc-300">
              <li>
                <Link href="/work" className="hover:text-[#0066CC] transition-colors flex items-center gap-1 group">
                  Portofolio Photography
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#0066CC]" />
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#0066CC] transition-colors flex items-center gap-1 group">
                  Layanan &amp; Paket Harga
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#0066CC]" />
                </Link>
              </li>
              <li>
                <Link href="/availability" className="hover:text-[#0066CC] transition-colors flex items-center gap-1 group">
                  Kalender Ketersediaan Tanggal
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#0066CC]" />
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-[#0066CC] transition-colors flex items-center gap-1 group">
                  Pemesanan Sesi / Booking
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#0066CC]" />
                </Link>
              </li>
              <li>
                <Link href="/booking/status" className="hover:text-[#0066CC] transition-colors flex items-center gap-1 group">
                  Cek Status Booking Code
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#0066CC]" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Studio */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[#0066CC]">
              Studio &amp; Lokasi
            </h4>
            <div className="flex flex-col gap-3 text-sm text-zinc-400 font-light">
              {s.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#0066CC] shrink-0 mt-1" />
                  <span>{s.address}</span>
                </div>
              )}
              {s.instagram && (
                <div className="flex items-center gap-3">
                  <InstagramIcon className="w-4 h-4 text-[#0066CC] shrink-0" />
                  <span>{igHandle}</span>
                </div>
              )}
              {s.whatsapp && (
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-[#0066CC] shrink-0" />
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#0066CC] transition-colors"
                  >
                    WhatsApp: {s.whatsapp}
                  </a>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 rounded bg-zinc-900/60 border border-zinc-800/80">
              <p className="text-xs text-zinc-300 font-light">
                Ingin konsultasi jadwal atau konsep kustom? Tim kami siap berdiskusi kapan saja.
              </p>
              <Link
                href="/booking"
                className="mt-3 inline-block text-xs font-semibold tracking-widest uppercase text-[#0066CC] hover:text-[#0052A3] transition-colors"
              >
                Jadwalkan Konsultasi →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-light">
          <p>© {new Date().getFullYear()} {s.studioName}. Hak Cipta Dilindungi. by <Link href="https://github.com/AbrorilHuda" target="_blank" rel="noopener noreferrer" className="hover:text-[#0066CC] transition-colors">{s.ownerName || 'Abroril Huda'}</Link></p>
          <div className="flex items-center gap-6">
            <span className="text-zinc-600">Cinematic &amp; Editorial Visuals</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
