export interface AppVersionEntry {
  version: string;
  date: string;
  highlights: string[];
}

export const CURRENT_APP_VERSION = 'v1.5.0';
export const CURRENT_APP_DATE = '12/11/2026';

export const APP_VERSION_HISTORY: AppVersionEntry[] = [
  {
    version: 'v1.5.0',
    date: '12/11/2026',
    highlights: [
      'Menu sanduíche superior com Seletor de Tema, Sair e Controle de Versões',
      'Exibição do Assunto da aula diretamente nos cards do calendário e lista',
      'Filtro estrito por Mês e Ano selecionado na visualização em Lista',
      'Ajuste de altura do menu superior fora da área esfumaçada do safe area'
    ]
  },
  {
    version: 'v1.4.0',
    date: '12/11/2026',
    highlights: [
      'Modais adaptáveis ao teclado virtual no celular',
      'Cores do safe area sincronizadas com os 4 temas da unidade',
      'Card de aviso de sincronização posicionado abaixo do menu superior'
    ]
  },
  {
    version: 'v1.3.0',
    date: '12/11/2026',
    highlights: [
      'Gerador por mês e dias específicos separados por vírgula (sem rodízio)',
      'Sincronização segura com a Planilha Google sem perda de dados',
      'Desmarcação rápida de prejuízo de aula'
    ]
  }
];
