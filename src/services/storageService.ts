import { AppState } from '../types';
import { INITIAL_TURMAS, INITIAL_MATERIAS, INITIAL_INSTRUTORES, INITIAL_AULAS, INITIAL_GESTORES } from './mockData';
import { fetchGoogleSheetsData, pushGoogleSheetsData } from './googleSheetsService';

const STORAGE_KEY = 'qts_plano_aulas_state_v2';
const DELETED_IDS_KEY = 'qts_deleted_ids_v2';

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
    theme: 'ft-19bpm',
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

// Normaliza Gestores para garantir que login e senha sejam sempre strings
function normalizeGestores(gestores: any[]): any[] {
  if (!Array.isArray(gestores)) return [];
  return gestores.map(g => ({
    ...g,
    login: String(g.login ?? ''),
    senha: String(g.senha ?? '')
  }));
}

// Carrega lista de IDs excluídos intencionalmente pelo usuário
function getDeletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch {
    // ignore
  }
  return new Set();
}

// Registra IDs que foram excluídos intencionalmente para não voltarem no merge
export function markIdsAsDeleted(ids: string[]): void {
  try {
    const current = getDeletedIds();
    ids.forEach(id => current.add(id));
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(current)));
  } catch {
    // ignore
  }
}

/**
 * Mesclagem Blindada Anti-Perda de Dados:
 * Une todos os registros da planilha com os registros locais (dando preferência à versão local mais recente)
 * e filtra apenas os IDs que foram explicitamente excluídos pelo usuário.
 * Assim, NENHUMA aula ou cadastro jamais some por falha de rede ou leitura concorrente!
 */
function mergeSafeCollection<T extends { id: string }>(
  localList: T[],
  remoteList: T[],
  deletedIds: Set<string>
): T[] {
  const map = new Map<string, T>();

  if (Array.isArray(remoteList)) {
    remoteList.forEach(item => {
      if (item && item.id && !deletedIds.has(item.id)) {
        map.set(item.id, item);
      }
    });
  }

  if (Array.isArray(localList)) {
    localList.forEach(item => {
      if (item && item.id && !deletedIds.has(item.id)) {
        map.set(item.id, item);
      }
    });
  }

  return Array.from(map.values());
}

// Controle de fila para evitar múltiplas gravações simultâneas na planilha
let isPushingNow = false;
let pendingPushState: { state: AppState; url: string } | null = null;

export const storageService = {
  loadState(): AppState {
    try {
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
        if (!sheetsConfig.theme) {
          sheetsConfig.theme = 'ft-19bpm';
        }
        return {
          turmas: parsed.turmas?.length ? parsed.turmas : INITIAL_TURMAS,
          materias: parsed.materias?.length ? parsed.materias : INITIAL_MATERIAS,
          instrutores: parsed.instrutores?.length ? parsed.instrutores : INITIAL_INSTRUTORES,
          aulas: normalizeAulasDates(parsed.aulas?.length ? parsed.aulas : INITIAL_AULAS),
          gestores: normalizeGestores(parsed.gestores?.length ? parsed.gestores : INITIAL_GESTORES),
          sheetsConfig
        };
      } else if (dbParam && dbParam.startsWith('http')) {
        return {
          ...DEFAULT_STATE,
          sheetsConfig: {
            scriptUrl: dbParam.trim(),
            autoSync: true,
            theme: 'ft-19bpm'
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
      gestores: normalizeGestores(parsed.gestores || INITIAL_GESTORES)
    } as AppState;
  },

  /**
   * Sincronização Bidirecional Blindada:
   * 1. Busca os dados da Planilha Google
   * 2. Mescla de forma segura com os dados locais (sem nunca apagar aulas se um lado vier vazio)
   * 3. Se o estado mesclado tiver itens locais que ainda não estavam na planilha, envia para a planilha!
   */
  async syncWithSheets(state: AppState, customScriptUrl?: string): Promise<AppState> {
    const targetUrl = (customScriptUrl || state.sheetsConfig.scriptUrl || DEFAULT_SCRIPT_URL).trim();
    if (!targetUrl) {
      throw new Error('URL do Google Sheets não configurada.');
    }

    try {
      const fetched = await fetchGoogleSheetsData(targetUrl);
      const deletedIds = getDeletedIds();

      const mergedTurmas = mergeSafeCollection(state.turmas, fetched.turmas, deletedIds);
      const mergedMaterias = mergeSafeCollection(state.materias, fetched.materias, deletedIds);
      const mergedInstrutores = mergeSafeCollection(state.instrutores, fetched.instrutores, deletedIds);
      const mergedAulas = normalizeAulasDates(mergeSafeCollection(state.aulas, fetched.aulas, deletedIds));
      const mergedGestores = normalizeGestores(mergeSafeCollection(state.gestores, fetched.gestores, deletedIds));

      const updatedState: AppState = {
        turmas: mergedTurmas.length > 0 ? mergedTurmas : INITIAL_TURMAS,
        materias: mergedMaterias.length > 0 ? mergedMaterias : INITIAL_MATERIAS,
        instrutores: mergedInstrutores.length > 0 ? mergedInstrutores : INITIAL_INSTRUTORES,
        aulas: mergedAulas,
        gestores: mergedGestores.length > 0 ? mergedGestores : INITIAL_GESTORES,
        sheetsConfig: {
          ...state.sheetsConfig,
          scriptUrl: targetUrl,
          autoSync: true,
          theme: state.sheetsConfig.theme || 'ft-19bpm',
          ultimaSincronizacao: new Date().toISOString()
        }
      };

      storageService.saveState(updatedState);

      // Se tínhamos aulas/dados locais que não estavam na planilha (ex: planilha tinha menos aulas),
      // já garante a gravação na planilha em background!
      if (
        updatedState.aulas.length !== fetched.aulas.length ||
        updatedState.materias.length !== fetched.materias.length ||
        updatedState.turmas.length !== fetched.turmas.length ||
        updatedState.instrutores.length !== fetched.instrutores.length ||
        updatedState.gestores.length !== fetched.gestores.length
      ) {
        storageService.pushToSheets(updatedState, targetUrl).catch(() => {});
      }

      return updatedState;
    } catch (err: any) {
      console.error('Erro na sincronização com Google Sheets:', err);
      throw err;
    }
  },

  /**
   * Envia (push) em fila ordenada (Mutex) para nunca haver concorrência no Google Apps Script.
   */
  async pushToSheets(state: AppState, customScriptUrl?: string): Promise<void> {
    const targetUrl = (customScriptUrl || state.sheetsConfig.scriptUrl || DEFAULT_SCRIPT_URL).trim();
    if (!targetUrl) return;

    if (isPushingNow) {
      pendingPushState = { state, url: targetUrl };
      return;
    }

    isPushingNow = true;
    try {
      await pushGoogleSheetsData(targetUrl, {
        turmas: state.turmas,
        materias: state.materias,
        instrutores: state.instrutores,
        aulas: normalizeAulasDates(state.aulas),
        gestores: normalizeGestores(state.gestores)
      });
    } catch (err: any) {
      console.error('Erro no auto-sync (push) com Google Sheets:', err);
      throw err;
    } finally {
      isPushingNow = false;
      if (pendingPushState) {
        const next = pendingPushState;
        pendingPushState = null;
        await storageService.pushToSheets(next.state, next.url);
      }
    }
  }
};
