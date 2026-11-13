import { Aula, Materia, Instrutor, Turno } from '../types';
import { getDaysInPeriod } from './dateUtils';

export interface BatchGenerationParams {
  turmaId: string;
  dataInicio: string;
  dataFim: string;
  diasSemana: number[]; // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
  materiasIds: string[];
  estrategiaRodizio: 'equilibrado' | 'sequencial' | 'aleatorio';
  estrategiaInstrutor: 'apto_preferencial' | 'rotativo' | 'fixo';
  instrutorFixoId?: string;
  turnoPadrao: Turno;
  horarioPadrao?: string;
  pularDiasComAulaExistente: boolean;
  assuntoPadrao?: string;
  /** Mapa opcional: materiaId -> IDs de assuntos selecionados para este período */
  selectedAssuntosByMateria?: Record<string, string[]>;
  /** Se true, distribui automaticamente os assuntos pré-cadastrados de cada matéria respeitando o peso */
  usarAssuntosCadastrados?: boolean;
}

export interface GeneratedAulaPreview {
  tempId: string;
  data: string;
  turmaId: string;
  materiaId: string;
  instrutorId: string;
  turno: Turno;
  horario: string;
  status: 'agendada';
  observacoes: string;
  instrutorApto: boolean;
}

/**
 * Constrói uma lista cíclica intercalada de nomes de assuntos de acordo com o peso (1x, 2x, 3x).
 * Ex: A (peso 2) e B (peso 1) -> ['A', 'B', 'A']
 */
function buildWeightedAssuntoCycle(
  materia: Materia | undefined,
  selectedIds?: string[]
): string[] {
  if (!materia || !Array.isArray(materia.assuntos) || materia.assuntos.length === 0) {
    return [];
  }

  const activeAssuntos =
    selectedIds !== undefined
      ? materia.assuntos.filter(a => selectedIds.includes(a.id))
      : materia.assuntos;

  if (activeAssuntos.length === 0) return [];

  const maxPeso = Math.max(...activeAssuntos.map(a => Math.max(1, a.peso || 1)));
  const cycle: string[] = [];

  for (let round = 0; round < maxPeso; round++) {
    for (const ass of activeAssuntos) {
      const peso = Math.max(1, ass.peso || 1);
      if (round < peso) {
        cycle.push(ass.nome);
      }
    }
  }

  return cycle;
}

