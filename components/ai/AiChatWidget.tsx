'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Camera,
  Aperture,
  X,
  Send,
  MessageCircle,
  Calendar,
  RotateCcw,
  ArrowRight,
  Clock,
  User,
  ExternalLink,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

const QUICK_CHIPS = [
  {
    icon: '💍',
    label: 'Paket Wedding',
    prompt: 'Halo Sera, bisa jelaskan paket dokumentasi wedding Margasera dan apa saja fasilitasnya?',
  },
  {
    icon: '🎞️',
    label: 'Prewedding Story',
    prompt: 'Halo Sera, konsep dan paket prewedding outdoor di Margasera seperti apa ya?',
  },
  {
    icon: '🎓',
    label: 'Wisuda Outdoor',
    prompt: 'Halo Sera, berapa harga dan detail paket foto wisuda outdoor?',
  },
  {
    icon: '📍',
    label: 'Lokasi Studio',
    prompt: 'Halo Sera, alamat studio Margasera di Pamekasan ada di mana ya?',
  },
  {
    icon: '💳',
    label: 'Info DP & Bayar',
    prompt: 'Halo Sera, bagaimana ketentuan pembayaran DP dan pelunasan sesi foto?',
  },
  {
    icon: '📅',
    label: 'Cara Booking',
    prompt: 'Halo Sera, bagaimana alur booking tanggal sesi foto di website ini?',
  },
];

/**
 * Formatter teks balasan Sera AI:
 * Mem-parse markdown bold (**teks**), bullet points, dan link markdown ([label](url)).
 */
function FormattedMessage({
  text,
  isUser = false,
  onClose,
}: {
  text: string;
  isUser?: boolean;
  onClose?: () => void;
}) {
  const elements = useMemo(() => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        return (
          <li
            key={lineIdx}
            className={`ml-3.5 list-disc pl-1 my-0.5 leading-relaxed ${isUser
                ? 'marker:text-white text-white'
                : 'marker:text-[#0066CC] text-zinc-900 dark:text-zinc-100'
              }`}
          >
            {renderInlineMarkdown(content, isUser, onClose)}
          </li>
        );
      }

      if (!trimmed) {
        return <div key={lineIdx} className="h-2" />;
      }

      return (
        <p
          key={lineIdx}
          className={`leading-relaxed my-0.5 ${isUser ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'
            }`}
        >
          {renderInlineMarkdown(line, isUser, onClose)}
        </p>
      );
    });
  }, [text, isUser, onClose]);

  return <div className="space-y-0.5 text-xs sm:text-[13px]">{elements}</div>;
}

