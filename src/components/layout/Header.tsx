import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Layers,
  BarChart3,
  Users,
  Settings,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, openSettings }) => {
  const { user, canEdit, openLoginModal, logout } = useAuth();
  const { syncSheets, isSyncing, syncError, sheetsConfig } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('calendario')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">QTS Inteligente</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-700">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Plano de Aulas, Rodízio e Instrutores</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setCurrentTab('calendario')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'calendario'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Calendário</span>
            </button>

            <button
              onClick={() => setCurrentTab('gerador')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'gerador'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Gerador de Período</span>
            </button>

            <button
              onClick={() => setCurrentTab('metricas')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'metricas'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Métricas & Gráficos</span>
            </button>

            <button
              onClick={() => setCurrentTab('cadastros')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'cadastros'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Cadastros</span>
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center space-x-2">
            {/* Google Sheets Sync Pill */}
            {sheetsConfig.scriptUrl && (
              <button
                onClick={syncSheets}
                disabled={isSyncing}
                title={syncError ? `Erro: ${syncError}` : 'Sincronizar com Planilha Google'}
                className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                <span className="hidden lg:inline">Planilha</span>
                {syncError ? (
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                )}
              </button>
            )}

            {/* Settings button */}
            <button
              onClick={openSettings}
              title="Configurações & Planilha Google"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Auth / Login Status Pill */}
            {canEdit ? (
              <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="hidden md:inline font-semibold">Gestor Ativo</span>
                <button
                  onClick={logout}
                  title="Sair do modo de edição"
                  className="ml-1 text-emerald-700 hover:text-emerald-950 p-0.5 rounded hover:bg-emerald-200/50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar (Gestor)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

