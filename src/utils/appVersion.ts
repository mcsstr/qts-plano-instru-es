export interface AppVersionEntry {
  version: string;
  date: string;
  highlights: string[];
}

export const CURRENT_APP_VERSION = 'v2.8.0';
export const CURRENT_APP_DATE = '24/11/2026';

export const APP_VERSION_HISTORY: AppVersionEntry[] = [
  {
    version: 'v2.8.0',
    date: '24/11/2026',
    highlights: [
      'Nova aba "Horários" na tela de Cadastros para gerenciar turnos, horários de instrução e configurar o horário padrão do sistema',
      'Configuração padrão no agendamento: Turno pré-selecionado para Tarde (13:00 - 17:00) e Matéria pré-selecionada para Atividade Física',
      'Remoção da identificação de turma na lista de seleção de instrutores, mantendo a visualização limpa',
      'Exibição do dia da semana (Seg, Ter, Qua, Qui, Sex, Sáb, Dom) em conjunto com a data em todo o sistema e modais',
      'Regra de conclusão de aulas: aulas agendadas anteriores ao dia de hoje (após a meia-noite) passam automaticamente a realizadas, mantendo no dia atual a possibilidade de remanejamento/prejuízo com total controle do gestor'
    ]
  },
  {
    version: 'v2.7.3',
    date: '24/11/2026',
    highlights: [
      'Substituição do ícone pelo símbolo de Impressora (Printer) no botão do Calendário (desktop e mobile)',
      'Identificação explícita da versão do sistema no rodapé da folha impressa A4 para validação visual imediata',
      'Botão "Atualizar" de 1 toque no cabeçalho/menu para limpar Service Worker, esvaziar cache PWA e recarregar',
      'Foco automático imediato na guia de pré-visualização do PDF ao clicar em Imprimir/Gerar'
    ]
  },
  {
    version: 'v2.7.2',
    date: '24/11/2026',
    highlights: [
      'Brasão oficial da Força Tática (19º BPM/I) em alta resolução incorporado diretamente no cabeçalho do PDF impresso',
      'Remoção do ícone de usuário na coluna de instrutor e remoção da sigla da matéria na tabela de instruções',
      'Desativação temporária dos blocos de assinatura para maior aproveitamento de espaço e impressão direta'
    ]
  },
  {
    version: 'v2.7.1',
    date: '24/11/2026',
    highlights: [
      'Abertura direta do PDF do Calendário em nova guia dedicada do navegador com pré-visualização completa em formato A4 antes da impressão',
      'Remoção de sobreposições modais para visualização limpa e botão flutuante para Imprimir / Salvar em PDF'
    ]
  },
  {
    version: 'v2.7.0',
    date: '24/11/2026',
    highlights: [
      'Novo gerador de PDF do Calendário Mensal de Instruções em formato oficial A4 Retrato para envio aos instrutores',
      'Tabelas separadas por Pelotão/Turma contendo apenas os dias de instrução, turno, matéria, assunto e instrutor',
      'Colunas com cores alternadas e campos de assinatura oficial para conferência e visto de comando',
      'Botão de acesso rápido "Gerar PDF" posicionado ao lado do botão de Filtros (desktop e mobile)'
    ]
  },
  {
    version: 'v2.6.6',
    date: '17/11/2026',
    highlights: [
      'Exibição restrita apenas aos grupos de postos/patentes que possuam instrutores cadastrados, ocultando grupos sem efetivo'
    ]
  },
  {
    version: 'v2.6.5',
    date: '17/11/2026',
    highlights: [
      'Botões "+ Adicionar" em cada grupo de patente militar com pré-seleção automática do posto no modal',
      'Campo opcional no cadastro de instrutores para vinculá-lo a uma turma existente ou manter geral',
      'Exibição de badge com a cor e sigla da turma vinculada nos cards de instrutores',
      'Filtros na página geral de Instrutores: filtrar por Turma, por Posto/Graduação e busca rápida por nome/contato'
    ]
  },
  {
    version: 'v2.6.4',
    date: '17/11/2026',
    highlights: [
      'Separação dos instrutores em grupos por antiguidade militar (do mais antigo ao mais moderno: Cel PM até Sd PM) e seletor de Posto/Graduação no cadastro'
    ]
  },
  {
    version: 'v2.6.3',
    date: '17/11/2026',
    highlights: [
      'Botões principais (Cancelar / Salvar) fixos no rodapé dos modais sem nunca sumir durante a rolagem',
      'Ordenação alfabética e numérica sequencial automática para todas as Matérias e todos os Assuntos',
      'Botão de expandir/recolher os assuntos nas matérias (substituindo a barra de pílulas Todas as Matérias)',
      'Modal específico ao editar na aba "Pesquisar por Assunto" permitindo alterar o nome do assunto ou transferi-lo para outra matéria'
    ]
  },
  {
    version: 'v2.6.2',
    date: '17/11/2026',
    highlights: [
      'Aba Matérias (Cadastros): novos botões e busca para consultar Por Matéria (listando seus assuntos) ou Por Assunto (exibindo a matéria vinculada)',
      'Página de Métricas: nova seção e aba de Metrificação de Assuntos Ministrados & Repetições com gráfico, filtro por matéria e contagem individual'
    ]
  },
  {
    version: 'v2.6.1',
    date: '17/11/2026',
    highlights: [
      'Inversão da hierarquia visual nos cards do calendário: o Assunto da aula passa a ser o texto principal em destaque e o nome da Matéria aparece no texto menor logo abaixo'
    ]
  },
  {
    version: 'v2.6.0',
    date: '16/11/2026',
    highlights: [
      'Novo Módulo Independente de Pesquisa Organizacional exclusivo para o Gestor Administrador no menu engrenagem',
      '1. Construtor de Pesquisas por Tópicos e Perguntas parametrizadas (Escala 1-5, Nota 0-10, Número, Escolha Única/Múltipla, Sim/Não e Texto)',
      '2. Central de Divulgação com geração de Link Público Independente (?pesquisa=...), compartilhamento no WhatsApp e QR Code',
      '3. Painel de Metrificação de Resultados por Tópico e por Pergunta com exportação para Excel (CSV)'
    ]
  },
  {
    version: 'v2.5.4',
    date: '14/11/2026',
    highlights: [
      'Aumento do respiro inferior do cabeçalho mobile logo abaixo do botão sanduíche para melhor contorno e separação visual do conteúdo'
    ]
  },
  {
    version: 'v2.5.3',
    date: '14/11/2026',
    highlights: [
      'Redesign do card de adição de Assuntos da Matéria no mobile (campos e botão Adicionar 100% alinhados dentro do card)'
    ]
  },
  {
    version: 'v2.5.2',
    date: '14/11/2026',
    highlights: [
      'Ícone do PWA em estilo iOS 27 Liquid Glass 100% full-bleed (o próprio quadro/cápsulas de vidro preenchem todo o ícone de ponta a ponta, sem fundo delimitador externo)'
    ]
  },
  {
    version: 'v2.5.1',
    date: '14/11/2026',
    highlights: [
      'Cabeçalho limpo apenas com o texto contínuo "Quadro de Instruções FT" (sem logotipo no topo do site)',
      'Novo ícone exclusivo para salvar o PWA seguindo o padrão ortográfico em camadas de vidro fosco dos apps nativos do iOS 27 (Icon Composer)'
    ]
  },
  {
    version: 'v2.5.0',
    date: '14/11/2026',
    highlights: [
      'Novo logotipo e ícone do app em estilo 3D Liquid Glass (Tema Vidro iOS 27) no cabeçalho e no PWA, acompanhado do selo FT estilizado'
    ]
  },
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
