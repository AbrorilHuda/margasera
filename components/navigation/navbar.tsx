'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Calendar, ChevronRight } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/work', label: 'Portofolio' },
    { href: '/services', label: 'Layanan & Paket' },
    { href: '/availability', label: 'Kalender Tanggal' },
    { href: '/booking/status', label: 'Cek Status Booking' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || mobileMenuOpen
        ? 'bg-zinc-950 backdrop-blur-md py-4 border-b border-zinc-800/60 shadow-2xl'
        : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-6'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-3 relative z-50" onClick={() => setMobileMenuOpen(false)}>
          <Image
            src="/logo.png"
            alt="MargaSera Logo"
            width={160}
            height={48}
            className="h-10 w-auto object-contain transition-opacity duration-300 group-hover:opacity-90"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-widest uppercase transition-all duration-300 hover:text-[#0066CC] relative py-1 ${isActive ? 'text-[#0066CC] font-medium' : 'text-zinc-300 font-light'
                  }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#0066CC] to-[#0052A3]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/booking"
            className="group relative inline-flex items-center justify-center px-6 py-2.5 text-xs font-semibold tracking-widest uppercase text-white bg-[#0066CC] hover:bg-[#0052A3] rounded-none overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,102,204,0.5)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Book Session
            </span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-zinc-300 hover:text-white focus:outline-none relative z-50"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-[#0066CC]" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation (Solid bg-zinc-950, No transparency bleed) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[70px] bg-zinc-950 z-40 flex flex-col justify-between px-8 py-8 border-t border-zinc-800 overflow-y-auto min-h-[calc(100vh-70px)]">
          <div className="flex flex-col gap-5 pt-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base tracking-widest uppercase flex items-center justify-between py-3 border-b border-zinc-900 ${isActive ? 'text-[#0066CC] font-semibold' : 'text-zinc-300'
                    }`}
                >
                  {link.label}
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </Link>
              );
            })}
          </div>

          <div className="pt-8 pb-6 flex flex-col gap-4">
            <Link
              href="/booking"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-4 bg-[#0066CC] hover:bg-[#0052A3] text-white font-semibold text-xs tracking-widest uppercase shadow-lg rounded-xl"
            >
              Pesan Sesi Foto Sekarang
            </Link>
            <p className="text-center text-xs text-zinc-500 tracking-wider font-mono">
              @margasera.id • Pamekasan, Madura
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
