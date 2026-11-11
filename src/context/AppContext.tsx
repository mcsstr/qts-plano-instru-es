import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AppState,
  Turma,
  Materia,
  Instrutor,
  Aula,
  Gestor,
  GoogleSheetsConfig,
  Turno
} from '../types';
import { storageService, DEFAULT_STATE } from '../services/storageService';
import { GeneratedAulaPreview } from '../utils/rotationAlgorithm';

interface AppContextType {
  state: AppState;
  turmas: Turma[];
  materias: Materia[];
  instrutores: Instrutor[];
  aulas: Aula[];
  gestores: Gestor[];
  sheetsConfig: GoogleSheetsConfig;

  // Filtros Globais
  selectedTurmaId: string;
  setSelectedTurmaId: (id: string) => void;
  selectedMateriaId: string;
  setSelectedMateriaId: (id: string) => void;
  selectedInstrutorId: string;
  setSelectedInstrutorId: (id: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;

  // Modo Seleção Múltipla & Exclusão em Massa
  isMultiSelectMode: boolean;
  setIsMultiSelectMode: (active: boolean) => void;
  selectedAulaIds: Set<string>;
  toggleSelectAula: (id: string) => void;
  selectAllAulas: (ids: string[]) => void;
  clearSelectedAulas: () => void;
  deleteSelectedAulas: () => void;

  // Ações de Aula
  addAula: (aulaData: Omit<Aula, 'id' | 'criadaEm'>) => Aula;
  updateAula: (aula: Aula) => void;
  deleteAula: (id: string) => void;
  deleteBulkAulas: (ids: string[]) => void;
  remanejarAula: (
    aulaOriginalId: string,
    novaData: string,
    motivo: string,
    novoTurno?: Turno,
    novoInstrutorId?: string
  ) => Aula;
  marcarPrejuizo: (aulaId: string, motivo: string, acao: 'prejudicada' | 'cancelada') => void;
  batchInsertAulas: (aulas: GeneratedAulaPreview[]) => void;

  // Cadastros
  addTurma: (turma: Omit<Turma, 'id'>) => Turma;
  updateTurma: (turma: Turma) => void;
  deleteTurma: (id: string) => void;

  addMateria: (materia: Omit<Materia, 'id'>) => Materia;
  updateMateria: (materia: Materia) => void;
  deleteMateria: (id: string) => void;

  addInstrutor: (instrutor: Omit<Instrutor, 'id'>) => Instrutor;
  updateInstrutor: (instrutor: Instrutor) => void;
  deleteInstrutor: (id: string) => void;

  // Gestores
  addGestor: (gestor: Omit<Gestor, 'id'>) => Gestor;
  updateGestor: (gestor: Gestor) => void;
  deleteGestor: (id: string) => void;
  validateGestorLogin: (loginOrNome: string, senha: string) => Gestor | null;

  // Google Sheets & Backup
  syncSheets: () => Promise<void>;
  updateSheetsConfig: (config: GoogleSheetsConfig) => void;
  isSyncing: boolean;
  syncError: string | null;
  resetToDefaultData: () => void;
  exportBackup: () => void;
  importBackup: (jsonStr: string) => void;

  // Helpers de busca
  getTurma: (id: string) => Turma | undefined;
  getMateria: (id: string) => Materia | undefined;
  getInstrutor: (id: string) => Instrutor | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => storageService.loadState());

