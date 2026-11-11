import { Turma, Materia, Instrutor, Aula, Gestor } from '../types';

export const INITIAL_TURMAS: Turma[] = [
  {
    id: 'turma-alfa',
    nome: 'Turma Alfa - Formação Geral',
    sigla: 'ALFA',
    cor: '#2563eb', // Blue
    descricao: 'Turma do Curso de Formação - 1º Pelotão',
    turnoPadrao: 'Integral',
    ativa: true
  },
  {
    id: 'turma-bravo',
    nome: 'Turma Bravo - Aperfeiçoamento',
    sigla: 'BRAVO',
    cor: '#059669', // Emerald
    descricao: 'Turma de Aperfeiçoamento Profissional',
    turnoPadrao: 'Manhã',
    ativa: true
  },
  {
    id: 'turma-charlie',
    nome: 'Turma Charlie - Especialização',
    sigla: 'CHARLIE',
    cor: '#7c3aed', // Purple
    descricao: 'Módulo Tático e Operacional',
    turnoPadrao: 'Tarde',
    ativa: true
  }
];

export const INITIAL_MATERIAS: Materia[] = [
  {
    id: 'mat-tiro',
    nome: 'Tiro Prático e Manuseio de Armamento',
    sigla: 'TIRO',
    cor: '#dc2626', // Red
    cargaDiasObjetivo: 15,
    descricao: 'Técnicas de tiro, segurança e manutenção',
    ativa: true
  },
  {
    id: 'mat-aph',
    nome: 'Primeiros Socorros e APH Tático',
    sigla: 'APH',
    cor: '#ea580c', // Orange
    cargaDiasObjetivo: 10,
    descricao: 'Atendimento pré-hospitalar em ambiente operacional',
    ativa: true
  },
  {
    id: 'mat-dir',
    nome: 'Direito Aplicado e Legislação',
    sigla: 'DIREITO',
    cor: '#2563eb', // Blue
    cargaDiasObjetivo: 12,
    descricao: 'Fundamentos jurídicos, direitos humanos e processo',
    ativa: true
  },
  {
    id: 'mat-defesa',
    nome: 'Defesa Pessoal e Técnicas de Imobilização',
    sigla: 'DEFESA',
    cor: '#16a34a', // Green
    cargaDiasObjetivo: 12,
    descricao: 'Controle de contato físico e algemação',
    ativa: true
  },
  {
    id: 'mat-crise',
    nome: 'Gerenciamento de Crises e Negociação',
    sigla: 'CRISES',
    cor: '#8b5cf6', // Violet
    cargaDiasObjetivo: 8,
    descricao: 'Postura em situações de alta complexidade',
    ativa: true
  },
  {
    id: 'mat-transito',
    nome: 'Fiscalização e Legislação de Trânsito',
    sigla: 'TRÂNSITO',
    cor: '#d97706', // Amber
    cargaDiasObjetivo: 8,
    descricao: 'Procedimentos e autuações operacionais',
    ativa: true
  }
];

export const INITIAL_INSTRUTORES: Instrutor[] = [
  {
    id: 'inst-rocha',
    nome: 'Capitão Rocha',
    contato: '(11) 98765-4321',
    materiasAptas: ['mat-tiro', 'mat-aph', 'mat-crise'],
    ativo: true,
    observacoes: 'Instrutor sênior de armamento e combate'
  },
  {
    id: 'inst-silva',
    nome: 'Tenente Beatriz Silva',
    contato: '(11) 97654-3210',
    materiasAptas: ['mat-dir', 'mat-transito'],
    ativo: true,
    observacoes: 'Especialista em Direito e Legislação'
  },
  {
    id: 'inst-mendes',
    nome: 'Sargento Mendes',
    contato: '(11) 96543-2109',
    materiasAptas: ['mat-defesa', 'mat-tiro'],
    ativo: true,
    observacoes: 'Mestre em artes marciais e tiro'
  },
  {
    id: 'inst-oliveira',
    nome: 'Sargento Oliveira',
    contato: '(11) 95432-1098',
    materiasAptas: ['mat-aph', 'mat-crise'],
    ativo: true,
    observacoes: 'Socorrista de resgate tático'
  },
  {
    id: 'inst-pereira',
    nome: 'Cabo Pereira',
    contato: '(11) 94321-0987',
    materiasAptas: ['mat-transito', 'mat-dir'],
    ativo: true,
    observacoes: 'Instrutor de operações de trânsito'
  }
];

export const INITIAL_GESTORES: Gestor[] = [
  {
    id: 'gestor-1',
    nome: 'Coordenação QTS',
    login: 'admin',
    senha: '123',
    cargo: 'Administrador Geral',
    ativo: true
  },
  {
    id: 'gestor-2',
    nome: 'Capitão Rocha (Gestor)',
    login: 'rocha',
    senha: '123',
    cargo: 'Oficial de Ensino',
    ativo: true
  }
];

