import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { THEME_LIST } from '../../utils/themeConfig';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_DB_ID } from '../../services/appwriteService';
import {
  X,
  Database,
  Check,
  RefreshCw,
  Download,
  Upload,
  RotateCcw,
  Smartphone,
  AlertCircle,
  Palette,
  Zap,
  ShieldCheck
} from 'lucide-react';

interface GoogleSheetsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetsSettingsModal: React.FC<GoogleSheetsSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    sheetsConfig,
    syncSheets,
    forcePushToSheets,
    isSyncing,
    syncError,
    exportBackup,
    importBackup,
    resetToDefaultData,
    theme,
    setTheme
  } = useApp();

  const { isAdmin } = useAuth();
  const [importError, setImportError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'temas' | 'appwrite' | 'backup' | 'pwa'>('temas');

  if (!isOpen || !isAdmin) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        importBackup(content);
        setImportError(null);
        alert('Dados importados com sucesso!');
      } catch {
        setImportError('Erro ao importar arquivo JSON: formato incompatível.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Banco de Dados Appwrite & Ajustes</h2>
              <p className="text-xs text-slate-400">Sincronização em Tempo Real (Projeto QTM-FT)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 px-5 pt-3 bg-slate-50/50 gap-4 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('temas')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'temas'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Temas da Unidade (4)</span>
          </button>

          <button
            onClick={() => setActiveTab('appwrite')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'appwrite'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Appwrite Cloud</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'backup'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Backup & Exportação</span>
          </button>

          <button
            onClick={() => setActiveTab('pwa')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'pwa'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Instalar no Celular</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* ABA 0: 4 TEMAS VISUAIS (EXCLUSIVO ADMIN) */}
          {activeTab === 'temas' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                Escolha um dos <strong>4 temas visuais</strong> inspirados nas cores representativas do brasão do <strong>19º BPM/I • Força Tática</strong> (Preto, Ouro, Rubro, Azul Tático e Branco). O tema escolhido é salvo automaticamente no Appwrite para todos os dispositivos.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEME_LIST.map(t => {
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex -space-x-1">
                            {t.previewColors.map((hex, i) => (
                              <span
                                key={i}
                                className="w-5 h-5 rounded-full border-2 border-white shadow-xs"
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                          </div>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                              <Check className="w-3 h-3" />
                              Ativo
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-900">{t.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{t.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ABA 1: APPWRITE CLOUD */}
          {activeTab === 'appwrite' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-emerald-950 text-sm">
                      Conectado ao Appwrite Cloud (QTM-FT)
                    </h4>
                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold">
                      Tempo Real
                    </span>
                  </div>
                  <p className="text-emerald-800 leading-relaxed">
                    Todas as aulas, turmas, matérias, instrutores, gestores e configurações de tema estão persistidos no banco de dados relacional do Appwrite com atualização diferencial instantânea e WebSocket Realtime.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Project ID</span>
                  <span className="font-mono font-bold text-slate-800 text-xs break-all">{APPWRITE_PROJECT_ID}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Database ID</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">{APPWRITE_DB_ID}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Região / Endpoint</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px] break-all">{APPWRITE_ENDPOINT}</span>
                </div>
              </div>

              {sheetsConfig.ultimaSincronizacao && (
                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Última verificação com o servidor:{' '}
                    <strong>{new Date(sheetsConfig.ultimaSincronizacao).toLocaleString('pt-BR')}</strong>
                  </span>
                </div>
              )}

              {syncError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center space-x-2 border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{syncError}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => forcePushToSheets()}
                  disabled={isSyncing}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Forçar Gravação Completa</span>
                </button>

                <button
                  type="button"
                  onClick={() => syncSheets()}
                  disabled={isSyncing}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar com Appwrite Agora'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ABA 2: BACKUP & RESTAURAÇÃO */}
          {activeTab === 'backup' && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                Você pode fazer o download de uma cópia de segurança completa de todas as turmas, matérias, instrutores e cronograma de aulas em formato JSON.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={exportBackup}
                  className="flex items-center justify-center space-x-2 p-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-semibold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar Backup (JSON)</span>
                </button>

                <label className="flex items-center justify-center space-x-2 p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-semibold cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Importar Backup (JSON)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {importError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
                  {importError}
                </div>
              )}

              <hr className="border-slate-100 my-2" />

              <div className="pt-2">
                <span className="font-semibold text-slate-700 block mb-1">Restaurar Dados Padrão:</span>
                <p className="text-slate-500 mb-2">
                  Restaura o banco de dados para a demonstração inicial com turmas, instrutores e aulas pré-agendadas.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Deseja resetar todos os dados para o padrão de demonstração?')) {
                      resetToDefaultData();
                      alert('Dados restaurados com sucesso!');
                    }
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl font-semibold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Demonstração Inicial</span>
                </button>
              </div>
            </div>
          )}

          {/* ABA 3: PWA NO CELULAR */}
          {activeTab === 'pwa' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start space-x-3">
                <Smartphone className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-900 text-sm">Aplicativo PWA Pronto para Celular</h4>
                  <p className="text-blue-800 text-xs mt-1">
                    Esta aplicação foi desenvolvida como um PWA (Progressive Web App). Ela funciona em tela cheia no smartphone, com ícone na tela inicial e resposta ao toque instantânea!
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900">No Android (Google Chrome):</span>
                  <p className="text-slate-600">
                    Toque no menu de 3 pontinhos (⋮) no canto superior direito do navegador e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                  </p>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900">No iPhone / iPad (Safari):</span>
                  <p className="text-slate-600">
                    Toque no botão de <strong>Compartilhar</strong> (ícone de quadrado com seta para cima) e selecione <strong>"Adicionar à Tela de Início"</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
