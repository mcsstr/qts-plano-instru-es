export interface AppVersionEntry {
  version: string;
  date: string;
  highlights: string[];
}

export const CURRENT_APP_VERSION = 'v2.3.1';
export const CURRENT_APP_DATE = '12/11/2026';

export const APP_VERSION_HISTORY: AppVersionEntry[] = [
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
  },
  {
    version: 'v2.1.0',
    date: '12/11/2026',
    highlights: [
      'Remoção dos botões e telas de sincronização manual (100% automático no Appwrite)',
      'Sub-menu expansível de Tema dentro do menu sanduíche mobile e remoção do botão Ajustes na barra inferior',
      'Avisos de status simplificados (Salvo, Alterado, Atualizado e Excluído com sucesso)',
      'Card de aula de Hoje rolando junto com os demais cards e proteção de safe area para todos os modais'
    ]
  },
  {
    version: 'v2.0.0',
    date: '12/11/2026',
    highlights: [
      'Migração completa do banco de dados para o Appwrite Cloud (Projeto QTM-FT)',
      'Sincronização diferencial instantânea e atualização em tempo real via WebSocket',
      'Persistência global do tema escolhido pelo Admin diretamente no Appwrite'
    ]
  },
  {
    version: 'v1.5.0',
    date: '12/11/2026',
    highlights: [
      'Menu sanduíche superior com Seletor de Tema, Sair e Controle de Versões',
      'Exibição do Assunto da aula diretamente nos cards do calendário e lista',
      'Filtro estrito por Mês e Ano selecionado na visualização em Lista'
    ]
  }
];
