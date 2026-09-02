'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, XCircle, Info, X, AlertTriangle, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void | Promise<void>;
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
  confirmModal: (options: ConfirmOptions) => void;
  confirmAsync: (title: string, message: string, options?: { confirmText?: string; cancelText?: string; variant?: 'danger' | 'primary' }) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const toast = {
    success: (message: string, title?: string) => addToast('success', message, title ?? 'Berhasil'),
    error: (message: string, title?: string) => addToast('error', message, title ?? 'Terjadi Kesalahan'),
    warning: (message: string, title?: string) => addToast('warning', message, title ?? 'Peringatan'),
    info: (message: string, title?: string) => addToast('info', message, title ?? 'Informasi'),
  };

  const confirmModal = (options: ConfirmOptions) => {
    setConfirmState(options);
  };

  const confirmAsync = (
    title: string,
    message: string,
    options?: { confirmText?: string; cancelText?: string; variant?: 'danger' | 'primary' }
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        title,
        message,
        confirmText: options?.confirmText,
        cancelText: options?.cancelText,
        variant: options?.variant,
        onConfirm: () => {
          resolve(true);
        },
      });
    });
  };

  return (
    <ToastContext.Provider value={{ toast, confirmModal, confirmAsync }}>
      {children}

      {/* FLOATING TOAST STACK (TOP-RIGHT CORNER) */}
      <div className="fixed top-20 right-5 sm:right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto p-4 rounded-2xl border shadow-xl flex items-start gap-3 backdrop-blur-xl transition-all ${
                item.type === 'success'
                  ? 'bg-emerald-950/90 dark:bg-emerald-950/90 border-emerald-800 text-emerald-100 shadow-emerald-950/30'
                  : item.type === 'error'
                  ? 'bg-rose-950/90 dark:bg-rose-950/90 border-rose-800 text-rose-100 shadow-rose-950/30'
                  : item.type === 'warning'
                  ? 'bg-amber-950/90 dark:bg-amber-950/90 border-amber-800 text-amber-100 shadow-amber-950/30'
                  : 'bg-zinc-900/90 dark:bg-zinc-900/90 border-zinc-700 text-zinc-100 shadow-black/40'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {item.type === 'error' && <XCircle className="w-5 h-5 text-rose-400" />}
                {item.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400" />}
                {item.type === 'info' && <Info className="w-5 h-5 text-[#0066CC]" />}
              </div>

              <div className="flex-1 flex flex-col gap-0.5 pr-2">
                {item.title && (
                  <strong className="text-xs font-semibold uppercase tracking-wider font-mono">
                    {item.title}
                  </strong>
                )}
                <p className="text-xs font-light leading-relaxed opacity-95">{item.message}</p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="opacity-70 hover:opacity-100 transition-opacity p-1 -mr-1 -mt-1 text-current"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* CONFIRMATION MODAL OVERLAY */}
      <AnimatePresence>
        {confirmState && (
          <div className="fixed inset-0 z-[10000] bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative text-zinc-900 dark:text-zinc-100"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 font-mono text-xs uppercase tracking-wider font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Konfirmasi Tindakan</span>
                </div>
                <h3 className="font-serif-editorial text-2xl text-zinc-900 dark:text-zinc-100 font-light leading-tight">
                  {confirmState.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
                  {confirmState.message}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isConfirming}
                  onClick={() => setConfirmState(null)}
                  className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-700 dark:text-zinc-300 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  {confirmState.cancelText || 'Batal'}
                </button>
                <button
                  type="button"
                  disabled={isConfirming}
                  onClick={async () => {
                    setIsConfirming(true);
                    try {
                      await confirmState.onConfirm();
                    } catch (err) {
                      console.error('Error in confirm action:', err);
                    } finally {
                      setIsConfirming(false);
                      setConfirmState(null);
                    }
                  }}
                  className={`flex-1 py-3 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                    confirmState.variant === 'danger'
                      ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40'
                      : 'bg-[#0066CC] hover:bg-[#0052A3] shadow-[0_0_15px_rgba(0,102,204,0.4)]'
                  }`}
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>{confirmState.confirmText || 'Ya, Lanjutkan'}</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
