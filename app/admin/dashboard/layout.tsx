'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
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
  MessageSquareQuote,
  PanelLeftClose,
  PanelLeftOpen,
  Wallet,
  Terminal,
} from 'lucide-react';
import { signOutAdmin } from '@/lib/actions/admin';
import { clearAllLocalOfflineData } from '@/lib/offline/db';
import { getStudioSettings } from '@/lib/actions/settings';
import { getServices, getPackages } from '@/lib/actions/services';
import { cacheMasterData } from '@/lib/offline-queue';
import type { StudioSettings } from '@/lib/types';
import { DEFAULT_STUDIO_SETTINGS } from '@/lib/constants';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useToast } from '@/components/ui/toast-context';
import { QuickActionsBottomSheet } from './_components/QuickActionsBottomSheet';
import { PwaInstallPrompt } from '@/app/admin/_components/PwaInstallPrompt';
import { OfflineSyncStatus } from '@/app/admin/_components/OfflineSyncStatus';
import { OfflineWhatsNewModal } from '@/app/admin/_components/OfflineWhatsNewModal';
import { NotificationBell } from '@/components/admin/NotificationBell';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Overview', shortLabel: 'Overview', icon: LayoutDashboard },
  { href: '/admin/dashboard/bookings', label: 'Booking & Orders', shortLabel: 'Booking', icon: Calendar },
  { href: '/admin/dashboard/finance', label: 'Keuangan & Kas', shortLabel: 'Keuangan', icon: Wallet },
  { href: '/admin/dashboard/testimonials', label: 'Testimonials', shortLabel: 'Testimoni', icon: MessageSquareQuote },
  { href: '/admin/dashboard/portfolio', label: 'Portfolio', shortLabel: 'Portfolio', icon: Camera },
  { href: '/admin/dashboard/services', label: 'Services', shortLabel: 'Layanan', icon: Layers },
  { href: '/admin/dashboard/pricing', label: 'Packages & Pricing', shortLabel: 'Paket', icon: Tag },
  { href: '/admin/dashboard/calendar', label: 'Availability Calendar', shortLabel: 'Kalender', icon: Clock },
  { href: '/admin/dashboard/settings', label: 'Studio Settings', shortLabel: 'Setting', icon: Settings },
];

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard Overview',
  '/admin/dashboard/bookings': 'Booking & Orders',
  '/admin/dashboard/finance': 'Manajemen Keuangan & Kas',
  '/admin/dashboard/testimonials': 'Kelola Testimoni Klien',
  '/admin/dashboard/portfolio': 'Portfolio',
  '/admin/dashboard/services': 'Services',
  '/admin/dashboard/pricing': 'Packages & Pricing',
  '/admin/dashboard/calendar': 'Availability Calendar',
  '/admin/dashboard/settings': 'Studio Settings',
  '/admin/dashboard/logs': 'Axiom Audit Logs',
};

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast, confirmModal } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [studioSettings, setStudioSettings] = useState<StudioSettings>(DEFAULT_STUDIO_SETTINGS);
  const [isAuditMode, setIsAuditMode] = useState(false);

  const logoClickCountRef = useRef(0);
  const logoClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Baca status audit mode dari sessionStorage
  useEffect(() => {
    try {
      const active = sessionStorage.getItem('margasera_audit_mode_active') === 'true';
      setIsAuditMode(active);
    } catch {}

    const handleModeChange = () => {
      try {
        const active = sessionStorage.getItem('margasera_audit_mode_active') === 'true';
        setIsAuditMode(active);
      } catch {}
    };

    window.addEventListener('margasera_audit_mode_change', handleModeChange);
    return () => window.removeEventListener('margasera_audit_mode_change', handleModeChange);
  }, []);

  // Shortcut rahasia: Tekan logo 5 kali untuk unlock/lock mode audit log
  const handleLogoSecretClick = (e: React.MouseEvent) => {
    logoClickCountRef.current += 1;

    if (logoClickTimerRef.current) {
      clearTimeout(logoClickTimerRef.current);
    }

    logoClickTimerRef.current = setTimeout(() => {
      logoClickCountRef.current = 0;
    }, 2500);

    if (logoClickCountRef.current === 3) {
      toast.info('⚡ 2 ketukan lagi untuk Secret Mode...');
    } else if (logoClickCountRef.current === 4) {
      toast.info('⚡ 1 ketukan lagi...');
    } else if (logoClickCountRef.current >= 5) {
      e.preventDefault();
      logoClickCountRef.current = 0;
      const nextMode = !isAuditMode;
      if (nextMode) {
        sessionStorage.setItem('margasera_audit_mode_active', 'true');
        setIsAuditMode(true);
        toast.success('🔓 Secret Mode Aktif! Membuka Axiom Audit Logs...');
        router.push('/admin/dashboard/logs');
      } else {
        sessionStorage.removeItem('margasera_audit_mode_active');
        setIsAuditMode(false);
        toast.info('🔒 Secret Audit Mode dinonaktifkan.');
        if (pathname === '/admin/dashboard/logs') {
          router.push('/admin/dashboard');
        }
      }
      window.dispatchEvent(new Event('margasera_audit_mode_change'));
    }
  };

  const currentNavItems = useMemo(() => {
    if (!isAuditMode) return NAV_ITEMS;
    return [
      ...NAV_ITEMS,
      {
        href: '/admin/dashboard/logs',
        label: 'Audit Logs (Axiom)',
        shortLabel: 'Logs',
        icon: Terminal,
      },
    ];
  }, [isAuditMode]);

  // Baca preferensi sidebar dari localStorage & adaptasi ukuran layar iPad
  useEffect(() => {
    try {
      const saved = localStorage.getItem('margasera_admin_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      } else if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        // Pada iPad / layar tablet (768px - 1023px), ciutkan secara default agar tabel lebih lega
        setIsCollapsed(true);
      }
    } catch { }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('margasera_admin_sidebar_collapsed', String(next));
      } catch { }
      return next;
    });
  };

  // Keyboard shortcut Ctrl+B / Cmd+B untuk toggle buka-tutup sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Sinkronisasi data asli Supabase ke cache offline lokal begitu admin online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      Promise.all([
        getServices(),
        getPackages(),
        getStudioSettings(),
      ])
        .then(([srvList, pkgList, settings]) => {
          if (settings) setStudioSettings(settings);
          cacheMasterData({
            services: srvList,
            packages: pkgList,
            studioSettings: settings,
          });
        })
        .catch((err) => {
          console.warn('[AdminLayout] Sinkronisasi master data offline gagal:', err);
        });


    } else {
      getStudioSettings().then(setStudioSettings).catch(console.error);
    }
  }, []);

  // Close sidebar and bottom sheets on route change
  useEffect(() => {
    setSidebarOpen(false);
    setShowQuickActions(false);
  }, [pathname]);

  const handleLogout = () => {
    confirmModal({
      title: 'Keluar dari Dashboard Admin?',
      message: 'Apakah Anda yakin ingin mengakhiri sesi admin saat ini?',
      confirmText: 'Ya, Keluar Sesi',
      variant: 'danger',
      onConfirm: async () => {
        setIsLoggingOut(true);
        try {
          await clearAllLocalOfflineData();
        } catch {
          // Abaikan error lokal agar proses logout tetap berjalan
        }
        await signOutAdmin();
      },
    });
  };

  const pageTitle = PAGE_TITLES[pathname] ?? 'Margasera Admin';

  const isHomeActive = pathname === '/admin/dashboard';
  const isBookingActive = pathname.startsWith('/admin/dashboard/bookings');

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row font-sans selection:bg-[#0066CC] selection:text-white transition-colors">
      {/* ===== SIDEBAR / NAVIGATION DRAWER ===== */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen max-h-screen shrink-0 overflow-y-auto no-scrollbar scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          isCollapsed ? 'md:overflow-visible md:w-[76px] md:px-2.5' : 'md:w-68 md:px-5 lg:w-72 lg:px-6'
        } bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-200 dark:border-zinc-900 flex flex-col justify-between pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] transition-all duration-300 ease-in-out shadow-xl md:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } w-72 px-6`}
      >
        <div className="flex flex-col gap-6">
          {/* Logo & Toggle Header */}
          <div className={`flex items-center justify-between ${isCollapsed ? 'md:hidden' : ''}`}>
            <div
              onClick={handleLogoSecretClick}
              className="flex items-center gap-3 cursor-pointer select-none active:scale-95 transition-transform"
              title="Ketuk 5 kali untuk membuka Secret Audit Mode"
            >
              <Image
                src="/logo.png"
                alt="Margasera Logo"
                width={160}
                height={48}
                className="h-9 w-auto object-contain dark:brightness-100 pointer-events-none"
                priority
              />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white active:scale-95 transition-transform"
                aria-label="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={toggleCollapse}
                className="hidden md:flex p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                title="Ciutkan Sidebar (Ctrl+B)"
                aria-label="Ciutkan Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop Collapsed Header */}
          {isCollapsed && (
            <div className="hidden md:flex w-full flex-col items-center gap-2">
              <div
                onClick={handleLogoSecretClick}
                className="group flex items-center justify-center cursor-pointer select-none"
                title="Ketuk 5 kali untuk membuka Secret Audit Mode"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066CC] to-[#004C99] text-white flex items-center justify-center font-bold font-serif text-lg shadow-md shadow-[#0066CC]/25 group-hover:scale-105 active:scale-95 transition-transform">
                  M
                </div>
              </div>
              <button
                onClick={toggleCollapse}
                className="hidden md:flex p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                title="Perluas Sidebar (Ctrl+B)"
                aria-label="Perluas Sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Admin Profile Card */}
          <div className={`p-3 bg-zinc-100/90 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl flex items-center gap-3 shadow-xs ${isCollapsed ? 'md:hidden' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-[#0066CC] text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
              AH
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide truncate">
                {studioSettings.ownerName}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-[#0066CC] font-mono tracking-widest uppercase font-medium">
                <ShieldCheck className="w-3 h-3 shrink-0" />
                <span>Lead Admin</span>
              </div>
            </div>
          </div>

          {isCollapsed && (
            <div
              className="hidden md:flex relative group justify-center py-0.5 cursor-default"
              title={`${studioSettings.ownerName} (Lead Admin)`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0066CC] to-blue-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  AH
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-zinc-950" />
              </div>
              {/* Floating Tooltip */}
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 translate-x-1 group-hover:translate-x-0 z-50 border border-zinc-700/50 dark:border-zinc-300/50">
                <p className="font-bold">{studioSettings.ownerName}</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono">Lead Administrator</p>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className="flex flex-col gap-1">
            <span className={`text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] px-3 mb-1.5 font-medium ${isCollapsed ? 'md:hidden' : ''}`}>
              Navigation Menu
            </span>
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <React.Fragment key={item.href}>
                  {/* Full item: always visible on mobile, visible on desktop when not collapsed */}
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 active:scale-[0.98] ${
                      isCollapsed ? 'flex md:hidden' : 'flex'
                    } ${
                      isActive
                        ? 'bg-[#0066CC] text-white font-semibold shadow-md border border-[#0066CC]/50'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                    <span className="tracking-wide truncate">{item.label}</span>
                  </Link>

                  {/* Collapsed item: visible only on desktop/tablet when collapsed */}
                  {isCollapsed && (
                    <Link
                      href={item.href}
                      title={item.label}
                      onClick={() => setSidebarOpen(false)}
                      className={`hidden md:flex flex-col group relative items-center justify-center w-[60px] py-2 px-0.5 mx-auto rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 ${
                        isActive
                          ? 'bg-[#0066CC] text-white font-semibold shadow-md shadow-[#0066CC]/30 border border-[#0066CC]/50'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'}`} />
                      <span className={`text-[9px] font-mono leading-tight tracking-tight mt-1 truncate max-w-[56px] text-center ${isActive ? 'text-white font-semibold' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        {item.shortLabel || item.label}
                      </span>
                      {/* Floating Tooltip for Desktop hover */}
                      <div className="hidden lg:flex absolute left-full ml-3 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 translate-x-1 group-hover:translate-x-0 z-50 items-center gap-1.5 border border-zinc-700/50 dark:border-zinc-300/50">
                        <span>{item.label}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#0066CC]" />}
                      </div>
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Sidebar Bottom Buttons */}
        <div className="flex flex-col gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-900 text-xs font-medium">
          {/* Full Bottom Actions: always visible on mobile, visible on desktop when not collapsed */}
          <div className={`flex flex-col gap-2 ${isCollapsed ? 'md:hidden' : ''}`}>
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2 bg-zinc-100/90 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-[#0066CC]/50 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors group active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#0066CC]" />
                <span className="tracking-wide text-xs">Website Live</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#0066CC] transition-colors" />
            </Link>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/40 dark:hover:bg-rose-900/50 dark:text-rose-300 rounded-lg transition-colors text-xs font-medium text-left w-full disabled:opacity-50 cursor-pointer shadow-xs group active:scale-[0.98]"
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

          {/* Collapsed Bottom Actions: visible only on desktop when collapsed */}
          {isCollapsed && (
            <div className="hidden md:flex flex-col items-center gap-2">
              <Link
                href="/"
                target="_blank"
                title="Lihat Website Live"
                className="group relative flex items-center justify-center w-11 h-11 rounded-xl bg-zinc-100/90 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-[#0066CC]/50 text-zinc-700 dark:text-zinc-300 transition-colors active:scale-95"
              >
                <Globe className="w-5 h-5 text-[#0066CC] group-hover:scale-110 transition-transform" />
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 translate-x-1 group-hover:translate-x-0 z-50 flex items-center gap-1.5 border border-zinc-700/50 dark:border-zinc-300/50">
                  <span>Website Live</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                </div>
              </Link>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="Keluar dari Dashboard Admin"
                className="group relative flex items-center justify-center w-11 h-11 rounded-xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/40 dark:hover:bg-rose-900/50 dark:text-rose-300 transition-colors active:scale-95 cursor-pointer shadow-xs"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-5 h-5 animate-spin text-rose-600 dark:text-rose-400" />
                ) : (
                  <LogOut className="w-5 h-5 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform" />
                )}
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 translate-x-1 group-hover:translate-x-0 z-50 border border-zinc-700/50 dark:border-zinc-300/50">
                  <span>Keluar Sesi Admin</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 dark:bg-black/80 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* ===== MAIN BODY ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header (Compact on Mobile, Full on Desktop) */}
        <header className="sticky top-0 z-20 bg-white/90 dark:bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-900 px-4 sm:px-6 pt-[calc(env(safe-area-inset-top,0px)+0.875rem)] pb-3.5 sm:py-4 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-1 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg active:scale-95 transition-transform"
              aria-label="Buka Menu Navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop & iPad Collapse/Expand Toggle */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex items-center justify-center p-2 -ml-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 active:scale-95 transition-all cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
              title={isCollapsed ? 'Perluas Sidebar (Ctrl+B)' : 'Ciutkan Sidebar (Ctrl+B)'}
              aria-label={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
              )}
            </button>

            <div
              onClick={handleLogoSecretClick}
              className="min-w-0 cursor-pointer select-none active:scale-[0.99] transition-transform"
              title="Ketuk 5 kali untuk membuka Secret Audit Mode"
            >
              <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] text-[#0066CC] uppercase font-semibold block truncate">
                Margasera Control Center
              </span>
              <h1 className="font-sans text-base sm:text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase truncate">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isAuditMode && (
              <Link
                href="/admin/dashboard/logs"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/40 hover:bg-purple-500/25 transition-all shadow-xs shrink-0 animate-pulse"
                title="Axiom Audit Mode Aktif! Klik untuk buka log"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping shrink-0" />
                <span className="hidden sm:inline">AUDIT MODE</span>
                <span className="sm:hidden">LOGS</span>
              </Link>
            )}
            <OfflineSyncStatus />
            <NotificationBell />
            <ThemeToggle />
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Keluar dari Dashboard Admin"
              className="hidden md:flex px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 text-rose-700 dark:bg-zinc-900/80 dark:border-zinc-800 dark:hover:border-rose-900/50 dark:hover:bg-rose-950/40 dark:text-zinc-400 dark:hover:text-rose-400 rounded-lg transition-all items-center gap-2 text-xs font-medium cursor-pointer shadow-xs group"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin text-rose-600 dark:text-rose-400" />
              ) : (
                <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform" />
              )}
              <span className="font-medium">Keluar</span>
            </button>
          </div>
        </header>

        {/* Page Content with safe area padding for bottom bar */}
        <main className="p-4 sm:p-8 md:p-10 pb-36 md:pb-10 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ===== MOBILE BOTTOM NAVIGATION (iOS PWA Bar < 768px) ===== */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-200/90 dark:border-zinc-800/90 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-2">
          {/* Home Tab */}
          <Link
            href="/admin/dashboard"
            className={`flex flex-col items-center justify-center gap-1 py-1 transition-all active:scale-95 ${isHomeActive
              ? 'text-[#0066CC] font-bold'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium'
              }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${isHomeActive ? 'bg-blue-50 dark:bg-[#0066CC]/15' : ''}`}>
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Home</span>
          </Link>

          {/* Booking Tab */}
          <Link
            href="/admin/dashboard/bookings"
            className={`flex flex-col items-center justify-center gap-1 py-1 transition-all active:scale-95 ${isBookingActive
              ? 'text-[#0066CC] font-bold'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium'
              }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${isBookingActive ? 'bg-blue-50 dark:bg-[#0066CC]/15' : ''}`}>
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Booking</span>
          </Link>

          {/* Add Action (+) Tab */}
          <button
            onClick={() => setShowQuickActions(true)}
            className="flex flex-col items-center justify-center gap-1 py-1 text-zinc-700 dark:text-zinc-300 active:scale-90 transition-transform cursor-pointer"
            aria-label="Buka Aksi Tambah Cepat"
          >
            <div className="w-10 h-10 -mt-3 rounded-full bg-[#0066CC] text-white flex items-center justify-center shadow-lg shadow-[#0066CC]/30 border-2 border-white dark:border-zinc-950">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold text-[#0066CC] tracking-tight">Add</span>
          </button>

          {/* Menu Drawer Tab */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center justify-center gap-1 py-1 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium active:scale-95 transition-all cursor-pointer"
            aria-label="Buka Drawer Menu"
          >
            <div className="p-1 rounded-xl">
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Menu</span>
          </button>
        </div>
      </nav>

      {/* Quick Actions Bottom Sheet Modal */}
      <QuickActionsBottomSheet
        isOpen={showQuickActions}
        onClose={() => setShowQuickActions(false)}
      />

      {/* Floating PWA Install Prompt for Admin */}
      <PwaInstallPrompt />

      {/* First-time announcement modal for Offline Features */}
      <OfflineWhatsNewModal />
    </div>
  );
}


