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
import { GoogleSheetsSettingsModal } from './components/settings/GoogleSheetsSettingsModal';
import { Toast } from './components/common/Toast';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'calendario' | 'gerador' | 'metricas' | 'cadastros'>('calendario');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast, closeToast, themePalette } = useApp();

  // Impede qualquer pop-up automático do navegador pedindo para instalar PWA
  useEffect(() => {
    const preventInstallPrompt = (e: Event) => {
      e.preventDefault();
    };
    window.addEventListener('beforeinstallprompt', preventInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', preventInstallPrompt);
  }, []);

  // Sincroniza a cor do safe-area / barra de status com a mesma cor do menu do tema escolhido
  useEffect(() => {
    const hex = themePalette.headerHex || '#0f172a';
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
    <div className={`min-h-screen ${themePalette.appBg} flex flex-col text-slate-800 antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200`}>
      {/* Toast Flutuante de Notificação */}
      <Toast toast={toast} onClose={closeToast} />

      {/* Header Sticky (não desce ao puxar para atualizar, mas permite o teclado subir nos modais) */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab: any) => setCurrentTab(tab)}
        openSettings={() => setIsSettingsOpen(true)}
      />

      {/* Conteúdo Principal */}
      <main className="grow max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 pb-24 md:pb-6">
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

      {/* Navegação Inferior para Telas Mobile */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={(tab: any) => setCurrentTab(tab)}
        openSettings={() => setIsSettingsOpen(true)}
      />

      {/* Modais Globais */}
      <LoginModal />
      <GoogleSheetsSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
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
