import React from 'react';
import { Aula } from '../../types';
import { ClassCard } from './ClassCard';
import { formatDateBr, formatDayOfWeek, format } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Plus, CalendarDays, Sparkles, Clock, CheckCircle2, AlertTriangle, History } from 'lucide-react';

interface AgendaViewProps {
  aulas: Aula[];
  onSelectAula: (aula: Aula) => void;
  onAddAulaOnDate: (dateStr: string) => void;
  /** Quando true (usado no mobile principal), o card de Hoje já é renderizado no topo sticky do CalendarView */
  hideTodayCard?: boolean;
  /** Modo de exibição: 'upcoming' = apenas próximas aulas; 'month-history' = todas as aulas do mês selecionado */
  mode?: 'upcoming' | 'month-history';
  /** Data de referência do mês selecionado (usado no modo month-history) */
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
  const { getTurma, getMateria } = useApp();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const selectedYearMonth = format(currentDate, 'yyyy-MM');

  // Aulas de HOJE (com normalização robusta de data)
  const todayAulas = React.useMemo(() => {
    return aulas.filter(a => {
      const clean = a.data ? String(a.data).split('T')[0].split(' ')[0].trim() : '';
      return clean === todayStr;
    });
  }, [aulas, todayStr]);

  // Todas as datas com aulas, agrupadas
  const sortedDates = React.useMemo(() => {
    const map = new Map<string, Aula[]>();
    aulas.forEach(a => {
      const cleanDate = a.data ? String(a.data).split('T')[0].split(' ')[0].trim() : '';
      if (!cleanDate || cleanDate.length < 10) return;
      const list = map.get(cleanDate) || [];
      list.push(a);
      map.set(cleanDate, list);
    });

    const dates = Array.from(map.keys()).sort();
    return dates.map(date => ({
      date,
      aulas: map.get(date) || []
    }));
  }, [aulas]);

  // Próximas datas com aula (a partir de hoje)
  const upcomingDates = React.useMemo(() => {
    return sortedDates.filter(g => g.date >= todayStr);
  }, [sortedDates, todayStr]);

  // Datas do mês selecionado (para a página de Histórico do mês inteiro)
  const monthDates = React.useMemo(() => {
    return sortedDates.filter(g => g.date.startsWith(selectedYearMonth));
  }, [sortedDates, selectedYearMonth]);

  const groupsToRender = mode === 'month-history' ? monthDates : upcomingDates;

  return (
    <div className="space-y-4">
      {/* =========================================================================
          CABEÇALHO DE HOJE (Quando não ocultado pelo container sticky pai)
         ========================================================================= */}
      {!hideTodayCard && mode === 'upcoming' && (
        <div className="sticky top-16 z-20 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg border border-blue-500/30 p-4 sm:p-5 backdrop-blur-md">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/15">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <CalendarDays className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-white text-blue-900 px-2 py-0.5 rounded-full shadow-2xs">
                    HOJE
                  </span>
                  <span className="text-xs text-blue-100 capitalize font-medium">
                    {formatDayOfWeek(todayStr)}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
                  {formatDateBr(todayStr)}
                </h2>
              </div>
            </div>

            {canEdit && (
              <button
                onClick={() => onAddAulaOnDate(todayStr)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold transition-all border border-white/20 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Inserir Aula Hoje</span>
              </button>
            )}
          </div>

          {/* Cards das Aulas de Hoje */}
          <div className="mt-3">
            {todayAulas.length === 0 ? (
              <div className="p-3 bg-white/10 rounded-xl text-center text-xs text-blue-100 flex items-center justify-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Nenhuma aula programada para hoje. Cronograma livre!</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {todayAulas.map(aula => {
                  const turma = getTurma(aula.turmaId);
                  const materia = getMateria(aula.materiaId);
                  const isPrejudicada = aula.status === 'prejudicada';
                  const isRealizada = aula.status === 'realizada';

                  return (
                    <div
                      key={aula.id}
                      onClick={() => onSelectAula(aula)}
                      className="p-3 rounded-xl bg-white text-slate-900 shadow-md cursor-pointer hover:scale-[1.01] transition-all border-l-4 text-left"
                      style={{ borderLeftColor: isPrejudicada ? '#f59e0b' : materia?.cor || '#2563eb' }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: `${turma?.cor || '#2563eb'}20`, color: turma?.cor || '#2563eb' }}
                        >
                          {turma?.sigla || 'TURMA'}
                        </span>
                        {isPrejudicada ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Prejuízo
                          </span>
                        ) : isRealizada ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Concluída
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" />
                            Hoje
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                        {materia?.nome || 'Matéria'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          LISTA DE AULAS (PRÓXIMAS OU HISTÓRICO DO MÊS INTEIRO)
         ========================================================================= */}
      <div className="space-y-4">
        {groupsToRender.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1 flex items-center gap-1.5">
              {mode === 'month-history' ? (
                <>
                  <History className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Todas as Aulas deste Mês ({groupsToRender.length} dias com aula)</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Próximas Datas com Aula</span>
                </>
              )}
            </h3>

            {groupsToRender.map(group => {
              const isToday = group.date === todayStr;

              return (
                <div
                  key={group.date}
                  className={`bg-white rounded-2xl border shadow-xs overflow-hidden transition-all ${
                    isToday ? 'border-blue-300 ring-2 ring-blue-500/20' : 'border-slate-200'
                  }`}
                >
                  {/* Cabeçalho da Data */}
                  <div
                    className={`px-4 py-3 border-b flex items-center justify-between ${
                      isToday ? 'bg-blue-50/80 border-blue-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="text-center bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="block text-xs font-bold text-slate-900">
                          {formatDateBr(group.date).substring(0, 5)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-bold capitalize ${isToday ? 'text-blue-800' : 'text-slate-900'}`}>
                            {formatDayOfWeek(group.date)}
                          </span>
                          {isToday && (
                            <span className="text-[10px] font-bold uppercase bg-blue-600 text-white px-2 py-0.5 rounded-full">
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
                        className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-semibold p-1.5 hover:bg-blue-100/60 rounded-lg transition-colors"
                        title="Adicionar aula nesta data"
                      >
                        <Plus className="w-4 h-4" />
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
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-800">
              {mode === 'month-history'
                ? 'Nenhuma aula registrada neste mês'
                : 'Nenhuma próxima aula agendada'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {mode === 'month-history'
                ? 'Use as setas de mês/ano acima para consultar outros meses do histórico.'
                : 'Para consultar datas anteriores ou meses completos, toque no ícone de Histórico no topo.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
