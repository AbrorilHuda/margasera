'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Terminal,
  RefreshCw,
  Search,
  ExternalLink,
  Lock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Check,
  Activity,
  DollarSign,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  fetchAuditLogsAction,
  testAxiomAction,
  checkAxiomStatusAction,
} from '@/lib/actions/audit';
import { cleanPayload, type AuditLogEntry } from '@/lib/audit-logger';
import { useToast } from '@/components/ui/toast-context';

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingAxiom, setTestingAxiom] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [axiomStatus, setAxiomStatus] = useState<{
    isConfigured: boolean;
    dataset: string;
    maskedToken?: string;
  }>({
    isConfigured: false,
    dataset: 'margasera-audit',
  });

  // 1. Cek otorisasi mode rahasia (Easter Egg / Shortcut state)
  useEffect(() => {
    try {
      const mode = sessionStorage.getItem('margasera_audit_mode_active');
      if (mode === 'true') {
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
      }
    } catch {
      setIsUnlocked(false);
    }
  }, []);

  // 2. Load logs & status Axiom
  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [statusRes, logsRes] = await Promise.all([
        checkAxiomStatusAction(),
        fetchAuditLogsAction(100),
      ]);

      setAxiomStatus(statusRes);

      if (logsRes.success) {
        setLogs(logsRes.logs);
      } else {
        toast.error(logsRes.error || 'Gagal mengambil riwayat audit');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memuat data audit.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isUnlocked) {
      loadData();
    }
  }, [isUnlocked, loadData]);

  // Reset pagination saat search/filter/pageSize berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, pageSize]);

  // 3. Test kirim event log ke Axiom
  const handleTestAxiom = async () => {
    setTestingAxiom(true);
    try {
      const res = await testAxiomAction('Ping pengujian koneksi Axiom dari Secret Inspector Mode');
      if (res.success) {
        toast.success(res.message);
        // Refresh log setelah kirim test
        setTimeout(() => {
          loadData(true);
        }, 1200);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Gagal mengirim event pengujian ke Axiom.');
    } finally {
      setTestingAxiom(false);
    }
  };

  // 4. Kunci kembali mode audit
  const handleLockMode = () => {
    try {
      sessionStorage.removeItem('margasera_audit_mode_active');
      window.dispatchEvent(new Event('margasera_audit_mode_change'));
    } catch { }
    toast.info('Mode Audit telah dikunci kembali.');
    router.push('/admin/dashboard');
  };

  const copyDetails = (id: string, details?: Record<string, unknown>) => {
    const cleaned = cleanPayload(details);
    if (!cleaned) return;
    navigator.clipboard.writeText(JSON.stringify(cleaned, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Payload data berhasil disalin ke clipboard');
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      // Category filter
      if (categoryFilter === 'booking' && !item.action.includes('BOOKING')) return false;
      if (categoryFilter === 'finance' && !item.action.includes('EXPENSE')) return false;
      if (categoryFilter === 'settings' && !item.action.includes('SETTINGS')) return false;
      if (categoryFilter === 'services' && !item.action.includes('SERVICE') && !item.action.includes('PACKAGE')) return false;
      if (categoryFilter === 'testimonial' && !item.action.includes('TESTIMONIAL')) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchAction = item.action.toLowerCase().includes(q);
        const matchActor = item.actor.toLowerCase().includes(q);
        const matchTarget = item.targetId?.toLowerCase().includes(q);
        const matchDetails = item.details ? JSON.stringify(item.details).toLowerCase().includes(q) : false;
        if (!matchAction && !matchActor && !matchTarget && !matchDetails) return false;
      }

      return true;
    });
  }, [logs, categoryFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Format Helper
  const getActionBadgeColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('CANCEL')) {
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-900/60';
    }
    if (action.includes('UPDATE_PAYMENT') || action.includes('CREATE')) {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60';
    }
    if (action.includes('SETTINGS')) {
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200 dark:border-purple-800/60';
    }
    if (action.includes('TEST')) {
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800/60';
    }
    return 'bg-blue-50 text-[#0066CC] dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-900/60';
  };

  // JIKA BELUM DI-UNLOCK LEWAT SHORTCUT 5X KLIK
  if (isUnlocked === false) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Mode Audit Terkunci
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
              Halaman ini adalah modul diagnostik &amp; audit log internal tersembunyi.
              Pengguna biasa tidak memiliki akses langsung ke halaman ini.
            </p>
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 font-mono w-full text-left flex items-start gap-2">
            <Terminal className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <span>
              <strong>Petunjuk Akses:</strong> Ketuk logo Margasera sebanyak <strong>5 kali</strong> di sudut dashboard untuk mengaktifkan <em>Audit Inspector Mode</em>.
            </span>
          </div>

          <button
            onClick={() => router.push('/admin/dashboard')}
            className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.98]"
          >
            Kembali ke Dashboard Utama
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ============================================================
          TOP STATUS BANNER: AXIOM CLOUD & AUDIT MODE
          ============================================================ */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-900/10 via-zinc-900/5 to-blue-900/10 dark:from-purple-950/40 dark:via-zinc-900/60 dark:to-blue-950/30 border border-purple-500/30 dark:border-purple-500/40 rounded-2xl backdrop-blur-md shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-md">
            <Terminal className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold tracking-wider uppercase bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                SECRET AUDIT MODE ACTIVE
              </span>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                Axiom Dataset: <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">{axiomStatus.dataset}</strong>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              Live Audit Trail &amp; Event Inspector
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
          <button
            onClick={handleTestAxiom}
            disabled={testingAxiom}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
            title="Kirim 1 event uji coba ke dataset Axiom"
          >
            {testingAxiom ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{testingAxiom ? 'Mengirim...' : 'Kirim Test Log'}</span>
          </button>

          <a
            href="https://app.axiom.co"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700"
            title="Buka dashboard lengkap di web Axiom"
          >
            <span>Axiom Cloud</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => loadData(false)}
            disabled={loading}
            className="p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700"
            title="Refresh riwayat log"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleLockMode}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            title="Kunci kembali mode ini dan sembunyikan dari menu"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Kunci Mode</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          METRICS & CONFIG SUMMARY
          ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>Status Ingest</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {axiomStatus.isConfigured ? 'Axiom Siap' : 'Memory Only'}
          </p>
        </div>

        <div className="p-3.5 bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>Log Tersedia</span>
            <Terminal className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {logs.length} Event
          </p>
        </div>

        <div className="p-3.5 bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>Aktivitas Keuangan</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {logs.filter((l) => l.action.includes('EXPENSE')).length} Event
          </p>
        </div>

        <div className="p-3.5 bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>Aktivitas Booking</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {logs.filter((l) => l.action.includes('BOOKING')).length} Event
          </p>
        </div>
      </div>

      {/* ============================================================
          FILTER & SEARCH TOOLBAR
          ============================================================ */}
      <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari aksi, email admin, ID target, atau payload..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/40"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'booking', label: 'Booking' },
            { id: 'finance', label: 'Keuangan' },
            { id: 'settings', label: 'Pengaturan' },
            { id: 'services', label: 'Layanan' },
            { id: 'testimonial', label: 'Testimoni' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap text-xs ${categoryFilter === cat.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================
          EVENT FEED & LOG TABLE
          ============================================================ */}
      <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs backdrop-blur-md">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-7 h-7 text-purple-500 animate-spin" />
            <p className="text-xs text-zinc-500 font-mono">Menghubungkan ke Axiom &amp; memuat log...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">
              Tidak ada log yang cocok
            </p>
            <p className="text-xs text-zinc-500 max-w-sm">
              Coba sesuaikan kata kunci pencarian atau pilih filter kategori lain.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
            {paginatedLogs.map((item) => {
              const isExpanded = expandedId === item.id;
              const cleaned = cleanPayload(item.details);
              const hasDetails = Boolean(cleaned && Object.keys(cleaned).length > 0);
              const dateObj = new Date(item.timestamp);
              const formattedTime = !isNaN(dateObj.getTime())
                ? dateObj.toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
                : item.timestamp;

              return (
                <div
                  key={item.id}
                  className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {/* Left: Action badge & actor */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold border ${getActionBadgeColor(
                          item.action
                        )}`}
                      >
                        {item.action}
                      </span>

                      {item.targetId && (
                        <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                          Target: {item.targetId}
                        </span>
                      )}

                      <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                        Oleh: <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{item.actor}</strong>
                      </span>
                    </div>

                    {/* Right: Timestamp & Expand button */}
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 self-end sm:self-auto">
                      <span>{formattedTime}</span>

                      {hasDetails && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                        >
                          <span>{isExpanded ? 'Tutup' : 'Detail'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded JSON details */}
                  {isExpanded && hasDetails && (
                    <div className="mt-3 p-3 bg-zinc-950 text-zinc-200 rounded-xl font-mono text-[11px] relative overflow-x-auto border border-zinc-800 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80 text-[10px] text-zinc-400">
                        <span>PAYLOAD AUDIT DATA</span>
                        <button
                          onClick={() => copyDetails(item.id, cleaned)}
                          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Disalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Salin JSON</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                        {JSON.stringify(cleaned, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================
            PAGINATION TOOLBAR
            ============================================================ */}
        {!loading && filteredLogs.length > 0 && (
          <div className="p-3.5 sm:px-4 bg-zinc-50/70 dark:bg-zinc-950/40 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400">
            {/* Info count */}
            <div className="flex items-center gap-2 font-mono text-center sm:text-left">
              <span>
                Menampilkan{' '}
                <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
                  {(currentPage - 1) * pageSize + 1}
                </strong>
                -
                <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
                  {Math.min(filteredLogs.length, currentPage * pageSize)}
                </strong>{' '}
                dari{' '}
                <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
                  {filteredLogs.length}
                </strong>{' '}
                log (Buffer server: {logs.length})
              </span>
            </div>

            {/* Controls: Page size & Page nav */}
            <div className="flex items-center gap-3">
              {/* Page size selector */}
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <span>Baris:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-purple-500 cursor-pointer text-xs"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Nav buttons */}
              <div className="flex items-center gap-1 font-mono">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  title="Halaman Pertama"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <span className="px-2 py-1 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  title="Halaman Berikutnya"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  title="Halaman Terakhir"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