function renderInlineMarkdown(
  str: string,
  isUser = false,
  onClose?: () => void
): React.ReactNode[] {
  // Regex untuk memecah teks tebal (**teks**) dan link markdown ([label](url))
  const parts = str.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, i) => {
    // 1. Format Bold (**teks**)
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong
          key={i}
          className={`font-bold ${isUser ? 'text-white' : 'text-zinc-950 dark:text-white'}`}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    // 2. Format Link ([label](url))
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const splitIdx = part.indexOf('](');
      const label = part.slice(1, splitIdx);
      const url = part.slice(splitIdx + 2, -1);

      // Link internal (/booking?service=... atau /availability)
      if (url.startsWith('/')) {
        const isBooking = url.startsWith('/booking');
        const isWa = url.startsWith('/api/wa');

        if (isWa) {
          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-2"
            >
              <MessageCircle className="w-3 h-3 shrink-0" />
              <span>{label}</span>
              <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-80" />
            </a>
          );
        }

        return (
          <Link
            key={i}
            href={url}
            onClick={onClose}
            className={`inline-flex items-center gap-1 font-semibold transition-all ${isBooking
                ? 'my-1 px-2.5 py-1 rounded-lg bg-[#0066CC] hover:bg-[#0052a3] text-white text-[11px] shadow-2xs hover:scale-[1.02] active:scale-[0.98]'
                : 'text-[#0066CC] dark:text-sky-400 hover:underline underline-offset-2'
              }`}
          >
            {isBooking && <Calendar className="w-3 h-3 shrink-0" />}
            <span>{label}</span>
            {isBooking && <ArrowRight className="w-3 h-3 shrink-0" />}
          </Link>
        );
      }

      // Link eksternal (WhatsApp wa.me atau https://)
      return (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-2"
        >
          <span>{label}</span>
          <ExternalLink className="w-3 h-3 shrink-0 opacity-80" />
        </a>
      );
    }

    return part;
  });
}

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Halo kak! Saya **Sera AI**, konsultan virtual resmi **Margasera Photography**.\n\nAda yang bisa saya bantu seputar paket foto studio, wedding, pre-wedding, wisuda, atau panduan booking?',
      timestamp: 'Baru saja',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPillPrompt, setShowPillPrompt] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false);
      setTimeout(() => inputRef.current?.focus(), 200);
      setShowPillPrompt(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(true);
    }
  }, [messages, loading]);

  // Sembunyikan floating pill tooltip setelah 14 detik
  useEffect(() => {
    const timer = setTimeout(() => setShowPillPrompt(false), 14000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setErrorMessage(null);
    setInput('');

    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text,
      timestamp: timeStr,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const historyPayload = newMessages
        .slice(-6)
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menghubungi Sera AI');
      }

      const botMsg: ChatMessage = {
        id: `${Date.now()}-bot`,
        role: 'model',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi gangguan koneksi. Silakan coba tanyakan kembali ya kak.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: 'Halo kak! Saya **Sera AI**, konsultan virtual resmi **Margasera Photography**.\n\nAda yang bisa saya bantu seputar paket foto studio, wedding, pre-wedding, wisuda, atau panduan booking?',
        timestamp: 'Baru saja',
      },
    ]);
    setErrorMessage(null);
    setInput('');
  };

  // Render Action Cards khas studio foto Margasera
  const renderActionCards = (text: string) => {
    const hasBooking = text.includes('/booking');
    const hasAvailability = text.includes('/availability');
    const hasWa =
      text.includes('wa.me') ||
      text.includes('/api/wa') ||
      text.toLowerCase().includes('whatsapp');

    if (!hasBooking && !hasAvailability && !hasWa) return null;

    // Deteksi deep link spesifik paket (/booking?service=...&package=...)
    const deepBookingMatch = text.match(/\/booking\?[^\s)\]]+/);
    const bookingUrl = deepBookingMatch ? deepBookingMatch[0] : '/booking';

    return (
      <div className="mt-3 pt-2.5 border-t border-zinc-200 dark:border-zinc-700/60 flex flex-col gap-1.5">
        {hasBooking && (
          <Link
            href={bookingUrl}
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0066CC] hover:bg-[#0052a3] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{deepBookingMatch ? 'Pesan Paket Ini Sekarang' : 'Formulir Pemesanan Sesi Foto'}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}

        {hasAvailability && (
          <Link
            href="/availability"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Cek Jadwal Tanggal Kosong</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-zinc-500 dark:text-zinc-400" />
          </Link>
        )}

        {hasWa && (
          <a
            href="/api/wa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Konsultasi Khusus via WhatsApp</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 opacity-90" />
          </a>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="sm:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Widget Container */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end font-sans">
        {/* Floating Pill Tooltip (Desktop & Mobile) - Terang & Jelas di Semua Mode */}
        {!isOpen && showPillPrompt && (
          <div
            onClick={() => setIsOpen(true)}
            className="mb-2.5 px-3.5 py-2.5 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl flex items-center gap-3 cursor-pointer hover:border-[#0066CC] hover:scale-105 active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 group"
          >
            <div className="w-8 h-8 rounded-full bg-[#0066CC] text-white flex items-center justify-center shrink-0 shadow-md">
              <Aperture className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <div>
              <p className="font-bold text-xs tracking-wide flex items-center gap-1.5 leading-none text-zinc-900 dark:text-white">
                <span>Tanya Sera AI</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
              </p>
              <p className="font-serif-editorial italic text-xs text-amber-700 dark:text-amber-400 mt-1 leading-none font-medium">
                Konsultan Foto Margasera
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPillPrompt(false);
              }}
              className="p-1 -mr-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded-lg cursor-pointer"
              title="Tutup sapaan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Window Chat (Mobile Bottom Sheet & Desktop Floating Box) */}
        {isOpen && (
          <div
            className={`
              fixed inset-x-0 bottom-0 top-12 sm:top-auto sm:inset-auto sm:bottom-0 sm:right-0
              w-full sm:w-[410px] h-[calc(100dvh-3rem)] sm:h-[610px] sm:max-h-[86vh]
              bg-white dark:bg-zinc-950
              border-t sm:border border-zinc-200 dark:border-zinc-800
              rounded-t-[28px] sm:rounded-3xl
              shadow-2xl shadow-black/25 dark:shadow-black/70
              flex flex-col overflow-hidden
              animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-250
            `}
          >
            {/* Mobile Drag Indicator Bar */}
            <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto mt-2 mb-1 sm:hidden shrink-0" />

            {/* HEADER KHAS MARGASERA - SUPPORTS BOTH LIGHT & DARK MODES */}
            <div className="px-4 py-3 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <div className="flex items-center gap-3">
                {/* Logo Shutter Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-zinc-900 border border-blue-200 dark:border-zinc-700 flex items-center justify-center text-[#0066CC] shadow-inner">
                    <Aperture className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold tracking-wide text-zinc-900 dark:text-white">
                      Sera AI
                    </h3>
                    <span className="text-[9px] font-mono font-semibold uppercase tracking-wider bg-amber-50 dark:bg-zinc-800 text-amber-800 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-zinc-700">
                      Studio Consultant
                    </span>
                  </div>
                  <p className="font-serif-editorial italic text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    Margasera Photography • Pamekasan
                  </p>
                </div>
              </div>

              {/* Action Buttons: Reset & Close */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                  title="Mulai obrolan baru"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                  title="Tutup chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* SUBHEADER: BRAND MOTTO - HIGH CONTRAST IN BOTH LIGHT & DARK MODES */}
            <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs shrink-0">
              <span className="font-serif-editorial italic font-semibold text-amber-800 dark:text-amber-400">
                &ldquo;Moment Satu Hari Untuk Selamanya&rdquo;
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Online 24/7
              </span>
            </div>

            {/* FEED PESAN */}
            <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-zinc-50 dark:bg-zinc-950/70 scroll-smooth">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-zinc-900 border border-blue-200 dark:border-zinc-800 text-[#0066CC] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Camera className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className={`max-w-[86%] sm:max-w-[82%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-2xl p-3 sm:p-3.5 shadow-xs ${isUser
                            ? 'bg-[#0066CC] text-white rounded-tr-xs'
                            : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-tl-xs'
                          }`}
                      >
                        <FormattedMessage
                          text={m.text}
                          isUser={isUser}
                          onClose={() => setIsOpen(false)}
                        />
                        {!isUser && renderActionCards(m.text)}
                      </div>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 px-1 font-mono font-medium">
                        {m.timestamp}
                      </span>
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 rounded-xl bg-[#0066CC] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <span className="text-[11px] font-bold">K</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* QUICK SUGGESTION CHIPS KHAS MARGASERA */}
              {messages.length <= 2 && !loading && (
                <div className="pt-2 animate-in fade-in duration-300">
                  <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-2 px-1 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#0066CC]" />
                    Pilihan Tanya Cepat:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_CHIPS.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(chip.prompt)}
                        className="text-left p-2.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:border-[#0066CC] flex items-center justify-between group active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span className="text-sm shrink-0">{chip.icon}</span>
                          <span className="truncate text-zinc-900 dark:text-zinc-100 font-medium">{chip.label}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#0066CC] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* LOADER SHUTTER MENGETIK */}
              {loading && (
                <div className="flex gap-2.5 justify-start items-center">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-zinc-900 border border-blue-200 dark:border-zinc-800 text-[#0066CC] flex items-center justify-center shrink-0 shadow-2xs">
                    <Aperture className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-1.5">
                    <span className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold mr-1">
                      Sera sedang menyiapkan jawaban
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0066CC] animate-bounce" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#0066CC] animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#0066CC] animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              )}

              {/* ERROR BANNER */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-400 text-xs flex items-center justify-between gap-2">
                  <span>{errorMessage}</span>
                  <button
                    onClick={() => handleSend()}
                    className="underline font-bold cursor-pointer shrink-0"
                  >
                    Coba lagi
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* FOOTER & INPUT BAR */}
            <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shrink-0 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] sm:pb-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value.slice(0, 300))}
                    placeholder="Tanya paket wedding, wisuda, atau booking..."
                    disabled={loading}
                    className="w-full pl-3.5 pr-14 py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#0066CC]/50 disabled:opacity-50 transition-all font-sans"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono font-medium pointer-events-none">
                    {input.length}/300
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-xl bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-30 disabled:pointer-events-none text-white transition-all cursor-pointer shadow-md active:scale-95 shrink-0 flex items-center justify-center"
                  title="Kirim pesan"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 px-1 font-mono font-medium">
                <span>Margasera Studio AI</span>
                <span>Di tenagai Gemini</span>
              </div>
            </div>
          </div>
        )}

        {/* FLOATING TRIGGER BUTTON (Ketika Chat Tertutup) - SUPPORTS LIGHT & DARK MODES */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3 pl-3 pr-4 py-2.5 sm:py-3 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-full shadow-2xl hover:shadow-[#0066CC]/25 border border-zinc-200 dark:border-zinc-800 hover:border-[#0066CC] transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 group"
            aria-label="Buka Konsultasi Sera AI"
          >
            {/* Shutter Camera Aperture Icon */}
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-zinc-900 border border-blue-200 dark:border-zinc-700/80 flex items-center justify-center text-[#0066CC] shadow-inner group-hover:rotate-45 transition-transform duration-300">
                <Aperture className="w-4 h-4" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-950 animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-950" />
            </div>

            <div className="text-left">
              <span className="text-xs sm:text-sm font-bold tracking-tight block leading-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
                Sera AI
              </span>
              <span className="font-serif-editorial italic text-xs text-amber-700 dark:text-amber-400 block leading-tight font-semibold">
                Konsultan Studio
              </span>
            </div>
          </button>
        )}
      </div>
    </>
  );
}
