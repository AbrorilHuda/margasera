'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  MessageSquareQuote,
  Star,
  ShieldCheck,
  PenLine,
  Eye,
  EyeOff,
  Trash2,
  Search,
  Filter,
  ArrowUpRight,
  RefreshCw,
  Loader2,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  getAllTestimonialsAdmin,
  toggleTestimonialPublishStatus,
  deleteTestimonialAdmin,
  type AdminTestimonialItem,
} from '@/lib/actions/testimonials';
import { useToast } from '@/components/ui/toast-context';

const EVENT_FILTERS = [
  'Semua Momen',
  'Wedding',
  'Pre-Wedding',
  'Engagement',
  'Siraman',
  'Wisuda Outdoor',
  'Sidang Skripsi',
  'Tasyakuran 40 Hari Bayi',
];

function getInitials(name: string): string {
  const parts = name.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AdminTestimonialsPage() {
  const { toast, confirmModal } = useToast();
  const [testimonials, setTestimonials] = useState<AdminTestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'hidden'>('all');
  const [eventFilter, setEventFilter] = useState('Semua Momen');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTestimonials = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const data = await getAllTestimonialsAdmin();
      setTestimonials(data);
    } catch (err) {
      console.error('Failed to load testimonials:', err);
      toast.error('Gagal mengambil data testimoni.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // Handle Toggle Publish/Hide
  const handleTogglePublish = async (item: AdminTestimonialItem) => {
    const nextStatus = !item.isPublished;
    setUpdatingId(item.id);

    // Optimistic UI update
    setTestimonials((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, isPublished: nextStatus } : t))
    );

    try {
      const res = await toggleTestimonialPublishStatus(item.id, nextStatus);
      if (res.success) {
        toast.success(
          nextStatus
            ? `Testimoni dari "${item.name}" sekarang TAMPIL di website.`
            : `Testimoni dari "${item.name}" berhasil DISEMBUNYIKAN.`
        );
      } else {
        // Rollback on failure
        setTestimonials((prev) =>
          prev.map((t) => (t.id === item.id ? { ...t, isPublished: item.isPublished } : t))
        );
        toast.error(`Gagal mengubah status: ${res.error}`);
      }
    } catch (err) {
      // Rollback
      setTestimonials((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, isPublished: item.isPublished } : t))
      );
      toast.error('Terjadi kesalahan jaringan.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle Delete Testimonial
  const handleDelete = (item: AdminTestimonialItem) => {
    confirmModal({
      title: 'Hapus Testimoni Ini?',
      message: `Apakah Anda yakin ingin menghapus testimoni dari "${item.name}"? Tindakan ini permanen dan tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus Testimoni',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await deleteTestimonialAdmin(item.id);
          if (res.success) {
            setTestimonials((prev) => prev.filter((t) => t.id !== item.id));
            toast.success(`Testimoni dari "${item.name}" berhasil dihapus.`);
          } else {
            toast.error(`Gagal menghapus: ${res.error}`);
          }
        } catch (err) {
          toast.error('Terjadi kesalahan saat menghapus data.');
        }
      },
    });
  };

  // Filtered list computation
  const filteredList = useMemo(() => {
    return testimonials.filter((t) => {
      // Status filter
      if (statusFilter === 'published' && !t.isPublished) return false;
      if (statusFilter === 'hidden' && t.isPublished) return false;

      // Event category filter
      if (eventFilter !== 'Semua Momen' && t.eventType.toLowerCase() !== eventFilter.toLowerCase()) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = t.name.toLowerCase().includes(q);
        const matchMsg = t.message.toLowerCase().includes(q);
        const matchLoc = (t.location || '').toLowerCase().includes(q);
        const matchCode = (t.bookingCode || '').toLowerCase().includes(q);
        const matchEvent = t.eventType.toLowerCase().includes(q);
        return matchName || matchMsg || matchLoc || matchCode || matchEvent;
      }

      return true;
    });
  }, [testimonials, statusFilter, eventFilter, searchQuery]);

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = testimonials.length;
    const published = testimonials.filter((t) => t.isPublished).length;
    const hidden = testimonials.filter((t) => !t.isPublished).length;
    const verified = testimonials.filter((t) => Boolean(t.bookingCode)).length;
    return { total, published, hidden, verified };
  }, [testimonials]);

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0066CC]/10 text-[#0066CC] dark:text-blue-400 text-xs font-semibold mb-2">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Manajemen Ulasan &amp; Moderasi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Kelola Testimoni Klien
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Moderasi dan kontrol testimoni yang masuk dari klien. Anda dapat menentukan ulasan mana yang boleh tampil di beranda website Margasera atau menyembunyikannya.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => fetchTestimonials(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>

          <Link
            href="/testimoni"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0066CC] hover:bg-blue-700 text-white transition-all shadow-xs"
          >
            <span>Buka Form /testimoni</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. Metrics Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Total Testimoni</span>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 font-mono">
            {metrics.total}
          </div>
          <span className="text-[11px] text-zinc-400 mt-0.5 block">Semua ulasan yang tercatat</span>
        </div>

        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Publik (Tampil)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            {metrics.published}
          </div>
          <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 block">
            Tampil di halaman beranda
          </span>
        </div>

        <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">Disembunyikan</span>
            <EyeOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono">
            {metrics.hidden}
          </div>
          <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5 block">
            Draft atau pending moderasi
          </span>
        </div>

        <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/50 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">Terverifikasi</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#0066CC] dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-[#0066CC] dark:text-blue-400 mt-1 font-mono">
            {metrics.verified}
          </div>
          <span className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-0.5 block">
            Menggunakan Kode Booking
          </span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white dark:bg-zinc-900/60 p-4 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama klien, ulasan, atau kode booking..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#0066CC] transition-all"
          />
        </div>

        {/* Filter Status Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Semua ({metrics.total})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'published'
                ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Publik ({metrics.published})
          </button>
          <button
            onClick={() => setStatusFilter('hidden')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'hidden'
                ? 'bg-amber-600 text-white shadow-2xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Disembunyikan ({metrics.hidden})
          </button>
        </div>

        {/* Category Dropdown */}
        <div className="shrink-0">
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-medium bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-[#0066CC] transition-all"
          >
            {EVENT_FILTERS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Testimonials List */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl animate-pulse flex flex-col gap-3"
            >
              <div className="h-5 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
              <div className="h-4 w-full max-w-lg bg-zinc-100 dark:bg-zinc-800/60 rounded-md" />
              <div className="h-4 w-2/3 bg-zinc-100 dark:bg-zinc-800/60 rounded-md" />
            </div>
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-white dark:bg-zinc-900/40 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
            <MessageSquareQuote className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {testimonials.length === 0
              ? 'Belum Ada Testimoni Tersimpan'
              : 'Tidak Ada Testimoni yang Sesuai Filter'}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md">
            {testimonials.length === 0
              ? 'Saat klien mengisi formulir di halaman /testimoni, datanya akan langsung otomatis muncul di halaman ini.'
              : 'Coba ubah kata kunci pencarian atau sesuaikan filter status dan kategori layanan di atas.'}
          </p>
          {testimonials.length === 0 && (
            <Link
              href="/testimoni"
              target="_blank"
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0066CC] hover:bg-blue-700 text-white transition-all shadow-xs"
            >
              <span>Uji Coba Kirim Testimoni</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      ) : (
        /* Testimonial Cards */
        <div className="flex flex-col gap-4">
          {filteredList.map((item) => {
            const isUpdating = updatingId === item.id;
            const dateStr = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '-';

            return (
              <div
                key={item.id}
                className={`p-5 sm:p-6 bg-white dark:bg-zinc-900/70 border rounded-2xl transition-all duration-200 shadow-2xs ${
                  item.isPublished
                    ? 'border-zinc-200/90 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
                    : 'border-amber-300/60 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left Column: Client Info & Quote */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#0066CC] to-blue-400 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-xs tracking-wider">
                      {getInitials(item.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {item.name}
                        </h3>

                        {/* Event pill */}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#0066CC]/10 text-[#0066CC] dark:text-blue-400 border border-[#0066CC]/20">
                          {item.eventType}
                        </span>

                        {/* Verified / Direct review pill */}
                        {item.bookingCode ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/50 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Terverifikasi ({item.bookingCode})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-blue-50 dark:bg-blue-950/40 text-[#0066CC] dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/40 font-medium">
                            <PenLine className="w-3 h-3" />
                            <span>Ulasan Klien</span>
                          </span>
                        )}

                        {/* Status badge */}
                        {item.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Publik
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                            <EyeOff className="w-2.5 h-2.5" />
                            Disembunyikan
                          </span>
                        )}
                      </div>

                      {/* Location, Date, & Star Rating */}
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-400" />
                          <span>{item.location || 'Pamekasan, Madura'}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          <span>{dateStr}</span>
                        </span>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: item.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                          <span className="text-zinc-700 dark:text-zinc-300 font-semibold font-mono text-[11px] ml-1">
                            {item.rating}.0
                          </span>
                        </div>
                      </div>

                      {/* Quote Text Box */}
                      <div className="mt-3.5 p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800/60 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-serif italic">
                        &ldquo;{item.message}&rdquo;
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Toggle & Action Controls */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800/60">
                    {/* Toggle Button */}
                    <button
                      onClick={() => handleTogglePublish(item)}
                      disabled={isUpdating}
                      title={
                        item.isPublished
                          ? 'Klik untuk menyembunyikan ulasan ini dari publik'
                          : 'Klik untuk menampilkan ulasan ini ke publik'
                      }
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                        item.isPublished
                          ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : item.isPublished ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                      <span>{item.isPublished ? 'Tampil di Publik' : 'Disembunyikan'}</span>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
