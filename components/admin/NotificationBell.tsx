'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Calendar,
  MessageSquareQuote,
  Camera,
  Trash2,
  CheckCheck,
  BellOff,
  Clock,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { createPublicClient } from '@/lib/supabase/public';
import {
  requestNotificationPermission,
  getFirebaseMessaging,
  onMessage,
} from '@/lib/firebase/client';
import { useToast } from '@/components/ui/toast-context';

interface Notification {
  id: string;
  type: 'booking' | 'testimonial' | 'gallery_selection';
  title: string;
  body: string;
  booking_id: string | null;
  url: string | null;
  is_read: boolean;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (isNaN(diff) || diff < 0) return 'Baru saja';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} mnt lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} hr lalu`;
  return `${Math.floor(days / 30)} bln lalu`;
}

function getNotificationVisual(type: Notification['type']) {
  switch (type) {
    case 'booking':
      return {
        icon: <Calendar className="w-4 h-4 text-[#0066CC] dark:text-blue-400" />,
        bg: 'bg-blue-50 dark:bg-blue-950/40 border border-blue-100/80 dark:border-blue-900/40',
        badge: 'Booking',
      };
    case 'testimonial':
      return {
        icon: <MessageSquareQuote className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        bg: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-100/80 dark:border-amber-900/40',
        badge: 'Testimoni',
      };
    case 'gallery_selection':
      return {
        icon: <Camera className="w-4 h-4 text-violet-600 dark:text-violet-400" />,
        bg: 'bg-violet-50 dark:bg-violet-950/40 border border-violet-100/80 dark:border-violet-900/40',
        badge: 'Pilih Foto',
      };
    default:
      return {
        icon: <Bell className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />,
        bg: 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700',
        badge: 'Sistem',
      };
  }
}

export function NotificationBell() {
  const router = useRouter();
  const { confirmModal } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fcmTokenRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Baca preferensi suara dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem('margasera_sound_enabled');
    if (saved !== null) {
      setSoundEnabled(saved === 'true');
    }
  }, []);

  // Mainkan audio notifikasi (file: /sounds/notification.mp3)
  const playNotificationSound = useCallback((force = false) => {
    if (typeof window === 'undefined') return;
    const isMuted = localStorage.getItem('margasera_sound_enabled') === 'false';
    if (!force && isMuted) return;

    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.85;
      audio.play().catch(() => {
        // Abaikan jika terbentur autoplay policy browser atau file belum ditaruh
      });
    } catch {
      // silent
    }
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('margasera_sound_enabled', String(next));
    if (next) {
      playNotificationSound(true);
    }
  };

  // Fetch notifikasi dari API
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch {
      // silent
    }
  }, []);

  // Setup FCM permission + token saat mount
  useEffect(() => {
    (async () => {
      const token = await requestNotificationPermission();
      if (!token || fcmTokenRef.current === token) return;
      fcmTokenRef.current = token;

      await fetch('/api/admin/fcm-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      // Handle foreground push (tab aktif)
      const messaging = getFirebaseMessaging();
      if (messaging) {
        onMessage(messaging, () => {
          playNotificationSound();
          fetchNotifications();
        });
      }
    })();
  }, [fetchNotifications, playNotificationSound]);

  // Realtime: Supabase subscription + polling fallback setiap 15 detik
  useEffect(() => {
    fetchNotifications();

    pollIntervalRef.current = setInterval(fetchNotifications, 15000);

    let channel: ReturnType<typeof supabase.channel> | null = null;
    const supabase = createPublicClient();
    try {
      channel = supabase
        .channel('admin-notifications-rt')
        .on(
          'postgres_changes' as any,
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          () => {
            playNotificationSound();
            fetchNotifications();
          }
        )
        .subscribe();
    } catch {
      // Realtime fallback polling tetap jalan
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchNotifications, playNotificationSound]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Refresh saat dropdown dibuka
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch {
      // silent
    }
  };

  const markAllRead = async () => {
    setLoading(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOne = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch('/api/admin/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch {
      // silent
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    confirmModal({
      title: 'Hapus Semua Notifikasi?',
      message: 'Apakah Anda yakin ingin menghapus seluruh riwayat notifikasi? Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Hapus Semua',
      variant: 'danger',
      onConfirm: async () => {
        setLoading(true);
        const prevList = [...notifications];
        setNotifications([]);
        try {
          const res = await fetch('/api/admin/notifications', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deleteAll: true }),
          });
          if (!res.ok) setNotifications(prevList);
        } catch {
          setNotifications(prevList);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleItemClick = async (notif: Notification) => {
    if (!notif.is_read) {
      markAsRead(notif.id);
    }
    setOpen(false);

    let targetUrl = notif.url;

    // Cerdas tangani notifikasi legacy yang belum punya parameter pencarian atau deep link
    if (!targetUrl || targetUrl === '/admin/dashboard/bookings') {
      if (notif.type === 'booking' && notif.booking_id) {
        targetUrl = `/admin/dashboard/bookings?search=${encodeURIComponent(notif.booking_id)}&openDetail=true`;
      } else if (notif.type === 'gallery_selection' && notif.booking_id) {
        targetUrl = `/admin/dashboard/bookings?search=${encodeURIComponent(notif.booking_id)}&openGallery=true`;
      } else if (notif.type === 'testimonial') {
        targetUrl = '/admin/dashboard/testimonials';
      } else {
        targetUrl = '/admin/dashboard/bookings';
      }
    }

    if (targetUrl) {
      router.push(targetUrl);
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {/* Bell Trigger Button */}
      <button
        id="admin-notification-bell"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ''}`}
        aria-expanded={open}
        className={`relative p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border ${open
            ? 'bg-blue-50 text-[#0066CC] border-blue-200 dark:bg-[#0066CC]/20 dark:text-blue-400 dark:border-[#0066CC]/40 shadow-xs'
            : 'text-zinc-600 dark:text-zinc-400 border-transparent hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
      >
        <Bell className="w-5 h-5 transition-transform" />

        {/* Badge Unread Count */}
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none ring-2 ring-white dark:ring-zinc-950 shadow-sm animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[9990] bg-black/40 backdrop-blur-xs sm:hidden animate-in fade-in duration-150"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Dropdown Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Panel notifikasi"
          className="fixed left-3 right-3 top-[4.25rem] sm:left-auto sm:right-0 sm:top-[calc(100%+8px)] sm:w-96 max-h-[calc(100dvh-5.5rem)] sm:max-h-[520px] bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-[9999] animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-zinc-50/80 dark:bg-zinc-900/60 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0066CC]/10 text-[#0066CC] dark:bg-[#0066CC]/20 dark:text-blue-400 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">
                Notifikasi
              </span>
              {unreadCount > 0 && (
                <span className="bg-[#0066CC] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none shadow-xs">
                  {unreadCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleSound}
                title={soundEnabled ? 'Suara notifikasi aktif (klik untuk membisukan)' : 'Suara notifikasi dibisukan (klik untuk mengaktifkan)'}
                className={`p-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer active:scale-95 ${
                  soundEnabled
                    ? 'text-zinc-600 hover:text-[#0066CC] hover:bg-blue-50 dark:text-zinc-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/50'
                    : 'text-rose-500 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  disabled={loading}
                  title="Tandai semua dibaca"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-[#0066CC] hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50 disabled:opacity-50 cursor-pointer transition-colors active:scale-95"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tandai dibaca</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={loading}
                  title="Hapus semua notifikasi"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/50 disabled:opacity-50 cursor-pointer transition-colors active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hapus semua</span>
                </button>
              )}
            </div>
          </div>

          {/* Sound Controls Bar */}
          <div className="px-4 py-1.5 bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <span className={`w-1.5 h-1.5 rounded-full ${soundEnabled ? 'bg-emerald-500 shadow-xs' : 'bg-zinc-400'}`} />
              Suara notifikasi: <strong className="font-medium text-zinc-700 dark:text-zinc-300">{soundEnabled ? 'Aktif' : 'Mati'}</strong>
            </span>
            <button
              type="button"
              onClick={() => playNotificationSound(true)}
              className="text-[#0066CC] dark:text-blue-400 hover:underline font-medium cursor-pointer"
            >
              Uji Suara
            </button>
          </div>

          {/* List Content */}
          <div className="overflow-y-auto overscroll-contain flex-1 divide-y divide-zinc-100 dark:divide-zinc-900">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-3 shadow-inner">
                  <BellOff className="w-6 h-6" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Belum ada notifikasi
                </p>
                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-[240px] leading-relaxed">
                  Pesanan baru, testimoni, dan pemilihan foto galeri akan muncul secara realtime di sini.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const visual = getNotificationVisual(notif.type);

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleItemClick(notif);
                      }
                    }}
                    className={`group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer text-left ${notif.is_read
                        ? 'bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                        : 'bg-blue-50/50 hover:bg-blue-50/80 dark:bg-[#0066CC]/10 dark:hover:bg-[#0066CC]/15'
                      }`}
                  >
                    {/* Icon Type Container */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${visual.bg}`}
                    >
                      {visual.icon}
                    </div>

                    {/* Notification Info */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`text-xs leading-snug truncate ${notif.is_read
                              ? 'font-medium text-zinc-700 dark:text-zinc-300'
                              : 'font-semibold text-zinc-900 dark:text-zinc-100'
                            }`}
                        >
                          {notif.title}
                        </span>
                        {!notif.is_read && (
                          <span
                            title="Belum dibaca"
                            className="w-2 h-2 rounded-full bg-[#0066CC] shrink-0"
                          />
                        )}
                      </div>

                      <p className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {notif.body}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                          <Clock className="w-3 h-3" />
                          {timeAgo(notif.created_at)}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded font-medium">
                          {visual.badge}
                        </span>
                      </div>
                    </div>

                    {/* Delete Item Button */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteOne(e, notif.id)}
                      title="Hapus notifikasi"
                      aria-label="Hapus notifikasi"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950/50 transition-colors opacity-80 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 shrink-0 cursor-pointer active:scale-90"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