// Helper to get dates relative to today
const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_AULAS: Aula[] = [
  {
    id: 'aula-1',
    data: getRelativeDate(-6),
    turmaId: 'turma-alfa',
    materiaId: 'mat-tiro',
    instrutorId: 'inst-rocha',
    turno: 'Integral',
    horario: '08:00 - 17:00',
    status: 'realizada',
    observacoes: 'Treinamento de fundamentos de pontaria no estande',
    criadaEm: new Date().toISOString()
  },
  {
    id: 'aula-2',
    data: getRelativeDate(-5),
    turmaId: 'turma-alfa',
    materiaId: 'mat-aph',
    instrutorId: 'inst-oliveira',
    turno: 'Integral',
    horario: '08:00 - 17:00',
    status: 'realizada',
    observacoes: 'Torniquetes e controle de hemorragias massivas',
    criadaEm: new Date().toISOString()
  },
  {
    id: 'aula-3',
    data: getRelativeDate(-4),
    turmaId: 'turma-alfa',
    materiaId: 'mat-dir',
    instrutorId: 'inst-silva',
    turno: 'Integral',
    horario: '08:00 - 17:00',
    status: 'realizada',
    observacoes: 'Direitos fundamentais e garantias constitucionais',
    criadaEm: new Date().toISOString()
  },
  {
    id: 'aula-4',
    data: getRelativeDate(-3),
    turmaId: 'turma-alfa',
    materiaId: 'mat-defesa',
    instrutorId: 'inst-mendes',
    turno: 'Integral',
    horario: '08:00 - 17:00',
    status: 'realizada',
    observacoes: 'Chaves de braço e retenção de armamento',
    criadaEm: new Date().toISOString()
  },
  {
    id: 'aula-5',
    data: getRelativeDate(-2),
    turmaId: 'turma-alfa',
    materiaId: 'mat-tiro',
    instrutorId: 'inst-rocha',
    turno: 'Integral',
    horario: '08:00 - 17:00',
    status: 'prejudicada',
    motivoPrejuizo: 'Chuva torrencial inviabilizou o estande aberto. Aula transferida para reposição.',
    remanejadaParaId: 'aula-8',
    observacoes: 'Remanejada conforme deliberação da coordenação',
    criadaEm: new Date().toISOString()
  },
  {
    id: 'aula-6',
    data: getRelativeDate(-1),
    turmaId: 'turma-bravo',
    materiaId: 'mat-crise',
    instrutorId: 'inst-oliveira',
    turno: 'Manhã',
    horario: '08:00 - 12:00',
    status: 'realizada',
    observacoes: 'Simulado de contenção e isolamento',
    criadaEm: new Date().toISOString()
  },
  {
    id: 'aula-7',
    data: getRelativeDate(0), // Hoje
    turmaId: 'turma-alfa',
    materiaId: 'mat-transito',
    instrutorId: 'inst-pereira',
    turno: 'Integral',
    horario: '08:00 - 17:00',
    status: 'agendada',
    observacoes: 'Prática de blitz educativa e preenchimento de autos',
    criadaEm: new Date().toISOString()
  },
  {
    id: 'aula-8',
    data: getRelativeDate(1), // Amanhã
    turmaId: 'turma-alfa',
    materiaId: 'mat-tiro',
    instrutorId: 'inst-rocha',
    turno: 'Integral',
    horario: '08:00 - 17:00',
    status: 'agendada',
    remanejadaDeId: 'aula-5',
    observacoes: 'Reposição da aula prejudicada pela chuva no estande',
    criadaEm: new Date().toISOString()
  },
  {
    id: 'aula-9',
    data: getRelativeDate(2),
    turmaId: 'turma-bravo',
    materiaId: 'mat-dir',
    instrutorId: 'inst-silva',
    turno: 'Manhã',
    horario: '08:00 - 12:00',
    status: 'agendada',
    observacoes: 'Estudo de casos reais',
    criadaEm: new Date().toISOString()
  },
  {
    id: 'aula-10',
    data: getRelativeDate(3),
    turmaId: 'turma-charlie',
    materiaId: 'mat-defesa',
    instrutorId: 'inst-mendes',
    turno: 'Tarde',
    horario: '13:00 - 17:00',
    status: 'agendada',
    observacoes: 'Treinamento de algemação em dupla',
    criadaEm: new Date().toISOString()
  },
  {
    id: 'aula-11',
    data: getRelativeDate(4),
    turmaId: 'turma-alfa',
    materiaId: 'mat-crise',
    instrutorId: 'inst-rocha',
    turno: 'Integral',
    horario: '08:00 - 17:00',
    status: 'agendada',
    observacoes: 'Técnicas de persuasão tática',
    criadaEm: new Date().toISOString()
  }
];
