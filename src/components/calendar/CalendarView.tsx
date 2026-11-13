import React, { useState, useMemo } from 'react';
import { Aula } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { MonthGrid } from './MonthGrid';
import { AgendaView } from './AgendaView';
import { getAulaAssunto } from './ClassCard';
import { AulaFormModal } from './AulaFormModal';
import { AulaDetailsModal } from './AulaDetailsModal';
import { PrejuizoModal } from './PrejuizoModal';
import { BulkActionBar } from './BulkActionBar';
import {
  formatMonthYear,
  formatDateBr,
  formatDayOfWeek,
  addMonths,
  subMonths,
  format
} from '../../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Layers,
  Filter,
  Calendar as CalendarIcon,
  List,
  CheckSquare,
  RotateCcw,
  Trash2,
  X,
  History,
  ArrowLeft,
  CalendarDays,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface CalendarViewProps {
  onGoToGenerator: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onGoToGenerator }) => {
  const {
    aulas,
    turmas,
    materias,
    instrutores,
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
    clearSelectedAulas,
    deleteSelectedAulas,
    getTurma,
    getMateria,
    themePalette
  } = useApp();

  const { canEdit, openLoginModal } = useAuth();

  // Na versão Desktop, a visualização padrão é SEMPRE do calendário inteiro ('mes')
  const [viewMode, setViewMode] = useState<'mes' | 'lista'>('mes');

  // No Mobile, controla se está na página de Histórico do mês inteiro
  const [isMobileHistoryPage, setIsMobileHistoryPage] = useState<boolean>(false);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showFiltersDesktop, setShowFiltersDesktop] = useState(false);

  // Modal de filtro mobile
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempTurmaId, setTempTurmaId] = useState('all');
  const [tempMateriaId, setTempMateriaId] = useState('all');
  const [tempInstrutorId, setTempInstrutorId] = useState('all');
  const [tempStatus, setTempStatus] = useState('all');

  // Estados dos modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [aulaToEdit, setAulaToEdit] = useState<Aula | null>(null);
  const [initialDateForNew, setInitialDateForNew] = useState<string | undefined>(undefined);

  const [selectedAulaForDetails, setSelectedAulaForDetails] = useState<Aula | null>(null);
  const [selectedAulaForPrejuizo, setSelectedAulaForPrejuizo] = useState<Aula | null>(null);

  // Navegação de Datas
  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Abertura de Modais
  const handleOpenNewAula = (dateStr?: string) => {
    if (!canEdit) {
      openLoginModal();
      return;
    }
    setAulaToEdit(null);
    setInitialDateForNew(dateStr || format(new Date(), 'yyyy-MM-dd'));
    setIsFormOpen(true);
  };

  const handleEditAula = (aula: Aula) => {
    setAulaToEdit(aula);
    setIsFormOpen(true);
  };

  const handleOpenPrejuizo = (aula: Aula) => {
    setSelectedAulaForPrejuizo(aula);
  };

  // Abrir modal de filtro mobile
  const openFilterModal = () => {
    setTempTurmaId(selectedTurmaId);
    setTempMateriaId(selectedMateriaId);
    setTempInstrutorId(selectedInstrutorId);
    setTempStatus(selectedStatus);
    setShowFilterModal(true);
  };

  // Aplicar filtros do modal
  const applyFilters = () => {
    setSelectedTurmaId(tempTurmaId);
    setSelectedMateriaId(tempMateriaId);
    setSelectedInstrutorId(tempInstrutorId);
    setSelectedStatus(tempStatus);
    setShowFilterModal(false);
  };

  // Filtragem de Aulas
  const filteredAulas = useMemo(() => {
    return aulas.filter(aula => {
      if (selectedTurmaId !== 'all' && aula.turmaId !== selectedTurmaId) return false;
      if (selectedMateriaId !== 'all' && aula.materiaId !== selectedMateriaId) return false;
      if (selectedInstrutorId !== 'all' && aula.instrutorId !== selectedInstrutorId) return false;
      if (selectedStatus !== 'all' && aula.status !== selectedStatus) return false;
      return true;
    });
  }, [aulas, selectedTurmaId, selectedMateriaId, selectedInstrutorId, selectedStatus]);

  const currentAulasIds = useMemo(() => filteredAulas.map(a => a.id), [filteredAulas]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Aulas de Hoje para o Card no Mobile
  const todayAulas = useMemo(() => {
    return filteredAulas.filter(a => {
      const clean = a.data ? String(a.data).split('T')[0].split(' ')[0].trim() : '';
      return clean === todayStr;
    });
  }, [filteredAulas, todayStr]);

  const hasActiveFilters =
    selectedTurmaId !== 'all' ||
    selectedMateriaId !== 'all' ||
    selectedInstrutorId !== 'all' ||
    selectedStatus !== 'all';

  const clearFilters = () => {
    setSelectedTurmaId('all');
    setSelectedMateriaId('all');
    setSelectedInstrutorId('all');
    setSelectedStatus('all');
  };

  // Handler para deletar selecionados no mobile
  const handleMobileDelete = () => {
    if (selectedAulaIds.size === 0) return;
    if (confirm(`Tem certeza que deseja excluir ${selectedAulaIds.size} aula(s) selecionada(s)? Esta ação não pode ser desfeita.`)) {
      deleteSelectedAulas();
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* =========================================================================
          1. VERSÃO MOBILE: BARRA SUPERIOR FIXA (STICKY) APENAS COM MÊS/ANO E FILTROS
         ========================================================================= */}
      <div className={`md:hidden sticky sticky-below-header z-20 ${themePalette.appBg} pt-1 pb-2 -mx-3 px-3 shadow-[0_6px_12px_-6px_rgba(15,23,42,0.06)] transition-colors duration-200`}>
        {/* Linha de Mês/Ano + Filtro + Histórico + Seleção Múltipla */}
        <div className="flex items-center justify-between bg-white px-2.5 py-2 rounded-2xl border border-slate-200/85 shadow-2xs">
          {isMobileHistoryPage && (
            <button
              onClick={() => setIsMobileHistoryPage(false)}
              className="flex items-center gap-1 px-2 py-1 mr-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors shrink-0"
              title="Voltar para Próximas Aulas"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>
          )}

          {/* Navegação Mês e Ano */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleToday}
              className="text-sm font-bold text-slate-900 capitalize tracking-tight px-1.5"
              title="Ir para o mês atual"
            >
              {formatMonthYear(currentDate)}
            </button>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Ações à Direita: Filtro, Histórico, MultiSelect */}
          <div className="flex items-center space-x-1">
            {/* Botão de Filtro */}
            <button
              onClick={() => {
                if (hasActiveFilters) {
                  clearFilters();
                } else {
                  openFilterModal();
                }
              }}
              className={`p-2 rounded-xl transition-colors relative ${
                hasActiveFilters
                  ? 'text-blue-700 bg-blue-50 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={hasActiveFilters ? 'Limpar Filtros' : 'Abrir Filtros'}
            >
              <Filter className="w-4 h-4" />
              {hasActiveFilters && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
              )}
            </button>

            {/* Botão de Histórico (abre página com o mês inteiro) */}
            <button
              onClick={() => setIsMobileHistoryPage(!isMobileHistoryPage)}
              className={`p-2 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold ${
                isMobileHistoryPage
                  ? 'text-white bg-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={isMobileHistoryPage ? 'Sair do Histórico' : 'Ver Histórico do Mês'}
            >
              <History className="w-4 h-4" />
            </button>

            {/* Botão de Seleção Múltipla */}
            {canEdit && (
              <button
                onClick={() => {
                  if (isMultiSelectMode) {
                    clearSelectedAulas();
                    setIsMultiSelectMode(false);
                  } else {
                    setIsMultiSelectMode(true);
                  }
                }}
                className={`p-2 rounded-xl transition-colors ${
                  isMultiSelectMode
                    ? 'text-white bg-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={isMultiSelectMode ? 'Desativar Seleção' : 'Seleção Múltipla'}
              >
                <CheckSquare className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card de HOJE no Mobile (Rola junto com os demais cards da lista) */}
      <div className="md:hidden">
        {!isMobileHistoryPage ? (
          <div className={`${themePalette.todayCardGradient} text-white rounded-2xl shadow-md border border-white/10 p-3.5 transition-colors duration-200`}>
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-500 text-white px-2 py-0.5 rounded-md">
                      HOJE
                    </span>
                    <span className="text-xs text-slate-300 capitalize font-medium">
                      {formatDayOfWeek(todayStr)}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold tracking-tight mt-0.5">
                    {formatDateBr(todayStr)}
                  </h2>
                </div>
              </div>

              {canEdit && (
                <button
                  onClick={() => handleOpenNewAula(todayStr)}
                  className="flex items-center space-x-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] font-semibold transition-all border border-white/15 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Aula</span>
                </button>
              )}
            </div>

            {/* Cards das Aulas de Hoje */}
            <div className="mt-2.5 max-h-40 overflow-y-auto space-y-2 pr-0.5">
              {todayAulas.length === 0 ? (
                <div className="p-2.5 bg-white/[0.06] rounded-xl text-center text-xs text-slate-300 flex items-center justify-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Nenhuma aula programada para hoje.</span>
                </div>
              ) : (
                todayAulas.map(aula => {
                  const turma = getTurma(aula.turmaId);
                  const materia = getMateria(aula.materiaId);
                  const isPrejudicada = aula.status === 'prejudicada';
                  const isRealizada = aula.status === 'realizada';
                  const assunto = getAulaAssunto(aula, materia?.descricao);
                  const turmaColor = turma?.cor || '#2563eb';

                  return (
                    <div
                      key={aula.id}
                      onClick={() => setSelectedAulaForDetails(aula)}
                      className="p-2.5 rounded-xl bg-white text-slate-900 shadow-xs cursor-pointer transition-all border-l-4 text-left"
                      style={{ borderLeftColor: isPrejudicada ? '#f59e0b' : materia?.cor || '#2563eb' }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                          style={{
                            backgroundColor: `${turmaColor}14`,
                            color: turmaColor,
                            border: `1px solid ${turmaColor}30`
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: turmaColor }} />
                          <span>{turma?.sigla || 'TURMA'}</span>
                        </span>
                        {isPrejudicada ? (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                            Prejuízo
                          </span>
                        ) : isRealizada ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            Concluída
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-blue-600" />
                            Hoje
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-xs text-slate-900 leading-snug line-clamp-1">
                        {materia?.nome || 'Matéria'}
                      </div>
                      {assunto && (
                        <div className="text-[11px] text-slate-500 font-normal leading-tight line-clamp-2 mt-0.5">
                          {assunto}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-2xl shadow-2xs flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <History className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-xs font-bold block">Histórico Mensal Completo</span>
                <span className="text-[11px] text-slate-400 capitalize">{formatMonthYear(currentDate)}</span>
              </div>
            </div>
            <span className="text-[10px] bg-white/10 border border-white/15 px-2 py-0.5 rounded-md font-semibold">
              Mês Inteiro
            </span>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL DE FILTRO MOBILE (sobreposição)
         ========================================================================= */}
      {showFilterModal && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowFilterModal(false)}
          />
          {/* Modal Bottom Sheet */}
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl p-5 pb-8 animate-in slide-in-from-bottom duration-300 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                Filtros
              </h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Turma</label>
                <select
                  value={tempTurmaId}
                  onChange={e => setTempTurmaId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                >
                  <option value="all">Todas as Turmas</option>
                  {turmas.map(t => (
                    <option key={t.id} value={t.id}>{t.sigla} - {t.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Matéria</label>
                <select
                  value={tempMateriaId}
                  onChange={e => setTempMateriaId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                >
                  <option value="all">Todas as Matérias</option>
                  {materias.map(m => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Instrutor</label>
                <select
                  value={tempInstrutorId}
                  onChange={e => setTempInstrutorId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                >
                  <option value="all">Todos os Instrutores</option>
                  {instrutores.map(i => (
                    <option key={i.id} value={i.id}>{i.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                <select
                  value={tempStatus}
                  onChange={e => setTempStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                >
                  <option value="all">Todos os Status</option>
                  <option value="agendada">Agendadas</option>
                  <option value="realizada">Realizadas</option>
                  <option value="prejudicada">Prejudicadas</option>
                  <option value="remanejada">Remanejadas</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. VERSÃO DESKTOP: BARRA DE COMANDO EXECUTIVA (Estilo Notion Calendar / Linear)
         ========================================================================= */}
      <div className="hidden md:flex bg-white rounded-2xl border border-slate-200/85 shadow-[0_1px_3px_rgba(15,23,42,0.04)] px-4 py-3 items-center justify-between gap-4">
        {/* Navegação de Data e Título do Mês */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-100/80 p-0.5 rounded-xl border border-slate-200/70">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleToday}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white transition-all"
            >
              Hoje
            </button>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
              title="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h1 className="text-lg font-extrabold text-slate-900 capitalize tracking-tight">
            {formatMonthYear(currentDate)}
          </h1>
        </div>

        {/* Controles Desktop */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Alternador de Visão no Desktop */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setViewMode('mes')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'mes'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Grade</span>
            </button>

            <button
              onClick={() => setViewMode('lista')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'lista'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>

          {/* Toggle de Filtros Desktop */}
          <button
            onClick={() => setShowFiltersDesktop(!showFiltersDesktop)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
              hasActiveFilters || showFiltersDesktop
                ? 'border-blue-600/30 bg-blue-50/80 text-blue-700'
                : 'border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            )}
          </button>

          {/* Modo Seleção Múltipla Desktop */}
          {canEdit && (
            <button
              onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isMultiSelectMode
                  ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                  : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Selecionar</span>
            </button>
          )}

          {/* Gerador de Período Desktop */}
          {canEdit && (
            <button
              onClick={onGoToGenerator}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200/80 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span>Gerar Período</span>
            </button>
          )}

          {/* Inserir Aula Desktop */}
          {canEdit && (
            <button
              onClick={() => handleOpenNewAula()}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Aula</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de Filtros Desktop */}
      {showFiltersDesktop && (
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200/85 shadow-2xs p-3.5 animate-in fade-in">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filtrar por:</span>
            </div>

            <select
              value={selectedTurmaId}
              onChange={e => setSelectedTurmaId(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
            >
              <option value="all">Todas as Turmas</option>
              {turmas.map(t => (
                <option key={t.id} value={t.id}>{t.sigla} - {t.nome}</option>
              ))}
            </select>

            <select
              value={selectedMateriaId}
              onChange={e => setSelectedMateriaId(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
            >
              <option value="all">Todas as Matérias</option>
              {materias.map(m => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>

            <select
              value={selectedInstrutorId}
              onChange={e => setSelectedInstrutorId(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
            >
              <option value="all">Todos os Instrutores</option>
              {instrutores.map(i => (
                <option key={i.id} value={i.id}>{i.nome}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
            >
              <option value="all">Todos os Status</option>
              <option value="agendada">Agendadas</option>
              <option value="realizada">Realizadas</option>
              <option value="prejudicada">Prejudicadas</option>
              <option value="remanejada">Remanejadas</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center space-x-1 py-1 px-2 rounded-lg hover:bg-rose-50 transition-colors ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          CONTEÚDO PRINCIPAL (Abaixo do bloco sticky no mobile)
         ========================================================================= */}
      <div className="md:hidden">
        <AgendaView
          aulas={filteredAulas}
          onSelectAula={aula => setSelectedAulaForDetails(aula)}
          onAddAulaOnDate={dateStr => handleOpenNewAula(dateStr)}
          hideTodayCard={true}
          mode={isMobileHistoryPage ? 'month-history' : 'upcoming'}
          currentDate={currentDate}
        />
      </div>

      <div className="hidden md:block">
        {viewMode === 'mes' ? (
          <MonthGrid
            currentDate={currentDate}
            aulas={filteredAulas}
            onSelectAula={aula => setSelectedAulaForDetails(aula)}
            onAddAulaOnDate={dateStr => handleOpenNewAula(dateStr)}
          />
        ) : (
          <AgendaView
            aulas={filteredAulas}
            onSelectAula={aula => setSelectedAulaForDetails(aula)}
            onAddAulaOnDate={dateStr => handleOpenNewAula(dateStr)}
            mode="month-history"
            currentDate={currentDate}
          />
        )}
      </div>

      {/* =========================================================================
          BOTÕES FLUTUANTES (FAB) NO MOBILE (Lado Direito, acima do Menu Inferior)
         ========================================================================= */}
      {isMultiSelectMode && selectedAulaIds.size > 0 && (
        <button
          onClick={handleMobileDelete}
          className="md:hidden fixed right-20 z-40 w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-white/20 focus:outline-none animate-in zoom-in duration-200 fab-above-bottom-nav"
          title={`Excluir ${selectedAulaIds.size} aula(s)`}
          aria-label="Excluir selecionadas"
        >
          <Trash2 className="w-6 h-6 stroke-[2.2]" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-rose-700 rounded-full text-[10px] font-black flex items-center justify-center shadow-sm border border-rose-200">
            {selectedAulaIds.size}
          </span>
        </button>
      )}

      {/* Botão FAB Inserir Aula (+) no canto inferior direito */}
      {canEdit && (
        <button
          onClick={() => handleOpenNewAula()}
          className="md:hidden fixed right-4 z-40 w-14 h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-white/15 focus:outline-none fab-above-bottom-nav"
          title="Inserir Nova Aula"
          aria-label="Inserir Nova Aula"
        >
          <Plus className="w-7 h-7 stroke-[2.2]" />
        </button>
      )}

      {/* Barra de Ações em Lote (Somente Desktop) */}
      <BulkActionBar currentAulasIds={currentAulasIds} />

      {/* Modais */}
      <AulaFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        aulaToEdit={aulaToEdit}
        initialDate={initialDateForNew}
      />

      <AulaDetailsModal
        isOpen={!!selectedAulaForDetails}
        onClose={() => setSelectedAulaForDetails(null)}
        aula={selectedAulaForDetails}
        onEdit={aula => handleEditAula(aula)}
        onOpenPrejuizo={aula => handleOpenPrejuizo(aula)}
      />

      <PrejuizoModal
        isOpen={!!selectedAulaForPrejuizo}
        onClose={() => setSelectedAulaForPrejuizo(null)}
        aula={selectedAulaForPrejuizo}
      />
    </div>
  );
};
