import React from 'react';
import { Aula } from '../../types';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, ArrowRightLeft, CheckCircle2, Check } from 'lucide-react';

interface ClassCardProps {
  aula: Aula;
  onClick: () => void;
  compact?: boolean;
}

export const ClassCard: React.FC<ClassCardProps> = ({ aula, onClick, compact = false }) => {
  const { getTurma, getMateria, getInstrutor, isMultiSelectMode, selectedAulaIds, toggleSelectAula } = useApp();

  const turma = getTurma(aula.turmaId);
  const materia = getMateria(aula.materiaId);
  const instrutor = getInstrutor(aula.instrutorId);

  const isSelected = selectedAulaIds.has(aula.id);
  const isPrejudicada = aula.status === 'prejudicada';
  const isRealizada = aula.status === 'realizada';
  const isRemanejada = aula.status === 'remanejada';

  const handleClick = (e: React.MouseEvent) => {
    if (isMultiSelectMode) {
      e.stopPropagation();
      toggleSelectAula(aula.id);
    } else {
      onClick();
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSelectAula(aula.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative rounded-lg p-2 text-left transition-all cursor-pointer border select-none ${
        isSelected
          ? 'ring-2 ring-blue-600 bg-blue-50/90 border-blue-400'
          : isPrejudicada
          ? 'bg-amber-50/90 border-amber-300 hover:border-amber-400 shadow-xs'
          : isRealizada
          ? 'bg-slate-50/90 border-slate-200 hover:border-slate-300 opacity-90'
          : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
      }`}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: isPrejudicada ? '#f59e0b' : materia?.cor || '#3b82f6'
      }}
    >
      {/* Checkbox quando em modo de seleção múltipla */}
      {isMultiSelectMode && (
        <div
          onClick={handleCheckboxClick}
          className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-sm border flex items-center justify-center transition-colors z-10 ${
            isSelected
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-slate-300 bg-white hover:border-blue-400'
          }`}
        >
          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      )}

      {/* Top Header: Turma e Status Icon */}
      <div className="flex items-center justify-between gap-1 mb-1 pr-4">
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm truncate max-w-[90px]"
          style={{
            backgroundColor: `${turma?.cor || '#2563eb'}18`,
            color: turma?.cor || '#2563eb'
          }}
        >
          {turma?.sigla || 'TURMA'}
        </span>

        {isPrejudicada ? (
          <span className="flex items-center text-[10px] text-amber-700 font-bold bg-amber-100 px-1 rounded" title={aula.motivoPrejuizo || 'Aula com Prejuízo'}>
            <AlertTriangle className="w-3 h-3 mr-0.5" />
            Prej.
          </span>
        ) : isRealizada ? (
          <span title="Aula Realizada" className="flex items-center">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
          </span>
        ) : isRemanejada ? (
          <span title="Remanejada" className="flex items-center">
            <ArrowRightLeft className="w-3 h-3 text-purple-600 shrink-0" />
          </span>
        ) : null}
      </div>

      {/* Nome da Matéria */}
      <div className="font-semibold text-xs text-slate-900 truncate leading-tight">
        {materia?.nome || 'Matéria'}
      </div>

      {/* Nome do Instrutor & Turno */}
      {!compact && (
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
          <span className="truncate max-w-[110px]" title={instrutor?.nome}>
            {instrutor?.nome || 'Sem instrutor'}
          </span>
          <span className="text-[10px] bg-slate-100 px-1 rounded text-slate-600">
            {aula.turno}
          </span>
        </div>
      )}
    </div>
  );
};
