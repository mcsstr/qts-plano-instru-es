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
      className={`group relative rounded-xl ${
        compact ? 'p-1.5 sm:p-2' : 'p-2.5 sm:p-3'
      } text-left transition-all cursor-pointer border select-none ${
        isSelected
          ? 'ring-2 ring-blue-600 bg-blue-50/95 border-blue-500 shadow-xs'
          : isPrejudicada
          ? 'bg-amber-50/95 border-amber-300 hover:border-amber-400 shadow-2xs hover:shadow-xs'
          : isRealizada
          ? 'bg-slate-50 border-slate-200/90 hover:border-slate-300 shadow-2xs'
          : 'bg-white border-slate-200/90 hover:border-blue-400 shadow-2xs hover:shadow-xs'
      }`}
      style={{
        borderLeftWidth: compact ? '4px' : '5px',
        borderLeftColor: isPrejudicada ? '#f59e0b' : materia?.cor || '#3b82f6'
      }}
    >
      {/* Checkbox quando em modo de seleção múltipla */}
      {isMultiSelectMode && (
        <div
          onClick={handleCheckboxClick}
          className={`absolute top-1.5 right-1.5 w-4 h-4 rounded border flex items-center justify-center transition-colors z-10 ${
            isSelected
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-slate-300 bg-white hover:border-blue-500'
          }`}
        >
          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      )}

      {/* Linha Superior: Turma Badge e Status (sem truncar a sigla da turma) */}
      <div className={`flex items-center justify-between gap-1 ${compact ? 'mb-1' : 'mb-1.5'} ${isMultiSelectMode ? 'pr-4' : ''}`}>
        <span
          className={`${compact ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'} font-extrabold rounded shrink-0 tracking-tight`}
          style={{
            backgroundColor: `${turma?.cor || '#2563eb'}18`,
            color: turma?.cor || '#2563eb'
          }}
        >
          {turma?.sigla || 'TURMA'}
        </span>

        {isPrejudicada ? (
          <span
            className="flex items-center text-[9px] text-amber-800 font-bold bg-amber-200/80 px-1.5 py-0.5 rounded-full border border-amber-300 shrink-0"
            title={aula.motivoPrejuizo || 'Aula com Prejuízo Registrado'}
          >
            <AlertTriangle className="w-2.5 h-2.5 mr-0.5 text-amber-700 shrink-0" />
            <span>Prejuízo</span>
          </span>
        ) : isRealizada ? (
          <span
            className="flex items-center text-[9px] text-emerald-800 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0"
            title="Aula Realizada"
          >
            <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 text-emerald-600 shrink-0" />
            <span>{compact ? 'OK' : 'Concluída'}</span>
          </span>
        ) : isRemanejada ? (
          <span
            className="flex items-center text-[9px] text-purple-800 font-semibold bg-purple-100 px-1.5 py-0.5 rounded-full shrink-0"
            title="Aula Remanejada"
          >
            <ArrowRightLeft className="w-2.5 h-2.5 mr-0.5 text-purple-600 shrink-0" />
            <span>Remanej.</span>
          </span>
        ) : null}
      </div>

      {/* Nome da Matéria com fonte menor para mostrar mais conteúdo */}
      <div
        className={`font-bold text-slate-900 ${
          compact
            ? 'text-[11px] leading-[1.25] line-clamp-2 mb-1'
            : 'text-xs sm:text-sm leading-snug line-clamp-2 mb-1.5'
        }`}
        title={materia?.nome}
      >
        {materia?.nome || 'Matéria'}
      </div>

      {/* Instrutor e Horário / Turno */}
      <div
        className={`pt-1 border-t border-slate-100 flex items-center justify-between gap-1 ${
          compact ? 'text-[10px]' : 'text-[11px]'
        } text-slate-600`}
      >
        <span className="flex items-center gap-0.5 font-medium truncate" title={instrutor?.nome}>
          <User className="w-2.5 h-2.5 text-slate-400 shrink-0" />
          <span className="truncate">{instrutor?.nome || 'Sem instrutor'}</span>
        </span>

        <span className="flex items-center gap-0.5 text-[9px] text-slate-500 font-medium bg-slate-100 px-1 py-0.5 rounded shrink-0">
          <Clock className="w-2 h-2 text-slate-400 shrink-0" />
          <span>{aula.turno}</span>
        </span>
      </div>
    </div>
  );
};
