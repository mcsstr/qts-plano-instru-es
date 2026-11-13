import React, { useState } from 'react';
import { Aula } from '../../types';
import { ClassCard } from './ClassCard';
import {
  getCalendarDays,
  isSameMonth,
  isSameDay,
  format,
  formatDateBr,
  formatDayOfWeek,
  isWeekend
} from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Plus, ChevronDown, ChevronUp, Maximize2, X, CalendarDays } from 'lucide-react';

interface MonthGridProps {
  currentDate: Date;
  aulas: Aula[];
  onSelectAula: (aula: Aula) => void;
  onAddAulaOnDate: (dateStr: string) => void;
}

export const MonthGrid: React.FC<MonthGridProps> = ({
  currentDate,
  aulas,
  onSelectAula,
  onAddAulaOnDate
}) => {
  const { canEdit } = useAuth();
  const { themePalette } = useApp();
  const days = getCalendarDays(currentDate);
  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const weekDaysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = new Date();

  // Dias que foram expandidos inline na própria grade (quando têm 3+ matérias)
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  // Dia aberto no Modal de Expansão Completa
  const [modalDayStr, setModalDayStr] = useState<string | null>(null);

  const toggleExpandDay = (dateStr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDates(prev => {
      const next = new Set(prev);
      if (next.has(dateStr)) {
        next.delete(dateStr);
      } else {
        next.add(dateStr);
      }
      return next;
    });
  };

  // Agrupa aulas por data (YYYY-MM-DD com normalização robusta)
  const aulasByDate = React.useMemo(() => {
    const map = new Map<string, Aula[]>();
    aulas.forEach(aula => {
      let cleanDate = '';
      if (aula.data) {
        cleanDate = String(aula.data).split('T')[0].split(' ')[0].trim();
      }
      if (!cleanDate || cleanDate.length < 10) return;
      const list = map.get(cleanDate) || [];
      list.push(aula);
      map.set(cleanDate, list);
    });
    return map;
  }, [aulas]);

  const modalDayAulas = modalDayStr ? aulasByDate.get(modalDayStr) || [] : [];

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/85 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] overflow-hidden">
        {/* Cabeçalho dos Dias da Semana (Estilo SaaS Executivo) */}
        <div
          className={`grid grid-cols-7 ${themePalette.calHeaderBg} ${themePalette.calHeaderText} text-center text-[10.5px] font-semibold tracking-[0.06em] uppercase divide-x divide-white/10`}
        >
          {weekDays.map((d, index) => (
            <div
              key={d}
              className={`py-1.5 ${
                index === 0 || index === 6
                  ? `${themePalette.calHeaderWeekendBg} ${themePalette.calHeaderWeekendText}`
                  : ''
              }`}
            >
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{weekDaysShort[index]}</span>
            </div>
          ))}
        </div>

        {/* Grade Mensal Arquitetural (Sem efeito xadrez poluído; células limpas e uniformes) */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200/75">
          {days.map((day, idx) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, today);
            const isDayWeekend = isWeekend(day);
            const dayAulas = aulasByDate.get(dateStr) || [];
            const hasMultiple = dayAulas.length > 1;
            const hasMoreThanTwo = dayAulas.length > 2;
            const isExpanded = expandedDates.has(dateStr);

            let cellBgClass = 'bg-white';
            if (!isCurrentMonth) {
              cellBgClass = 'bg-slate-50/90 text-slate-300';
            } else if (isToday) {
              cellBgClass = `${themePalette.calTodayBg} ${themePalette.calTodayRing}`;
            } else if (isDayWeekend) {
              cellBgClass = themePalette.calWeekendBg;
            } else {
              cellBgClass = themePalette.calDayOddBg;
            }

            // Exibe até 2 matérias diretamente dentro do bloco.
            const visibleAulas = !isExpanded && hasMoreThanTwo ? dayAulas.slice(0, 2) : dayAulas;
            const hiddenCount = dayAulas.length - visibleAulas.length;

            return (
              <div
                key={idx}
                className={`min-h-[82px] sm:min-h-[92px] lg:min-h-[98px] p-1.5 flex flex-col transition-colors duration-150 group relative hover:bg-slate-50/70 ${cellBgClass}`}
              >
                {/* Topo da Célula: Número do Dia, Contador de Aulas e Botão + */}
                <div className="flex items-center justify-between mb-1 gap-1">
                  <span
                    className={`text-[11px] font-bold tabular-nums w-5 h-5 flex items-center justify-center rounded-md transition-all shrink-0 ${
                      isToday
                        ? `${themePalette.calTodayBadge}`
                        : !isCurrentMonth
                        ? 'text-slate-300 font-medium'
                        : isDayWeekend
                        ? themePalette.calDayNumWeekend
                        : themePalette.calDayNumOdd
                    }`}
                  >
                    {format(day, 'd')}
                  </span>

                  <div className="flex items-center gap-1 ml-auto">
                    {/* Contador discreto e elegante quando há 2+ aulas no dia */}
                    {hasMultiple && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setModalDayStr(dateStr);
                        }}
                        title="Expandir todas as aulas deste dia"
                        className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer leading-none"
                      >
                        <span>{dayAulas.length} aulas</span>
                        <Maximize2 className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                      </button>
                    )}

                    {/* Botão rápido + Adicionar aula no dia */}
                    {canEdit && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onAddAulaOnDate(dateStr);
                        }}
                        title={`Adicionar aula em ${formatDateBr(dateStr)}`}
                        className="opacity-0 group-hover:opacity-100 transition-all p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 bg-slate-100/80 rounded-md shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Lista de Aulas do Dia */}
                <div className={`flex flex-col ${dayAulas.length === 1 ? 'grow' : 'space-y-1'}`}>
                  {visibleAulas.map(aula => (
                    <ClassCard
                      key={aula.id}
                      aula={aula}
                      compact={true}
                      singleInDay={dayAulas.length === 1}
                      onClick={() => onSelectAula(aula)}
                    />
                  ))}
                </div>

                {/* Botão de Expansão apenas quando houver 3 ou mais matérias */}
                {hasMoreThanTwo && (
                  <div className="mt-1.5">
                    <button
                      onClick={e => toggleExpandDay(dateStr, e)}
                      className="w-full py-1 px-2 rounded-md bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors leading-none border border-slate-200/70"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>Recolher</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>+{hiddenCount} {hiddenCount === 1 ? 'aula' : 'aulas'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Área clicável limpa para dias vazios */}
                {dayAulas.length === 0 && isCurrentMonth && !isDayWeekend && (
                  <div
                    onClick={() => canEdit && onAddAulaOnDate(dateStr)}
                    className={`grow flex items-center justify-center rounded-xl border border-dashed border-transparent transition-all ${
                      canEdit ? 'hover:border-slate-300 hover:bg-slate-50/80 cursor-pointer' : ''
                    }`}
                  >
                    <span className="text-[11px] text-slate-400 hidden group-hover:block font-medium">
                      {canEdit ? '+ Nova aula' : ''}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          MODAL DE EXPANSÃO DO DIA (Mostra todas as matérias/aulas do dia selecionado)
         ========================================================================= */}
      {modalDayStr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
            onClick={() => setModalDayStr(null)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-400 block capitalize">
                    {formatDayOfWeek(modalDayStr)}
                  </span>
                  <h3 className="text-base font-bold leading-tight">
                    {formatDateBr(modalDayStr)} • {modalDayAulas.length} {modalDayAulas.length === 1 ? 'aula' : 'aulas'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setModalDayStr(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[65vh] overflow-y-auto space-y-2.5 bg-slate-50/60">
              {modalDayAulas.map(aula => (
                <ClassCard
                  key={aula.id}
                  aula={aula}
                  compact={false}
                  onClick={() => {
                    setModalDayStr(null);
                    onSelectAula(aula);
                  }}
                />
              ))}
            </div>

            <div className="px-4 py-3 bg-white border-t border-slate-200 flex items-center justify-between">
              {canEdit ? (
                <button
                  onClick={() => {
                    const targetDate = modalDayStr;
                    setModalDayStr(null);
                    onAddAulaOnDate(targetDate);
                  }}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Aula neste Dia</span>
                </button>
              ) : (
                <span />
              )}
              <button
                onClick={() => setModalDayStr(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
