import { PesquisaOrganizacional, RespostaPesquisa } from '../types/survey';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_DB_ID, toAppwriteRowId } from './appwriteService';

const HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': APPWRITE_PROJECT_ID
};

const LOCAL_SURVEYS_KEY = 'qts_ft_surveys_v1';
const LOCAL_RESPONSES_KEY = 'qts_ft_survey_responses_v1';
const CHUNK_SIZE = 2600; // Seguro abaixo do limite de 3000 chars da coluna deletedIdsJson na tabela config

async function fetchConfigRows(): Promise<any[]> {
  const limitQuery = encodeURIComponent(JSON.stringify({ method: 'limit', values: [5000] }));
  const url = `${APPWRITE_ENDPOINT}/tablesdb/${APPWRITE_DB_ID}/tables/config/rows?queries[]=${limitQuery}`;
  const res = await fetch(url, { method: 'GET', headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.rows || [];
}

async function upsertConfigRow(rawId: string, tag: string, contentStr: string): Promise<void> {
  const rowId = toAppwriteRowId(rawId);
  const payload = {
    id: rowId,
    theme: tag.slice(0, 48),
    deletedIdsJson: contentStr,
    updatedAt: new Date().toISOString()
  };

  const postRes = await fetch(
    `${APPWRITE_ENDPOINT}/tablesdb/${APPWRITE_DB_ID}/tables/config/rows`,
    {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ rowId, data: payload })
    }
  );

  if (postRes.ok) return;

  if (postRes.status === 409) {
    await fetch(
      `${APPWRITE_ENDPOINT}/tablesdb/${APPWRITE_DB_ID}/tables/config/rows/${rowId}`,
      {
        method: 'PATCH',
        headers: HEADERS,
        body: JSON.stringify({ data: payload })
      }
    );
  }
}

async function deleteConfigRow(rawId: string): Promise<void> {
  const rowId = toAppwriteRowId(rawId);
  try {
    await fetch(
      `${APPWRITE_ENDPOINT}/tablesdb/${APPWRITE_DB_ID}/tables/config/rows/${rowId}`,
      {
        method: 'DELETE',
        headers: HEADERS
      }
    );
  } catch {
    // ignore
  }
}