  // Filtros
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('all');
  const [selectedMateriaId, setSelectedMateriaId] = useState<string>('all');
  const [selectedInstrutorId, setSelectedInstrutorId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Seleção Múltipla
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [selectedAulaIds, setSelectedAulaIds] = useState<Set<string>>(new Set());

  // Sincronização
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Salva no localStorage sempre que o state mudar
  useEffect(() => {
    storageService.saveState(state);
  }, [state]);

  // Se autoSync estiver ativo e tiver URL, sincroniza periodicamente
  useEffect(() => {
    if (state.sheetsConfig.autoSync && state.sheetsConfig.scriptUrl) {
      const interval = setInterval(() => {
        syncSheets();
      }, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [state.sheetsConfig]);

  // Sincronizar com Google Sheets
  const syncSheets = async () => {
    if (!state.sheetsConfig.scriptUrl) {
      setSyncError('URL da Planilha Google não foi configurada.');
      return;
    }
    setIsSyncing(true);
    setSyncError(null);
    try {
      const updated = await storageService.syncWithSheets(state);
      setState(updated);
    } catch (err: any) {
      setSyncError(err?.message || 'Falha ao sincronizar com Google Sheets');
    } finally {
      setIsSyncing(false);
    }
  };

  const updateSheetsConfig = (config: GoogleSheetsConfig) => {
    setState(prev => ({
      ...prev,
      sheetsConfig: config
    }));
  };

  // Funções de Seleção Múltipla
  const toggleSelectAula = (id: string) => {
    setSelectedAulaIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllAulas = (ids: string[]) => {
    setSelectedAulaIds(new Set(ids));
  };

  const clearSelectedAulas = () => {
    setSelectedAulaIds(new Set());
  };

  const deleteSelectedAulas = () => {
    if (selectedAulaIds.size === 0) return;
    deleteBulkAulas(Array.from(selectedAulaIds));
    clearSelectedAulas();
    setIsMultiSelectMode(false);
  };

  // AULAS CRUD
  const addAula = (aulaData: Omit<Aula, 'id' | 'criadaEm'>): Aula => {
    const newAula: Aula = {
      ...aulaData,
      id: `aula-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      criadaEm: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      aulas: [newAula, ...prev.aulas]
    }));

    return newAula;
  };

  const updateAula = (aula: Aula) => {
    setState(prev => ({
      ...prev,
      aulas: prev.aulas.map(a => (a.id === aula.id ? aula : a))
    }));
  };

  const deleteAula = (id: string) => {
    setState(prev => ({
      ...prev,
      aulas: prev.aulas.filter(a => a.id !== id)
    }));
  };

  const deleteBulkAulas = (ids: string[]) => {
    const idSet = new Set(ids);
    setState(prev => ({
      ...prev,
      aulas: prev.aulas.filter(a => !idSet.has(a.id))
    }));
  };

  const remanejarAula = (
    aulaOriginalId: string,
    novaData: string,
    motivo: string,
    novoTurno?: Turno,
    novoInstrutorId?: string
  ): Aula => {
    const aulaOriginal = state.aulas.find(a => a.id === aulaOriginalId);
    if (!aulaOriginal) throw new Error('Aula não encontrada');

    const novaAulaId = `aula-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const novaAula: Aula = {
      id: novaAulaId,
      data: novaData,
      turmaId: aulaOriginal.turmaId,
      materiaId: aulaOriginal.materiaId,
      instrutorId: novoInstrutorId || aulaOriginal.instrutorId,
      turno: novoTurno || aulaOriginal.turno,
      horario: aulaOriginal.horario,
      status: 'agendada',
      remanejadaDeId: aulaOriginal.id,
      observacoes: `Reposição de aula prejudicada em ${aulaOriginal.data}: ${motivo}`,
      criadaEm: new Date().toISOString()
    };

    const aulaOriginalAtualizada: Aula = {
      ...aulaOriginal,
      status: 'prejudicada',
      motivoPrejuizo: motivo,
      remanejadaParaId: novaAulaId,
      observacoes: (aulaOriginal.observacoes ? aulaOriginal.observacoes + ' | ' : '') + `Remanejada para ${novaData}`
    };

    setState(prev => ({
      ...prev,
      aulas: [
        novaAula,
        ...prev.aulas.map(a => (a.id === aulaOriginal.id ? aulaOriginalAtualizada : a))
      ]
    }));

    return novaAula;
  };

  const marcarPrejuizo = (aulaId: string, motivo: string, acao: 'prejudicada' | 'cancelada') => {
    setState(prev => ({
      ...prev,
      aulas: prev.aulas.map(a => {
        if (a.id !== aulaId) return a;
        return {
          ...a,
          status: acao,
          motivoPrejuizo: motivo,
          observacoes: (a.observacoes ? a.observacoes + ' | ' : '') + `Prejuízo registrado: ${motivo}`
        };
      })
    }));
  };

  const batchInsertAulas = (generatedAulas: GeneratedAulaPreview[]) => {
    const newAulas: Aula[] = generatedAulas.map((item, idx) => ({
      id: `aula-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      data: item.data,
      turmaId: item.turmaId,
      materiaId: item.materiaId,
      instrutorId: item.instrutorId,
      turno: item.turno,
      horario: item.horario,
      status: 'agendada',
      observacoes: item.observacoes,
      criadaEm: new Date().toISOString()
    }));

    setState(prev => ({
      ...prev,
      aulas: [...newAulas, ...prev.aulas]
    }));
  };

  // TURMAS CRUD
  const addTurma = (turmaData: Omit<Turma, 'id'>): Turma => {
    const newTurma: Turma = {
      ...turmaData,
      id: `turma-${Date.now()}`
    };
    setState(prev => ({
      ...prev,
      turmas: [...prev.turmas, newTurma]
    }));
    return newTurma;
  };

  const updateTurma = (turma: Turma) => {
    setState(prev => ({
      ...prev,
      turmas: prev.turmas.map(t => (t.id === turma.id ? turma : t))
    }));
  };

  const deleteTurma = (id: string) => {
    setState(prev => ({
      ...prev,
      turmas: prev.turmas.filter(t => t.id !== id)
    }));
  };

  // MATERIAS CRUD
  const addMateria = (materiaData: Omit<Materia, 'id'>): Materia => {
    const newMateria: Materia = {
      ...materiaData,
      id: `mat-${Date.now()}`
    };
    setState(prev => ({
      ...prev,
      materias: [...prev.materias, newMateria]
    }));
    return newMateria;
  };

  const updateMateria = (materia: Materia) => {
    setState(prev => ({
      ...prev,
      materias: prev.materias.map(m => (m.id === materia.id ? materia : m))
    }));
  };

  const deleteMateria = (id: string) => {
    setState(prev => ({
      ...prev,
      materias: prev.materias.filter(m => m.id !== id)
    }));
  };

  // INSTRUTORES CRUD
  const addInstrutor = (instrutorData: Omit<Instrutor, 'id'>): Instrutor => {
    const newInstrutor: Instrutor = {
      ...instrutorData,
      id: `inst-${Date.now()}`
    };
    setState(prev => ({
      ...prev,
      instrutores: [...prev.instrutores, newInstrutor]
    }));
    return newInstrutor;
  };

  const updateInstrutor = (instrutor: Instrutor) => {
    setState(prev => ({
      ...prev,
      instrutores: prev.instrutores.map(i => (i.id === instrutor.id ? instrutor : i))
    }));
  };

  const deleteInstrutor = (id: string) => {
    setState(prev => ({
      ...prev,
      instrutores: prev.instrutores.filter(i => i.id !== id)
    }));
  };

  // GESTORES CRUD
  const addGestor = (gestorData: Omit<Gestor, 'id'>): Gestor => {
    const newGestor: Gestor = {
      ...gestorData,
      id: `gestor-${Date.now()}`
    };
    setState(prev => ({
      ...prev,
      gestores: [...prev.gestores, newGestor]
    }));
    return newGestor;
  };

  const updateGestor = (gestor: Gestor) => {
    setState(prev => ({
      ...prev,
      gestores: prev.gestores.map(g => (g.id === gestor.id ? gestor : g))
    }));
  };

  const deleteGestor = (id: string) => {
    setState(prev => ({
      ...prev,
      gestores: prev.gestores.filter(g => g.id !== id)
    }));
  };

  const validateGestorLogin = (loginOrNome: string, senhaInput: string): Gestor | null => {
    const cleanLogin = loginOrNome.trim().toLowerCase();
    const cleanSenha = senhaInput.trim();

    return state.gestores.find(
      g => g.ativo &&
        (g.login.toLowerCase() === cleanLogin || g.nome.toLowerCase() === cleanLogin) &&
        g.senha === cleanSenha
    ) || null;
  };

  // Reset / Backup
  const resetToDefaultData = () => {
    setState(DEFAULT_STATE);
    storageService.saveState(DEFAULT_STATE);
  };

  const exportBackup = () => {
    const dataStr = storageService.exportToJson(state);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qts-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (jsonStr: string) => {
    const imported = storageService.importFromJson(jsonStr);
    setState(imported);
    storageService.saveState(imported);
  };

  // Lookup helpers
  const getTurma = useCallback((id: string) => state.turmas.find(t => t.id === id), [state.turmas]);
  const getMateria = useCallback((id: string) => state.materias.find(m => m.id === id), [state.materias]);
  const getInstrutor = useCallback((id: string) => state.instrutores.find(i => i.id === id), [state.instrutores]);

  return (
    <AppContext.Provider
      value={{
        state,
        turmas: state.turmas,
        materias: state.materias,
        instrutores: state.instrutores,
        aulas: state.aulas,
        gestores: state.gestores,
        sheetsConfig: state.sheetsConfig,

        selectedTurmaId,
        setSelectedTurmaId,
        selectedMateriaId,
        setSelectedMateriaId,
        selectedInstrutorId,
        setSelectedInstrutorId,
        selectedStatus,
        setSelectedStatus,

        isMultiSelectMode,
        setIsMultiSelectMode,
        selectedAulaIds,
        toggleSelectAula,
        selectAllAulas,
        clearSelectedAulas,
        deleteSelectedAulas,

        addAula,
        updateAula,
        deleteAula,
        deleteBulkAulas,
        remanejarAula,
        marcarPrejuizo,
        batchInsertAulas,

        addTurma,
        updateTurma,
        deleteTurma,

        addMateria,
        updateMateria,
        deleteMateria,

        addInstrutor,
        updateInstrutor,
        deleteInstrutor,

        addGestor,
        updateGestor,
        deleteGestor,
        validateGestorLogin,

        syncSheets,
        updateSheetsConfig,
        isSyncing,
        syncError,
        resetToDefaultData,
        exportBackup,
        importBackup,

        getTurma,
        getMateria,
        getInstrutor
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return context;
};
