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

  // Sincroniza a cor da barra de status / safe-area do celular com a cor exata do cabeçalho (sensação de infinito)
  useEffect(() => {
    const hex = themePalette.headerHex || '#0f172a';
    document.documentElement.style.backgroundColor = hex;
    document.body.style.backgroundColor = hex;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', hex);
    }
  }, [themePalette.headerHex]);

  // Garante que após fechar o teclado no iOS (ex: após realizar login), a tela nunca fique deslocada para cima no safe area
  useEffect(() => {
    const resetViewportScroll = () => {
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 50);
    };
    window.addEventListener('focusout', resetViewportScroll);
    window.visualViewport?.addEventListener('resize', resetViewportScroll);
    return () => {
      window.removeEventListener('focusout', resetViewportScroll);
      window.visualViewport?.removeEventListener('resize', resetViewportScroll);
    };
  }, []);

  return (
    <div className={`h-full w-full overflow-hidden ${themePalette.appBg} flex flex-col text-slate-800 antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200`}>
      {/* Toast Flutuante de Notificação */}
      <Toast toast={toast} onClose={closeToast} />

      {/* Header Congelado no Topo (não se move no pull-to-refresh) */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab: any) => setCurrentTab(tab)}
        openSettings={() => setIsSettingsOpen(true)}
      />

      {/* Conteúdo Principal com Rolagem Independente */}
      <main className="grow overflow-y-auto overscroll-y-none w-full">
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 pb-24 md:pb-6">
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
        </div>
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