export function generatePeriodSchedule(
  params: BatchGenerationParams,
  existingAulas: Aula[],
  materias: Materia[],
  instrutores: Instrutor[]
): GeneratedAulaPreview[] {
  const {
    turmaId,
    dataInicio,
    dataFim,
    diasSemana,
    materiasIds,
    estrategiaRodizio,
    estrategiaInstrutor,
    instrutorFixoId,
    turnoPadrao,
    horarioPadrao = '08:00 - 17:00',
    pularDiasComAulaExistente,
    assuntoPadrao = '',
    selectedAssuntosByMateria,
    usarAssuntosCadastrados = true
  } = params;

  if (!turmaId || !dataInicio || !dataFim || materiasIds.length === 0) {
    return [];
  }

  // 1. Obter todos os dias válidos do período
  const targetDays = getDaysInPeriod(dataInicio, dataFim, true, diasSemana);

  // 2. Filtrar dias com aulas já agendadas para essa turma, se configurado
  const existingDatesForTurma = new Set(
    existingAulas
      .filter(a => a.turmaId === turmaId && a.status !== 'cancelada')
      .map(a => a.data)
  );

  const availableDays = pularDiasComAulaExistente
    ? targetDays.filter(day => !existingDatesForTurma.has(day))
    : targetDays;

  if (availableDays.length === 0) return [];

  // 3. Contabilizar histórico de aulas da turma para estratégia 'equilibrado'
  const materiaCountMap = new Map<string, number>();
  materiasIds.forEach(id => materiaCountMap.set(id, 0));

  existingAulas
    .filter(a => a.turmaId === turmaId && a.status !== 'cancelada')
    .forEach(a => {
      if (materiaCountMap.has(a.materiaId)) {
        materiaCountMap.set(a.materiaId, (materiaCountMap.get(a.materiaId) || 0) + 1);
      }
    });

  // 4. Contabilizar histórico de dias dos instrutores para equilibrar distribuição
  const instructorDaysMap = new Map<string, Set<string>>();
  instrutores.forEach(inst => instructorDaysMap.set(inst.id, new Set<string>()));
  existingAulas
    .filter(a => a.status !== 'cancelada')
    .forEach(a => {
      const set = instructorDaysMap.get(a.instrutorId);
      if (set) set.add(a.data);
    });

  const activeInstructors = instrutores.filter(i => i.ativo);
  const result: GeneratedAulaPreview[] = [];

  // Mapa de ciclos de assuntos por matéria e cursor atual
  const assuntoCycleMap = new Map<string, string[]>();
  const assuntoCursorMap = new Map<string, number>();
  if (usarAssuntosCadastrados) {
    materiasIds.forEach(matId => {
      const mat = materias.find(m => m.id === matId);
      const selectedIds = selectedAssuntosByMateria ? selectedAssuntosByMateria[matId] : undefined;
      assuntoCycleMap.set(matId, buildWeightedAssuntoCycle(mat, selectedIds));
      assuntoCursorMap.set(matId, 0);
    });
  }

  let seqIndex = 0;

  for (let i = 0; i < availableDays.length; i++) {
    const day = availableDays[i];

    // Escolhe a matéria de acordo com a estratégia
    let chosenMateriaId = materiasIds[0];

    if (estrategiaRodizio === 'equilibrado') {
      // Prioriza a matéria do grupo com menos aulas dadas até o momento
      const sortedByCount = [...materiasIds].sort((a, b) => {
        const countA = materiaCountMap.get(a) || 0;
        const countB = materiaCountMap.get(b) || 0;
        return countA - countB;
      });
      chosenMateriaId = sortedByCount[0];
      // Incrementa a contagem para o rodízio continuar equilibrado nos próximos dias do lote
      materiaCountMap.set(chosenMateriaId, (materiaCountMap.get(chosenMateriaId) || 0) + 1);
    } else if (estrategiaRodizio === 'sequencial') {
      chosenMateriaId = materiasIds[seqIndex % materiasIds.length];
      seqIndex++;
    } else if (estrategiaRodizio === 'aleatorio') {
      const randIdx = Math.floor(Math.random() * materiasIds.length);
      chosenMateriaId = materiasIds[randIdx];
    }

    // Escolhe o instrutor
    let chosenInstrutorId = '';
    let isApto = false;

    if (estrategiaInstrutor === 'fixo' && instrutorFixoId) {
      chosenInstrutorId = instrutorFixoId;
      const inst = instrutores.find(x => x.id === instrutorFixoId);
      isApto = inst ? inst.materiasAptas.includes(chosenMateriaId) : false;
    } else if (estrategiaInstrutor === 'apto_preferencial') {
      // Busca instrutores que possuem matéria como apta
      const aptos = activeInstructors.filter(inst =>
        inst.materiasAptas.includes(chosenMateriaId)
      );

      if (aptos.length > 0) {
        // Entre os aptos, escolhe o que tem menos dias trabalhados
        aptos.sort((a, b) => {
          const daysA = (instructorDaysMap.get(a.id) || new Set()).size;
          const daysB = (instructorDaysMap.get(b.id) || new Set()).size;
          return daysA - daysB;
        });
        chosenInstrutorId = aptos[0].id;
        isApto = true;
      } else if (activeInstructors.length > 0) {
        // Se nenhum tem matéria na lista de aptidão, pega o com menor carga
        // O usuário solicitou expressamente: "o instrutor pode dar aula sobre qualquer materia... ainda assim ele pode ser vinculado para dar aula em uma materia que ainda nao esteja cadastrada no perfil dele"
        const sortedAll = [...activeInstructors].sort((a, b) => {
          const daysA = (instructorDaysMap.get(a.id) || new Set()).size;
          const daysB = (instructorDaysMap.get(b.id) || new Set()).size;
          return daysA - daysB;
        });
        chosenInstrutorId = sortedAll[0].id;
        isApto = false;
      }
    } else {
      // Rotativo simples entre todos
      const sortedAll = [...activeInstructors].sort((a, b) => {
        const daysA = (instructorDaysMap.get(a.id) || new Set()).size;
        const daysB = (instructorDaysMap.get(b.id) || new Set()).size;
        return daysA - daysB;
      });
      if (sortedAll.length > 0) {
        chosenInstrutorId = sortedAll[0].id;
        isApto = sortedAll[0].materiasAptas.includes(chosenMateriaId);
      }
    }

    // Registra o dia para o instrutor para balanceamento dos próximos dias do lote
    if (chosenInstrutorId) {
      const set = instructorDaysMap.get(chosenInstrutorId) || new Set<string>();
      set.add(day);
      instructorDaysMap.set(chosenInstrutorId, set);
    }

    // Seleciona o próximo assunto parametrizado da matéria (respeitando pesos 1x/2x/3x)
    let resolvedAssunto = assuntoPadrao.trim();
    if (usarAssuntosCadastrados) {
      const cycle = assuntoCycleMap.get(chosenMateriaId) || [];
      if (cycle.length > 0) {
        const cursor = assuntoCursorMap.get(chosenMateriaId) || 0;
        resolvedAssunto = cycle[cursor % cycle.length];
        assuntoCursorMap.set(chosenMateriaId, cursor + 1);
      }
    }

    result.push({
      tempId: `gen-${Date.now()}-${i}`,
      data: day,
      turmaId,
      materiaId: chosenMateriaId,
      instrutorId: chosenInstrutorId || (activeInstructors[0]?.id || ''),
      turno: turnoPadrao,
      horario: horarioPadrao,
      status: 'agendada',
      observacoes: resolvedAssunto,
      instrutorApto: isApto
    });
  }

  return result;
}

