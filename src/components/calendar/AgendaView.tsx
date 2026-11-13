import React from 'react';
import { Aula } from '../../types';
import { ClassCard, getAulaAssunto } from './ClassCard';
import { formatDateBr, formatDayOfWeek, format, formatMonthYear } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Plus, CalendarDays, Sparkles, Clock, CheckCircle2, AlertTriangle, History } from 'lucide-react';

interface AgendaViewProps {
  aulas: Aula[];
  onSelectAula: (aula: Aula) => void;
  onAddAulaOnDate: (dateStr: string) => void;
  /** Quando true (usado no mobile principal), o card de Hoje já é renderizado no CalendarView */
  hideTodayCard?: boolean;
  /** Modo de exibição: 'upcoming' = próximas aulas do mês selecionado; 'month-history' = todas as aulas do mês selecionado */
  mode?: 'upcoming' | 'month-history';
  /** Data de referência do mês e ano selecionado na barra superior */
  currentDate?: Date;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  aulas,
  onSelectAula,
  onAddAulaOnDate,
  hideTodayCard = false,
  mode = 'upcoming',
  currentDate = new Date()
}) => {
  const { canEdit } = useAuth();
  const { getTurma, getMateria, themePalette } = useApp();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const currentYearMonth = todayStr.substring(0, 7);
  const selectedYearMonth = format(currentDate, 'yyyy-MM');
  const isSelectedCurrentMonth = selectedYearMonth === currentYearMonth;

  // Aulas de HOJE (com normalização robusta de data)
  const todayAulas = React.useMemo(() => {
    return aulas.filter(a => {
      const clean = a.data ? String(a.data).split('T')[0].split(' ')[0].trim() : '';
      return clean === todayStr;
    });
  }, [aulas, todayStr]);

  // Todas as datas com aulas do MÊS E ANO SELECIONADO na pilha superior
  const monthSortedDates = React.useMemo(() => {
    const map = new Map<string, Aula[]>();
    aulas.forEach(a => {
      const cleanDate = a.data ? String(a.data).split('T')[0].split(' ')[0].trim() : '';
      if (!cleanDate || cleanDate.length < 10) return;
      // Exibe APENAS datas referentes ao mês e ano selecionado na barra superior
      if (!cleanDate.startsWith(selectedYearMonth)) return;
      const list = map.get(cleanDate) || [];
      list.push(a);
      map.set(cleanDate, list);
    });

    const dates = Array.from(map.keys()).sort();
    return dates.map(date => ({
      date,
      aulas: map.get(date) || []
    }));
  }, [aulas, selectedYearMonth]);

  const groupsToRender = React.useMemo(() => {
    if (mode === 'month-history' || !isSelectedCurrentMonth || !hideTodayCard) {
      return monthSortedDates;
    }
    return monthSortedDates.filter(g => g.date >= todayStr);
  }, [monthSortedDates, mode, isSelectedCurrentMonth, hideTodayCard, todayStr]);

  return (
    <div className="space-y-4">
      {/* =========================================================================
           CABEÇALHO DE HOJE (Quando não ocultado pelo container pai e no mês atual)
         ========================================================================= */}
      {!hideTodayCard && isSelectedCurrentMonth && (
        <div className={`${themePalette.todayCardGradient} text-white rounded-2xl shadow-md border border-white/10 p-4 sm:p-5`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <CalendarDays className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-500 text-white px-2 py-0.5 rounded-md">
                    HOJE
                  </span>
                  <span className="text-xs text-slate-300 capitalize font-medium">
                    {formatDayOfWeek(todayStr)}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight mt-0.5">
                  {formatDateBr(todayStr)}
                </h2>
              </div>
            </div>

            {canEdit && (
              <button
                onClick={() => onAddAulaOnDate(todayStr)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all border border-white/15 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Aula Hoje</span>
              </button>
            )}
          </div>

          {/* Cards das Aulas de Hoje */}
          <div className="mt-3">
            {todayAulas.length === 0 ? (
              <div className="p-3 bg-white/[0.06] rounded-xl text-center text-xs text-slate-300 flex items-center justify-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Nenhuma aula programada para hoje.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {todayAulas.map(aula => {
                  const turma = getTurma(aula.turmaId);
                  const materia = getMateria(aula.materiaId);
                  const isPrejudicada = aula.status === 'prejudicada';
                  const isRealizada = aula.status === 'realizada';
                  const assunto = getAulaAssunto(aula, materia?.descricao);
                  const turmaColor = turma?.cor || '#2563eb';

                  return (
                    <div
                      key={aula.id}
                      onClick={() => onSelectAula(aula)}
                      className="p-3 rounded-xl bg-white text-slate-900 shadow-xs cursor-pointer hover:bg-slate-50 transition-all border-l-4 text-left"
                      style={{ borderLeftColor: isPrejudicada ? '#f59e0b' : materia?.cor || '#2563eb' }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md"
                          style={{
                            backgroundColor: `${turmaColor}14`,
                            color: turmaColor,
                            border: `1px solid ${turmaColor}30`
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: turmaColor }} />
                          <span>{turma?.sigla || 'TURMA'}</span>
                        </span>
                        {isPrejudicada ? (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Prejuízo
                          </span>
                        ) : isRealizada ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Concluída
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" />
                            Hoje
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-sm text-slate-900 leading-snug line-clamp-1">
                        {materia?.nome || 'Matéria'}
                      </div>
                      {assunto && (
                        <div className="text-xs text-slate-500 font-normal line-clamp-2 mt-0.5">
                          {assunto}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          LISTA DE AULAS DO MÊS E ANO SELECIONADO
         ========================================================================= */}
      <div className="space-y-4">
        {groupsToRender.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1 flex items-center gap-1.5">
              {mode === 'month-history' || !isSelectedCurrentMonth || !hideTodayCard ? (
                <>
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span className="capitalize">
                    Aulas de {formatMonthYear(currentDate)} ({groupsToRender.length} {groupsToRender.length === 1 ? 'dia com aula' : 'dias com aula'})
                  </span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span className="capitalize">
                    Próximas Datas de {formatMonthYear(currentDate)} ({groupsToRender.length})
                  </span>
                </>
              )}
            </h3>

            {groupsToRender.map(group => {
              const isToday = group.date === todayStr;

              return (
                <div
                  key={group.date}
                  className={`bg-white rounded-2xl border shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden transition-all ${
                    isToday ? 'border-blue-400/80 ring-2 ring-blue-500/15' : 'border-slate-200/85'
                  }`}
                >
                  {/* Cabeçalho da Data */}
                  <div
                    className={`px-4 py-3 border-b flex items-center justify-between ${
                      isToday ? 'bg-blue-50/50 border-blue-200/70' : 'bg-slate-50/70 border-slate-200/75'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-center bg-white px-2.5 py-1 rounded-xl border border-slate-200/85 shadow-2xs">
                        <span className="block text-xs font-bold tabular-nums text-slate-900">
                          {formatDateBr(group.date).substring(0, 5)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-bold capitalize ${isToday ? 'text-blue-900' : 'text-slate-900'}`}>
                            {formatDayOfWeek(group.date)}
                          </span>
                          {isToday && (
                            <span className="text-[10px] font-bold uppercase bg-blue-600 text-white px-2 py-0.5 rounded-md">
                              Hoje
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {group.aulas.length} {group.aulas.length === 1 ? 'aula agendada' : 'aulas agendadas'}
                        </span>
                      </div>
                    </div>

                    {canEdit && (
                      <button
                        onClick={() => onAddAulaOnDate(group.date)}
                        className="flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 font-semibold px-2.5 py-1.5 hover:bg-slate-200/60 rounded-xl transition-colors"
                        title="Adicionar aula nesta data"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Adicionar</span>
                      </button>
                    )}
                  </div>

                  {/* Cards das Aulas do Dia */}
                  <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {group.aulas.map(aula => (
                      <ClassCard
                        key={aula.id}
                        aula={aula}
                        onClick={() => onSelectAula(aula)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/85 p-10 text-center shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 capitalize">
              Nenhuma aula em {formatMonthYear(currentDate)}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Use as setas de mês e ano na barra superior para consultar outros períodos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
