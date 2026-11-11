import React, { useState, useMemo } from 'react';
import { Aula } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { MonthGrid } from './MonthGrid';
import { AgendaView } from './AgendaView';
import { AulaFormModal } from './AulaFormModal';
import { AulaDetailsModal } from './AulaDetailsModal';
import { PrejuizoModal } from './PrejuizoModal';
import { BulkActionBar } from './BulkActionBar';
import {
  formatMonthYear,
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
  RotateCcw
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
    setIsMultiSelectMode
  } = useApp();

  const { canEdit, openLoginModal } = useAuth();

  // No mobile, o modo de visualização é SEMPRE lista
  const [viewMode, setViewMode] = useState<'mes' | 'lista'>('lista');

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showFiltersDesktop, setShowFiltersDesktop] = useState(false);

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

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* =========================================================================
          1. VERSÃO MOBILE: BARRA ULTRA COMPACTA (APENAS MUDAR MÊS E ANO)
         ========================================================================= */}
      <div className="md:hidden flex items-center justify-between bg-white px-3 py-2 rounded-2xl border border-slate-200/90 shadow-2xs">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Mês Anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <h1 className="text-sm font-bold text-slate-900 capitalize tracking-tight">
            {formatMonthYear(currentDate)}
          </h1>
          <button
            onClick={handleToday}
            className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200"
          >
            Hoje
          </button>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Próximo Mês"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Alerta de Filtro Ativo no Mobile (com botão para limpar) */}
      {hasActiveFilters && (
        <div className="md:hidden flex items-center justify-between px-3 py-1.5 bg-blue-50 text-blue-800 text-[11px] rounded-xl border border-blue-200 animate-in fade-in">
          <span className="font-medium">Filtro aplicado às aulas</span>
          <button
            onClick={clearFilters}
            className="font-bold underline text-blue-900 hover:text-blue-950"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {/* =========================================================================
          2. VERSÃO DESKTOP: CONTROLES COMPLETOS (Mês, Grade, Filtros, Inserir)
         ========================================================================= */}
      <div className="hidden md:flex bg-white rounded-2xl border border-slate-200 shadow-xs p-4 items-center justify-between gap-4">
        {/* Navegação de Data */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Hoje
            </button>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Próximo Mês"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <h1 className="text-lg font-bold text-slate-900 capitalize tracking-tight ml-2">
            {formatMonthYear(currentDate)}
          </h1>
        </div>

        {/* Controles Desktop */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Alternador de Visão no Desktop */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('lista')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'lista'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>

            <button
              onClick={() => setViewMode('mes')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'mes'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Grade Mês</span>
            </button>
          </div>

          {/* Toggle de Filtros Desktop */}
          <button
            onClick={() => setShowFiltersDesktop(!showFiltersDesktop)}
            className={`flex items-center space-x-1 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
              hasActiveFilters || showFiltersDesktop
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros</span>
          </button>

          {/* Modo Seleção Múltipla Desktop */}
          {canEdit && (
            <button
              onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isMultiSelectMode
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Seleção Múltipla</span>
            </button>
          )}

          {/* Gerador de Período Desktop */}
          {canEdit && (
            <button
              onClick={onGoToGenerator}
              className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition-colors"
            >
              <Layers className="w-4 h-4" />
              <span>Gerar Período</span>
            </button>
          )}

          {/* Inserir Aula Desktop */}
          {canEdit && (
            <button
              onClick={() => handleOpenNewAula()}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Inserir Aula</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de Filtros Desktop */}
      {showFiltersDesktop && (
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 animate-in fade-in">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filtrar por:</span>
            </div>

            <select
              value={selectedTurmaId}
              onChange={e => setSelectedTurmaId(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
            >
              <option value="all">Todas as Turmas</option>
              {turmas.map(t => (
                <option key={t.id} value={t.id}>{t.sigla} - {t.nome}</option>
              ))}
            </select>

            <select
              value={selectedMateriaId}
              onChange={e => setSelectedMateriaId(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
            >
              <option value="all">Todas as Matérias</option>
              {materias.map(m => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>

            <select
              value={selectedInstrutorId}
              onChange={e => setSelectedInstrutorId(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
            >
              <option value="all">Todos os Instrutores</option>
              {instrutores.map(i => (
                <option key={i.id} value={i.id}>{i.nome}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
            >
              <option value="all">Todos os Status</option>
              <option value="agendada">📅 Agendadas</option>
              <option value="realizada">✅ Realizadas</option>
              <option value="prejudicada">⚠️ Prejudicadas</option>
              <option value="remanejada">🔄 Remanejadas</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center space-x-1 py-1 px-2 rounded-lg hover:bg-rose-50 transition-colors ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo: No mobile é SEMPRE Lista (AgendaView); no Desktop respeita viewMode */}
      <div className="md:hidden">
        <AgendaView
          aulas={filteredAulas}
          onSelectAula={aula => setSelectedAulaForDetails(aula)}
          onAddAulaOnDate={dateStr => handleOpenNewAula(dateStr)}
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
          />
        )}
      </div>

      {/* =========================================================================
          BOTÃO FLUTUANTE PREMIUM (FAB) NO MOBILE
          Inspirado em apps premium (Google Calendar / Material Design 3)
         ========================================================================= */}
      <button
        onClick={() => handleOpenNewAula()}
        className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-2 border-white/40 focus:outline-none"
        title="Inserir Nova Aula"
        aria-label="Inserir Nova Aula"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Barra de Ações em Lote */}
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
