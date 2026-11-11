import React, { useState, useMemo, useEffect } from 'react';
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

  const { canEdit } = useAuth();

  // No mobile, inicia automaticamente em 'lista' para garantir visual perfeito e não espremido
  const [viewMode, setViewMode] = useState<'mes' | 'lista'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'lista';
    }
    return 'mes';
  });

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

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
    <div className="space-y-4">
      {/* Top Bar: Navegação de Mês, Modos de Visão e Ações */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Navegação de Data */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-start">
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

          <h1 className="text-base sm:text-lg font-bold text-slate-900 capitalize tracking-tight ml-2">
            {formatMonthYear(currentDate)}
          </h1>
        </div>

        {/* Controles e Ações */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
          {/* Alternador de Visão (Mês / Lista) */}
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
              <span>Lista {viewMode === 'lista' ? '• Dia a Dia' : ''}</span>
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

          {/* Botão de Filtro Mobile */}
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className={`md:hidden flex items-center space-x-1 px-3 py-1.5 rounded-xl border text-xs font-medium ${
              hasActiveFilters
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-slate-200 text-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros</span>
          </button>

          {/* Modo Seleção Múltipla (somente para gestor) */}
          {canEdit && (
            <button
              onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isMultiSelectMode
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Permite selecionar várias aulas para exclusão em lote"
            >
              <CheckSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Seleção Múltipla</span>
            </button>
          )}

          {/* Gerador de Período Shortcut (Gestor) */}
          {canEdit && (
            <button
              onClick={onGoToGenerator}
              className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition-colors"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Gerar Período</span>
            </button>
          )}

          {/* Inserir Aula (Gestor) */}
          {canEdit && (
            <button
              onClick={() => handleOpenNewAula()}
              className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Inserir Aula</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de Filtros (Responsiva: Sempre visível no Desktop, colapsável no Mobile) */}
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 ${
        showFiltersMobile ? 'block' : 'hidden md:block'
      }`}>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filtrar:</span>
          </div>

          {/* Filtro Turma */}
          <select
            value={selectedTurmaId}
            onChange={e => setSelectedTurmaId(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as Turmas</option>
            {turmas.map(t => (
              <option key={t.id} value={t.id}>
                {t.sigla} - {t.nome}
              </option>
            ))}
          </select>

          {/* Filtro Matéria */}
          <select
            value={selectedMateriaId}
            onChange={e => setSelectedMateriaId(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as Matérias</option>
            {materias.map(m => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>

          {/* Filtro Instrutor */}
          <select
            value={selectedInstrutorId}
            onChange={e => setSelectedInstrutorId(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Instrutores</option>
            {instrutores.map(i => (
              <option key={i.id} value={i.id}>
                {i.nome}
              </option>
            ))}
          </select>

          {/* Filtro Status */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Conteúdo do Calendário (Grade Mensal ou Lista PWA) */}
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

      {/* Barra de Ações em Lote (Fixada quando seleção múltipla está ativa) */}
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
