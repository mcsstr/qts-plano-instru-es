import { Turma, Materia, Instrutor, Aula, Gestor, AppTheme, AssuntoMateria } from '../types';

export const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = '6af65532002569934af0';
export const APPWRITE_DB_ID = 'qtm_db';

const HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': APPWRITE_PROJECT_ID
};

// Sanitize rowId for Appwrite (max 36 chars, alphanumeric + . _ -)
export function toAppwriteRowId(rawId: string): string {
  const cleaned = String(rawId || '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^[^a-zA-Z0-9]+/, 'd');
  return cleaned.slice(0, 35) || `doc_${Date.now()}`;
}

const normalizeDateStr = (d: any): string => {
  if (!d) return '';
  return String(d).split('T')[0].split(' ')[0].trim();
};

// Cache em memória dos hashes de cada linha já sincronizada no servidor para enviar apenas o que mudou (Sync Diferencial Instantâneo)
const syncedRowHashCache = new Map<string, string>();

async function fetchTableRows(tableId: string): Promise<any[]> {
  const limitQuery = encodeURIComponent(JSON.stringify({ method: 'limit', values: [5000] }));
  const url = `${APPWRITE_ENDPOINT}/tablesdb/${APPWRITE_DB_ID}/tables/${tableId}/rows?queries[]=${limitQuery}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: HEADERS
  });
  if (!res.ok) {
    throw new Error(`Falha ao ler tabela ${tableId} no Appwrite (HTTP ${res.status})`);
  }
  const json = await res.json();
  return json.rows || [];
}

async function upsertTableRow(tableId: string, rawId: string, payload: Record<string, any>): Promise<void> {
  const rowId = toAppwriteRowId(rawId);
  const cacheKey = `${tableId}:${rowId}`;
  const payloadHash = JSON.stringify(payload);

  // Se a linha já está idêntica no servidor, pula a requisição de rede!
  if (syncedRowHashCache.get(cacheKey) === payloadHash) {
    return;
  }

  // Tenta atualizar (PATCH) se já conhecemos a linha no cache; caso contrário tenta POST e faz fallback para PATCH
  const isKnownOnServer = syncedRowHashCache.has(cacheKey);

  if (isKnownOnServer) {
    const patchRes = await fetch(
      `${APPWRITE_ENDPOINT}/tablesdb/${APPWRITE_DB_ID}/tables/${tableId}/rows/${rowId}`,
      {
        method: 'PATCH',
        headers: HEADERS,
        body: JSON.stringify({ data: payload })
      }
    );
    if (patchRes.ok) {
      syncedRowHashCache.set(cacheKey, payloadHash);
      return;
    }
  }

  // Tenta criar (POST)
  const postRes = await fetch(
    `${APPWRITE_ENDPOINT}/tablesdb/${APPWRITE_DB_ID}/tables/${tableId}/rows`,
    {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ rowId, data: payload })
    }
  );

  if (postRes.ok) {
    syncedRowHashCache.set(cacheKey, payloadHash);
    return;
  }

  // Se retornou 409 (já existe no banco), atualiza via PATCH
  if (postRes.status === 409) {
    const patchRes = await fetch(
      `${APPWRITE_ENDPOINT}/tablesdb/${APPWRITE_DB_ID}/tables/${tableId}/rows/${rowId}`,
      {
        method: 'PATCH',
        headers: HEADERS,
        body: JSON.stringify({ data: payload })
      }
    );
    if (patchRes.ok) {
      syncedRowHashCache.set(cacheKey, payloadHash);
    }
  }
}

export async function deleteAppwriteRow(tableId: string, rawId: string): Promise<void> {
  const rowId = toAppwriteRowId(rawId);
  const cacheKey = `${tableId}:${rowId}`;
  syncedRowHashCache.delete(cacheKey);
  try {
    await fetch(
      `${APPWRITE_ENDPOINT}/tablesdb/${APPWRITE_DB_ID}/tables/${tableId}/rows/${rowId}`,
      {
        method: 'DELETE',
        headers: HEADERS
      }
    );
  } catch {
    // ignore network error on delete
  }
}

export interface AppwriteFetchedData {
  turmas: Turma[];
  materias: Materia[];
  instrutores: Instrutor[];
  aulas: Aula[];
  gestores: Gestor[];
  theme?: AppTheme;
  remoteDeletedIds: string[];
}

export async function fetchAppwriteData(): Promise<AppwriteFetchedData> {
  const [turmasRows, materiasRows, instrutoresRows, aulasRows, gestoresRows, configRows] =
    await Promise.all([
      fetchTableRows('turmas'),
      fetchTableRows('materias'),
      fetchTableRows('instrutores'),
      fetchTableRows('aulas'),
      fetchTableRows('gestores'),
      fetchTableRows('config')
    ]);

  const turmas: Turma[] = turmasRows.map(r => {
    const payload = {
      id: String(r.id || r.$id),
      nome: String(r.nome || ''),
      sigla: String(r.sigla || ''),
      cor: String(r.cor || '#2563eb'),
      descricao: String(r.descricao || ''),
      turnoPadrao: (r.turnoPadrao as any) || 'Integral',
      ativa: Boolean(r.ativa ?? true)
    };
    syncedRowHashCache.set(`turmas:${toAppwriteRowId(payload.id)}`, JSON.stringify(payload));
    return payload;
  });

  const materias: Materia[] = materiasRows.map(r => {
    let assuntos: AssuntoMateria[] = [];
    if (r.assuntosJson) {
      try {
        const parsed = JSON.parse(r.assuntosJson);
        if (Array.isArray(parsed)) {
          assuntos = parsed
            .map((item: any, idx: number): AssuntoMateria | null => {
              if (typeof item === 'string') {
                return { id: `ass_${idx}`, nome: item, peso: 1 };
              }
              if (item && typeof item.nome === 'string') {
                return {
                  id: String(item.id || `ass_${idx}`),
                  nome: item.nome,
                  peso: Number(item.peso || 1)
                };
              }
              return null;
            })
            .filter((x): x is AssuntoMateria => x !== null && x.nome.trim().length > 0);
        }
      } catch {
        assuntos = [];
      }
    }

    const dbPayload = {
      id: String(r.id || r.$id),
      nome: String(r.nome || ''),
      sigla: String(r.sigla || ''),
      cor: String(r.cor || '#3b82f6'),
      cargaDiasObjetivo: Number(r.cargaDiasObjetivo ?? 10),
      descricao: String(r.descricao || ''),
      assuntosJson: JSON.stringify(assuntos),
      ativa: Boolean(r.ativa ?? true)
    };
    syncedRowHashCache.set(`materias:${toAppwriteRowId(dbPayload.id)}`, JSON.stringify(dbPayload));
    return {
      id: dbPayload.id,
      nome: dbPayload.nome,
      sigla: dbPayload.sigla,
      cor: dbPayload.cor,
      cargaDiasObjetivo: dbPayload.cargaDiasObjetivo,
      descricao: dbPayload.descricao,
      assuntos,
      ativa: dbPayload.ativa
    };
  });

  const instrutores: Instrutor[] = instrutoresRows.map(r => {
    let materiasAptas: string[] = [];
    if (r.materiasAptasJson) {
      try {
        const parsed = JSON.parse(r.materiasAptasJson);
        if (Array.isArray(parsed)) materiasAptas = parsed;
      } catch {
        materiasAptas = [];
      }
    }
    const dbPayload = {
      id: String(r.id || r.$id),
      nome: String(r.nome || ''),
      contato: String(r.contato || ''),
      materiasAptasJson: JSON.stringify(materiasAptas),
      ativo: Boolean(r.ativo ?? true),
      observacoes: String(r.observacoes || '')
    };
    syncedRowHashCache.set(`instrutores:${toAppwriteRowId(dbPayload.id)}`, JSON.stringify(dbPayload));

    return {
      id: dbPayload.id,
      nome: dbPayload.nome,
      contato: dbPayload.contato,
      materiasAptas,
      ativo: dbPayload.ativo,
      observacoes: dbPayload.observacoes
    };
  });

  const aulas: Aula[] = aulasRows.map(r => {
    const payload = {
      id: String(r.id || r.$id),
      data: normalizeDateStr(r.data),
      turmaId: String(r.turmaId || ''),
      materiaId: String(r.materiaId || ''),
      instrutorId: String(r.instrutorId || ''),
      turno: (r.turno as any) || 'Integral',
      horario: String(r.horario || '08:00 - 17:00'),
      status: (r.status as any) || 'agendada',
      motivoPrejuizo: String(r.motivoPrejuizo || ''),
      remanejadaParaId: String(r.remanejadaParaId || ''),
      remanejadaDeId: String(r.remanejadaDeId || ''),
      observacoes: String(r.observacoes || ''),
      criadaEm: String(r.criadaEm || '')
    };
    syncedRowHashCache.set(`aulas:${toAppwriteRowId(payload.id)}`, JSON.stringify(payload));
    return {
      ...payload,
      motivoPrejuizo: payload.motivoPrejuizo || undefined,
      remanejadaParaId: payload.remanejadaParaId || undefined,
      remanejadaDeId: payload.remanejadaDeId || undefined
    };
  });

  const gestores: Gestor[] = gestoresRows.map(r => {
    const payload = {
      id: String(r.id || r.$id),
      nome: String(r.nome || ''),
      login: String(r.login ?? ''),
      senha: String(r.senha ?? ''),
      cargo: String(r.cargo || ''),
      ativo: Boolean(r.ativo ?? true)
    };
    syncedRowHashCache.set(`gestores:${toAppwriteRowId(payload.id)}`, JSON.stringify(payload));
    return payload;
  });

  let theme: AppTheme | undefined = undefined;
  let remoteDeletedIds: string[] = [];
  const globalConfig = configRows.find(c => c.id === 'global' || c.$id === 'global') || configRows[0];
  if (globalConfig) {
    if (globalConfig.theme) {
      theme = globalConfig.theme as AppTheme;
    }
    if (globalConfig.deletedIdsJson) {
      try {
        const parsed = JSON.parse(globalConfig.deletedIdsJson);
        if (Array.isArray(parsed)) remoteDeletedIds = parsed;
      } catch {
        remoteDeletedIds = [];
      }
    }
  }

  return {
    turmas,
    materias,
    instrutores,
    aulas,
    gestores,
    theme,
    remoteDeletedIds
  };
}

export async function pushAppwriteData(data: {
  turmas: Turma[];
  materias: Materia[];
  instrutores: Instrutor[];
  aulas: Aula[];
  gestores: Gestor[];
  theme?: AppTheme;
  deletedIds?: string[];
}): Promise<void> {
  const tasks: Promise<void>[] = [];

  for (const t of data.turmas) {
    tasks.push(
      upsertTableRow('turmas', t.id, {
        id: String(t.id),
        nome: String(t.nome || ''),
        sigla: String(t.sigla || ''),
        cor: String(t.cor || '#2563eb'),
        descricao: String(t.descricao || ''),
        turnoPadrao: String(t.turnoPadrao || 'Integral'),
        ativa: Boolean(t.ativa ?? true)
      })
    );
  }

  for (const m of data.materias) {
    tasks.push(
      upsertTableRow('materias', m.id, {
        id: String(m.id),
        nome: String(m.nome || ''),
        sigla: String(m.sigla || ''),
        cor: String(m.cor || '#3b82f6'),
        cargaDiasObjetivo: Number(m.cargaDiasObjetivo ?? 10),
        descricao: String(m.descricao || ''),
        assuntosJson: JSON.stringify(Array.isArray(m.assuntos) ? m.assuntos : []).slice(0, 4950),
        ativa: Boolean(m.ativa ?? true)
      })
    );
  }

  for (const i of data.instrutores) {
    tasks.push(
      upsertTableRow('instrutores', i.id, {
        id: String(i.id),
        nome: String(i.nome || ''),
        contato: String(i.contato || ''),
        materiasAptasJson: JSON.stringify(Array.isArray(i.materiasAptas) ? i.materiasAptas : []),
        ativo: Boolean(i.ativo ?? true),
        observacoes: String(i.observacoes || '')
      })
    );
  }

  for (const a of data.aulas) {
    tasks.push(
      upsertTableRow('aulas', a.id, {
        id: String(a.id),
        data: normalizeDateStr(a.data),
        turmaId: String(a.turmaId || ''),
        materiaId: String(a.materiaId || ''),
        instrutorId: String(a.instrutorId || ''),
        turno: String(a.turno || 'Integral'),
        horario: String(a.horario || '08:00 - 17:00'),
        status: String(a.status || 'agendada'),
        motivoPrejuizo: String(a.motivoPrejuizo || ''),
        remanejadaParaId: String(a.remanejadaParaId || ''),
        remanejadaDeId: String(a.remanejadaDeId || ''),
        observacoes: String(a.observacoes || ''),
        criadaEm: String(a.criadaEm || new Date().toISOString())
      })
    );
  }

  for (const g of data.gestores) {
    tasks.push(
      upsertTableRow('gestores', g.id, {
        id: String(g.id),
        nome: String(g.nome || ''),
        login: String(g.login ?? ''),
        senha: String(g.senha ?? ''),
        cargo: String(g.cargo || ''),
        ativo: Boolean(g.ativo ?? true)
      })
    );
  }

  const recentDeleted = (data.deletedIds || []).slice(-100);
  tasks.push(
    upsertTableRow('config', 'global', {
      id: 'global',
      theme: String(data.theme || 'ft-19bpm'),
      deletedIdsJson: JSON.stringify(recentDeleted).slice(0, 2900),
      updatedAt: new Date().toISOString()
    })
  );

  await Promise.all(tasks);
}

/**
 * Conecta ao WebSocket Realtime do Appwrite para atualizar a tela automaticamente
 * sempre que outro celular ou computador alterar aulas, cadastros ou tema.
 */
export function subscribeAppwriteRealtime(onRemoteChange: () => void): () => void {
  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let isDisposed = false;

  const connect = () => {
    if (isDisposed) return;
    try {
      const channels = [
        `databases.${APPWRITE_DB_ID}.tables.aulas.rows`,
        `databases.${APPWRITE_DB_ID}.tables.turmas.rows`,
        `databases.${APPWRITE_DB_ID}.tables.materias.rows`,
        `databases.${APPWRITE_DB_ID}.tables.instrutores.rows`,
        `databases.${APPWRITE_DB_ID}.tables.gestores.rows`,
        `databases.${APPWRITE_DB_ID}.tables.config.rows`,
        `databases.${APPWRITE_DB_ID}.collections.aulas.documents`,
        `databases.${APPWRITE_DB_ID}.collections.config.documents`
      ]
        .map(c => `channels[]=${encodeURIComponent(c)}`)
        .join('&');

      const wsUrl = `wss://nyc.cloud.appwrite.io/v1/realtime?project=${APPWRITE_PROJECT_ID}&${channels}`;
      ws = new WebSocket(wsUrl);

      ws.onmessage = event => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'event') {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              onRemoteChange();
            }, 600);
          }
        } catch {
          // ignore
        }
      };

      ws.onclose = () => {
        if (!isDisposed) {
          reconnectTimer = setTimeout(connect, 5000);
        }
      };
    } catch {
      // ignore
    }
  };

  connect();

  return () => {
    isDisposed = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (debounceTimer) clearTimeout(debounceTimer);
    if (ws) {
      try {
        ws.close();
      } catch {
        // ignore
      }
    }
  };
}

