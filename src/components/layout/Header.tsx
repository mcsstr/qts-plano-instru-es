import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { THEME_LIST } from '../../utils/themeConfig';
import { CURRENT_APP_VERSION, CURRENT_APP_DATE, APP_VERSION_HISTORY } from '../../utils/appVersion';
import {
  Calendar,
  Layers,
  BarChart3,
  Users,
  LogIn,
  LogOut,
  ShieldCheck,
  Palette,
  Check,
  Menu,
  X,
  Sparkles,
  History,
  ChevronRight,
  ChevronDown,
  Settings
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const { user, canEdit, isAdmin, openLoginModal, logout } = useAuth();
  const { theme, themePalette, setTheme } = useApp();

  // Estados unificados para o Menu de Configurações (Engrenagem no Desktop / Sanduíche no Mobile)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeSubmenuOpen, setIsThemeSubmenuOpen] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const isDarkHeader = theme !== 'clean-slate';
  const currentThemeObj = THEME_LIST.find(t => t.id === theme) || THEME_LIST[0];

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
    setIsThemeSubmenuOpen(false);
    setShowVersionHistory(false);
  };

  const renderSettingsDropdown = () => (
    <>
      {/* Backdrop invisível para fechar ao clicar fora */}
      <div
        className="fixed inset-0 z-40"
        onClick={handleCloseMenu}
      />

      {/* Painel Dropdown (Engrenagem Desktop / Sanduíche Mobile) */}
      <div className="absolute right-0 mt-2.5 w-80 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-[0_12px_36px_-4px_rgba(15,23,42,0.18)] border border-slate-200/90 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
        {/* 1. Usuário Logado / Login e Botão Sair */}
        <div className="p-3.5 bg-slate-50/90 border-b border-slate-200/80">
          {canEdit ? (
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {user.nome}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-md leading-none">
                      {isAdmin ? 'Administrador' : 'Gestor'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  handleCloseMenu();
                }}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition-all shrink-0 shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Modo Consulta</span>
                <span className="text-[11px] text-slate-500">Faça login para gerenciar o Quadro</span>
              </div>
              <button
                onClick={() => {
                  handleCloseMenu();
                  openLoginModal();
                }}
                className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-colors shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-2.5 space-y-2 max-h-[72vh] overflow-y-auto">
          {/* 2. Sub-menu Tema (Exclusivo Admin) */}
          {isAdmin && (
            <div className="rounded-xl border border-slate-200/80 overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setIsThemeSubmenuOpen(!isThemeSubmenuOpen)}
                className="w-full flex items-center justify-between p-2.5 bg-white hover:bg-slate-50/80 text-left transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center justify-center shrink-0">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      Tema do Sistema
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                      {currentThemeObj.name}
                    </span>
                  </div>
                </div>
                {isThemeSubmenuOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {isThemeSubmenuOpen && (
                <div className="p-2 bg-slate-50/80 border-t border-slate-200/70 space-y-1.5 animate-in fade-in duration-150">
                  {THEME_LIST.map(t => {
                    const active = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTheme(t.id);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all ${
                          active
                            ? 'border-blue-600 bg-blue-50/80 shadow-2xs'
                            : 'border-slate-200/80 bg-white hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className="flex -space-x-1 shrink-0">
                            {t.previewColors.map((hex, i) => (
                              <span
                                key={i}
                                className="w-4 h-4 rounded-full border border-white shadow-2xs"
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 block leading-tight truncate">
                              {t.name}
                            </span>
                            <span className="text-[10px] text-slate-500 block leading-tight mt-0.5 truncate">
                              {t.subtitle}
                            </span>
                          </div>
                        </div>
                        {active && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. Versão do App + Histórico de Atualizações */}
          <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    Versão {CURRENT_APP_VERSION}
                  </span>
                  <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                    Atualizado em {CURRENT_APP_DATE}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowVersionHistory(!showVersionHistory)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <History className="w-3.5 h-3.5" />
                <span>{showVersionHistory ? 'Ocultar' : 'Notas'}</span>
              </button>
            </div>

            {showVersionHistory && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 space-y-2.5 max-h-44 overflow-y-auto pr-1">
                {APP_VERSION_HISTORY.map(entry => (
                  <div key={entry.version} className="text-[11px]">
                    <div className="flex items-center justify-between font-bold text-slate-800 mb-0.5">
                      <span>{entry.version}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{entry.date}</span>
                    </div>
                    <ul className="list-disc list-inside text-[10px] text-slate-600 space-y-0.5">
                      {entry.highlights.map((h, idx) => (
                        <li key={idx} className="leading-snug">{h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <header
      onTouchMove={e => e.preventDefault()}
      style={{
        backgroundColor: themePalette.headerHex
      }}
      className={`sticky top-0 z-30 ${themePalette.headerBg} ${themePalette.headerBorderTop} safe-top-header md:pt-0 transition-colors duration-200 select-none touch-none`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11 sm:h-15">
          {/* Logo & Title */}
          <div
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group min-w-0"
            onClick={() => setCurrentTab('calendario')}
          >
            <img
              src="/favicon.svg"
              alt="Quadro de Instruções FT"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0 transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col min-w-0">
              <span className={`font-extrabold text-sm sm:text-base ${themePalette.headerText} tracking-tight leading-tight truncate`}>
                Quadro de Instruções FT
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center space-x-1 p-1 rounded-xl border ${themePalette.navContainerBg}`}>
            <button
              onClick={() => setCurrentTab('calendario')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'calendario'
                  ? themePalette.navActiveBg
                  : themePalette.navInactiveText
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendário</span>
            </button>

            <button
              onClick={() => setCurrentTab('gerador')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'gerador'
                  ? themePalette.navActiveBg
                  : themePalette.navInactiveText
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Gerador de Período</span>
            </button>

            <button
              onClick={() => setCurrentTab('metricas')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'metricas'
                  ? themePalette.navActiveBg
                  : themePalette.navInactiveText
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Métricas & Gráficos</span>
            </button>

            <button
              onClick={() => setCurrentTab('cadastros')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'cadastros'
                  ? themePalette.navActiveBg
                  : themePalette.navInactiveText
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Cadastros</span>
            </button>
          </nav>

          {/* =================================================================
              ÁREA DIREITA:
              - Desktop: Botão Engrenagem (Settings) contendo Login/Usuário, Sair, Tema e Versão
              - Mobile: Menu Sanduíche (Menu) contendo Login/Usuário, Sair, Tema e Versão
             ================================================================= */}
          <div className="flex items-center">
            <div className="relative">
              {/* Botão Engrenagem (Desktop) / Sanduíche (Mobile) */}
              <button
                onClick={() => {
                  if (isMenuOpen) {
                    handleCloseMenu();
                  } else {
                    setIsMenuOpen(true);
                  }
                }}
                title="Configurações, Conta, Tema e Versão"
                className={`relative p-2 rounded-xl border transition-all flex items-center justify-center ${
                  isDarkHeader
                    ? 'border-[#2d3a52] bg-[#162032] text-white hover:bg-[#1e293b]'
                    : 'border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                {/* Ícone no Desktop: Engrenagem */}
                <Settings
                  className={`hidden md:block w-4 h-4 transition-transform duration-300 ${
                    isMenuOpen ? 'rotate-90' : ''
                  }`}
                />
                {/* Ícone no Mobile: Sanduíche / X */}
                <span className="md:hidden">
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </span>

                {canEdit && (
                  <span
                    className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 ${
                      isDarkHeader ? 'border-slate-900' : 'border-white'
                    }`}
                    title={`Conectado como ${user.nome}`}
                  />
                )}
              </button>

              {isMenuOpen && renderSettingsDropdown()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
