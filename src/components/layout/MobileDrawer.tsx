import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  X,
  Calendar,
  Layers,
  BarChart3,
  Users,
  Settings,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openSettings: () => void;
  onOpenNewAula: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  setCurrentTab,
  openSettings
}) => {
  const { user, canEdit, isAdmin, openLoginModal, logout } = useAuth();
  const {
    syncSheets,
    isSyncing,
    sheetsConfig
  } = useApp();

  if (!isOpen) return null;

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250 overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Menu Principal</h3>
              <p className="text-[11px] text-blue-100">QTS FT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-4 overflow-y-auto space-y-5 grow text-sm">
          {/* Card de Usuário / Gestor */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            {canEdit ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-700 block">Gestor Logado</span>
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[140px] block">
                      {user.nome}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium flex items-center gap-1"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Modo Consulta Pública</span>
                  <span className="text-[11px] text-slate-500">Apenas visualização</span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    openLoginModal();
                  }}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Entrar</span>
                </button>
              </div>
            )}
          </div>

          {/* Navegação Principal */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
              Navegação
            </span>
            <div className="space-y-1">
              <button
                onClick={() => handleNavigate('calendario')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium transition-colors text-left ${
                  currentTab === 'calendario'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Calendário de Aulas</span>
              </button>

              <button
                onClick={() => handleNavigate('gerador')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium transition-colors text-left ${
                  currentTab === 'gerador'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Gerador de Período & Rodízio</span>
              </button>

              <button
                onClick={() => handleNavigate('metricas')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium transition-colors text-left ${
                  currentTab === 'metricas'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Métricas & Gráficos</span>
              </button>

              <button
                onClick={() => handleNavigate('cadastros')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium transition-colors text-left ${
                  currentTab === 'cadastros'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4 text-purple-600" />
                <span>Cadastros (Turmas, Matérias, Instrutores)</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    onClose();
                    openSettings();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-100 transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Ajustes & Banco de Dados (Admin)</span>
                </button>
              )}
            </div>
          </div>

          {/* Sincronização Manual (se configurada) */}
          {canEdit && sheetsConfig.scriptUrl && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                Banco de Dados
              </span>
              <button
                onClick={() => {
                  syncSheets();
                }}
                disabled={isSyncing}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                <span className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                  <span>Sincronizar Planilha Google</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-400 shrink-0">
          QTS FT • PWA v2.0
        </div>
      </div>
    </div>
  );
};
