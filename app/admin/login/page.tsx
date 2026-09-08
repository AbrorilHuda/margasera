'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';
import { signInAdmin } from '@/lib/actions/admin';
import { PwaInstallPrompt } from '@/app/admin/_components/PwaInstallPrompt';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signInAdmin(email, password);

    if (result.success) {
      router.push('/admin/dashboard');
      router.refresh();
    } else {
      setError(result.error ?? 'Email atau password yang Anda masukkan tidak sesuai.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center px-4 sm:px-6 py-10 relative transition-colors">
      {/* Top Bar Actions */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Website</span>
        </Link>
      </div>

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-xl dark:shadow-2xl p-7 sm:p-9 flex flex-col gap-6">
        {/* Brand & Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <Image
            src="/logo.png"
            alt="Margasera Logo"
            width={160}
            height={44}
            className="h-9 w-auto object-contain"
            priority
          />
          <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase font-mono font-semibold text-[#0066CC] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-full border border-blue-200/60 dark:border-blue-900/50">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </div>
          <div className="flex flex-col gap-1 mt-0.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Masuk ke Dashboard
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Kelola jadwal pemesanan, paket, dan layanan studio
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-email"
              className="text-[11px] font-mono font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <span>Email</span>
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              placeholder="admin@margasera.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-50/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 focus:border-[#0066CC] dark:focus:border-[#0066CC] text-zinc-900 dark:text-zinc-100 px-3.5 py-2.5 sm:py-3 rounded-xl text-sm focus:outline-none transition-colors placeholder:text-zinc-400"
            />
          </div>

          {/* Password Field with Show/Hide Toggle */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-password"
              className="text-[11px] font-mono font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-50/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 focus:border-[#0066CC] dark:focus:border-[#0066CC] text-zinc-900 dark:text-zinc-100 px-3.5 py-2.5 sm:py-3 pr-11 rounded-xl text-sm focus:outline-none transition-colors placeholder:text-zinc-400 font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-[#0066CC] dark:text-blue-400" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium text-center bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-2.5 rounded-xl">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-3.5 bg-[#0066CC] hover:bg-[#0052A3] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold tracking-[0.15em] uppercase rounded-xl transition-all shadow-xs hover:shadow-md active:scale-[0.99] flex items-center justify-center gap-2 mt-1 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Masuk Ke Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="text-center pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
            Margasera Studio Management System
          </p>
        </div>
      </div>

      {/* Floating PWA Install Card Prompt */}
      <PwaInstallPrompt />
    </div>
  );
}
