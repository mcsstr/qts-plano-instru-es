import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { LoginModal } from './components/layout/LoginModal';
import { CalendarView } from './components/calendar/CalendarView';
import { BatchGeneratorView } from './components/generator/BatchGeneratorView';
import { MetricsDashboard } from './components/metrics/MetricsDashboard';
import { RegistersManager } from './components/registers/RegistersManager';
import { Toast } from './components/common/Toast';
import { CURRENT_APP_VERSION } from './utils/appVersion';

const VERSION_STORAGE_KEY = 'qtm_enforced_app_version';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'calendario' | 'gerador' | 'metricas' | 'cadastros'>('calendario');
  const { toast, closeToast, themePalette } = useApp();

  // Impede qualquer pop-up automático do navegador pedindo para instalar PWA
  useEffect(() => {
    const preventInstallPrompt = (e: Event) => {
      e.preventDefault();
    };
    window.addEventListener('beforeinstallprompt', preventInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', preventInstallPrompt);
  }, []);

  // Força atualização automática no site e no PWA sempre que uma nova versão for publicada
  useEffect(() => {
    let isReloading = false;

    const forceClearCacheAndReload = async (targetVersion: string) => {
      if (isReloading) return;
      isReloading = true;
      try {
        localStorage.setItem(VERSION_STORAGE_KEY, targetVersion);
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(
            registrations.map(async reg => {
              if (reg.waiting) {
                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
              }
              await reg.update().catch(() => {});
            })
          );
        }
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
      } catch {
        // ignore
      }
      window.location.reload();
    };

    // Verifica se a versão salva localmente mudou
    try {
      const savedVersion = localStorage.getItem(VERSION_STORAGE_KEY);
      if (savedVersion && savedVersion !== CURRENT_APP_VERSION) {
        localStorage.setItem(VERSION_STORAGE_KEY, CURRENT_APP_VERSION);
        if ('caches' in window) {
          caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {});
        }
      } else if (!savedVersion) {
        localStorage.setItem(VERSION_STORAGE_KEY, CURRENT_APP_VERSION);
      }
    } catch {
      // ignore
    }

    // Listener de troca de Service Worker ativo (autoUpdate)
    const handleControllerChange = () => {
      if (!isReloading) {
        isReloading = true;
        window.location.reload();
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    }

    // Consulta /version.json sem cache para detectar nova versão no servidor imediatamente
    const checkServerVersion = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          registrations.forEach(reg => {
            if (reg.waiting) {
              reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            } else {
              reg.update().catch(() => {});
            }
          });
        }

        const res = await fetch(`/version.json?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache'
          }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.version && data.version !== CURRENT_APP_VERSION) {
          await forceClearCacheAndReload(data.version);
        }
      } catch {
        // ignore offline errors
      }
    };

    checkServerVersion();

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        checkServerVersion();
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    const interval = setInterval(checkServerVersion, 45000);

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      }
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      clearInterval(interval);
    };
  }, []);

  // Sincroniza a cor do safe-area / barra de status com a mesma cor do menu do tema escolhido
  useEffect(() => {
    const hex = themePalette.headerHex || '#090d16';
    document.documentElement.style.backgroundColor = hex;
    document.body.style.backgroundColor = hex;
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', hex);
  }, [themePalette.headerHex]);

  // Monitora a abertura do teclado virtual no celular para que os modais acompanhem o espaço visível restante
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleViewportChange = () => {
      const isKeyboardOpen = vv.height < window.innerHeight * 0.82;
      document.documentElement.style.setProperty('--vvh', `${vv.height}px`);
      document.documentElement.style.setProperty('--vv-top', `${vv.offsetTop}px`);
      document.body.classList.toggle('keyboard-open', isKeyboardOpen);

      if (isKeyboardOpen && document.activeElement instanceof HTMLElement) {
        const tag = document.activeElement.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
          setTimeout(() => {
            (document.activeElement as HTMLElement)?.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }, 100);
        }
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        setTimeout(() => {
          handleViewportChange();
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 250);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        handleViewportChange();
      }, 150);
    };

    vv.addEventListener('resize', handleViewportChange);
    vv.addEventListener('scroll', handleViewportChange);
    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      vv.removeEventListener('resize', handleViewportChange);
      vv.removeEventListener('scroll', handleViewportChange);
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return (
    <div className={`h-dvh max-h-dvh overflow-hidden ${themePalette.appBg} flex flex-col text-slate-800 antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200`}>
      {/* Toast Compacto de Status */}
      <Toast toast={toast} onClose={closeToast} />

      {/* Header Fixo no Topo do App Shell (fora do container de rolagem para evitar esfumaçado do iOS) */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab: any) => setCurrentTab(tab)}
      />

      {/* Container de Rolagem Dedicado */}
      <div id="app-scroll-container" className="grow w-full overflow-y-auto overscroll-y-contain">
        <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 pb-24 md:pb-4">
          {currentTab === 'calendario' && (
            <CalendarView onGoToGenerator={() => setCurrentTab('gerador')} />
          )}

          {currentTab === 'gerador' && (
            <BatchGeneratorView onSuccess={() => setCurrentTab('calendario')} />
          )}

          {currentTab === 'metricas' && (
            <MetricsDashboard />
          )}

          {currentTab === 'cadastros' && (
            <RegistersManager />
          )}
        </main>
      </div>

      {/* Navegação Inferior para Telas Mobile */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={(tab: any) => setCurrentTab(tab)}
      />

      {/* Modal de Login */}
      <LoginModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AppProvider>
  );
}
