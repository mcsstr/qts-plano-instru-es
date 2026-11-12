import { AppState } from '../types';
import { INITIAL_TURMAS, INITIAL_MATERIAS, INITIAL_INSTRUTORES, INITIAL_AULAS, INITIAL_GESTORES } from './mockData';
import { fetchGoogleSheetsData, pushGoogleSheetsData } from './googleSheetsService';

const STORAGE_KEY = 'qts_plano_aulas_state_v2';

export const DEFAULT_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxwJ1ZcRqf80D0mQ4ZwwYB9pfZoBmvbw_6QkDLVehHuODFZYjXsxbMzuVWCGjxWswyUQg/exec';

export const DEFAULT_STATE: AppState = {
  turmas: INITIAL_TURMAS,
  materias: INITIAL_MATERIAS,
  instrutores: INITIAL_INSTRUTORES,
  aulas: INITIAL_AULAS,
  gestores: INITIAL_GESTORES,
  sheetsConfig: {
    scriptUrl: DEFAULT_SCRIPT_URL,
    autoSync: true,
    ultimaSincronizacao: undefined
  }
};

// Normaliza datas de Aula para garantir formato YYYY-MM-DD puro
function normalizeAulasDates(aulas: any[]): any[] {
  if (!Array.isArray(aulas)) return [];
  return aulas.map(a => ({
    ...a,
    data: a.data ? String(a.data).split('T')[0].split(' ')[0].trim() : ''
  }));
}

export const storageService = {
  loadState(): AppState {
    try {
      // Verifica se a URL do banco veio via parâmetro ?db= na URL do navegador
      const urlParams = new URLSearchParams(window.location.search);
      const dbParam = urlParams.get('db');

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const sheetsConfig = parsed.sheetsConfig || DEFAULT_STATE.sheetsConfig;
        if (dbParam && dbParam.startsWith('http')) {
          sheetsConfig.scriptUrl = dbParam.trim();
          sheetsConfig.autoSync = true;
        } else if (!sheetsConfig.scriptUrl) {
          sheetsConfig.scriptUrl = DEFAULT_SCRIPT_URL;
          sheetsConfig.autoSync = true;
        }
        return {
          turmas: parsed.turmas || INITIAL_TURMAS,
          materias: parsed.materias || INITIAL_MATERIAS,
          instrutores: parsed.instrutores || INITIAL_INSTRUTORES,
          aulas: normalizeAulasDates(parsed.aulas || INITIAL_AULAS),
          gestores: parsed.gestores || INITIAL_GESTORES,
          sheetsConfig
        };
      } else if (dbParam && dbParam.startsWith('http')) {
        return {
          ...DEFAULT_STATE,
          sheetsConfig: {
            scriptUrl: dbParam.trim(),
            autoSync: true
          }
        };
      }
    } catch (e) {
      console.error('Erro ao carregar dados do localStorage:', e);
    }
    return DEFAULT_STATE;
  },

  saveState(state: AppState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Erro ao salvar dados no localStorage:', e);
    }
  },

  exportToJson(state: AppState): string {
    return JSON.stringify(state, null, 2);
  },

  importFromJson(jsonStr: string): AppState {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.turmas || !parsed.materias || !parsed.instrutores || !parsed.aulas) {
      throw new Error('Arquivo de backup inválido: formato incompatível.');
    }
    return {
      ...parsed,
      gestores: parsed.gestores || INITIAL_GESTORES
    } as AppState;
  },

  /**
   * Busca os dados da Planilha Google (fonte da verdade).
   * Se a planilha já tiver registros, usa os dados da planilha para que todos os dispositivos
   * vejam exatamente as mesmas turmas, matérias, instrutores, aulas e gestores.
   * Só envia os dados locais se a planilha estiver completamente vazia (primeira conexão).
   */
  async syncWithSheets(state: AppState, customScriptUrl?: string): Promise<AppState> {
    const targetUrl = (customScriptUrl || state.sheetsConfig.scriptUrl || '').trim();
    if (!targetUrl) {
      throw new Error('URL do Google Sheets não configurada.');
    }

    try {
      // 1. Primeiro BUSCA o que está na Planilha Google
      const fetched = await fetchGoogleSheetsData(targetUrl);

      const remoteHasData =
        fetched.turmas.length > 0 ||
        fetched.materias.length > 0 ||
        fetched.instrutores.length > 0 ||
        fetched.aulas.length > 0 ||
        fetched.gestores.length > 0;

      if (!remoteHasData) {
        // Planilha nova/vazia: envia os dados deste dispositivo para inicializar a planilha
        await pushGoogleSheetsData(targetUrl, {
          turmas: state.turmas,
          materias: state.materias,
          instrutores: state.instrutores,
          aulas: normalizeAulasDates(state.aulas),
          gestores: state.gestores
        });

        const initializedState: AppState = {
          ...state,
          sheetsConfig: {
            ...state.sheetsConfig,
            scriptUrl: targetUrl,
            autoSync: true,
            ultimaSincronizacao: new Date().toISOString()
          }
        };
        storageService.saveState(initializedState);
        return initializedState;
      }

      // Planilha já possui dados: usa os dados da planilha como fonte oficial para sincronizar dispositivos
      const updatedState: AppState = {
        turmas: fetched.turmas.length > 0 ? fetched.turmas : state.turmas,
        materias: fetched.materias.length > 0 ? fetched.materias : state.materias,
        instrutores: fetched.instrutores.length > 0 ? fetched.instrutores : state.instrutores,
        aulas: normalizeAulasDates(fetched.aulas),
        gestores: fetched.gestores.length > 0 ? fetched.gestores : state.gestores,
        sheetsConfig: {
          ...state.sheetsConfig,
          scriptUrl: targetUrl,
          autoSync: true,
          ultimaSincronizacao: new Date().toISOString()
        }
      };

      storageService.saveState(updatedState);
      return updatedState;
    } catch (err: any) {
      console.error('Erro na sincronização com Google Sheets:', err);
      throw err;
    }
  },

  /**
   * Envia (push) imediatamente o estado atual deste dispositivo para a Planilha Google.
   * Chamado automaticamente toda vez que o usuário adiciona, edita ou exclui qualquer item.
   */
  async pushToSheets(state: AppState, customScriptUrl?: string): Promise<void> {
    const targetUrl = (customScriptUrl || state.sheetsConfig.scriptUrl || '').trim();
    if (!targetUrl) return;

    try {
      await pushGoogleSheetsData(targetUrl, {
        turmas: state.turmas,
        materias: state.materias,
        instrutores: state.instrutores,
        aulas: normalizeAulasDates(state.aulas),
        gestores: state.gestores
      });
    } catch (err: any) {
      console.error('Erro no auto-sync (push) com Google Sheets:', err);
      throw err;
    }
  }
};
