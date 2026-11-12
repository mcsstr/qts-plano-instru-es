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
  const { toast, closeToast } = useApp();

  // Impede qualquer pop-up automático do navegador pedindo para instalar PWA
  useEffect(() => {
    const preventInstallPrompt = (e: Event) => {
      e.preventDefault();
    };
    window.addEventListener('beforeinstallprompt', preventInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', preventInstallPrompt);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Toast Flutuante de Notificação */}
      <Toast toast={toast} onClose={closeToast} />

      {/* Header Fixo / Sticky */}
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