export interface SpecificMonthDaysParams {
  turmaId: string;
  ano: number;
  mes: number; // 1 = Janeiro ... 12 = Dezembro
  diasDoMes: number[]; // Ex: [3, 7, 15, 22]
  materiasIds: string[]; // Todas essas matérias serão inseridas em CADA dia selecionado (sem rodízio)
  estrategiaInstrutor: 'apto_preferencial' | 'rotativo' | 'fixo';
  instrutorFixoId?: string;
  turnoPadrao: Turno;
  horarioPadrao?: string;
  pularDiasComAulaExistente: boolean;
  assuntoPadrao?: string;
  selectedAssuntosByMateria?: Record<string, string[]>;
  usarAssuntosCadastrados?: boolean;
}

/**
 * Modalidade: Dias Específicos do Mês (por vírgula).
 * Insere a(s) mesma(s) matéria(s) selecionada(s) em todos os dias informados daquele mês, sem fazer rodízio.
 */
export function generateSpecificDaysSchedule(
  params: SpecificMonthDaysParams,
  existingAulas: Aula[],
  instrutores: Instrutor[],
  materias: Materia[] = []
): GeneratedAulaPreview[] {
  const {
    turmaId,
    ano,
    mes,
    diasDoMes,
    materiasIds,
    estrategiaInstrutor,
    instrutorFixoId,
    turnoPadrao,
    horarioPadrao = '08:00 - 17:00',
    pularDiasComAulaExistente,
    assuntoPadrao = '',
    selectedAssuntosByMateria,
    usarAssuntosCadastrados = true
  } = params;

  if (!turmaId || !ano || !mes || diasDoMes.length === 0 || materiasIds.length === 0) {
    return [];
  }

  // Quantidade máxima de dias no mês escolhido
  const maxDayInMonth = new Date(ano, mes, 0).getDate();

  // Filtra e ordena dias válidos (1..maxDayInMonth), sem duplicatas
  const validDays = Array.from(
    new Set(
      diasDoMes
        .map(d => Math.floor(Number(d)))
        .filter(d => !isNaN(d) && d >= 1 && d <= maxDayInMonth)
    )
  ).sort((a, b) => a - b);

  if (validDays.length === 0) return [];

  const targetDateStrings = validDays.map(d => {
    const mm = String(mes).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${ano}-${mm}-${dd}`;
  });

  // Se pularDiasComAulaExistente estiver marcado, verifica datas já ocupadas pela turma
  const existingDatesForTurma = new Set(
    existingAulas
      .filter(a => a.turmaId === turmaId && a.status !== 'cancelada')
      .map(a => String(a.data).split('T')[0].trim())
  );

  const availableDates = pularDiasComAulaExistente
    ? targetDateStrings.filter(dateStr => !existingDatesForTurma.has(dateStr))
    : targetDateStrings;

  if (availableDates.length === 0) return [];

  // Contabilizar histórico de dias dos instrutores para equilibrar distribuição
  const instructorDaysMap = new Map<string, Set<string>>();
  instrutores.forEach(inst => instructorDaysMap.set(inst.id, new Set<string>()));
  existingAulas
    .filter(a => a.status !== 'cancelada')
    .forEach(a => {
      const set = instructorDaysMap.get(a.instrutorId);
      if (set) set.add(a.data);
    });

  const activeInstructors = instrutores.filter(i => i.ativo);
  const result: GeneratedAulaPreview[] = [];

  const assuntoCycleMap = new Map<string, string[]>();
  const assuntoCursorMap = new Map<string, number>();
  if (usarAssuntosCadastrados) {
    materiasIds.forEach(matId => {
      const mat = materias.find(m => m.id === matId);
      const selectedIds = selectedAssuntosByMateria ? selectedAssuntosByMateria[matId] : undefined;
      assuntoCycleMap.set(matId, buildWeightedAssuntoCycle(mat, selectedIds));
      assuntoCursorMap.set(matId, 0);
    });
  }

  let counter = 0;

  // Para CADA data escolhida, insere TODAS as matérias selecionadas (sem rodízio)
  for (const dateStr of availableDates) {
    for (const materiaId of materiasIds) {
      let chosenInstrutorId = '';
      let isApto = false;

      if (estrategiaInstrutor === 'fixo' && instrutorFixoId) {
        chosenInstrutorId = instrutorFixoId;
        const inst = instrutores.find(x => x.id === instrutorFixoId);
        isApto = inst ? inst.materiasAptas.includes(materiaId) : false;
      } else if (estrategiaInstrutor === 'apto_preferencial') {
        const aptos = activeInstructors.filter(inst =>
          inst.materiasAptas.includes(materiaId)
        );

        if (aptos.length > 0) {
          aptos.sort((a, b) => {
            const daysA = (instructorDaysMap.get(a.id) || new Set()).size;
            const daysB = (instructorDaysMap.get(b.id) || new Set()).size;
            return daysA - daysB;
          });
          chosenInstrutorId = aptos[0].id;
          isApto = true;
        } else if (activeInstructors.length > 0) {
          const sortedAll = [...activeInstructors].sort((a, b) => {
            const daysA = (instructorDaysMap.get(a.id) || new Set()).size;
            const daysB = (instructorDaysMap.get(b.id) || new Set()).size;
            return daysA - daysB;
          });
          chosenInstrutorId = sortedAll[0].id;
          isApto = false;
        }
      } else {
        const sortedAll = [...activeInstructors].sort((a, b) => {
          const daysA = (instructorDaysMap.get(a.id) || new Set()).size;
          const daysB = (instructorDaysMap.get(b.id) || new Set()).size;
          return daysA - daysB;
        });
        if (sortedAll.length > 0) {
          chosenInstrutorId = sortedAll[0].id;
          isApto = sortedAll[0].materiasAptas.includes(materiaId);
        }
      }

      if (chosenInstrutorId) {
        const set = instructorDaysMap.get(chosenInstrutorId) || new Set<string>();
        set.add(dateStr);
        instructorDaysMap.set(chosenInstrutorId, set);
      }

      let resolvedAssunto = assuntoPadrao.trim();
      if (usarAssuntosCadastrados) {
        const cycle = assuntoCycleMap.get(materiaId) || [];
        if (cycle.length > 0) {
          const cursor = assuntoCursorMap.get(materiaId) || 0;
          resolvedAssunto = cycle[cursor % cycle.length];
          assuntoCursorMap.set(materiaId, cursor + 1);
        }
      }

      result.push({
        tempId: `gen-fix-${Date.now()}-${counter++}`,
        data: dateStr,
        turmaId,
        materiaId,
        instrutorId: chosenInstrutorId || (activeInstructors[0]?.id || ''),
        turno: turnoPadrao,
        horario: horarioPadrao,
        status: 'agendada',
        observacoes: resolvedAssunto,
        instrutorApto: isApto
      });
    }
  }

  return result;
}

