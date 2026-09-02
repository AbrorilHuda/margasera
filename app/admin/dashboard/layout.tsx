'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Camera,
  Tag,
  Clock,
  LogOut,
  Plus,
  ShieldCheck,
  Menu,
  X,
  Layers,
  Settings,
  Globe,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { signOutAdmin } from '@/lib/actions/admin';
import { getStudioSettings } from '@/lib/actions/settings';
import type { StudioSettings } from '@/lib/types';
import { DEFAULT_STUDIO_SETTINGS } from '@/lib/constants';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useToast } from '@/components/ui/toast-context';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Ikhtisar & Stats', icon: LayoutDashboard },
  { href: '/admin/dashboard/bookings', label: 'Pesanan & Booking', icon: Calendar },
  { href: '/admin/dashboard/portfolio', label: 'Manajemen Portofolio', icon: Camera },
  { href: '/admin/dashboard/services', label: 'Kategori Layanan', icon: Layers },
  { href: '/admin/dashboard/pricing', label: 'Paket & Harga Tarif', icon: Tag },
  { href: '/admin/dashboard/calendar', label: 'Kalender Ketersediaan', icon: Clock },
  { href: '/admin/dashboard/settings', label: 'Pengaturan Studio', icon: Settings },
];

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Ikhtisar & Ringkasan Performa',
  '/admin/dashboard/bookings': 'Manajemen Booking & Pesanan',
  '/admin/dashboard/portfolio': 'Manajemen Portofolio & Karya',
  '/admin/dashboard/services': 'Kategori Layanan',
  '/admin/dashboard/pricing': 'Paket & Harga Tarif',
  '/admin/dashboard/calendar': 'Kalender Ketersediaan Tanggal',
  '/admin/dashboard/settings': 'Pengaturan Studio & Informasi Kontak',
};

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { confirmModal } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [studioSettings, setStudioSettings] = useState<StudioSettings>(DEFAULT_STUDIO_SETTINGS);

  useEffect(() => {
    getStudioSettings().then(setStudioSettings).catch(console.error);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    confirmModal({
      title: 'Keluar dari Dashboard Admin?',
      message: 'Apakah Anda yakin ingin mengakhiri sesi admin saat ini?',
      confirmText: 'Ya, Keluar Sesi',
      variant: 'danger',
      onConfirm: async () => {
        setIsLoggingOut(true);
        await signOutAdmin();
      },
    });
  };

  const pageTitle = PAGE_TITLES[pathname] ?? 'Admin Dashboard';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row font-sans selection:bg-[#0066CC] selection:text-white transition-colors">
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-72 h-screen max-h-screen shrink-0 overflow-y-auto bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-900 flex flex-col justify-between p-6 transition-transform duration-300 shadow-sm md:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Margasera Logo"
                width={160}
                height={48}
                className="h-10 w-auto object-contain dark:brightness-100"
                priority
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Profile Card */}
          <div className="p-3.5 bg-zinc-100/90 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-[#0066CC] text-white font-bold flex items-center justify-center text-sm shadow-sm">
              AH
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">
                {studioSettings.ownerName}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-[#0066CC] font-mono tracking-widest uppercase font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span>Lead Admin</span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] px-3 mb-2 font-medium">
              Navigation Menu
            </span>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#0066CC] text-white font-semibold shadow-md border border-[#0066CC]/50'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                  <span className="tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Bottom Buttons */}
        <div className="flex flex-col gap-2.5 pt-6 border-t border-zinc-200 dark:border-zinc-900 text-xs font-medium">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-4 py-2.5 bg-zinc-100/90 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-[#0066CC]/50 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#0066CC]" />
              <span className="tracking-wide">Website Live</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#0066CC] transition-colors" />
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/40 dark:hover:bg-rose-900/50 dark:text-rose-300 rounded-lg transition-colors text-xs font-medium text-left w-full disabled:opacity-50 cursor-pointer shadow-xs group"
          >
            {isLoggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600 dark:text-rose-400" />
            ) : (
              <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform" />
            )}
            <span className="tracking-wide font-medium">
              {isLoggingOut ? 'Mengeluarkan Sesi...' : 'Keluar Dashboard'}
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 dark:bg-black/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* ===== MAIN BODY ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/90 dark:bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#0066CC] uppercase font-medium">
                Margasera Control Center
              </span>
              <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/admin/dashboard/bookings"
              className="px-4 py-2 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Booking</span>
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Keluar dari Dashboard Admin"
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 text-rose-700 dark:bg-zinc-900/80 dark:border-zinc-800 dark:hover:border-rose-900/50 dark:hover:bg-rose-950/40 dark:text-zinc-400 dark:hover:text-rose-400 rounded-lg transition-all flex items-center gap-2 text-xs font-medium cursor-pointer shadow-xs group"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin text-rose-600 dark:text-rose-400" />
              ) : (
                <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform" />
              )}
              <span className="hidden md:inline font-medium">Keluar</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 sm:p-8 md:p-10 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
