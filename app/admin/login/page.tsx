'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { signInAdmin } from '@/lib/actions/admin';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setError(result.error ?? 'Login gagal. Coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 sm:p-10 shadow-2xl flex flex-col gap-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <Image
            src="/logo.png"
            alt="Margasera Logo"
            width={160}
            height={48}
            className="h-10 w-auto object-contain"
          />
          <div className="inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-[#0066CC] bg-[#0066CC]/10 px-3 py-1 rounded border border-[#0066CC]/30 mt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#0066CC]" /> Email Admin
            </label>
            <input
              type="email"
              required
              placeholder="admin@margasera.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded text-xs focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#0066CC]" /> Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded text-xs focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-medium text-center bg-rose-950/20 border border-rose-900/40 px-3 py-2 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#0066CC] hover:bg-[#0052A3] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold tracking-[0.2em] uppercase transition-colors shadow-[0_0_20px_rgba(0,102,204,0.3)] flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi Akses...</span>
              </>
            ) : (
              <>
                <span>Masuk Ke Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Kembali Ke Website Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
