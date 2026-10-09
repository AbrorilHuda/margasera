'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Loader2, DollarSign, Tag, Calendar, User, FileText, CreditCard, AlertCircle, Search, Building2, Check } from 'lucide-react';
import { createExpense, updateExpense } from '@/lib/actions/finance';
import { putLocalExpense } from '@/lib/offline';
import { formatCurrency } from '@/lib/utils';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import { useToast } from '@/components/ui/toast-context';
import type { Booking, Expense, TransactionType } from '@/lib/types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedExpense: Expense, isEdit: boolean) => void;
  editingExpense?: Expense | null;
  bookings: Booking[];
  isOffline?: boolean;
}

export function ExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  editingExpense,
  bookings,
  isOffline = false,
}: ExpenseModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('fee_team');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [bookingId, setBookingId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'other'>('transfer');
  const [notes, setNotes] = useState<string>('');

  // Booking Search State
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [isBookingDropdownOpen, setIsBookingDropdownOpen] = useState(false);
  const bookingDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bookingDropdownRef.current && !bookingDropdownRef.current.contains(e.target as Node)) {
        setIsBookingDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Selected Booking details
  const selectedBooking = useMemo(() => {
    if (!bookingId) return null;
    const found = bookings.find((b) => b.id === bookingId);
    if (found) return found;
    if (editingExpense?.bookingId === bookingId && editingExpense?.bookingCode) {
      return {
        id: bookingId,
        bookingCode: editingExpense.bookingCode,
        customerName: editingExpense.customerName || 'Klien',
        serviceName: '',
        packageName: '',
        bookingDate: '',
      } as unknown as Booking;
    }
    return null;
  }, [bookings, bookingId, editingExpense]);

  // Filter bookings: abaikan cancelled kecuali booking yang sedang terpilih, limit maks 15 hasil
  const filteredBookings = useMemo(() => {
    const activeList = bookings.filter((b) => b.status !== 'cancelled' || b.id === bookingId);
    if (!bookingSearchQuery.trim()) {
      return activeList.slice(0, 15);
    }
    const query = bookingSearchQuery.toLowerCase().trim();
    return activeList
      .filter((b) => {
        const code = (b.bookingCode || '').toLowerCase();
        const name = (b.customerName || '').toLowerCase();
        const phone = (b.whatsapp || '').toLowerCase();
        const service = (b.serviceName || b.packageName || '').toLowerCase();
        const date = (b.bookingDate || '').toLowerCase();
        return (
          code.includes(query) ||
          name.includes(query) ||
          phone.includes(query) ||
          service.includes(query) ||
          date.includes(query)
        );
      })
      .slice(0, 15);
  }, [bookings, bookingId, bookingSearchQuery]);

  // Populate form if editing
  useEffect(() => {
    if (editingExpense) {
      setType(editingExpense.type || 'expense');
      setDate(editingExpense.date || new Date().toISOString().split('T')[0]);
      setTitle(editingExpense.title || '');
      setCategory(editingExpense.category || 'fee_team');
      setCustomCategory(editingExpense.customCategory || '');
      setAmount(editingExpense.amount || '');
      setBookingId(editingExpense.bookingId || '');
      setPaymentMethod(editingExpense.paymentMethod || 'transfer');
      setNotes(editingExpense.notes || '');
      setBookingSearchQuery('');
      setIsBookingDropdownOpen(false);
    } else {
      // Reset form
      setType('expense');
      setDate(new Date().toISOString().split('T')[0]);
      setTitle('');
      setCategory('fee_team');
      setCustomCategory('');
      setAmount('');
      setBookingId('');
      setPaymentMethod('transfer');
      setNotes('');
      setBookingSearchQuery('');
      setIsBookingDropdownOpen(false);
    }
  }, [editingExpense, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.warning('Mohon isi keterangan atau deskripsi transaksi.', 'Keterangan Kosong');
      return;
    }

    const numericAmount = typeof amount === 'number' ? amount : Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      toast.warning('Nominal transaksi harus lebih dari 0.', 'Nominal Tidak Valid');
      return;
    }

    if (category === 'other' && !customCategory.trim()) {
      toast.warning('Karena Anda memilih kategori Lainnya, silakan tulis nama kategorinya.', 'Nama Kategori Manual');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      type,
      date,
      title: title.trim(),
      category,
      customCategory: category === 'other' ? customCategory.trim() : undefined,
      amount: numericAmount,
      bookingId: bookingId || undefined,
      bookingCode: selectedBooking?.bookingCode,
      customerName: selectedBooking?.customerName,
      paymentMethod,
      notes: notes.trim() || undefined,
    };

    try {
      if (isOffline) {
        // Simpan langsung ke IndexedDB lokal jika offline
        const offlineRecord: Expense = {
          id: editingExpense?.id || `offline_exp_${Date.now()}`,
          ...payload,
          createdAt: editingExpense?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await putLocalExpense(offlineRecord);
        toast.success('Transaksi disimpan di memori perangkat dan akan disinkronkan saat online.', 'Tersimpan di Cache Offline');
        onSuccess(offlineRecord, Boolean(editingExpense));
        onClose();
        return;
      }

      if (editingExpense) {
        const res = await updateExpense(editingExpense.id, payload);
        if (!res.success || !res.data) {
          throw new Error(res.error || 'Gagal memperbarui transaksi.');
        }
        await putLocalExpense(res.data);
        toast.success('Catatan keuangan berhasil diperbarui.', 'Berhasil Diperbarui');
        onSuccess(res.data, true);
      } else {
        const res = await createExpense(payload);
        if (!res.success || !res.data) {
          throw new Error(res.error || 'Gagal menyimpan transaksi.');
        }
        await putLocalExpense(res.data);
        toast.success('Catatan keuangan baru berhasil ditambahkan.', 'Berhasil Dicatat');
        onSuccess(res.data, false);
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem saat menyimpan transaksi.', 'Gagal Menyimpan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0066CC]" />
              {editingExpense ? 'Edit Catatan Transaksi' : 'Catat Transaksi Keuangan'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {type === 'expense' ? 'Catat pengeluaran project atau operasional' : 'Catat pemasukan non-booking'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Toggle Type (Expense / Income) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${type === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              Pengeluaran (Beban)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              Pemasukan Tambahan
            </button>
          </div>

          {/* Row 1: Tanggal & Nominal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                Tanggal Transaksi
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl focus:outline-hidden focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                  Nominal (Rp) <span className="text-rose-500">*</span>
                </span>
                {typeof amount === 'number' && amount > 0 && (
                  <span className="text-[10px] font-mono font-medium text-[#0066CC]">
                    {formatCurrency(amount)}
                  </span>
                )}
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="Contoh: 750000"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono font-bold bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl focus:outline-hidden focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Kategori */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-zinc-400" />
              Kategori Transaksi
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl focus:outline-hidden focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] transition-colors"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label} ({cat.description})
                </option>
              ))}
            </select>
          </div>

          {/* Input Manual Kategori Kustom jika kategori === 'other' */}
          {category === 'other' && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1.5 animate-in fade-in duration-150">
              <label className="block text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                Nama Kategori Manual <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Beli Harddisk Eksternal, Snack Tamu, Pajak..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-700/60 rounded-lg focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Nama kategori ini akan ditampilkan di laporan dan badge transaksi.
              </p>
            </div>
          )}

          {/* Keterangan / Deskripsi */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              Keterangan / Rincian Pengeluaran <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Honor Mas Wahyu fotografer 2 sesi wedding, Cetak album 20x30 di Lab Subur"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl focus:outline-hidden focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] transition-colors"
            />
          </div>

          {/* Hubungkan ke Booking Klien (Opsional) */}
          <div className="relative" ref={bookingDropdownRef}>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                Terkait Project / Booking (Opsional)
              </span>
              <span className="text-[10px] text-zinc-400 font-normal">
                Pilih jika pengeluaran ini untuk project klien
              </span>
            </label>

            {bookingId && selectedBooking ? (
              /* Kartu Booking Terpilih */
              <div className="flex items-center justify-between p-2.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 rounded-xl">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#0066CC]/10 text-[#0066CC] dark:text-blue-400 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#0066CC] dark:text-blue-400">
                        [{selectedBooking.bookingCode}]
                      </span>
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {selectedBooking.customerName}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {selectedBooking.serviceName || selectedBooking.packageName || 'Booking'} {selectedBooking.bookingDate ? `• ${selectedBooking.bookingDate}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBookingId('');
                    setBookingSearchQuery('');
                  }}
                  className="px-2.5 py-1 text-[11px] text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer shrink-0 ml-2 font-medium flex items-center gap-1 border border-zinc-200/60 dark:border-zinc-700/60"
                  title="Lepas keterkaitan project (Jadikan umum)"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Lepas</span>
                </button>
              </div>
            ) : (
              /* Input Pencarian Booking */
              <div className="relative">
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={bookingSearchQuery}
                    onChange={(e) => {
                      setBookingSearchQuery(e.target.value);
                      setIsBookingDropdownOpen(true);
                    }}
                    onFocus={() => setIsBookingDropdownOpen(true)}
                    placeholder="🏢 Umum Studio (Ketik nama klien / kode booking...)"
                    className="w-full pl-9 pr-8 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl focus:outline-hidden focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] transition-colors placeholder:text-zinc-400 text-zinc-800 dark:text-zinc-200"
                  />
                  {bookingSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setBookingSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-md cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdown Popover */}
                {isBookingDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                    <div className="overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
                      {/* Opsi: Pengeluaran Umum */}
                      <button
                        type="button"
                        onClick={() => {
                          setBookingId('');
                          setIsBookingDropdownOpen(false);
                          setBookingSearchQuery('');
                        }}
                        className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer ${
                          !bookingId ? 'bg-zinc-50 dark:bg-zinc-800/40 text-[#0066CC] font-semibold' : 'text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-zinc-400 shrink-0" />
                          <span>🏢 Pengeluaran Umum Studio (Bukan project klien)</span>
                        </div>
                        {!bookingId && <Check className="w-3.5 h-3.5 text-[#0066CC]" />}
                      </button>

                      {/* List Booking Terfilter */}
                      {filteredBookings.length > 0 ? (
                        filteredBookings.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              setBookingId(b.id);
                              setIsBookingDropdownOpen(false);
                              setBookingSearchQuery('');
                            }}
                            className="w-full px-3.5 py-2.5 text-left hover:bg-blue-50/60 dark:hover:bg-blue-950/30 transition-colors cursor-pointer flex items-center justify-between group"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-xs font-bold text-[#0066CC] dark:text-blue-400">
                                  [{b.bookingCode}]
                                </span>
                                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                  {b.customerName}
                                </span>
                              </div>
                              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                {b.serviceName || b.packageName || 'Booking'} • {b.bookingDate}
                              </div>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 capitalize shrink-0">
                              {b.status}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center text-xs text-zinc-400">
                          Tidak ada booking yang cocok dengan "{bookingSearchQuery}"
                        </div>
                      )}
                    </div>

                    <div className="p-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 text-[10px] text-zinc-400 flex items-center justify-between">
                      <span>Maksimal 15 data ditampilkan</span>
                      <button
                        type="button"
                        onClick={() => setIsBookingDropdownOpen(false)}
                        className="text-[#0066CC] hover:underline cursor-pointer"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Metode Bayar & Catatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                Metode Pembayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl focus:outline-hidden focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] transition-colors"
              >
                <option value="transfer">Transfer Bank (BRI/Mandiri/dsb)</option>
                <option value="cash">Tunai (Cash)</option>
                <option value="other">Lainnya / E-Wallet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <input
                type="text"
                placeholder="No. referensi transfer, vendor, dsb."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl focus:outline-hidden focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] transition-colors"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#0066CC] hover:bg-[#0055b3] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : editingExpense ? (
                'Simpan Perubahan'
              ) : (
                'Simpan Transaksi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
