export type TipoRespostaPesquisa =
  | 'escala_likert'    // Escala 1 a 5 (Discordo Totalmente -> Concordo Totalmente)
  | 'nota_numerica'    // Nota de 0 a 10
  | 'numero'           // Número livre digitado pelo usuário
  | 'escolha_unica'    // Múltipla escolha (apenas 1 opção)
  | 'multipla_escolha' // Múltipla escolha (várias opções / checkboxes)
  | 'sim_nao'          // Sim / Não / Parcialmente
  | 'texto_curto'      // Resposta curta em uma linha
  | 'texto_longo';     // Sugestão / comentário aberto

export interface PerguntaPesquisa {
  id: string;
  texto: string;
  descricaoAuxiliar?: string;
  tipo: TipoRespostaPesquisa;
  obrigatoria: boolean;
  /** Opções para escolha_unica ou multipla_escolha */
  opcoes?: string[];
  /** Rótulos personalizados para os extremos da escala (ex: "Muito Insatisfeito" / "Muito Satisfeito") */
  rotuloMin?: string;
  rotuloMax?: string;
}

export interface TopicoPesquisa {
  id: string;
  titulo: string;
  descricao?: string;
  perguntas: PerguntaPesquisa[];
}

export type StatusPesquisa = 'rascunho' | 'publicada' | 'encerrada';

export interface PesquisaOrganizacional {
  id: string;
  titulo: string;
  descricao: string;
  anonima: boolean;
  solicitarPelotao: boolean;
  status: StatusPesquisa;
  topicos: TopicoPesquisa[];
  criadaEm: string;
  atualizadaEm: string;
}

export interface RespostaPesquisa {
  id: string;
  pesquisaId: string;
  respondidaEm: string;
  identificacaoNome?: string;
  identificacaoPelotao?: string;
  /** Mapa de perguntaId -> valor respondido (string | number | string[]) */
  respostas: Record<string, string | number | string[]>;
}

export type SurveyAdminTab = 'criar' | 'divulgar' | 'metricas';

