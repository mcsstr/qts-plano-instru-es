import { Instrutor } from '../types';

export interface MilitaryRankDef {
  id: string;
  sigla: string;
  titulo: string;
  categoria: 'Oficiais Superiores' | 'Oficiais Intermediários e Subalternos' | 'Praças Especiais e Graduados' | 'Praças' | 'Outros';
  ordem: number;
  patterns: RegExp[];
}

export const PM_RANKS_HIERARCHY: MilitaryRankDef[] = [
  {
    id: 'cel_pm',
    sigla: 'Cel PM',
    titulo: 'Coronel PM',
    categoria: 'Oficiais Superiores',
    ordem: 1,
    // Cuidado para não capturar "Ten Cel PM" como "Cel PM"
    patterns: [/^(?:cel\.?\s*pm|coronel\s*pm|cel\.?)\b/i]
  },
  {
    id: 'ten_cel_pm',
    sigla: 'Ten Cel PM',
    titulo: 'Tenente-Coronel PM',
    categoria: 'Oficiais Superiores',
    ordem: 2,
    patterns: [/^(?:ten\.?\s*cel\.?\s*pm|tenente[\s-]*coronel\s*pm|tc\s*pm|ten\s*cel)\b/i]
  },
  {
    id: 'maj_pm',
    sigla: 'Maj PM',
    titulo: 'Major PM',
    categoria: 'Oficiais Superiores',
    ordem: 3,
    patterns: [/^(?:maj\.?\s*pm|major\s*pm|maj\.?)\b/i]
  },
  {
    id: 'cap_pm',
    sigla: 'Cap PM',
    titulo: 'Capitão PM',
    categoria: 'Oficiais Intermediários e Subalternos',
    ordem: 4,
    patterns: [/^(?:cap\.?\s*pm|capit[aã]o\s*pm|cap\.?)\b/i]
  },
  {
    id: '1_ten_pm',
    sigla: '1º Ten PM',
    titulo: '1º Tenente PM',
    categoria: 'Oficiais Intermediários e Subalternos',
    ordem: 5,
    patterns: [/^(?:1[º°o]?\s*ten\.?\s*pm|1[º°o]?\s*tenente\s*pm|1[º°o]?\s*ten\.?)\b/i]
  },
  {
    id: '2_ten_pm',
    sigla: '2º Ten PM',
    titulo: '2º Tenente PM',
    categoria: 'Oficiais Intermediários e Subalternos',
    ordem: 6,
    patterns: [/^(?:2[º°o]?\s*ten\.?\s*pm|2[º°o]?\s*tenente\s*pm|2[º°o]?\s*ten\.?|ten\.?\s*pm|tenente\s*pm)\b/i]
  },
  {
    id: 'asp_of_pm',
    sigla: 'Asp Of PM',
    titulo: 'Aspirante a Oficial PM',
    categoria: 'Praças Especiais e Graduados',
    ordem: 7,
    patterns: [/^(?:asp\.?\s*of\.?\s*pm|aspirante\s*(?:a\s*oficial)?\s*pm|asp\.?\s*pm|asp\.?\s*of\.?)\b/i]
  },
  {
    id: 'subten_pm',
    sigla: 'Subten PM',
    titulo: 'Subtenente PM',
    categoria: 'Praças Especiais e Graduados',
    ordem: 8,
    patterns: [/^(?:sub\s*ten\.?\s*pm|subtenente\s*pm|subten\.?\s*pm|sub\s*ten\.?|st\s*pm)\b/i]
  },
  {
    id: '1_sgt_pm',
    sigla: '1º Sgt PM',
    titulo: '1º Sargento PM',
    categoria: 'Praças Especiais e Graduados',
    ordem: 9,
    patterns: [/^(?:1[º°o]?\s*sgt\.?\s*pm|1[º°o]?\s*sargento\s*pm|1[º°o]?\s*sgt\.?)\b/i]
  },
  {
    id: '2_sgt_pm',
    sigla: '2º Sgt PM',
    titulo: '2º Sargento PM',
    categoria: 'Praças Especiais e Graduados',
    ordem: 10,
    patterns: [/^(?:2[º°o]?\s*sgt\.?\s*pm|2[º°o]?\s*sargento\s*pm|2[º°o]?\s*sgt\.?)\b/i]
  },
  {
    id: '3_sgt_pm',
    sigla: '3º Sgt PM',
    titulo: '3º Sargento PM',
    categoria: 'Praças Especiais e Graduados',
    ordem: 11,
    patterns: [/^(?:3[º°o]?\s*sgt\.?\s*pm|3[º°o]?\s*sargento\s*pm|3[º°o]?\s*sgt\.?|sgt\.?\s*pm|sargento\s*pm|sgt\.?)\b/i]
  },
  {
    id: 'cb_pm',
    sigla: 'Cb PM',
    titulo: 'Cabo PM',
    categoria: 'Praças',
    ordem: 12,
    patterns: [/^(?:cb\.?\s*pm|cabo\s*pm|cb\.?)\b/i]
  },
  {
    id: 'sd_pm',
    sigla: 'Sd PM',
    titulo: 'Soldado PM',
    categoria: 'Praças',
    ordem: 13,
    patterns: [/^(?:sd\.?\s*pm|soldado\s*pm|sd\.?)\b/i]
  }
];

