'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/theme-provider';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-full bg-zinc-900/60 border border-zinc-800 flex items-center justify-center ${className}`} />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
      className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center relative overflow-hidden cursor-pointer group ${
        isDark
          ? 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-amber-300 hover:text-amber-200 shadow-md'
          : 'bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-[#0066CC] hover:text-[#0052A3] shadow-sm'
      } ${className}`}
    >
      <motion.div
        key={theme}
        initial={{ y: -20, opacity: 0, rotate: -90 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        exit={{ y: 20, opacity: 0, rotate: 90 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        ) : (
          <Moon className="w-4 h-4 text-[#0066CC] group-hover:scale-110 transition-transform" />
        )}
      </motion.div>
    </button>
  );
}
