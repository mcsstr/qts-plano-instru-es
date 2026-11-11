import React from 'react';
import { Aula } from '../../types';
import { ClassCard } from './ClassCard';
import { formatDateBr, formatDayOfWeek, parseISO } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { Plus, CalendarDays } from 'lucide-react';

interface AgendaViewProps {
  aulas: Aula[];
  onSelectAula: (aula: Aula) => void;
  onAddAulaOnDate: (dateStr: string) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  aulas,
  onSelectAula,
  onAddAulaOnDate
}) => {
  const { canEdit } = useAuth();

  // Ordena aulas por data cronológica crescente
  const sortedDates = React.useMemo(() => {
    const map = new Map<string, Aula[]>();
    aulas.forEach(a => {
      const list = map.get(a.data) || [];
      list.push(a);
      map.set(a.data, list);
    });

    const dates = Array.from(map.keys()).sort();
    return dates.map(date => ({
      date,
      aulas: map.get(date) || []
    }));
  }, [aulas]);

  if (sortedDates.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <CalendarDays className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">Nenhuma aula encontrada</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Nenhuma aula coincide com os filtros selecionados ou não há aulas cadastradas para este período.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedDates.map(group => {
        const isToday = group.date === new Date().toISOString().split('T')[0];

        return (
          <div
            key={group.date}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
          >
            {/* Header da Data */}
            <div className={`px-4 py-3 border-b flex items-center justify-between ${
              isToday ? 'bg-blue-50/70 border-blue-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-bold ${isToday ? 'text-blue-700' : 'text-slate-900'}`}>
                  {formatDateBr(group.date)}
                </span>
                <span className="text-xs text-slate-500 capitalize">
                  • {formatDayOfWeek(group.date)}
                </span>
                {isToday && (
                  <span className="text-[10px] font-bold uppercase bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    Hoje
                  </span>
                )}
              </div>

              {canEdit && (
                <button
                  onClick={() => onAddAulaOnDate(group.date)}
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 font-medium py-1 px-2 rounded-lg hover:bg-blue-100/50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar aula neste dia</span>
                </button>
              )}
            </div>

            {/* Aulas do dia */}
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
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
  );
};

