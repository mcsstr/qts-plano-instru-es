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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Cabeçalho dos Dias da Semana (Mais enxuto para caber o calendário na tela) */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/90 text-center text-[11px] font-bold text-slate-700">
          {weekDays.map((d, index) => (
            <div
              key={d}
              className={`py-1.5 ${index === 0 || index === 6 ? 'text-slate-400 bg-slate-100/40' : ''}`}
            >
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{weekDaysShort[index]}</span>
            </div>
          ))}
        </div>

        {/* Grade de Dias do Mês - Altura ajustada para caber o mês inteiro na tela */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
          {days.map((day, idx) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, today);
            const isDayWeekend = isWeekend(day);
            const dayAulas = aulasByDate.get(dateStr) || [];
            const hasMultiple = dayAulas.length > 1;
            const hasMoreThanTwo = dayAulas.length > 2;
            const isExpanded = expandedDates.has(dateStr);

            // Exibe até 2 matérias diretamente dentro do bloco (já que cabem perfeitamente!).
            // Se houver 3 ou mais matérias, mostra as 2 primeiras + botão de expandir/modal.
            const visibleAulas = !isExpanded && hasMoreThanTwo ? dayAulas.slice(0, 2) : dayAulas;
            const hiddenCount = dayAulas.length - visibleAulas.length;

            return (
              <div
                key={idx}
                className={`min-h-[100px] sm:min-h-[112px] p-1.5 flex flex-col transition-colors group relative ${
                  !isCurrentMonth ? 'bg-slate-50/60 text-slate-400' : 'bg-white'
                } ${isDayWeekend && isCurrentMonth ? 'bg-slate-50/30' : ''}`}
              >
                {/* Topo do dia: Número, Marcador de Múltiplas Matérias e Botão Adicionar */}
                <div className="flex items-center justify-between mb-1 gap-1">
                  <span
                    className={`text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-md transition-all shrink-0 ${
                      isToday
                        ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                        : isCurrentMonth
                        ? 'text-slate-800 group-hover:bg-slate-100'
                        : 'text-slate-300'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Marcador clicável quando houver 2 ou mais matérias no dia */}
                  {hasMultiple && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setModalDayStr(dateStr);
                      }}
                      title="Clique para abrir todas as aulas deste dia em destaque"
                      className="flex items-center gap-0.5 text-[9px] font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-1.5 py-0.5 rounded transition-colors cursor-pointer leading-none"
                    >
                      <span>{dayAulas.length} aulas</span>
                      <Maximize2 className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded ml-auto shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Lista de Aulas do Dia (1 aula preenche o bloco; 2 aulas aparecem empilhadas; 3+ mostra botão) */}
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

                {/* Botão de Expansão apenas quando houver 3 ou mais matérias (pois 2 já aparecem inteiras!) */}
                {hasMoreThanTwo && (
                  <div className="mt-1">
                    <button
                      onClick={e => toggleExpandDay(dateStr, e)}
                      className="w-full py-0.5 px-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 text-[9px] font-bold flex items-center justify-center gap-0.5 transition-colors leading-tight"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-2.5 h-2.5 shrink-0" />
                          <span>Recolher</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-2.5 h-2.5 shrink-0" />
                          <span>+{hiddenCount} {hiddenCount === 1 ? 'matéria' : 'matérias'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Empty state visual no dia se não houver aulas e for dia útil */}
                {dayAulas.length === 0 && isCurrentMonth && !isDayWeekend && (
                  <div
                    onClick={() => canEdit && onAddAulaOnDate(dateStr)}
                    className={`grow flex items-center justify-center rounded-lg border border-dashed border-transparent transition-colors ${
                      canEdit ? 'hover:border-slate-200 hover:bg-slate-50/50 cursor-pointer' : ''
                    }`}
                  >
                    <span className="text-[10px] text-slate-300 hidden group-hover:block font-medium">
                      {canEdit ? '+ Aula' : 'Livre'}
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
            <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[11px] uppercase font-bold text-blue-100 block capitalize">
                    {formatDayOfWeek(modalDayStr)}
                  </span>
                  <h3 className="text-base font-black leading-tight">
                    Aulas do dia {formatDateBr(modalDayStr)} ({modalDayAulas.length})
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setModalDayStr(null)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[65vh] overflow-y-auto space-y-2.5">
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

            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {canEdit ? (
                <button
                  onClick={() => {
                    const targetDate = modalDayStr;
                    setModalDayStr(null);
                    onAddAulaOnDate(targetDate);
                  }}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Outra Aula neste Dia</span>
                </button>
              ) : (
                <span />
              )}
              <button
                onClick={() => setModalDayStr(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
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
