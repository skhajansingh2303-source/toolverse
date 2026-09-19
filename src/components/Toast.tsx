'use client';

import React, { useState, useEffect } from 'react';

interface ToastItem {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning';
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type?: 'info' | 'success' | 'warning' }>;
      if (!customEvent.detail?.message) return;

      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = {
        id,
        message: customEvent.detail.message,
        type: customEvent.detail.type || 'success',
      };

      setToasts((prev) => [...prev.slice(-3), newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2500);
    };

    window.addEventListener('toolsverse-toast', handleToast);
    return () => window.removeEventListener('toolsverse-toast', handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gray-950/95 dark:bg-slate-900/95 text-white text-xs font-semibold shadow-2xl border border-white/20 dark:border-slate-700 backdrop-blur-xl animate-fade-in-up"
        >
          <span className="text-emerald-400">✓</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
