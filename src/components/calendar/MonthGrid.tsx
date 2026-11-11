import React from 'react';
import { Aula } from '../../types';
import { ClassCard } from './ClassCard';
import {
  getCalendarDays,
  isSameMonth,
  isSameDay,
  format,
  isWeekend
} from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { Plus } from 'lucide-react';

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
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = new Date();

  // Agrupa aulas por data (YYYY-MM-DD)
  const aulasByDate = React.useMemo(() => {
    const map = new Map<string, Aula[]>();
    aulas.forEach(aula => {
      const list = map.get(aula.data) || [];
      list.push(aula);
      map.set(aula.data, list);
    });
    return map;
  }, [aulas]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Cabeçalho dos Dias da Semana */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-semibold text-slate-600">
        {weekDays.map((d, index) => (
          <div
            key={d}
            className={`py-2.5 ${index === 0 || index === 6 ? 'text-slate-400 bg-slate-100/50' : ''}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grade de Dias do Mês */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[560px]">
        {days.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, today);
          const isDayWeekend = isWeekend(day);
          const dayAulas = aulasByDate.get(dateStr) || [];

          return (
            <div
              key={idx}
              className={`min-h-[105px] sm:min-h-[120px] p-1.5 sm:p-2 flex flex-col transition-colors group relative ${
                !isCurrentMonth ? 'bg-slate-50/40 text-slate-400' : 'bg-white'
              } ${isDayWeekend && isCurrentMonth ? 'bg-slate-50/20' : ''}`}
            >
              {/* Topo do dia: Número e botão Adicionar */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                    isToday
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : isCurrentMonth
                      ? 'text-slate-700'
                      : 'text-slate-300'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {/* Botão rápido + Adicionar aula no dia */}
                {canEdit && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onAddAulaOnDate(dateStr);
                    }}
                    title={`Adicionar aula em ${dateStr}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Lista de Aulas do Dia */}
              <div className="space-y-1.5 overflow-y-auto max-h-[120px] pr-0.5">
                {dayAulas.map(aula => (
                  <ClassCard
                    key={aula.id}
                    aula={aula}
                    onClick={() => onSelectAula(aula)}
                    compact={dayAulas.length > 2}
                  />
                ))}
              </div>

              {/* Empty state visual no dia se não houver aulas e for dia útil */}
              {dayAulas.length === 0 && isCurrentMonth && !isDayWeekend && (
                <div
                  onClick={() => canEdit && onAddAulaOnDate(dateStr)}
                  className={`grow flex items-center justify-center rounded-lg border border-dashed border-transparent ${
                    canEdit ? 'hover:border-slate-200 cursor-pointer' : ''
                  }`}
                >
                  <span className="text-[10px] text-slate-300 hidden group-hover:block">
                    {canEdit ? '+ Inserir' : 'Livre'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

