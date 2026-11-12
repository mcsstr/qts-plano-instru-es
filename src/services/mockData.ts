import { Turma, Materia, Instrutor, Aula, Gestor } from '../types';

export const INITIAL_TURMAS: Turma[] = [
  {
    id: 'turma-alfa',
    nome: '1º Pelotão FT',
    sigla: '1º PEL',
    cor: '#059669',
    descricao: '1º Pelotão de Força Tática - 19ºBPM/I',
    turnoPadrao: 'Integral',
    ativa: true
  },
  {
    id: 'turma-bravo',
    nome: '2º Pelotão FT',
    sigla: '2º PEL',
    cor: '#2563eb',
    descricao: '2º Pelotão de Força Tática - 19ºBPM/I',
    turnoPadrao: 'Integral',
    ativa: true
  }
];

export const INITIAL_MATERIAS: Materia[] = [
  {
    id: 'mat-tiro',
    nome: 'Tiro Defensivo',
    sigla: 'TIRO',
    cor: '#dc2626',
    cargaDiasObjetivo: 1,
    descricao: 'Técnicas de tiro, segurança e manutenção',
    ativa: true
  },
  {
    id: 'mat-aph',
    nome: 'APH Tático',
    sigla: 'APH',
    cor: '#ea580c',
    cargaDiasObjetivo: 1,
    descricao: 'Atendimento pré-hospitalar em ambiente operacional',
    ativa: true
  },
  {
    id: 'mat-dir',
    nome: 'Direito Aplicado e Legislação',
    sigla: 'DIREITO',
    cor: '#2563eb',
    cargaDiasObjetivo: 4,
    descricao: 'Fundamentos jurídicos, direitos humanos e processo',
    ativa: true
  },
  {
    id: 'mat-defesa',
    nome: 'Defesa Pessoal e Técnicas de Imobilização',
    sigla: 'DEFESA',
    cor: '#16a34a',
    cargaDiasObjetivo: 12,
    descricao: 'Controle de contato físico e algemação',
    ativa: true
  },
  {
    id: 'mat-crise',
    nome: 'CQB',
    sigla: 'CQB',
    cor: '#8b5cf6',
    cargaDiasObjetivo: 1,
    descricao: 'Postura em situações de alta complexidade',
    ativa: true
  },
  {
    id: 'mat-transito',
    nome: 'Conduta de Patrulha',
    sigla: 'CONDUTA',
    cor: '#d97706',
    cargaDiasObjetivo: 1,
    descricao: 'Procedimentos e autuações operacionais',
    ativa: true
  },
  {
    id: 'mat-1794442346613',
    nome: 'Condicionamento Físico',
    sigla: 'FÍSICO',
    cor: '#db2777',
    cargaDiasObjetivo: 10,
    descricao: '',
    ativa: true
  }
];

export const INITIAL_INSTRUTORES: Instrutor[] = [
  {
    id: 'inst-rocha',
    nome: 'Cap PM Teodoro',
    contato: '',
    materiasAptas: ['mat-1794442346613'],
    ativo: true,
    observacoes: ''
  },
  {
    id: 'inst-silva',
    nome: '1º Ten PM Marcos Sotero',
    contato: '(17) 98189-5563',
    materiasAptas: ['mat-dir'],
    ativo: true,
    observacoes: ''
  },
  {
    id: 'inst-mendes',
    nome: 'Sgt PM Permegiani',
    contato: '',
    materiasAptas: ['mat-defesa', 'mat-tiro'],
    ativo: true,
    observacoes: 'Mestre em artes marciais e tiro'
  },
  {
    id: 'inst-oliveira',
    nome: '1º Sgt PM Gonçalves',
    contato: '',
    materiasAptas: [],
    ativo: true,
    observacoes: 'Socorrista de resgate tático'
  },
  {
    id: 'inst-pereira',
    nome: '1º Sgt PM Silvestre',
    contato: '',
    materiasAptas: [],
    ativo: true,
    observacoes: 'Instrutor de operações de trânsito'
  },
  {
    id: 'inst-1794507868152',
    nome: '1º Sgt PM Simões',
    contato: '',
    materiasAptas: [],
    ativo: true,
    observacoes: ''
  },
  {
    id: 'inst-1794507882176',
    nome: '2º Sgt PM Leandro',
    contato: '',
    materiasAptas: [],
    ativo: true,
    observacoes: ''
  },
  {
    id: 'inst-1794507937072',
    nome: 'Subten PM Celestino',
    contato: '',
    materiasAptas: ['mat-tiro'],
    ativo: true,
    observacoes: ''
  }
];

