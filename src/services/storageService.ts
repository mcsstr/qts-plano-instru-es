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
          aulas: parsed.aulas || INITIAL_AULAS,
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

      // 2. Busca os dados atualizados da planilha
      const fetched = await fetchGoogleSheetsData(state.sheetsConfig.scriptUrl);

      const updatedState: AppState = {
        turmas: fetched.turmas.length > 0 ? fetched.turmas : state.turmas,
        materias: fetched.materias.length > 0 ? fetched.materias : state.materias,
        instrutores: fetched.instrutores.length > 0 ? fetched.instrutores : state.instrutores,
        aulas: fetched.aulas.length > 0 ? fetched.aulas : state.aulas,
        gestores: fetched.gestores.length > 0 ? fetched.gestores : state.gestores,
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
