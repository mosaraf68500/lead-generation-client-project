'use client';

/**
 * Tiny toast system. The lib intentionally has no third-party deps — toasts
 * are added with `push({ ... })`, auto-dismiss after `duration`, and animate
 * via a fadeIn keyframe in globals.css.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '@/utils';

export type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  push: (toast: Omit<Toast, 'id'> & { duration?: number }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantClasses: Record<ToastVariant, string> = {
  success: 'border-accent-500/30 bg-white text-ink-900',
  error: 'border-red-300 bg-white text-red-700',
  info: 'border-brand-200 bg-white text-ink-900',
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push: ToastContextValue['push'] = useCallback((toast) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, ...toast }]);
    const duration = toast.duration ?? 4000;
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto w-full max-w-md animate-fadeIn rounded-2xl border px-4 py-3 shadow-card',
              variantClasses[toast.variant],
            )}
          >
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.description && (
              <p className="mt-1 text-sm text-ink-500">{toast.description}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
};
