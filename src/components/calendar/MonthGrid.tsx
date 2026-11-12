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
  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const weekDaysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = new Date();

  // Agrupa aulas por data (YYYY-MM-DD com normalização robusta)
  const aulasByDate = React.useMemo(() => {
    const map = new Map<string, Aula[]>();
    aulas.forEach(aula => {
      // Normalização robusta: remove parte de hora, espaços e garante formato YYYY-MM-DD
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Cabeçalho dos Dias da Semana */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/90 text-center text-xs font-bold text-slate-700">
        {weekDays.map((d, index) => (
          <div
            key={d}
            className={`py-3 ${index === 0 || index === 6 ? 'text-slate-400 bg-slate-100/40' : ''}`}
          >
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{weekDaysShort[index]}</span>
          </div>
        ))}
      </div>

      {/* Grade de Dias do Mês */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[640px]">
        {days.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, today);
          const isDayWeekend = isWeekend(day);
          const dayAulas = aulasByDate.get(dateStr) || [];

          return (
            <div
              key={idx}
              className={`min-h-[140px] sm:min-h-[170px] lg:min-h-[190px] p-2 sm:p-2.5 flex flex-col transition-colors group relative ${
                !isCurrentMonth ? 'bg-slate-50/60 text-slate-400' : 'bg-white'
              } ${isDayWeekend && isCurrentMonth ? 'bg-slate-50/30' : ''}`}
            >
              {/* Topo do dia: Número e botão Adicionar */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-bold w-7 h-7 flex items-center justify-center rounded-xl transition-all ${
                    isToday
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105'
                      : isCurrentMonth
                      ? 'text-slate-800 group-hover:bg-slate-100'
                      : 'text-slate-300'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {/* Contador de Aulas se houver mais de 1 */}
                {dayAulas.length > 1 && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md">
                    {dayAulas.length} aulas
                  </span>
                )}

                {/* Botão rápido + Adicionar aula no dia */}
                {canEdit && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onAddAulaOnDate(dateStr);
                    }}
                    title={`Adicionar aula em ${dateStr}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Lista de Aulas do Dia (Espaçadas e Visíveis) */}
              <div className="space-y-2 overflow-y-auto max-h-[145px] pr-0.5">
                {dayAulas.map(aula => (
                  <ClassCard
                    key={aula.id}
                    aula={aula}
                    onClick={() => onSelectAula(aula)}
                  />
                ))}
              </div>

              {/* Empty state visual no dia se não houver aulas e for dia útil */}
              {dayAulas.length === 0 && isCurrentMonth && !isDayWeekend && (
                <div
                  onClick={() => canEdit && onAddAulaOnDate(dateStr)}
                  className={`grow flex items-center justify-center rounded-xl border border-dashed border-transparent transition-colors ${
                    canEdit ? 'hover:border-slate-200 hover:bg-slate-50/50 cursor-pointer' : ''
                  }`}
                >
                  <span className="text-[11px] text-slate-300 hidden group-hover:block font-medium">
                    {canEdit ? '+ Inserir Aula' : 'Livre'}
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