export function loadLocalSurveys(): PesquisaOrganizacional[] {
  try {
    const raw = localStorage.getItem(LOCAL_SURVEYS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export function saveLocalSurveys(surveys: PesquisaOrganizacional[]): void {
  try {
    localStorage.setItem(LOCAL_SURVEYS_KEY, JSON.stringify(surveys));
  } catch {
    // ignore
  }
}

export function loadLocalResponses(): RespostaPesquisa[] {
  try {
    const raw = localStorage.getItem(LOCAL_RESPONSES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export function saveLocalResponses(responses: RespostaPesquisa[]): void {
  try {
    localStorage.setItem(LOCAL_RESPONSES_KEY, JSON.stringify(responses));
  } catch {
    // ignore
  }
}

/**
 * Busca todas as pesquisas e respostas salvas no Appwrite Cloud
 */
export async function fetchSurveysAndResponses(): Promise<{
  surveys: PesquisaOrganizacional[];
  responses: RespostaPesquisa[];
}> {
  try {
    const rows = await fetchConfigRows();

    // 1. Reconstruir pesquisas (podem estar divididas em chunks sv_<shortId>_<chunkIdx>)
    const surveyChunksMap = new Map<string, { idx: number; text: string }[]>();
    const responseChunksMap = new Map<string, { idx: number; text: string }[]>();

    for (const r of rows) {
      const tag = String(r.theme || '');
      const text = String(r.deletedIdsJson || '');

      if (tag.startsWith('sv:')) {
        // formato tag: sv:<surveyId>:<chunkIdx>
        const parts = tag.split(':');
        const sId = parts[1];
        const cIdx = Number(parts[2] || 0);
        if (sId) {
          const list = surveyChunksMap.get(sId) || [];
          list.push({ idx: cIdx, text });
          surveyChunksMap.set(sId, list);
        }
      } else if (tag.startsWith('sr:')) {
        // formato tag: sr:<respId>:<chunkIdx>
        const parts = tag.split(':');
        const rId = parts[1];
        const cIdx = Number(parts[2] || 0);
        if (rId) {
          const list = responseChunksMap.get(rId) || [];
          list.push({ idx: cIdx, text });
          responseChunksMap.set(rId, list);
        }
      }
    }

    const surveys: PesquisaOrganizacional[] = [];
    for (const [, chunks] of surveyChunksMap.entries()) {
      chunks.sort((a, b) => a.idx - b.idx);
      const fullJson = chunks.map(c => c.text).join('');
      try {
        const parsed = JSON.parse(fullJson);
        if (parsed && parsed.id && parsed.titulo) {
          surveys.push(parsed);
        }
      } catch {
        // ignore malformed chunk
      }
    }

    const responses: RespostaPesquisa[] = [];
    for (const [, chunks] of responseChunksMap.entries()) {
      chunks.sort((a, b) => a.idx - b.idx);
      const fullJson = chunks.map(c => c.text).join('');
      try {
        const parsed = JSON.parse(fullJson);
        if (parsed && parsed.id && parsed.pesquisaId) {
          responses.push(parsed);
        }
      } catch {
        // ignore malformed chunk
      }
    }

    surveys.sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
    responses.sort((a, b) => b.respondidaEm.localeCompare(a.respondidaEm));

    saveLocalSurveys(surveys);
    saveLocalResponses(responses);

    return { surveys, responses };
  } catch {
    return {
      surveys: loadLocalSurveys(),
      responses: loadLocalResponses()
    };
  }
}

/**
 * Salva ou atualiza uma Pesquisa Organizacional no Appwrite Cloud (com suporte a múltiplos chunks)
 */
export async function saveSurveyToCloud(survey: PesquisaOrganizacional): Promise<void> {
  const local = loadLocalSurveys();
  const idx = local.findIndex(s => s.id === survey.id);
  if (idx >= 0) {
    local[idx] = survey;
  } else {
    local.unshift(survey);
  }
  saveLocalSurveys(local);

  const json = JSON.stringify(survey);
  const chunks: string[] = [];
  for (let i = 0; i < json.length; i += CHUNK_SIZE) {
    chunks.push(json.slice(i, i + CHUNK_SIZE));
  }

  const tasks: Promise<void>[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const rowId = `sv_${survey.id}_${i}`;
    const tag = `sv:${survey.id}:${i}`;
    tasks.push(upsertConfigRow(rowId, tag, chunks[i]));
  }
  // Limpa possíveis chunks excedentes antigos (até 10 chunks)
  for (let i = chunks.length; i < 8; i++) {
    tasks.push(deleteConfigRow(`sv_${survey.id}_${i}`));
  }

  await Promise.all(tasks);
}

/**
 * Exclui uma Pesquisa Organizacional do Appwrite Cloud
 */
export async function deleteSurveyFromCloud(surveyId: string): Promise<void> {
  const local = loadLocalSurveys().filter(s => s.id !== surveyId);
  saveLocalSurveys(local);

  const tasks: Promise<void>[] = [];
  for (let i = 0; i < 8; i++) {
    tasks.push(deleteConfigRow(`sv_${surveyId}_${i}`));
  }
  await Promise.all(tasks);
}

/**
 * Registra uma nova resposta de participante no Appwrite Cloud
 */
export async function submitSurveyResponseToCloud(response: RespostaPesquisa): Promise<void> {
  const local = loadLocalResponses();
  local.unshift(response);
  saveLocalResponses(local);

  const json = JSON.stringify(response);
  const chunks: string[] = [];
  for (let i = 0; i < json.length; i += CHUNK_SIZE) {
    chunks.push(json.slice(i, i + CHUNK_SIZE));
  }

  const tasks: Promise<void>[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const rowId = `sr_${response.id}_${i}`;
    const tag = `sr:${response.id}:${i}`;
    tasks.push(upsertConfigRow(rowId, tag, chunks[i]));
  }
  await Promise.all(tasks);
}

/**
 * Exclui uma resposta individual do Appwrite Cloud
 */
export async function deleteSurveyResponseFromCloud(responseId: string): Promise<void> {
  const local = loadLocalResponses().filter(r => r.id !== responseId);
  saveLocalResponses(local);

  const tasks: Promise<void>[] = [];
  for (let i = 0; i < 5; i++) {
    tasks.push(deleteConfigRow(`sr_${responseId}_${i}`));
  }
  await Promise.all(tasks);
}

/**
 * Gera um modelo completo de Pesquisa de Clima & Diagnóstico Organizacional
 */
export function createDefaultSurveyTemplate(): PesquisaOrganizacional {
  const shortId = Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();

  return {
    id: `pesq_${shortId}`,
    titulo: 'Pesquisa de Clima e Diagnóstico Organizacional — FT',
    descricao:
      'Sua participação é fundamental para aprimorarmos continuamente o planejamento de instruções, as condições operacionais e a gestão do efetivo.',
    anonima: true,
    solicitarPelotao: true,
    status: 'rascunho',
    criadaEm: now,
    atualizadaEm: now,
    topicos: [
      {
        id: `top_${shortId}_1`,
        titulo: '1. Qualidade das Instruções e Capacitação Técnica',
        descricao: 'Avalie a relevância prática, a carga horária e a didática das instruções ministradas.',
        perguntas: [
          {
            id: `perg_${shortId}_1`,
            texto: 'Como você avalia a aplicabilidade prática dos assuntos abordados nas instruções recentes?',
            tipo: 'escala_likert',
            obrigatoria: true,
            rotuloMin: 'Pouco Aplicável',
            rotuloMax: 'Altamente Aplicável'
          },
          {
            id: `perg_${shortId}_2`,
            texto: 'Qual área temática você considera que precisa de maior carga de treinamento no próximo período?',
            tipo: 'escolha_unica',
            obrigatoria: true,
            opcoes: [
              'Tiro Tático e Armamento',
              'CQB / Entradas Táticas',
              'Controle de Distúrbios Civis (CDC)',
              'Atendimento Pré-Hospitalar Tático (APHT)',
              'Condicionamento Físico e Defesa Pessoal'
            ]
          },
          {
            id: `perg_${shortId}_3`,
            texto: 'De 0 a 10, que nota você atribui à organização geral do calendário de instruções?',
            tipo: 'nota_numerica',
            obrigatoria: true
          }
        ]
      },
      {
        id: `top_${shortId}_2`,
        titulo: '2. Condições Operacionais, Equipamentos e Liderança',
        descricao: 'Percepção sobre recursos materiais, comunicação interna e suporte do comando.',
        perguntas: [
          {
            id: `perg_${shortId}_4`,
            texto: 'Os materiais e equipamentos disponibilizados para as instruções atendem plenamente às necessidades?',
            tipo: 'sim_nao',
            obrigatoria: true
          },
          {
            id: `perg_${shortId}_5`,
            texto: 'A comunicação prévia sobre datas, horários e mudanças no quadro de instruções é clara e eficiente?',
            tipo: 'escala_likert',
            obrigatoria: true,
            rotuloMin: 'Discordo Totalmente',
            rotuloMax: 'Concordo Totalmente'
          },
          {
            id: `perg_${shortId}_6`,
            texto: 'Deixe sua sugestão, crítica construtiva ou assunto específico que gostaria de ver incluído nas próximas instruções:',
            tipo: 'texto_longo',
            obrigatoria: false
          }
        ]
      }
    ]
  };
}
