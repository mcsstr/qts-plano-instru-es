import { AppTheme } from '../types';

export interface ThemePalette {
  id: AppTheme;
  name: string;
  subtitle: string;
  previewColors: string[];
  // Fundo geral da aplicação
  appBg: string;
  // Header superior
  headerBg: string;
  headerText: string;
  headerSubtext: string;
  headerBorderTop: string;
  navContainerBg: string;
  navActiveBg: string;
  navActiveText: string;
  navInactiveText: string;
  // Calendário (MonthGrid)
  calBorder: string;
  calHeaderBg: string;
  calHeaderText: string;
  calHeaderWeekendBg: string;
  calHeaderWeekendText: string;
  calDivider: string;
  calDayEvenBg: string;
  calDayOddBg: string;
  calWeekendBg: string;
  calTodayBg: string;
  calTodayRing: string;
  calTodayBadge: string;
  calDayNumEven: string;
  calDayNumOdd: string;
  calDayNumWeekend: string;
  // Botões principais e FAB
  primaryBtn: string;
  secondaryBadge: string;
  todayCardGradient: string;
}

export const THEMES: Record<AppTheme, ThemePalette> = {
  'ft-19bpm': {
    id: 'ft-19bpm',
    name: '19º BPM/I • Força Tática',
    subtitle: 'Grafite tático, ouro imperial, azul e rubro',
    previewColors: ['#0f172a', '#eab308', '#dc2626', '#0284c7'],
    appBg: 'bg-slate-100/90',
    headerBg: 'bg-slate-900 border-b border-slate-800',
    headerText: 'text-white',
    headerSubtext: 'text-amber-400/90 font-medium',
    headerBorderTop: 'border-t-4 border-t-amber-400',
    navContainerBg: 'bg-slate-800/90 border border-slate-700',
    navActiveBg: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold shadow-xs',
    navActiveText: 'text-slate-950',
    navInactiveText: 'text-slate-300 hover:text-white hover:bg-slate-700/60',
    calBorder: 'border-slate-300',
    calHeaderBg: 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-2 border-amber-400',
    calHeaderText: 'text-white',
    calHeaderWeekendBg: 'bg-red-950/60',
    calHeaderWeekendText: 'text-amber-300',
    calDivider: 'divide-slate-200/90',
    calDayEvenBg: 'bg-white',
    calDayOddBg: 'bg-slate-50/90',
    calWeekendBg: 'bg-amber-50/35',
    calTodayBg: 'bg-sky-50/80',
    calTodayRing: 'ring-2 ring-inset ring-sky-600/60',
    calTodayBadge: 'bg-sky-600 text-white shadow-xs',
    calDayNumEven: 'text-slate-800 bg-slate-100',
    calDayNumOdd: 'text-slate-800 bg-white border border-slate-200/80',
    calDayNumWeekend: 'text-red-800 bg-amber-100/70',
    primaryBtn: 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white',
    secondaryBadge: 'bg-slate-900 text-amber-400 border border-amber-400/40',
    todayCardGradient: 'bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 border-amber-400/40'
  },

  'azul-operacional': {
    id: 'azul-operacional',
    name: 'Azul Operacional',
    subtitle: 'Azul marinho e celeste institucional leve',
    previewColors: ['#1e3a8a', '#0284c7', '#e0f2fe', '#ffffff'],
    appBg: 'bg-slate-50',
    headerBg: 'bg-white/95 border-b border-blue-100',
    headerText: 'text-slate-900',
    headerSubtext: 'text-slate-500',
    headerBorderTop: 'border-t-4 border-t-blue-700',
    navContainerBg: 'bg-slate-100 border border-slate-200/70',
    navActiveBg: 'bg-blue-700 text-white font-semibold shadow-xs',
    navActiveText: 'text-white',
    navInactiveText: 'text-slate-600 hover:text-slate-900 hover:bg-white',
    calBorder: 'border-blue-200/80',
    calHeaderBg: 'bg-gradient-to-r from-blue-800 via-blue-700 to-sky-700',
    calHeaderText: 'text-white',
    calHeaderWeekendBg: 'bg-blue-950/35',
    calHeaderWeekendText: 'text-sky-200',
    calDivider: 'divide-blue-100/80',
    calDayEvenBg: 'bg-white',
    calDayOddBg: 'bg-sky-50/45',
    calWeekendBg: 'bg-slate-50/80',
    calTodayBg: 'bg-blue-50/80',
    calTodayRing: 'ring-2 ring-inset ring-blue-600/50',
    calTodayBadge: 'bg-blue-600 text-white shadow-xs',
    calDayNumEven: 'text-slate-700 bg-slate-100/80',
    calDayNumOdd: 'text-blue-900 bg-blue-100/50',
    calDayNumWeekend: 'text-slate-500 bg-slate-200/50',
    primaryBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondaryBadge: 'bg-blue-700 text-white',
    todayCardGradient: 'bg-gradient-to-r from-blue-800 via-blue-700 to-sky-700 border-blue-500/30'
  },

  'rubro-ouro': {
    id: 'rubro-ouro',
    name: 'Heráldico Rubro & Ouro',
    subtitle: 'Vermelho rubro, dourado e grafite sóbrio',
    previewColors: ['#991b1b', '#dc2626', '#eab308', '#1e293b'],
    appBg: 'bg-stone-100/80',
    headerBg: 'bg-white/95 border-b border-red-100',
    headerText: 'text-slate-900',
    headerSubtext: 'text-red-800/80 font-medium',
    headerBorderTop: 'border-t-4 border-t-red-700',
    navContainerBg: 'bg-stone-100 border border-stone-200',
    navActiveBg: 'bg-gradient-to-r from-red-700 to-red-800 text-amber-300 font-bold shadow-xs',
    navActiveText: 'text-amber-300',
    navInactiveText: 'text-slate-600 hover:text-slate-900 hover:bg-white',
    calBorder: 'border-stone-300',
    calHeaderBg: 'bg-gradient-to-r from-red-900 via-red-800 to-stone-900 border-b-2 border-amber-400',
    calHeaderText: 'text-white',
    calHeaderWeekendBg: 'bg-black/25',
    calHeaderWeekendText: 'text-amber-300',
    calDivider: 'divide-stone-200/80',
    calDayEvenBg: 'bg-white',
    calDayOddBg: 'bg-stone-50/90',
    calWeekendBg: 'bg-amber-50/40',
    calTodayBg: 'bg-red-50/60',
    calTodayRing: 'ring-2 ring-inset ring-red-700/50',
    calTodayBadge: 'bg-red-700 text-amber-300 shadow-xs',
    calDayNumEven: 'text-stone-800 bg-stone-100',
    calDayNumOdd: 'text-red-950 bg-red-50/80',
    calDayNumWeekend: 'text-amber-900 bg-amber-100/70',
    primaryBtn: 'bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white',
    secondaryBadge: 'bg-red-800 text-amber-300',
    todayCardGradient: 'bg-gradient-to-r from-red-900 via-red-800 to-stone-900 border-amber-400/40'
  },

  'clean-slate': {
    id: 'clean-slate',
    name: 'Minimalista Sóbrio',
    subtitle: 'Tons neutros de alto contraste e leitura leve',
    previewColors: ['#334155', '#64748b', '#f1f5f9', '#ffffff'],
    appBg: 'bg-slate-100',
    headerBg: 'bg-white border-b border-slate-200',
    headerText: 'text-slate-900',
    headerSubtext: 'text-slate-500',
    headerBorderTop: 'border-t-4 border-t-slate-800',
    navContainerBg: 'bg-slate-100 border border-slate-200',
    navActiveBg: 'bg-slate-800 text-white font-semibold shadow-xs',
    navActiveText: 'text-white',
    navInactiveText: 'text-slate-600 hover:text-slate-900 hover:bg-white',
    calBorder: 'border-slate-200',
    calHeaderBg: 'bg-slate-800',
    calHeaderText: 'text-slate-100',
    calHeaderWeekendBg: 'bg-slate-900/50',
    calHeaderWeekendText: 'text-slate-300',
    calDivider: 'divide-slate-200/80',
    calDayEvenBg: 'bg-white',
    calDayOddBg: 'bg-slate-50/70',
    calWeekendBg: 'bg-slate-100/60',
    calTodayBg: 'bg-blue-50/50',
    calTodayRing: 'ring-2 ring-inset ring-slate-800',
    calTodayBadge: 'bg-slate-900 text-white',
    calDayNumEven: 'text-slate-700 bg-slate-100',
    calDayNumOdd: 'text-slate-700 bg-white border border-slate-200',
    calDayNumWeekend: 'text-slate-500 bg-slate-200/60',
    primaryBtn: 'bg-slate-900 hover:bg-slate-800 text-white',
    secondaryBadge: 'bg-slate-800 text-white',
    todayCardGradient: 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 border-slate-600'
  }
};

export const THEME_LIST: ThemePalette[] = [
  THEMES['ft-19bpm'],
  THEMES['azul-operacional'],
  THEMES['rubro-ouro'],
  THEMES['clean-slate']
];
