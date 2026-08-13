'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock authentication transition
    setTimeout(() => {
      setLoading(false);
      router.push('/admin/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 sm:p-10 shadow-2xl flex flex-col gap-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full border border-[#0066CC]/40 flex items-center justify-center bg-black">
            <Camera className="w-5 h-5 text-[#0066CC]" />
          </div>
          <span className="font-serif-editorial text-3xl tracking-[0.2em] font-semibold text-zinc-100 uppercase">
            Marga Sera
          </span>
          <div className="inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-[#0066CC] bg-[#0066CC]/10 px-3 py-1 rounded border border-[#0066CC]/30">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold tracking-[0.2em] uppercase transition-colors shadow-[0_0_20px_rgba(0,102,204,0.3)] flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>Memverifikasi Akses...</span>
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
