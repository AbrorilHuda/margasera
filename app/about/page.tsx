import React from 'react';
import Image from 'next/image';
import { Camera, MapPin, MessageCircle, Mail, Phone, Send, Sparkles } from 'lucide-react';
import { InstagramIcon } from '@/components/ui/icons';

export const metadata = {
  title: 'Tentang & Kontak — Marga Sera Photography',
  description: 'Cerita filosofi brand, profil fotografer, dan formulir kontak Marga Sera Photography Medan.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-8 pb-24">
      {/* Brand Story Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 flex flex-col gap-6">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#0066CC]">
              The Artist & Storyteller
            </span>
            <h1 className="font-serif-editorial text-4xl sm:text-6xl text-zinc-100 font-light tracking-wide uppercase leading-tight">
              Cerita Di Balik Marga Sera
            </h1>
            <p className="text-sm text-zinc-400 font-light leading-relaxed">
              Marga Sera Photography didirikan dengan visi menghadirkan gaya penceritaan visual yang bermakna. Setiap jepretan dirancang untuk mengabadikan esensi, gestur yang tidak disengaja, serta kedalaman emosi dari momen spesial Anda.
            </p>
            <p className="text-sm text-zinc-400 font-light leading-relaxed">
              Kami percaya bahwa fotografer bukan sekadar memegang kamera, melainkan mengarahkan cahaya, emosi, dan kenangan menjadi karya seni visual yang akan selalu dinikmati lintas generasi.
            </p>

            <div className="p-6 bg-zinc-900 border border-zinc-800 flex items-center gap-4 mt-2">
              <Sparkles className="w-6 h-6 text-[#0066CC] shrink-0" />
              <p className="text-xs text-zinc-300 font-light italic">
                &ldquo;Kemewahan sebuah dokumentasi tidak terletak pada kerumitannya, melainkan kejujuran emosi di dalamnya.&rdquo;
              </p>
            </div>
          </div>

          <div className="md:col-span-6 relative h-[560px] w-full border border-zinc-800">
            <Image
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1600&auto=format&fit=crop"
              alt="Marga Sera Studio Lead"
              fill
              className="object-cover img-editorial filter brightness-90"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Contact Form & Location Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-16 border-t border-zinc-900">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Contact Details */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#0066CC]">
              Hubungi Tim Kami
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl text-zinc-100 font-light uppercase">
              Mari Berdiskusi
            </h2>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Memiliki pertanyaan khusus mengenai jadwal, lokasi destination wedding, atau kolaborasi visual? Kirimkan pesan Anda melalui formulir di samping.
            </p>

            <div className="flex flex-col gap-4 text-xs text-zinc-300 font-light pt-4 border-t border-zinc-900">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#0066CC] shrink-0" />
                <span>Medan, Sumatera Utara & Available Destination Worldwide</span>
              </div>
              <div className="flex items-center gap-3">
                <InstagramIcon className="w-4 h-4 text-[#0066CC] shrink-0" />
                <span>@margasera.id</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-[#0066CC] shrink-0" />
                <span>WhatsApp: +62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#0066CC] shrink-0" />
                <span>Email: contact@margasera.id</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-7 bg-zinc-900 border border-zinc-800 p-8 md:p-10">
            <form className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Anda"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded text-xs focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0812xxxx"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="email@domain.com"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded text-xs focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest">
                  Pesan / Subjek *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan pesan atau pertanyaan Anda di sini..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded text-xs focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold tracking-widest uppercase transition-colors shadow-[0_0_20px_rgba(0,102,204,0.3)] flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Pesan Kontak</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
