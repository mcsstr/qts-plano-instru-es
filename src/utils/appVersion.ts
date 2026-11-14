export interface AppVersionEntry {
  version: string;
  date: string;
  highlights: string[];
}

export const CURRENT_APP_VERSION = 'v2.4.4';
export const CURRENT_APP_DATE = '14/11/2026';

export const APP_VERSION_HISTORY: AppVersionEntry[] = [
  {
    version: 'v2.4.4',
    date: '14/11/2026',
    highlights: [
      'Trava da barra de Mês/Ano no mobile para permanecer 100% imóvel na posição inicial durante a rolagem, sem subir para colar no menu'
    ]
  },
  {
    version: 'v2.4.3',
    date: '14/11/2026',
    highlights: [
      'Elevação do menu superior no PWA para ficar colado ao limite da Dynamic Island / Safe Area manteniendo 100% de nitidez'
    ]
  },
  {
    version: 'v2.4.2',
    date: '14/11/2026',
    highlights: [
      'Eliminação do efeito esfumaçado (blur) nos botões do menu superior no iOS 26 usando faixa sólida de topo para o Color Sampler do WebKit e cores 100% opacas'
    ]
  },
  {
    version: 'v2.4.1',
    date: '14/11/2026',
    highlights: [
      'Reforço de cache-busting no PWA (desregistro automático de Service Worker antigo e recarregamento com parâmetro de versão a cada 15s)'
    ]
  },
  {
    version: 'v2.4.0',
    date: '14/11/2026',
    highlights: [
      'Renomeação do sistema para "Quadro de Instruções FT"',
      'Menu superior posicionado rente ao limite da safe area e sem efeito esfumaçado no iOS/PWA (arquitetura App Shell com rolagem isolada)',
      'Botão "Entrar" exclusivo dentro do menu sanduíche / engrenagem',
      'Atualização forçada automática (Service Worker + verificação em tempo real de version.json) no site e no PWA'
    ]
  },
  {
    version: 'v2.3.4',
    date: '13/11/2026',
    highlights: [
      'Correção definitiva da largura dos campos de data (Início/Término) no Gerador de Período para iOS/Mobile'
    ]
  },
  {
    version: 'v2.3.3',
    date: '13/11/2026',
    highlights: [
      'Ajuste de alinhamento mobile no Gerador de Período (campos de data contidos no card, botões "Dias da semana" / "Dias do mês" compactos e seção 2 alinhada)',
      'Subida do menu superior mobile até o limite seguro abaixo da safe area'
    ]
  },
  {
    version: 'v2.3.2',
    date: '12/11/2026',
    highlights: [
      'Remoção do botão inferior duplicado nos dias com múltiplas aulas (mantendo apenas o indicador superior ao lado da data)',
      'Botão de visualizar/ocultar senha (olho) na tela de Login para facilitar a conferência'
    ]
  },
  {
    version: 'v2.3.1',
    date: '12/11/2026',
    highlights: [
      'Exibição de Matéria, Assunto e Instrutor diretamente nos cards compactos da grade mensal',
      'Grade limitada a 1 aula visível por dia com botão para abrir o Modal do Dia quando houver múltiplas aulas',
      'Sobreposição organizada de modais (Modal do Dia -> Detalhes da Aula -> Edição/Prejuízo) com proteção de safe area no celular'
    ]
  },
  {
    version: 'v2.3.0',
    date: '12/11/2026',
    highlights: [
      'Grade do calendário e cards compactados para caber o mês inteiro na tela sem rolagem excessiva',
      'Pré-cadastro e parametrização de Assuntos dentro de cada Matéria com nível de importância (1x, 2x, 3x)',
      'Gerador de Período adaptado para distribuir automaticamente os assuntos cadastrados com seleção rápida na prévia',
      'Atalho de assuntos pré-cadastrados ao agendar ou editar uma aula individual'
    ]
  },
  {
    version: 'v2.2.0',
    date: '12/11/2026',
    highlights: [
      'Menu Engrenagem na versão Desktop unificando Login/Usuário, Botão Sair, Sub-menu Tema e Versão do App',
      'Redesign completo dos 4 temas com paletas SaaS executivas (Obsidian Pro, Sapphire Corporate, Emerald Executive e Minimalist Daylight)',
      'Nova tipografia profissional (Plus Jakarta Sans & Inter) e remodelação da grade mensal e dos cards de aula'
    ]
  }
];
