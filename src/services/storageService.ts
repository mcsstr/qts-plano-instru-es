import { AppState } from '../types';
import { INITIAL_TURMAS, INITIAL_MATERIAS, INITIAL_INSTRUTORES, INITIAL_AULAS, INITIAL_GESTORES } from './mockData';
import { fetchGoogleSheetsData, pushGoogleSheetsData } from './googleSheetsService';

const STORAGE_KEY = 'qts_plano_aulas_state_v2';

export const DEFAULT_STATE: AppState = {
  turmas: INITIAL_TURMAS,
  materias: INITIAL_MATERIAS,
  instrutores: INITIAL_INSTRUTORES,
  aulas: INITIAL_AULAS,
  gestores: INITIAL_GESTORES,
  sheetsConfig: {
    scriptUrl: '',
    autoSync: false,
    ultimaSincronizacao: undefined
  }
};

// Helper de mesclagem inteligente por ID:
// Prioriza os itens locais para que NENHUM cadastro recém-criado seja perdido ou sobrescrito!
function mergeCollections<T extends { id: string }>(localList: T[], remoteList: T[]): T[] {
  const map = new Map<string, T>();
  // 1. Adiciona itens remotos da planilha
  if (Array.isArray(remoteList)) {
    remoteList.forEach(item => {
      if (item && item.id) map.set(item.id, item);
    });
  }
  // 2. Mescla os itens locais por cima (preservando cadastros locais mais recentes)
  if (Array.isArray(localList)) {
    localList.forEach(item => {
      if (item && item.id) map.set(item.id, item);
    });
  }
  return Array.from(map.values());
}

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
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          turmas: parsed.turmas || INITIAL_TURMAS,
          materias: parsed.materias || INITIAL_MATERIAS,
          instrutores: parsed.instrutores || INITIAL_INSTRUTORES,
          aulas: normalizeAulasDates(parsed.aulas || INITIAL_AULAS),
          gestores: parsed.gestores || INITIAL_GESTORES,
          sheetsConfig: parsed.sheetsConfig || DEFAULT_STATE.sheetsConfig
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

  async syncWithSheets(state: AppState): Promise<AppState> {
    if (!state.sheetsConfig.scriptUrl) {
      throw new Error('URL do Google Sheets não configurada.');
    }

    try {
      // 1. Envia os dados atuais para a planilha
      await pushGoogleSheetsData(state.sheetsConfig.scriptUrl, {
        turmas: state.turmas,
        materias: state.materias,
        instrutores: state.instrutores,
        aulas: state.aulas,
        gestores: state.gestores
      });

      // 2. Busca dados da planilha com mesclagem inteligente
      const fetched = await fetchGoogleSheetsData(state.sheetsConfig.scriptUrl);

      const updatedState: AppState = {
        turmas: mergeCollections(state.turmas, fetched.turmas),
        materias: mergeCollections(state.materias, fetched.materias),
        instrutores: mergeCollections(state.instrutores, fetched.instrutores),
        aulas: normalizeAulasDates(mergeCollections(state.aulas, fetched.aulas)),
        gestores: mergeCollections(state.gestores, fetched.gestores),
        sheetsConfig: {
          ...state.sheetsConfig,
          ultimaSincronizacao: new Date().toISOString()
        }
      };

      storageService.saveState(updatedState);
      return updatedState;
    } catch (err: any) {
      console.error('Erro na sincronização com Google Sheets:', err);
      throw err;
    }
  }
};
