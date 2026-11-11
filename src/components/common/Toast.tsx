import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, RefreshCw } from 'lucide-react';

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
    }, toast.duration || 4500);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-in slide-in-from-top-4 duration-200">
      <div
        className={`rounded-2xl p-4 shadow-xl border backdrop-blur-md flex items-start space-x-3 text-sm ${
          isSuccess
            ? 'bg-emerald-900/95 text-white border-emerald-700 shadow-emerald-950/20'
            : isError
            ? 'bg-rose-900/95 text-white border-rose-700 shadow-rose-950/20'
            : 'bg-slate-900/95 text-white border-slate-700 shadow-slate-950/20'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
          {!isSuccess && !isError && <RefreshCw className="w-5 h-5 text-blue-400" />}
        </div>

        <div className="grow">
          <h4 className="font-bold leading-tight">{toast.title}</h4>
          {toast.message && (
            <p className="text-xs opacity-90 mt-1 leading-relaxed">{toast.message}</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="shrink-0 p-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
