export type Turno = 'Manhã' | 'Tarde' | 'Noite' | 'Integral';

export type AulaStatus = 'agendada' | 'realizada' | 'prejudicada' | 'remanejada' | 'cancelada';

export type AppTheme = 'ft-19bpm' | 'azul-operacional' | 'rubro-ouro' | 'clean-slate';

export interface Turma {
  id: string;
  nome: string;
  sigla: string;
  cor: string;
  descricao?: string;
  turnoPadrao?: Turno;
  ativa: boolean;
}

export interface Materia {
  id: string;
  nome: string;
  sigla: string;
  cor: string;
  cargaDiasObjetivo?: number; // Meta de dias/encontros
  descricao?: string;
  ativa: boolean;
}

export interface Instrutor {
  id: string;
  nome: string;
  contato?: string;
  materiasAptas: string[]; // IDs das matérias em que possui conhecimento pertinente
  ativo: boolean;
  observacoes?: string;
}

export interface Aula {
  id: string;
  data: string; // formato YYYY-MM-DD
  turmaId: string;
  materiaId: string;
  instrutorId: string;
  turno: Turno;
  horario?: string; // ex: "08:00 - 12:00"
  status: AulaStatus;
  motivoPrejuizo?: string; // Detalhes caso a aula tenha sido prejudicada
  remanejadaParaId?: string; // ID da nova aula criada caso remanejada
  remanejadaDeId?: string; // ID da aula original caso seja fruto de remanejamento
  observacoes?: string;
  criadaEm: string;
}

export interface Gestor {
  id: string;
  nome: string;
  login: string;
  senha: string;
  cargo?: string;
  ativo: boolean;
}

export interface AuthUser {
  nome: string;
  login?: string;
  role: 'admin' | 'gestor' | 'publico';
  autenticado: boolean;
}

export interface GoogleSheetsConfig {
  scriptUrl: string;
  autoSync: boolean;
  ultimaSincronizacao?: string;
  theme?: AppTheme;
}

export interface AppState {
  turmas: Turma[];
  materias: Materia[];
  instrutores: Instrutor[];
  aulas: Aula[];
  gestores: Gestor[];
  sheetsConfig: GoogleSheetsConfig;
}
