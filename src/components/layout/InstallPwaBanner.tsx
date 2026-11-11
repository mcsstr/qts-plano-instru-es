import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

export const InstallPwaBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Exibe apenas se não tiver sido fechado antes nesta sessão
      const dismissed = sessionStorage.getItem('qts_pwa_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('qts_pwa_dismissed', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 text-xs flex items-center justify-between shadow-xs z-20">
      <div className="flex items-center space-x-2.5">
        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <Smartphone className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-bold">Instale o QTS no seu celular</span>
          <p className="text-[11px] text-blue-100 hidden sm:block">
            Acesse rapidamente como um aplicativo direto da tela inicial.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <button
          onClick={handleInstall}
          className="flex items-center space-x-1 bg-white text-blue-700 font-bold px-3 py-1 rounded-lg text-xs shadow-xs hover:bg-blue-50 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar</span>
        </button>

        <button
          onClick={handleDismiss}
          className="p-1 text-white/80 hover:text-white rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