export const INITIAL_GESTORES: Gestor[] = [
  {
    id: 'gestor-1',
    nome: 'Coordenação QTS',
    login: 'admin',
    senha: 'Str302415@',
    cargo: 'Administrador Geral',
    ativo: true
  },
  {
    id: 'gestor-2',
    nome: 'Cap PM Teodoro',
    login: 'teodoro',
    senha: '123',
    cargo: 'Cmt Cia FT',
    ativo: true
  },
  {
    id: 'gestor-1794430000752',
    nome: '1º Ten PM Marcos Sotero',
    login: '1488872',
    senha: 'Str302415@',
    cargo: 'Cmt Pel FT',
    ativo: true
  }
];

export const INITIAL_AULAS: Aula[] = [
  {
    id: 'aula-ft-20261123',
    data: '2026-11-23',
    turmaId: 'turma-bravo',
    materiaId: 'mat-1794442346613',
    instrutorId: 'inst-rocha',
    turno: 'Integral',
    horario: '08:00 - 17:00',
    status: 'agendada',
    observacoes: '',
    criadaEm: '2026-11-12T18:00:00.000Z'
  },
  {
    id: 'aula-ft-20261124',
    data: '2026-11-24',
    turmaId: 'turma-alfa',
    materiaId: 'mat-1794442346613',
    instrutorId: 'inst-rocha',
    turno: 'Integral',
    horario: '08:00 - 17:00',
    status: 'agendada',
    observacoes: '',
    criadaEm: '2026-11-12T18:00:00.000Z'
  },
  {
    id: 'aula-ft-20261126',
    data: '2026-11-26',
    turmaId: 'turma-alfa',
    materiaId: 'mat-1794442346613',
    instrutorId: 'inst-rocha',
    turno: 'Integral',
    horario: '08:00 - 17:00',
    status: 'agendada',
    observacoes: '',
    criadaEm: '2026-11-12T18:00:00.000Z'
  },
  {
    id: 'aula-ft-20261127',
    data: '2026-11-27',
    turmaId: 'turma-bravo',
    materiaId: 'mat-1794442346613',
    instrutorId: 'inst-rocha',
    turno: 'Integral',
    horario: '08:00 - 17:00',
    status: 'agendada',
    observacoes: '',
    criadaEm: '2026-11-12T18:00:00.000Z'
  },
  {
    id: 'aula-ft-20261130',
    data: '2026-11-30',
    turmaId: 'turma-alfa',
    materiaId: 'mat-1794442346613',
    instrutorId: 'inst-rocha',
    turno: 'Integral',
    horario: '08:00 - 17:00',
    status: 'agendada',
    observacoes: '',
    criadaEm: '2026-11-12T18:00:00.000Z'
  },
  {
    id: 'aula-ft-20261201',
    data: '2026-12-01',
    turmaId: 'turma-bravo',
    materiaId: 'mat-1794442346613',
    instrutorId: 'inst-rocha',
    turno: 'Integral',
    horario: '08:00 - 17:00',
    status: 'agendada',
    observacoes: '',
    criadaEm: '2026-11-12T18:00:00.000Z'
  },
  {
    id: 'aula-ft-20261203',
    data: '2026-12-03',
    turmaId: 'turma-bravo',
    materiaId: 'mat-1794442346613',
    instrutorId: 'inst-rocha',
    turno: 'Integral',
    horario: '08:00 - 17:00',
    status: 'agendada',
    observacoes: '',
    criadaEm: '2026-11-12T18:00:00.000Z'
  },
  {
    id: 'aula-ft-20261204',
    data: '2026-12-04',
    turmaId: 'turma-alfa',
    materiaId: 'mat-1794442346613',
    instrutorId: 'inst-rocha',
    turno: 'Integral',
    horario: '08:00 - 17:00',
    status: 'agendada',
    observacoes: '',
    criadaEm: '2026-11-12T18:00:00.000Z'
  }
];
