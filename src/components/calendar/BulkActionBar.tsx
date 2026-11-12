import React from 'react';
import { useApp } from '../../context/AppContext';
import { Trash2, X, CheckSquare, Square } from 'lucide-react';

interface BulkActionBarProps {
  currentAulasIds: string[];
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({ currentAulasIds }) => {
  const {
    isMultiSelectMode,
    setIsMultiSelectMode,
    selectedAulaIds,
    selectAllAulas,
    clearSelectedAulas,
    deleteSelectedAulas
  } = useApp();

  if (!isMultiSelectMode) return null;

  const count = selectedAulaIds.size;
  const allSelected = currentAulasIds.length > 0 && currentAulasIds.every(id => selectedAulaIds.has(id));

  const handleToggleSelectAll = () => {
    if (allSelected) {
      clearSelectedAulas();
    } else {
      selectAllAulas(currentAulasIds);
    }
  };

  const handleDelete = () => {
    if (count === 0) return;
    if (confirm(`Tem certeza que deseja excluir as ${count} aulas selecionadas? Esta ação não pode ser desfeita.`)) {
      deleteSelectedAulas();
    }
  };

  return (
    <div className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 items-center space-x-4 animate-in slide-in-from-bottom-5">
      <div className="flex items-center space-x-2">
        <span className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center">
          {count}
        </span>
        <span className="text-xs sm:text-sm font-medium">
          {count === 1 ? 'aula selecionada' : 'aulas selecionadas'}
        </span>
      </div>

      <div className="h-4 w-px bg-slate-700"></div>

      <button
        onClick={handleToggleSelectAll}
        className="text-xs text-slate-300 hover:text-white flex items-center space-x-1.5 transition-colors"
      >
        {allSelected ? (
          <>
            <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Desmarcar Todas</span>
          </>
        ) : (
          <>
            <Square className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Marcar Todas</span>
          </>
        )}
      </button>

      <button
        disabled={count === 0}
        onClick={handleDelete}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
          count > 0
            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Excluir ({count})</span>
      </button>

      <button
        onClick={() => {
          clearSelectedAulas();
          setIsMultiSelectMode(false);
        }}
        title="Cancelar modo de seleção"
        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

