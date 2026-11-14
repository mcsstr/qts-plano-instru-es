import { AppTheme } from '../types';

export interface ThemePalette {
  id: AppTheme;
  name: string;
  subtitle: string;
  previewColors: string[];
  // Cor exata em HEX do cabeçalho para sincronizar com o safe-area do celular
  headerHex: string;
  // Fundo geral da aplicação
  appBg: string;
  // Header Superior
  headerBg: string;
  headerBorderTop: string;
  headerText: string;
  headerSubtext: string;
  headerBadgeBg: string;
  headerBadgeText: string;
  navContainerBg: string;
  navActiveBg: string;
  navInactiveText: string;
  // Cabeçalho dos dias da semana no Calendário
  calHeaderBg: string;
  calHeaderText: string;
  calHeaderWeekendBg: string;
  calHeaderWeekendText: string;
  // Células dos dias no Calendário
  calDayEvenBg: string;
  calDayOddBg: string;
  calWeekendBg: string;
  calTodayBg: string;
  calTodayRing: string;
  calTodayBadge: string;
  calDayNumEven: string;
  calDayNumOdd: string;
  calDayNumWeekend: string;
  // Card de Hoje (Mobile / Agenda)
  todayCardGradient: string;
}

export const THEMES: Record<AppTheme, ThemePalette> = {
  'ft-19bpm': {
    id: 'ft-19bpm',
    name: 'Obsidian Pro',
    subtitle: 'Grafite profundo e estética executiva estilo Linear & Vercel',
    previewColors: ['#090d16', '#3b82f6', '#f3f4f6', '#ffffff'],
    headerHex: '#090d16',
    appBg: 'bg-[#f1f3f5]',
    headerBg: 'bg-[#090d16] border-b border-[#1e293b]',
    headerBorderTop: '',
    headerText: 'text-white',
    headerSubtext: 'text-slate-400',
    headerBadgeBg: 'bg-white/10 border border-white/15',
    headerBadgeText: 'text-slate-200',
    navContainerBg: 'bg-white/[0.06] border-white/10',
    navActiveBg: 'bg-white text-slate-950 shadow-xs font-semibold',
    navInactiveText: 'text-slate-300 hover:text-white hover:bg-white/[0.06]',
    calHeaderBg: 'bg-slate-900 border-b border-slate-800',
    calHeaderText: 'text-slate-300',
    calHeaderWeekendBg: 'bg-slate-950/60',
    calHeaderWeekendText: 'text-slate-400',
    calDayEvenBg: 'bg-white',
    calDayOddBg: 'bg-white',
    calWeekendBg: 'bg-slate-50/80',
    calTodayBg: 'bg-blue-50/40',
    calTodayRing: 'ring-1 ring-inset ring-blue-500/30',
    calTodayBadge: 'bg-blue-600 text-white shadow-xs',
    calDayNumEven: 'text-slate-700',
    calDayNumOdd: 'text-slate-700',
    calDayNumWeekend: 'text-slate-400',
    todayCardGradient: 'bg-gradient-to-br from-[#090d16] via-slate-900 to-slate-800'
  },

  'azul-operacional': {
    id: 'azul-operacional',
    name: 'Sapphire Corporate',
    subtitle: 'Azul marinho corporativo inspirado no Stripe & Notion',
    previewColors: ['#0f172a', '#4f46e5', '#eef2f6', '#ffffff'],
    headerHex: '#0f172a',
    appBg: 'bg-[#eef2f6]',
    headerBg: 'bg-[#0f172a] border-b border-[#1e293b]',
    headerBorderTop: '',
    headerText: 'text-white',
    headerSubtext: 'text-indigo-200',
    headerBadgeBg: 'bg-indigo-500/20 border border-indigo-400/30',
    headerBadgeText: 'text-indigo-200',
    navContainerBg: 'bg-slate-800/90 border-slate-700/80',
    navActiveBg: 'bg-indigo-600 text-white shadow-xs font-semibold',
    navInactiveText: 'text-slate-300 hover:text-white hover:bg-slate-700/60',
    calHeaderBg: 'bg-[#0f172a] border-b border-slate-800',
    calHeaderText: 'text-slate-200',
    calHeaderWeekendBg: 'bg-slate-950/50',
    calHeaderWeekendText: 'text-indigo-300/80',
    calDayEvenBg: 'bg-white',
    calDayOddBg: 'bg-white',
    calWeekendBg: 'bg-slate-50/80',
    calTodayBg: 'bg-indigo-50/45',
    calTodayRing: 'ring-1 ring-inset ring-indigo-500/30',
    calTodayBadge: 'bg-indigo-600 text-white shadow-xs',
    calDayNumEven: 'text-slate-700',
    calDayNumOdd: 'text-slate-700',
    calDayNumWeekend: 'text-slate-400',
    todayCardGradient: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900'
  },

  'rubro-ouro': {
    id: 'rubro-ouro',
    name: 'Emerald Executive',
    subtitle: 'Verde floresta sofisticado com acentos esmeralda modernos',
    previewColors: ['#062019', '#10b981', '#f0f4f2', '#ffffff'],
    headerHex: '#062019',
    appBg: 'bg-[#eff3f1]',
    headerBg: 'bg-[#062019] border-b border-[#0c382c]',
    headerBorderTop: '',
    headerText: 'text-white',
    headerSubtext: 'text-emerald-200',
    headerBadgeBg: 'bg-emerald-500/20 border border-emerald-400/30',
    headerBadgeText: 'text-emerald-200',
    navContainerBg: 'bg-white/[0.07] border-white/10',
    navActiveBg: 'bg-emerald-500 text-slate-950 shadow-xs font-bold',
    navInactiveText: 'text-emerald-100/80 hover:text-white hover:bg-white/10',
    calHeaderBg: 'bg-[#062019] border-b border-emerald-950',
    calHeaderText: 'text-emerald-100',
    calHeaderWeekendBg: 'bg-black/25',
    calHeaderWeekendText: 'text-emerald-300/80',
    calDayEvenBg: 'bg-white',
    calDayOddBg: 'bg-white',
    calWeekendBg: 'bg-slate-50/80',
    calTodayBg: 'bg-emerald-50/45',
    calTodayRing: 'ring-1 ring-inset ring-emerald-500/30',
    calTodayBadge: 'bg-emerald-600 text-white shadow-xs',
    calDayNumEven: 'text-slate-700',
    calDayNumOdd: 'text-slate-700',
    calDayNumWeekend: 'text-slate-400',
    todayCardGradient: 'bg-gradient-to-br from-[#062019] via-emerald-950 to-teal-900'
  },

  'clean-slate': {
    id: 'clean-slate',
    name: 'Minimalist Daylight',
    subtitle: 'Visual claro, arejado e minimalista estilo Apple & Cron',
    previewColors: ['#ffffff', '#0f172a', '#2563eb', '#f8fafc'],
    headerHex: '#ffffff',
    appBg: 'bg-[#f5f7fa]',
    headerBg: 'bg-white border-b border-[#e2e8f0]',
    headerBorderTop: '',
    headerText: 'text-slate-900',
    headerSubtext: 'text-slate-500',
    headerBadgeBg: 'bg-slate-100 border border-slate-200',
    headerBadgeText: 'text-slate-700',
    navContainerBg: 'bg-slate-100/90 border-slate-200/70',
    navActiveBg: 'bg-slate-900 text-white shadow-2xs font-semibold',
    navInactiveText: 'text-slate-600 hover:text-slate-900 hover:bg-white/60',
    calHeaderBg: 'bg-slate-50 border-b border-slate-200/90',
    calHeaderText: 'text-slate-500',
    calHeaderWeekendBg: 'bg-slate-100/70',
    calHeaderWeekendText: 'text-slate-400',
    calDayEvenBg: 'bg-white',
    calDayOddBg: 'bg-white',
    calWeekendBg: 'bg-slate-50/70',
    calTodayBg: 'bg-blue-50/35',
    calTodayRing: 'ring-1 ring-inset ring-blue-500/25',
    calTodayBadge: 'bg-blue-600 text-white shadow-xs',
    calDayNumEven: 'text-slate-700',
    calDayNumOdd: 'text-slate-700',
    calDayNumWeekend: 'text-slate-400',
    todayCardGradient: 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950'
  }
};

export const THEME_LIST: ThemePalette[] = [
  THEMES['ft-19bpm'],
  THEMES['azul-operacional'],
  THEMES['rubro-ouro'],
  THEMES['clean-slate']
];