export const FALLBACK_RANK: MilitaryRankDef = {
  id: 'outros',
  sigla: 'Outros',
  titulo: 'Demais Instrutores',
  categoria: 'Outros',
  ordem: 99,
  patterns: []
};

/**
 * Identifica o Posto/Graduação de um instrutor a partir do início do seu nome
 */
export function getInstrutorRank(nome: string): MilitaryRankDef {
  const clean = (nome || '').trim();
  // Testa Ten Cel PM antes de Cel PM para evitar falso positivo
  const orderedForMatching = [
    PM_RANKS_HIERARCHY[1], // Ten Cel PM
    PM_RANKS_HIERARCHY[0], // Cel PM
    ...PM_RANKS_HIERARCHY.slice(2)
  ];

  for (const rank of orderedForMatching) {
    for (const regex of rank.patterns) {
      if (regex.test(clean)) {
        return rank;
      }
    }
  }
  return FALLBACK_RANK;
}

/**
 * Extrai apenas o nome de guerra (sem o prefixo do posto/graduação) para ordenação alfabética dentro do mesmo posto
 */
export function getNomeDeGuerraSemPosto(nomeCompleto: string): string {
  const clean = (nomeCompleto || '').trim();
  const rank = getInstrutorRank(clean);
  if (rank.id === 'outros') return clean;
  for (const regex of rank.patterns) {
    if (regex.test(clean)) {
      return clean.replace(regex, '').trim();
    }
  }
  return clean;
}

/**
 * Ordena uma lista de instrutores rigorosamente por antiguidade (do mais antigo ao mais moderno)
 * e, dentro do mesmo posto/graduação, em ordem alfabética pelo nome de guerra.
 */
export function sortInstrutoresByAntiguidade(instrutores: Instrutor[]): Instrutor[] {
  return [...instrutores].sort((a, b) => {
    const rankA = getInstrutorRank(a.nome);
    const rankB = getInstrutorRank(b.nome);
    if (rankA.ordem !== rankB.ordem) {
      return rankA.ordem - rankB.ordem;
    }
    const guerraA = getNomeDeGuerraSemPosto(a.nome);
    const guerraB = getNomeDeGuerraSemPosto(b.nome);
    return guerraA.localeCompare(guerraB, 'pt-BR', { numeric: true, sensitivity: 'base' });
  });
}

/**
 * Agrupa os instrutores por Posto/Graduação em ordem de antiguidade (do mais antigo para o mais moderno)
 */
export function groupInstrutoresByAntiguidade(
  instrutores: Instrutor[]
): { rank: MilitaryRankDef; items: Instrutor[] }[] {
  const sorted = sortInstrutoresByAntiguidade(instrutores);
  const groupsMap = new Map<string, { rank: MilitaryRankDef; items: Instrutor[] }>();

  for (const inst of sorted) {
    const rank = getInstrutorRank(inst.nome);
    const existing = groupsMap.get(rank.id);
    if (existing) {
      existing.items.push(inst);
    } else {
      groupsMap.set(rank.id, { rank, items: [inst] });
    }
  }

  return Array.from(groupsMap.values()).sort((a, b) => a.rank.ordem - b.rank.ordem);
}
