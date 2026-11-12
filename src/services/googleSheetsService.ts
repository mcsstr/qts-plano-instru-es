import { Turma, Materia, Instrutor, Aula, Gestor } from '../types';

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * BANCO DE DADOS GOOGLE SHEETS - QTS / PLANO DE AULAS INTELIGENTE
 * =========================================================================
 * 
 * INSTRUÇÕES:
 * 1. Em sua Planilha Google, clique em 'Extensões' > 'Apps Script'.
 * 2. Cole este código completo.
 * 3. Clique em 'Implantar' > 'Gerenciar Implantações' > Ícone de Lápis (Editar)
 *    e selecione Versão: 'Nova versão', depois 'Implantar'.
 * 4. Copie a URL do App da Web e cole nos Ajustes do QTS!
 */

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'getAll';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Assegura que todas as abas existam
    ensureSheetsExist(ss);

    if (action === 'getAll') {
      const data = {
        turmas: getSheetData(ss.getSheetByName('Turmas')),
        materias: getSheetData(ss.getSheetByName('Materias')),
        instrutores: getSheetData(ss.getSheetByName('Instrutores')),
        aulas: getSheetData(ss.getSheetByName('Aulas')),
        gestores: getSheetData(ss.getSheetByName('Gestores')),
        success: true,
        timestamp: new Date().toISOString()
      };
      return createJsonResponse(data);
    }

    return createJsonResponse({ success: false, error: 'Ação não suportada' });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureSheetsExist(ss);

    if (contents.action === 'syncAll') {
      if (contents.data.turmas) updateSheetData(ss.getSheetByName('Turmas'), contents.data.turmas);
      if (contents.data.materias) updateSheetData(ss.getSheetByName('Materias'), contents.data.materias);
      if (contents.data.instrutores) updateSheetData(ss.getSheetByName('Instrutores'), contents.data.instrutores);
      if (contents.data.aulas) updateSheetData(ss.getSheetByName('Aulas'), contents.data.aulas);
      if (contents.data.gestores) updateSheetData(ss.getSheetByName('Gestores'), contents.data.gestores);

      return createJsonResponse({ success: true, message: 'Dados sincronizados com sucesso!' });
    }

    return createJsonResponse({ success: false, error: 'Ação POST desconhecida' });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

function ensureSheetsExist(ss) {
  const definitions = {
    'Turmas': ['id', 'nome', 'sigla', 'cor', 'descricao', 'turnoPadrao', 'ativa'],
    'Materias': ['id', 'nome', 'sigla', 'cor', 'cargaDiasObjetivo', 'descricao', 'ativa'],
    'Instrutores': ['id', 'nome', 'contato', 'materiasAptas', 'ativo', 'observacoes'],
    'Aulas': ['id', 'data', 'turmaId', 'materiaId', 'instrutorId', 'turno', 'horario', 'status', 'motivoPrejuizo', 'remanejadaParaId', 'remanejadaDeId', 'observacoes', 'criadaEm'],
    'Gestores': ['id', 'nome', 'login', 'senha', 'cargo', 'ativo']
  };

  for (let sheetName in definitions) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(definitions[sheetName]);
      sheet.getRange(1, 1, 1, definitions[sheetName].length)
        .setBackground('#1e293b')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
    }
  }
}

function getSheetData(sheet) {
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows[0];
  const items = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0]) continue;
    const item = {};
    headers.forEach((header, idx) => {
      let val = row[idx];
      // Normalização de Datas para YYYY-MM-DD
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone() || 'GMT-3', 'yyyy-MM-dd');
      } else if (header === 'materiasAptas' && typeof val === 'string' && val.trim().startsWith('[')) {
        try { val = JSON.parse(val); } catch(e) { val = []; }
      } else if (header === 'materiasAptas' && typeof val === 'string') {
        val = val ? val.split(',').map(s => s.trim()) : [];
      } else if (header === 'ativa' || header === 'ativo') {
        val = val === true || String(val).toLowerCase() === 'true';
      }
      item[header] = val;
    });
    items.push(item);
  }
  return items;
}

function updateSheetData(sheet, items) {
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
  }

  if (!items || items.length === 0) return;

  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const rowsToInsert = items.map(item => {
    return headers.map(header => {
      let val = item[header];
      if (header === 'materiasAptas' && Array.isArray(val)) {
        return JSON.stringify(val);
      }
      return val !== undefined && val !== null ? val : '';
    });
  });

  if (rowsToInsert.length > 0) {
    sheet.getRange(2, 1, rowsToInsert.length, headers.length).setValues(rowsToInsert);
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

const normalizeDateStr = (d: any): string => {
  if (!d) return '';
  if (typeof d === 'string') {
    return d.split('T')[0];
  }
  return String(d);
};

export async function fetchGoogleSheetsData(scriptUrl: string): Promise<{
  turmas: Turma[];
  materias: Materia[];
  instrutores: Instrutor[];
  aulas: Aula[];
  gestores: Gestor[];
}> {
  if (!scriptUrl || !scriptUrl.startsWith('http')) {
    throw new Error('URL do Google Apps Script inválida.');
  }

  const url = `${scriptUrl}?action=getAll&t=${Date.now()}`;
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors'
  });

  if (!response.ok) {
    throw new Error(`Falha ao conectar com o Google Sheets: HTTP ${response.status}`);
  }

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || 'Erro retornado pela planilha');
  }

  const rawAulas: Aula[] = json.aulas || [];
  const normalizedAulas = rawAulas.map(a => ({
    ...a,
    data: normalizeDateStr(a.data)
  }));

  const rawGestores: Gestor[] = json.gestores || [];
  const normalizedGestores = rawGestores.map(g => ({
    ...g,
    login: String(g.login ?? ''),
    senha: String(g.senha ?? '')
  }));

  return {
    turmas: json.turmas || [],
    materias: json.materias || [],
    instrutores: json.instrutores || [],
    aulas: normalizedAulas,
    gestores: normalizedGestores
  };
}

export async function pushGoogleSheetsData(
  scriptUrl: string,
  data: {
    turmas: Turma[];
    materias: Materia[];
    instrutores: Instrutor[];
    aulas: Aula[];
    gestores: Gestor[];
  }
): Promise<void> {
  if (!scriptUrl || !scriptUrl.startsWith('http')) {
    throw new Error('URL do Google Apps Script inválida.');
  }

  // Normaliza datas antes de enviar para a planilha
  const cleanedAulas = data.aulas.map(a => ({
    ...a,
    data: normalizeDateStr(a.data)
  }));

  const payload = {
    action: 'syncAll',
    data: {
      ...data,
      aulas: cleanedAulas
    }
  };

  await fetch(scriptUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(payload)
  });

  return;
}
