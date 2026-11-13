import React from 'react';
import { Aula } from '../../types';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, ArrowRightLeft, CheckCircle2, Check, User } from 'lucide-react';

interface ClassCardProps {
  aula: Aula;
  onClick: () => void;
  compact?: boolean;
  /** Quando há apenas 1 aula no dia na grade, aproveita melhor a altura da célula */
  singleInDay?: boolean;
}

/**
 * Extrai o assunto/conteúdo limpo da aula (removendo anotações automáticas de prejuízo/reposição)
 * ou utiliza a descrição/ementa da matéria caso a aula não tenha assunto específico preenchido.
 */
export function getAulaAssunto(aula: Aula, materiaDescricao?: string): string {
  if (aula.observacoes) {
    const cleaned = aula.observacoes
      .replace(/\s*\|\s*Prejuízo registrado:.*$/i, '')
      .replace(/\s*\|\s*Remanejada para.*$/i, '')
      .replace(/^Prejuízo registrado:.*$/i, '')
      .replace(/^Remanejada para.*$/i, '')
      .replace(/^Aula de reposição referente.*$/i, '')
      .replace(/^Gerado via Rodízio Automático$/i, '')
      .replace(/^Inserção por Dias Específicos do Mês$/i, '')
      .trim();
    if (cleaned) return cleaned;
  }
  return materiaDescricao?.trim() || '';
}

export const ClassCard: React.FC<ClassCardProps> = ({
  aula,
  onClick,
  compact = false,
  singleInDay = false
}) => {
  const { getTurma, getMateria, getInstrutor, isMultiSelectMode, selectedAulaIds, toggleSelectAula } = useApp();

  const turma = getTurma(aula.turmaId);
  const materia = getMateria(aula.materiaId);
  const instrutor = getInstrutor(aula.instrutorId);

  const isSelected = selectedAulaIds.has(aula.id);
  const isPrejudicada = aula.status === 'prejudicada';
  const isRealizada = aula.status === 'realizada';
  const isRemanejada = aula.status === 'remanejada';

  const materiaColor = materia?.cor || '#3b82f6';
  const turmaColor = turma?.cor || '#2563eb';
  const assunto = getAulaAssunto(aula, materia?.descricao);

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
      className={`group relative overflow-hidden ${
        compact
          ? singleInDay
            ? 'p-2.5 rounded-xl flex flex-col justify-between grow'
            : 'px-2 py-1.5 rounded-lg'
          : 'p-3 sm:p-3.5 rounded-xl'
      } text-left transition-all duration-150 cursor-pointer border select-none ${
        isSelected
          ? 'ring-2 ring-blue-600 bg-blue-50/95 border-blue-500 shadow-xs'
          : isPrejudicada
          ? 'bg-amber-50/90 border-amber-300/90 hover:border-amber-400 shadow-2xs'
          : 'bg-white hover:bg-slate-50/80 border-slate-200/85 hover:border-slate-300/90 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_12px_-2px_rgba(15,23,42,0.08)]'
      }`}
      style={{
        borderLeftWidth: compact ? '3.5px' : '4px',
        borderLeftColor: isPrejudicada ? '#f59e0b' : materiaColor
      }}
    >
      {/* Checkbox quando em modo de seleção múltipla */}
      {isMultiSelectMode && (
        <div
          onClick={handleCheckboxClick}
          className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-md border flex items-center justify-center transition-colors z-10 ${
            isSelected
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-slate-300 bg-white hover:border-blue-500'
          }`}
        >
          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
        </div>
      )}

      {/* Topo do Card: Pill da Turma + Status */}
      <div
        className={`flex items-center justify-between gap-1 ${
          compact ? (singleInDay ? 'mb-1.5' : 'mb-1') : 'mb-2'
        } ${isMultiSelectMode ? 'pr-5' : ''}`}
      >
        <span
          className={`inline-flex items-center gap-1 ${
            compact ? 'text-[9.5px] px-1.5 py-0.5' : 'text-[10.5px] px-2 py-0.5'
          } font-bold rounded-md shrink-0 tracking-tight leading-none`}
          style={{
            backgroundColor: `${turmaColor}14`,
            color: turmaColor,
            border: `1px solid ${turmaColor}30`
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: turmaColor }}
          />
          <span>{turma?.sigla || 'TURMA'}</span>
        </span>

        {isPrejudicada ? (
          <span
            className="inline-flex items-center text-[9px] text-amber-800 font-semibold bg-amber-100/90 px-1.5 py-0.5 rounded-md border border-amber-300/80 shrink-0 leading-none"
            title={aula.motivoPrejuizo || 'Aula com Prejuízo Registrado'}
          >
            <AlertTriangle className="w-2.5 h-2.5 mr-0.5 text-amber-600 shrink-0" />
            <span>Prejuízo</span>
          </span>
        ) : isRealizada ? (
          <span
            className="inline-flex items-center text-[9px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/80 shrink-0 leading-none"
            title="Aula Realizada"
          >
            <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 text-emerald-600 shrink-0" />
            <span>{compact ? 'OK' : 'Concluída'}</span>
          </span>
        ) : isRemanejada ? (
          <span
            className="inline-flex items-center text-[9px] text-violet-700 font-semibold bg-violet-50 px-1.5 py-0.5 rounded-md border border-violet-200/80 shrink-0 leading-none"
            title="Aula Remanejada"
          >
            <ArrowRightLeft className="w-2.5 h-2.5 mr-0.5 text-violet-600 shrink-0" />
            <span>Remanej.</span>
          </span>
        ) : null}
      </div>

      {/* Corpo: Nome da Matéria + Assunto */}
      <div className="min-w-0">
        <div
          className={`font-semibold text-slate-900 tracking-[-0.015em] ${
            compact
              ? singleInDay
                ? 'text-[12px] leading-snug line-clamp-1'
                : 'text-[11px] leading-tight line-clamp-1'
              : 'text-[13px] sm:text-sm leading-snug line-clamp-1'
          }`}
          title={materia?.nome}
        >
          {materia?.nome || 'Matéria'}
        </div>

        {assunto && (
          <div
            className={`text-slate-500 font-normal ${
              compact
                ? singleInDay
                  ? 'text-[10.5px] leading-snug line-clamp-2 mt-0.5'
                  : 'text-[9.5px] leading-tight line-clamp-1 mt-0.5'
                : 'text-xs leading-relaxed line-clamp-2 mt-1'
            }`}
            title={`Assunto: ${assunto}`}
          >
            {assunto}
          </div>
        )}
      </div>

      {/* Rodapé sutil com Instrutor (exibido em cards únicos no dia ou nos cards expandidos/lista) */}
      {instrutor && (!compact || singleInDay) && (
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center gap-1 text-[10px] text-slate-400 font-medium truncate">
          <User className="w-2.5 h-2.5 text-slate-400 shrink-0" />
          <span className="truncate">{instrutor.nome}</span>
        </div>
      )}
    </div>
  );
};
