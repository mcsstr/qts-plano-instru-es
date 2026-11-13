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
  Settings,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Palette,
  Check,
  Menu,
  X,
  Sparkles,
  History
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openSettings: () => void;
  onOpenNewAula?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, openSettings }) => {
  const { user, canEdit, isAdmin, openLoginModal, logout } = useAuth();
  const { syncSheets, isSyncing, syncError, sheetsConfig, theme, themePalette, setTheme } = useApp();
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const isDarkHeader = theme !== 'clean-slate';

  return (
    <header
      onTouchMove={e => e.preventDefault()}
      style={{
        backgroundColor: themePalette.headerHex,
        boxShadow: `0 -120px 0 0 ${themePalette.headerHex}`
      }}
      className={`sticky top-0 z-30 ${themePalette.headerBg} ${themePalette.headerBorderTop} safe-top-header md:pt-0 transition-colors duration-200 select-none touch-none`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Title */}
          <div
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer"
            onClick={() => setCurrentTab('calendario')}
          >
            <img
              src="/favicon.svg"
              alt="QTM"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-md shadow-black/20 shrink-0"
            />
            <div className="flex items-baseline space-x-2">
              <span className={`font-extrabold text-base sm:text-lg ${themePalette.headerText} tracking-tight`}>
                QTM
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  isDarkHeader
                    ? 'bg-white/10 text-slate-300 border border-white/10'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {CURRENT_APP_VERSION}
              </span>
            </div>
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

          {/* Right Action Area: Botão Sincronizar + Entrar (se deslogado) + Menu Sanduíche */}
          <div className="flex items-center space-x-2">
            {/* Botão Sincronizar (Apenas Ícone + Ponto Verde de Status) */}
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
                <RefreshCw
                  className={`w-4 h-4 ${
                    isSyncing
                      ? 'animate-spin text-amber-400'
                      : isDarkHeader
                      ? 'text-slate-200'
                      : 'text-slate-600'
                  }`}
                />
                {syncError ? (
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                )}
              </button>
            )}

            {/* Se não estiver logado, mantém acesso rápido ao botão Entrar */}
            {!canEdit && (
              <button
                onClick={openLoginModal}
                className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}

            {/* Menu Sanduíche Superior (Contém Tema, Configurações, Sair e Versões do App) */}
            <div className="relative">
              <button
                onClick={() => setIsHamburgerOpen(!isHamburgerOpen)}
                title="Abrir Menu de Opções, Tema e Versão"
                className={`relative p-2 rounded-xl border transition-colors flex items-center justify-center ${
                  isDarkHeader
                    ? 'border-white/15 bg-white/10 text-white hover:bg-white/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {isHamburgerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                {canEdit && (
                  <span
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900"
                    title="Gestor Autenticado"
                  />
                )}
              </button>

              {isHamburgerOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsHamburgerOpen(false)}
                  />

                  {/* Painel do Menu Sanduíche */}
                  <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
                    {/* 1. Cabeçalho da Conta / Status do Gestor */}
                    <div className="p-3.5 bg-slate-50 border-b border-slate-200/80">
                      {canEdit ? (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                              <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-extrabold text-slate-900 block truncate">
                                {user.nome}
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                                {isAdmin ? 'Administrador Geral' : 'Gestor Autenticado'}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              logout();
                              setIsHamburgerOpen(false);
                            }}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors shrink-0"
                            title="Sair da conta"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sair</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Modo Consulta Pública</span>
                            <span className="text-[11px] text-slate-500">Entre para editar o cronograma</span>
                          </div>
                          <button
                            onClick={() => {
                              setIsHamburgerOpen(false);
                              openLoginModal();
                            }}
                            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-colors"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Entrar</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-3 space-y-3 max-h-[75vh] overflow-y-auto">
                      {/* 2. Seletor de Tema (Exclusivo Admin) */}
                      {isAdmin && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                              <Palette className="w-3.5 h-3.5 text-amber-500" />
                              Tema Visual da Unidade
                            </span>
                            <span className="text-[10px] text-blue-600 font-bold">Admin</span>
                          </div>

                          <div className="space-y-1.5">
                            {THEME_LIST.map(t => {
                              const active = theme === t.id;
                              return (
                                <button
                                  key={t.id}
                                  onClick={() => {
                                    setTheme(t.id);
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
                      )}

                      {/* 3. Configurações da Planilha (Exclusivo Admin) */}
                      {isAdmin && (
                        <div className="pt-1 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setIsHamburgerOpen(false);
                              openSettings();
                            }}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700 transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <Settings className="w-4 h-4 text-blue-600" />
                              <span>Configurações & Planilha Google</span>
                            </span>
                            <span className="text-[10px] text-slate-400">Abrir</span>
                          </button>
                        </div>
                      )}

                      {/* 4. Versão do App e Notas de Atualização */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-extrabold text-slate-900">
                                    Versão {CURRENT_APP_VERSION}
                                  </span>
                                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                                    Atualizado
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 block">
                                  Build: {CURRENT_APP_DATE}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setShowVersionHistory(!showVersionHistory)}
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
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
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
