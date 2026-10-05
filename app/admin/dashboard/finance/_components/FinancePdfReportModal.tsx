'use client';

import React from 'react';
import Image from 'next/image';
import { X, Printer, FileText, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { EXPENSE_CATEGORY_LABELS } from '@/lib/constants';
import { printDocument } from '@/lib/print';
import type { Expense, StudioSettings } from '@/lib/types';

interface FinancePdfReportModalProps {
  expenses: Expense[];
  studioSettings: StudioSettings;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  totalReceivables: number;
  monthFilter: string;
  categoryFilter: string;
  formatMonthLabel: (ym: string) => string;
  dateRangeLabel?: string;
  onClose: () => void;
}

export function FinancePdfReportModal({
  expenses,
  studioSettings,
  totalIncome,
  totalExpense,
  netProfit,
  totalReceivables,
  monthFilter,
  categoryFilter,
  formatMonthLabel,
  dateRangeLabel,
  onClose,
}: FinancePdfReportModalProps) {
  const periodLabel = dateRangeLabel || (monthFilter === 'all' ? 'Seluruh Periode Tercatat' : formatMonthLabel(monthFilter));

  // Breakdown per kategori pengeluaran
  const expenseByCategory = expenses
    .filter((e) => e.type === 'expense')
    .reduce((acc, e) => {
      const catKey = e.category;
      const catName = catKey === 'other' ? (e.customCategory || 'Lainnya') : (EXPENSE_CATEGORY_LABELS[catKey] || catKey);
      acc[catName] = (acc[catName] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

  const handlePrint = () => {
    printDocument('margasera-finance-report-doc', `Laporan_Keuangan_Margasera_${monthFilter || 'rekap'}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Toolbar Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0066CC]" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Pratinjau Laporan Keuangan & Kas
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Format resmi cetak & ekspor PDF Marga Sera Photography
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#0066CC] hover:bg-[#0055b3] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content to Print */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-zinc-100 dark:bg-zinc-950/50">
          <div
            id="margasera-finance-report-doc"
            className="bg-white text-zinc-900 p-6 sm:p-10 rounded-xl shadow-xs border border-zinc-200 mx-auto max-w-3xl space-y-6 text-sm"
          >
            {/* Kop Dokumen */}
            <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-5">
              <div className="flex flex-col gap-1.5">
                <div className="py-1 w-fit">
                  <Image
                    src="/logo.png"
                    alt="Margasera Logo"
                    width={160}
                    height={48}
                    className="h-9 w-auto object-contain"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-sm font-bold uppercase tracking-wider text-zinc-950 font-sans">
                    {studioSettings.studioName || 'MARGASERA PHOTOGRAPHY'}
                  </h1>
                  <p className="text-xs text-zinc-600 font-sans">
                    {studioSettings.address || 'Pamekasan, Madura, Jawa Timur'}
                  </p>
                  <p className="text-xs text-zinc-500 font-sans">
                    WhatsApp: {studioSettings.whatsapp || '0858-0613-8955'} | Email: {studioSettings.email || 'hello@margasera.id'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 bg-zinc-900 text-white text-[10px] font-mono uppercase font-bold tracking-widest rounded-sm mb-1">
                  LAPORAN KAS & LABA RUGI
                </span>
                <p className="text-xs font-semibold text-zinc-800">{periodLabel}</p>
                <p className="text-[10px] text-zinc-500 font-mono">
                  Dicetak: {formatDate(new Date().toISOString())}
                </p>
              </div>
            </div>

            {/* Ringkasan Arus Kas (Executive Summary) */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                  Total Pemasukan Riil
                </span>
                <span className="text-base sm:text-lg font-bold text-emerald-700 block mt-0.5">
                  {formatCurrency(totalIncome)}
                </span>
                <span className="text-[10px] text-zinc-500">Uang masuk (DP & Pelunasan)</span>
              </div>
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                  Total Beban Pengeluaran
                </span>
                <span className="text-base sm:text-lg font-bold text-rose-700 block mt-0.5">
                  {formatCurrency(totalExpense)}
                </span>
                <span className="text-[10px] text-zinc-500">Operasional & biaya project</span>
              </div>
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                  Laba Bersih (Net Profit)
                </span>
                <span className={`text-base sm:text-lg font-bold block mt-0.5 ${netProfit >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>
                  {formatCurrency(netProfit)}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {netProfit >= 0 ? 'Margin Sehat' : 'Defisit Operasional'}
                </span>
              </div>
            </div>

            {/* Rekapitulasi per Kategori Pengeluaran */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 font-mono mb-2 pb-1 border-b border-zinc-200">
                1. Alokasi Pengeluaran Berdasarkan Kategori
              </h2>
              {Object.keys(expenseByCategory).length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-2">Belum ada data pengeluaran pada periode ini.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(expenseByCategory).map(([cat, amt]) => {
                    const pct = totalExpense > 0 ? ((amt / totalExpense) * 100).toFixed(1) : '0';
                    return (
                      <div key={cat} className="flex items-center justify-between p-2 bg-zinc-50 border border-zinc-100 rounded-md">
                        <span className="text-zinc-700 font-medium">{cat}</span>
                        <div className="text-right">
                          <span className="font-bold font-mono text-zinc-900 block">{formatCurrency(amt)}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Rincian Transaksi */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 font-mono mb-2 pb-1 border-b border-zinc-200">
                2. Rincian Catatan Transaksi ({expenses.length} Transaksi)
              </h2>
              <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200 text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Tanggal</th>
                      <th className="py-2 px-3">Kategori</th>
                      <th className="py-2 px-3">Keterangan / Terkait Project</th>
                      <th className="py-2 px-3">Metode</th>
                      <th className="py-2 px-3 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 font-sans text-[11px]">
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-zinc-500 italic">
                          Tidak ada catatan transaksi pada filter yang dipilih.
                        </td>
                      </tr>
                    ) : (
                      expenses.map((exp) => {
                        const isIncome = exp.type === 'income';
                        const catLabel =
                          exp.category === 'other'
                            ? (exp.customCategory || 'Lainnya')
                            : (EXPENSE_CATEGORY_LABELS[exp.category] || exp.category);
                        return (
                          <tr key={exp.id} className="hover:bg-zinc-50">
                            <td className="py-2 px-3 font-mono whitespace-nowrap text-zinc-600">
                              {exp.date}
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-medium bg-zinc-100 text-zinc-700">
                                {catLabel}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <span className="font-semibold text-zinc-900 block">{exp.title}</span>
                              {exp.bookingCode && (
                                <span className="text-[10px] text-zinc-500 block">
                                  Project: [{exp.bookingCode}] {exp.customerName}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-zinc-600 uppercase text-[10px] font-mono">
                              {exp.paymentMethod || 'transfer'}
                            </td>
                            <td className={`py-2 px-3 text-right font-mono font-bold whitespace-nowrap ${
                              isIncome ? 'text-emerald-700' : 'text-rose-700'
                            }`}>
                              {isIncome ? '+' : '-'}{formatCurrency(exp.amount)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Tanda Tangan */}
            <div className="pt-6 border-t border-zinc-200 flex justify-between items-end text-xs text-zinc-500 font-light">
              <div className="flex flex-col gap-1">
                <strong className="text-zinc-800 font-semibold uppercase font-mono text-[10px]">Catatan Laporan:</strong>
                <span>• Laporan kas ini di-generate secara otomatis oleh sistem internal Margasera.</span>
                <span>• Total Piutang Berjalan Klien: <strong>{formatCurrency(totalReceivables)}</strong></span>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className="text-[10px] font-mono text-zinc-400">Penanggung Jawab:</span>
                <div className="h-10 w-28 border-b border-zinc-400 flex items-center justify-end italic text-zinc-400 text-xs">
                  <Image
                    src="/ttd.PNG"
                    alt="Tanda Tangan Margasera"
                    width={250}
                    height={100}
                    className="h-20 w-auto object-contain"
                    priority
                  />
                </div>
                <strong className="text-zinc-900 font-semibold font-mono text-xs">ROYFAL ALIM, S.Kom</strong>
                <span className="font-mono text-[10px]">Chief Executive Officer(CEO)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
