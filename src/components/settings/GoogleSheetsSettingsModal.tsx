import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { GOOGLE_APPS_SCRIPT_CODE } from '../../services/googleSheetsService';
import {
  X,
  FileSpreadsheet,
  Copy,
  Check,
  RefreshCw,
  Download,
  Upload,
  RotateCcw,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle
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
    updateSheetsConfig,
    syncSheets,
    forcePushToSheets,
    isSyncing,
    syncError,
    exportBackup,
    importBackup,
    resetToDefaultData
  } = useApp();

  const { isAdmin } = useAuth();
  const [scriptUrl, setScriptUrl] = useState(sheetsConfig.scriptUrl || '');
  const [autoSync, setAutoSync] = useState(sheetsConfig.autoSync ?? true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sheets' | 'backup' | 'pwa'>('sheets');

  if (!isOpen || !isAdmin) return null;

  const handleSaveSheetsConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = scriptUrl.trim();
    updateSheetsConfig({
      scriptUrl: cleanUrl,
      autoSync
    });
    if (cleanUrl) {
      await syncSheets(cleanUrl);
    }
  };

  const handleForcePush = async () => {
    const cleanUrl = scriptUrl.trim();
    if (!cleanUrl) return;
    updateSheetsConfig({
      scriptUrl: cleanUrl,
      autoSync
    });
    await forcePushToSheets(cleanUrl);
  };

  const handleCopyShareLink = () => {
    const cleanUrl = scriptUrl.trim();
    if (!cleanUrl) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?db=${encodeURIComponent(cleanUrl)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 3000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

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
      } catch (err: any) {
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
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Banco de Dados & Ajustes</h2>
              <p className="text-xs text-slate-400">Planilha Google, Backup e PWA Mobile</p>
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
        <div className="flex border-b border-slate-200 px-5 pt-3 bg-slate-50/50 space-x-4 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('sheets')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'sheets'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Planilha Google</span>
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
          {/* ABA 1: PLANILHA GOOGLE */}
          {activeTab === 'sheets' && (
            <div className="space-y-4">
              <form onSubmit={handleSaveSheetsConfig} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    URL do Aplicativo Web Google Apps Script
                  </label>
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={scriptUrl}
                    onChange={e => setScriptUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Se este campo estiver em branco, o sistema continua funcionando perfeitamente gravando localmente no navegador (LocalStorage).
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSync}
                      onChange={e => setAutoSync(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>Sincronização Automática ativa</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleForcePush}
                      disabled={isSyncing || !scriptUrl.trim()}
                      title="Envia todas as matérias, gestores e aulas deste dispositivo para a planilha"
                      className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Enviar Dados Locais p/ Planilha</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSyncing}
                      title="Conecta e carrega os dados salvos na planilha"
                      className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Sincronizando...' : 'Salvar & Puxar da Planilha'}</span>
                    </button>
                  </div>
                </div>

                {scriptUrl.trim() && (
                  <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                    <div className="text-indigo-900">
                      <span className="font-bold block">Abrir em outro celular ou computador já conectado:</span>
                      <span className="text-[11px] text-indigo-700">
                        Use este link para abrir o app em outro dispositivo já ligado a esta planilha automaticamente.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyShareLink}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shrink-0 transition-colors"
                    >
                      {copiedShareLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedShareLink ? 'Link Copiado!' : 'Copiar Link'}</span>
                    </button>
                  </div>
                )}

                {syncError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center space-x-2 border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{syncError}</span>
                  </div>
                )}
              </form>

              {/* Tutorial Passo a Passo */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                    Como conectar sua Planilha Google em 2 minutos:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center space-x-1 text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Código Copiado!' : 'Copiar Código Google Script'}</span>
                  </button>
                </div>

                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
                  <li>Abra uma Planilha no <strong>Google Drive</strong> (Google Sheets).</li>
                  <li>No menu superior da planilha, clique em <strong>Extensões</strong> &gt; <strong>Apps Script</strong>.</li>
                  <li>Apague o código existente e cole o código que você copiou no botão acima.</li>
                  <li>Clique no botão azul <strong>Implantar</strong> &gt; <strong>Nova Implantação</strong>.</li>
                  <li>Escolha o tipo: <strong>App da Web</strong> (Web App).</li>
                  <li>Em <em>Quem pode acessar</em>, selecione <strong>Qualquer pessoa</strong> (para permitir a conexão).</li>
                  <li>Copie a <strong>URL do App da Web</strong> gerada e cole no campo acima!</li>
                </ol>
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

