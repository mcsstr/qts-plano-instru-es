import React from 'react';
import { Aula } from '../../types';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, ArrowRightLeft, CheckCircle2, Check } from 'lucide-react';

interface ClassCardProps {
  aula: Aula;
  onClick: () => void;
  compact?: boolean;
  /** Quando há apenas 1 aula no dia na grade, aproveita melhor a altura da célula */
  singleInDay?: boolean;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  aula,
  onClick,
  compact = false,
  singleInDay = false
}) => {
  const { getTurma, getMateria, isMultiSelectMode, selectedAulaIds, toggleSelectAula } = useApp();

  const turma = getTurma(aula.turmaId);
  const materia = getMateria(aula.materiaId);

  const isSelected = selectedAulaIds.has(aula.id);
  const isPrejudicada = aula.status === 'prejudicada';
  const isRealizada = aula.status === 'realizada';
  const isRemanejada = aula.status === 'remanejada';

  const materiaColor = materia?.cor || '#3b82f6';
  const turmaColor = turma?.cor || '#2563eb';

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
      className={`group relative rounded-lg ${
        compact
          ? singleInDay
            ? 'p-2 flex flex-col justify-between grow'
            : 'px-1.5 py-1'
          : 'p-2.5 sm:p-3 rounded-xl'
      } text-left transition-all cursor-pointer border select-none hover:scale-[1.01] ${
        isSelected
          ? 'ring-2 ring-blue-600 bg-blue-100/90 border-blue-500 shadow-xs'
          : isPrejudicada
          ? 'bg-amber-100/90 border-amber-400 hover:border-amber-500 shadow-xs'
          : 'shadow-2xs hover:shadow-sm'
      }`}
      style={{
        borderLeftWidth: compact ? '4px' : '5px',
        borderLeftColor: isPrejudicada ? '#f59e0b' : materiaColor,
        backgroundColor: isSelected
          ? undefined
          : isPrejudicada
          ? undefined
          : `${materiaColor}14`,
        borderColor: isSelected || isPrejudicada ? undefined : `${materiaColor}40`
      }}
    >
      {/* Checkbox quando em modo de seleção múltipla */}
      {isMultiSelectMode && (
        <div
          onClick={handleCheckboxClick}
          className={`absolute top-1 right-1 w-4 h-4 rounded border flex items-center justify-center transition-colors z-10 ${
            isSelected
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-slate-300 bg-white hover:border-blue-500'
          }`}
        >
          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      )}

      {/* Linha Superior: Turma Badge Colorido e Status */}
      <div className={`flex items-center justify-between gap-1 ${compact ? (singleInDay ? 'mb-1' : 'mb-0.5') : 'mb-1.5'} ${isMultiSelectMode ? 'pr-4' : ''}`}>
        <span
          className={`${compact ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'} font-extrabold rounded shrink-0 tracking-tight leading-none text-white shadow-2xs`}
          style={{
            backgroundColor: turmaColor
          }}
        >
          {turma?.sigla || 'TURMA'}
        </span>

        {isPrejudicada ? (
          <span
            className="flex items-center text-[9px] text-amber-900 font-bold bg-amber-300/90 px-1.5 py-0.5 rounded-full border border-amber-400 shrink-0 leading-none"
            title={aula.motivoPrejuizo || 'Aula com Prejuízo Registrado'}
          >
            <AlertTriangle className="w-2.5 h-2.5 mr-0.5 text-amber-800 shrink-0" />
            <span>Prejuízo</span>
          </span>
        ) : isRealizada ? (
          <span
            className="flex items-center text-[9px] text-emerald-800 font-bold bg-emerald-200/90 px-1.5 py-0.5 rounded-full shrink-0 leading-none"
            title="Aula Realizada"
          >
            <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 text-emerald-700 shrink-0" />
            <span>{compact ? 'OK' : 'Concluída'}</span>
          </span>
        ) : isRemanejada ? (
          <span
            className="flex items-center text-[9px] text-purple-800 font-bold bg-purple-200/90 px-1.5 py-0.5 rounded-full shrink-0 leading-none"
            title="Aula Remanejada"
          >
            <ArrowRightLeft className="w-2.5 h-2.5 mr-0.5 text-purple-700 shrink-0" />
            <span>Remanej.</span>
          </span>
        ) : null}
      </div>

      {/* Nome da Matéria */}
      <div
        className={`font-bold text-slate-900 ${
          compact
            ? singleInDay
              ? 'text-xs leading-snug line-clamp-2'
              : 'text-[10.5px] leading-tight line-clamp-1'
            : 'text-xs sm:text-sm leading-snug line-clamp-2'
        }`}
        title={materia?.nome}
      >
        {materia?.nome || 'Matéria'}
      </div>
    </div>
  );
};
