import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { THEME_LIST } from '../../utils/themeConfig';
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
  Palette,
  Check
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openSettings: () => void;
  onOpenNewAula?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, openSettings }) => {
  const { canEdit, isAdmin, openLoginModal, logout } = useAuth();
  const { syncSheets, isSyncing, syncError, sheetsConfig, theme, themePalette, setTheme } = useApp();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const isDarkHeader = theme === 'ft-19bpm';

  return (
    <header className={`shrink-0 z-30 ${themePalette.headerBg} border-b ${themePalette.headerBorderTop} shadow-xs safe-top-header md:pt-0 transition-colors duration-200 select-none`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Title */}
            <div className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer" onClick={() => setCurrentTab('calendario')}>
              <img
                src="/favicon.svg"
                alt="QTM"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-md shadow-black/20 shrink-0"
              />
              <span className={`font-extrabold text-base sm:text-lg ${themePalette.headerText} tracking-tight`}>
                QTM
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className={`hidden md:flex items-center space-x-1.5 p-1 rounded-xl border ${themePalette.navContainerBg}`}>
              <button
                onClick={() => setCurrentTab('calendario')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'calendario'
                    ? themePalette.navActiveBg
                    : themePalette.navInactiveText
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Calendário</span>
              </button>

              <button
                onClick={() => setCurrentTab('gerador')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'gerador'
                    ? themePalette.navActiveBg
                    : themePalette.navInactiveText
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Gerador de Período</span>
              </button>

              <button
                onClick={() => setCurrentTab('metricas')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'metricas'
                    ? themePalette.navActiveBg
                    : themePalette.navInactiveText
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Métricas & Gráficos</span>
              </button>

              <button
                onClick={() => setCurrentTab('cadastros')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'cadastros'
                    ? themePalette.navActiveBg
                    : themePalette.navInactiveText
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Cadastros</span>
              </button>
            </nav>

            {/* Right Action Area */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {/* Botão Sincronizar (Apenas Ícone + Ponto Verde de Status, em Desktop e Mobile) */}
              {sheetsConfig.scriptUrl && (
                <button
                  onClick={() => syncSheets()}
                  disabled={isSyncing}
                  title={syncError ? `Erro: ${syncError}` : 'Sincronizar com a Planilha Google agora'}
                  className={`flex items-center space-x-1.5 px-2.5 py-2 text-xs rounded-xl border transition-colors shadow-2xs ${
                    isDarkHeader
                      ? 'border-white/15 bg-white/10 text-slate-200 hover:bg-white/20'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-400' : isDarkHeader ? 'text-slate-200' : 'text-slate-600'}`} />
                  {syncError ? (
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  )}
                </button>
              )}

              {/* Seletor Rápido de Tema (Exclusivo Admin) */}
              {isAdmin && (
                <div className="relative">
                  <button
                    onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                    title="Escolher Tema Visual (Exclusivo Admin)"
                    className={`p-2 rounded-xl transition-colors flex items-center gap-1 ${
                      isDarkHeader
                        ? 'text-amber-300 hover:bg-white/15 bg-white/5'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Palette className="w-5 h-5" />
                  </button>

                  {isThemeMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsThemeMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                          <div>
                            <span className="text-xs font-extrabold text-slate-900 block">Tema da Unidade (Admin)</span>
                            <span className="text-[10px] text-slate-500">Cores inspiradas no 19º BPM/I • FT</span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          {THEME_LIST.map(t => {
                            const active = theme === t.id;
                            return (
                              <button
                                key={t.id}
                                onClick={() => {
                                  setTheme(t.id);
                                  setIsThemeMenuOpen(false);
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all ${
                                  active
                                    ? 'border-blue-600 bg-blue-50/70 shadow-2xs'
                                    : 'border-slate-200/80 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center space-x-2.5">
                                  <div className="flex -space-x-1 shrink-0">
                                    {t.previewColors.map((hex, i) => (
                                      <span
                                        key={i}
                                        className="w-4 h-4 rounded-full border border-white shadow-2xs"
                                        style={{ backgroundColor: hex }}
                                      />
                                    ))}
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                                      {t.name}
                                    </span>
                                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                                      {t.subtitle}
                                    </span>
                                  </div>
                                </div>
                                {active && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Settings button (Somente Admin no Desktop) */}
              {isAdmin && (
                <button
                  onClick={openSettings}
                  title="Configurações & Planilha Google (Exclusivo Admin)"
                  className={`hidden sm:block p-2 rounded-xl transition-colors ${
                    isDarkHeader
                      ? 'text-slate-300 hover:text-white hover:bg-white/15'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}

              {/* Auth / Login Status Pill (Mobile & Desktop) */}
              <div className="flex items-center">
                {canEdit ? (
                  <div className="flex items-center space-x-1.5 sm:space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold hidden sm:inline">Gestor Ativo</span>
                    <button
                      onClick={logout}
                      title="Sair do modo de edição"
                      className="text-emerald-700 hover:text-emerald-950 p-0.5 rounded hover:bg-emerald-200/50 flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span className="sm:hidden text-[11px] font-bold">Sair</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={openLoginModal}
                    className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Entrar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
    </header>
  );
};
