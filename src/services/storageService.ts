import { AppState } from '../types';
import { INITIAL_TURMAS, INITIAL_MATERIAS, INITIAL_INSTRUTORES, INITIAL_AULAS, INITIAL_GESTORES } from './mockData';
import {
  fetchAppwriteData,
  pushAppwriteData,
  deleteAppwriteRow,
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID
} from './appwriteService';

const STORAGE_KEY = 'qts_plano_aulas_state_v2';
const DELETED_IDS_KEY = 'qts_deleted_ids_v2';

export const DEFAULT_SCRIPT_URL = `${APPWRITE_ENDPOINT} (Projeto: ${APPWRITE_PROJECT_ID})`;

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

function normalizeAulasDates(aulas: any[]): any[] {
  if (!Array.isArray(aulas)) return [];
  return aulas.map(a => ({
    ...a,
    data: a.data ? String(a.data).split('T')[0].split(' ')[0].trim() : ''
  }));
}

function normalizeGestores(gestores: any[]): any[] {
  if (!Array.isArray(gestores)) return [];
  return gestores.map(g => ({
    ...g,
    login: String(g.login ?? ''),
    senha: String(g.senha ?? '')
  }));
}

export function getDeletedIds(): Set<string> {
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

export function markIdsAsDeleted(
  ids: string[],
  tableId?: 'aulas' | 'turmas' | 'materias' | 'instrutores' | 'gestores'
): void {
  try {
    const current = getDeletedIds();
    ids.forEach(id => current.add(id));
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(current)));

    // Remove imediatamente do Appwrite para todos os dispositivos
    ids.forEach(id => {
      if (tableId) {
        deleteAppwriteRow(tableId, id);
      } else {
        // Detecta a tabela pelo prefixo ou tenta remover das tabelas
        if (id.startsWith('aula')) deleteAppwriteRow('aulas', id);
        else if (id.startsWith('turma')) deleteAppwriteRow('turmas', id);
        else if (id.startsWith('mat')) deleteAppwriteRow('materias', id);
        else if (id.startsWith('inst')) deleteAppwriteRow('instrutores', id);
        else if (id.startsWith('gestor')) deleteAppwriteRow('gestores', id);
        else {
          deleteAppwriteRow('aulas', id);
        }
      }
    });
  } catch {
    // ignore
  }
}

/**
 * Mesclagem Segura Anti-Perda de Dados:
 * Une os registros do Appwrite com os registros locais e filtra IDs excluídos.
 */
function mergeSafeCollection<T extends { id: string }>(
  localList: T[],
  remoteList: T[],
  deletedIds: Set<string>,
  preferRemote = true
): T[] {
  const map = new Map<string, T>();

  if (preferRemote) {
    if (Array.isArray(localList)) {
      localList.forEach(item => {
        if (item && item.id && !deletedIds.has(item.id)) {
          map.set(item.id, item);
        }
      });
    }
    if (Array.isArray(remoteList)) {
      remoteList.forEach(item => {
        if (item && item.id && !deletedIds.has(item.id)) {
          map.set(item.id, item);
        }
      });
    }
  } else {
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
  }

  return Array.from(map.values());
}

let isPushingNow = false;
let pendingPushState: AppState | null = null;

export const storageService = {
  loadState(): AppState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const sheetsConfig = parsed.sheetsConfig || DEFAULT_STATE.sheetsConfig;
        sheetsConfig.scriptUrl = DEFAULT_SCRIPT_URL;
        sheetsConfig.autoSync = true;
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
   * Sincronização em Nuvem com Appwrite (QTM-FT)
   */
  async syncWithSheets(state: AppState): Promise<AppState> {
    try {
      const fetched = await fetchAppwriteData();
      const deletedIds = getDeletedIds();
      if (Array.isArray(fetched.remoteDeletedIds)) {
        fetched.remoteDeletedIds.forEach(id => deletedIds.add(id));
        localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(deletedIds)));
      }

      const mergedTurmas = mergeSafeCollection(state.turmas, fetched.turmas, deletedIds, true);
      const mergedMaterias = mergeSafeCollection(state.materias, fetched.materias, deletedIds, true);
      const mergedInstrutores = mergeSafeCollection(state.instrutores, fetched.instrutores, deletedIds, true);
      const mergedAulas = normalizeAulasDates(mergeSafeCollection(state.aulas, fetched.aulas, deletedIds, true));
      const mergedGestores = normalizeGestores(mergeSafeCollection(state.gestores, fetched.gestores, deletedIds, true));

      const updatedState: AppState = {
        turmas: mergedTurmas.length > 0 ? mergedTurmas : INITIAL_TURMAS,
        materias: mergedMaterias.length > 0 ? mergedMaterias : INITIAL_MATERIAS,
        instrutores: mergedInstrutores.length > 0 ? mergedInstrutores : INITIAL_INSTRUTORES,
        aulas: mergedAulas,
        gestores: mergedGestores.length > 0 ? mergedGestores : INITIAL_GESTORES,
        sheetsConfig: {
          ...state.sheetsConfig,
          scriptUrl: DEFAULT_SCRIPT_URL,
          autoSync: true,
          theme: fetched.theme || state.sheetsConfig.theme || 'ft-19bpm',
          ultimaSincronizacao: new Date().toISOString()
        }
      };

      storageService.saveState(updatedState);

      // Se havia itens locais novos que ainda não estavam no Appwrite, envia de forma diferencial
      if (
        updatedState.aulas.length !== fetched.aulas.length ||
        updatedState.materias.length !== fetched.materias.length ||
        updatedState.turmas.length !== fetched.turmas.length ||
        updatedState.instrutores.length !== fetched.instrutores.length ||
        updatedState.gestores.length !== fetched.gestores.length
      ) {
        storageService.pushToSheets(updatedState).catch(() => {});
      }

      return updatedState;
    } catch (err: any) {
      console.error('Erro na sincronização com Appwrite:', err);
      throw err;
    }
  },

  /**
   * Envia alterações diferenciais para o Appwrite em fila ordenada (Mutex).
   */
  async pushToSheets(state: AppState): Promise<void> {
    if (isPushingNow) {
      pendingPushState = state;
      return;
    }

    isPushingNow = true;
    try {
      const deletedIds = Array.from(getDeletedIds());
      await pushAppwriteData({
        turmas: state.turmas,
        materias: state.materias,
        instrutores: state.instrutores,
        aulas: normalizeAulasDates(state.aulas),
        gestores: normalizeGestores(state.gestores),
        theme: state.sheetsConfig.theme || 'ft-19bpm',
        deletedIds
      });
    } catch (err: any) {
      console.error('Erro no auto-sync (push) com Appwrite:', err);
      throw err;
    } finally {
      isPushingNow = false;
      if (pendingPushState) {
        const next = pendingPushState;
        pendingPushState = null;
        await storageService.pushToSheets(next);
      }
    }
  }
};
