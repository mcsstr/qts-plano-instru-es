import React from 'react';
import { Aula } from '../../types';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, ArrowRightLeft, CheckCircle2, Check, User, Clock } from 'lucide-react';

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
      className={`group relative rounded-xl p-2.5 sm:p-3 text-left transition-all cursor-pointer border select-none ${
        isSelected
          ? 'ring-2 ring-blue-600 bg-blue-50/95 border-blue-500 shadow-sm'
          : isPrejudicada
          ? 'bg-amber-50/95 border-amber-300 hover:border-amber-400 shadow-sm hover:shadow-md'
          : isRealizada
          ? 'bg-slate-50 border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs'
          : 'bg-white border-slate-200/90 hover:border-blue-400 shadow-2xs hover:shadow-md'
      }`}
      style={{
        borderLeftWidth: '5px',
        borderLeftColor: isPrejudicada ? '#f59e0b' : materia?.cor || '#3b82f6'
      }}
    >
      {/* Checkbox quando em modo de seleção múltipla */}
      {isMultiSelectMode && (
        <div
          onClick={handleCheckboxClick}
          className={`absolute top-2 right-2 w-5 h-5 rounded-md border flex items-center justify-center transition-colors z-10 ${
            isSelected
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-slate-300 bg-white hover:border-blue-500'
          }`}
        >
          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </div>
      )}

      {/* Linha Superior: Turma Badge e Status */}
      <div className="flex items-center justify-between gap-1 mb-1.5 pr-4">
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-md truncate max-w-[120px] shadow-2xs"
          style={{
            backgroundColor: `${turma?.cor || '#2563eb'}20`,
            color: turma?.cor || '#2563eb'
          }}
        >
          {turma?.sigla || 'TURMA'}
        </span>

        {isPrejudicada ? (
          <span
            className="flex items-center text-[10px] text-amber-800 font-bold bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse"
            title={aula.motivoPrejuizo || 'Aula com Prejuízo Registrado'}
          >
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-700 shrink-0" />
            Prejuízo
          </span>
        ) : isRealizada ? (
          <span
            className="flex items-center text-[10px] text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full"
            title="Aula Realizada"
          >
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600 shrink-0" />
            Concluída
          </span>
        ) : isRemanejada ? (
          <span
            className="flex items-center text-[10px] text-purple-800 font-semibold bg-purple-100 px-2 py-0.5 rounded-full"
            title="Aula Remanejada"
          >
            <ArrowRightLeft className="w-3 h-3 mr-1 text-purple-600 shrink-0" />
            Remanejada
          </span>
        ) : null}
      </div>

      {/* Nome da Matéria com tipografia muito mais visível */}
      <div className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2 mb-1.5">
        {materia?.nome || 'Matéria'}
      </div>

      {/* Instrutor e Horário / Turno */}
      {!compact ? (
        <div className="pt-1.5 border-t border-slate-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-600">
          <span className="flex items-center gap-1 font-medium truncate max-w-[140px]" title={instrutor?.nome}>
            <User className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{instrutor?.nome || 'Sem instrutor'}</span>
          </span>

          <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded-md self-start sm:self-auto shrink-0">
            <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
            <span>{aula.turno}</span>
          </span>
        </div>
      ) : (
        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
          <User className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{instrutor?.nome || 'Sem instrutor'}</span>
        </div>
      )}
    </div>
  );
};
