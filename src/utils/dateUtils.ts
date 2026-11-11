import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addDays,
  isWeekend
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDateBr = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (e) {
    return dateStr;
  }
};

export const formatDayOfWeek = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    return format(date, 'EEEE', { locale: ptBR });
  } catch (e) {
    return '';
  }
};

export const formatMonthYear = (date: Date): string => {
  return format(date, 'MMMM yyyy', { locale: ptBR });
};

export const formatShortDay = (dateStr: string): string => {
  try {
    const date = parseISO(dateStr);
    return format(date, 'dd MMM', { locale: ptBR });
  } catch (e) {
    return dateStr;
  }
};

export const getCalendarDays = (currentDate: Date) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  // Week starts on Sunday (0) or Monday (1). In Brazil/military calendar, Monday or Sunday are common.
  // Standard ptBR week starts on Sunday (0) or Monday (1). Let's use Sunday (0).
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  return eachDayOfInterval({ start: startDate, end: endDate });
};

export const getDaysInPeriod = (
  startDateStr: string,
  endDateStr: string,
  includeWeekends: boolean = false,
  selectedDaysOfWeek: number[] = [1, 2, 3, 4, 5] // 0=Sun, 1=Mon, ..., 6=Sat
): string[] => {
  try {
    const start = parseISO(startDateStr);
    const end = parseISO(endDateStr);

    if (start > end) return [];

    const allDays = eachDayOfInterval({ start, end });

    return allDays
      .filter(day => {
        const dayOfWeek = day.getDay();
        if (!includeWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
          return false;
        }
        return selectedDaysOfWeek.includes(dayOfWeek);
      })
      .map(day => format(day, 'yyyy-MM-dd'));
  } catch (e) {
    console.error('Erro ao calcular dias do período:', e);
    return [];
  }
};

export const isTodayStr = (dateStr: string): boolean => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return today === dateStr;
};

export {
  format,
  parseISO,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addDays,
  isWeekend
};

