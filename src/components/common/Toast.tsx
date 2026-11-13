import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 2200);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed toast-below-header left-1/2 -translate-x-1/2 z-50 w-auto max-w-[90vw] animate-in slide-in-from-top-3 duration-150">
      <div
        className={`rounded-full px-4 py-2.5 shadow-xl border backdrop-blur-md flex items-center space-x-2.5 text-xs sm:text-sm ${
          isSuccess
            ? 'bg-emerald-900/95 text-white border-emerald-700 shadow-emerald-950/20'
            : isError
            ? 'bg-rose-900/95 text-white border-rose-700 shadow-rose-950/20'
            : 'bg-slate-900/95 text-white border-slate-700 shadow-slate-950/20'
        }`}
      >
        <div className="shrink-0">
          {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {!isSuccess && !isError && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
        </div>

        <span className="font-bold whitespace-nowrap">{toast.title}</span>

        <button
          onClick={onClose}
          className="shrink-0 p-0.5 rounded-full opacity-70 hover:opacity-100 hover:bg-white/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
