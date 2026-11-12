import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  LogIn,
  LogOut,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openSettings: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab, openSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, canEdit, openLoginModal, logout } = useAuth();
  const { syncSheets, isSyncing, sheetsConfig } = useApp();

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      {/* =========================================================================
          BOTÃO FLUTUANTE DE MENU (FAB) - Lado Inferior Esquerdo
          Mesmo formato e altura do botão de Adicionar (+), livre da marca d'água
         ========================================================================= */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-slate-800 to-slate-900 text-white shadow-xl shadow-slate-900/35 flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-2 border-white/40 focus:outline-none fab-safe-bottom"
        title="Abrir Menu de Opções"
        aria-label="Abrir Menu de Opções"
      >
        {isOpen ? <X className="w-6 h-6 stroke-[2.5]" /> : <Menu className="w-6 h-6 stroke-[2.5]" />}
      </button>

      {/* =========================================================================
          POPUP / SHEET DE OPÇÕES DO MENU AO CLICAR NO BOTÃO
         ========================================================================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-24">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setIsOpen(false)}
          />

          {/* Card Flutuante do Menu */}
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 space-y-3 z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <img src="/favicon.svg" alt="QTS FT" className="w-7 h-7 rounded-lg shadow-xs" />
                <div>
                  <span className="font-bold text-sm text-slate-900 block leading-tight">Menu QTS FT</span>
                  <span className="text-[11px] text-slate-500">Escolha uma opção</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grade de Opções Principais */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleSelectTab('calendario')}
                className={`flex items-center space-x-2.5 p-3 rounded-2xl border text-left transition-all ${
                  currentTab === 'calendario'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-semibold'
                }`}
              >
                <Calendar className="w-5 h-5 shrink-0" />
                <span className="text-xs">Calendário</span>
              </button>

              <button
                onClick={() => handleSelectTab('gerador')}
                className={`flex items-center space-x-2.5 p-3 rounded-2xl border text-left transition-all ${
                  currentTab === 'gerador'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-semibold'
                }`}
              >
                <Layers className="w-5 h-5 shrink-0" />
                <span className="text-xs">Gerador</span>
              </button>

              <button
                onClick={() => handleSelectTab('metricas')}
                className={`flex items-center space-x-2.5 p-3 rounded-2xl border text-left transition-all ${
                  currentTab === 'metricas'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-semibold'
                }`}
              >
                <BarChart3 className="w-5 h-5 shrink-0" />
                <span className="text-xs">Métricas</span>
              </button>

              <button
                onClick={() => handleSelectTab('cadastros')}
                className={`flex items-center space-x-2.5 p-3 rounded-2xl border text-left transition-all ${
                  currentTab === 'cadastros'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-semibold'
                }`}
              >
                <Users className="w-5 h-5 shrink-0" />
                <span className="text-xs">Cadastros</span>
              </button>
            </div>

            {/* Ajustes & Sincronização */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsOpen(false);
                  openSettings();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-600" />
                  <span>Ajustes & Planilha Google</span>
                </span>
              </button>

              {sheetsConfig.scriptUrl && (
                <button
                  onClick={() => {
                    syncSheets();
                    setIsOpen(false);
                  }}
                  disabled={isSyncing}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-600' : 'text-emerald-600'}`} />
                    <span>Sincronizar Planilha Agora</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </button>
              )}

              {/* Status de Login / Gestor */}
              {canEdit ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[160px]">
                      {user.nome}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    openLoginModal();
                  }}
                  className="w-full flex items-center justify-center space-x-2 p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Entrar como Gestor</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
