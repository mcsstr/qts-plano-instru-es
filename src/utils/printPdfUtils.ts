import { Aula, Turma, Materia, Instrutor } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function getCleanAssunto(aula: Aula, materiaDescricao?: string): string {
  if (aula.observacoes) {
    const cleaned = aula.observacoes
      .replace(/\s*\|\s*Prejuízo registrado:.*$/i, '')
      .replace(/\s*\|\s*Remanejada para.*$/i, '')
      .replace(/^Prejuízo registrado:.*$/i, '')
      .replace(/^Remanejada para.*$/i, '')
      .replace(/^Aula de reposição referente.*$/i, '')
      .replace(/^Gerado via Rodízio Automático$/i, '')
      .replace(/^Inserção por Dias Específicos do Mês$/i, '')
      .trim();
    if (cleaned) return cleaned;
  }
  return materiaDescricao?.trim() || '';
}

export function openMonthlySchedulePdf(
  viewMonth: Date,
  aulas: Aula[],
  turmas: Turma[],
  materias: Materia[],
  instrutores: Instrutor[]
): void {
  // Abre a nova guia imediatamente durante o evento de clique do usuário
  const newWindow = window.open('', '_blank');
  if (!newWindow) {
    alert('Por favor, permita pop-ups no seu navegador para abrir a guia de visualização do PDF.');
    return;
  }

  const monthPrefix = format(viewMonth, 'yyyy-MM');
  const monthNameUpper = format(viewMonth, 'MMMM / yyyy', { locale: ptBR }).toUpperCase();
  const safeFilename = `QTS_Instrucoes_${format(viewMonth, 'yyyy_MM')}`;

  // Filtra as aulas do mês ordenadas cronologicamente
  const monthAulas = aulas
    .filter(a => {
      const cleanDate = a.data ? String(a.data).split('T')[0].split(' ')[0].trim() : '';
      if (!cleanDate.startsWith(monthPrefix)) return false;
      if (a.status === 'cancelada') return false;
      return true;
    })
    .sort((a, b) => {
      const dateDiff = a.data.localeCompare(b.data);
      if (dateDiff !== 0) return dateDiff;
      return (a.horario || '').localeCompare(b.horario || '');
    });

  // Agrupa as aulas por Turma / Pelotão (apenas pelotões que têm instrução no mês)
  const turmasComAulas: { turma: Turma; aulas: Aula[] }[] = [];

  for (const t of turmas) {
    const aulasDoPelotao = monthAulas.filter(a => a.turmaId === t.id);
    if (aulasDoPelotao.length > 0) {
      turmasComAulas.push({ turma: t, aulas: aulasDoPelotao });
    }
  }

  // Aulas sem pelotão cadastrado
  const knownIds = new Set(turmas.map(t => t.id));
  const aulasSemTurma = monthAulas.filter(a => !knownIds.has(a.turmaId));
  if (aulasSemTurma.length > 0) {
    turmasComAulas.push({
      turma: {
        id: 'sem_turma',
        nome: 'Instruções Gerais (Sem Pelotão Definido)',
        sigla: 'GERAL',
        cor: '#475569',
        ativa: true
      },
      aulas: aulasSemTurma
    });
  }

  const totalAulasNoMes = turmasComAulas.reduce((acc, curr) => acc + curr.aulas.length, 0);

  // Constrói o HTML das seções de cada pelotão
  let sectionsHtml = '';

  if (turmasComAulas.length === 0) {
    sectionsHtml = `
      <div class="empty-state">
        <div style="font-size: 32px; margin-bottom: 8px;">📅</div>
        <h3>Nenhuma instrução programada para ${format(viewMonth, 'MMMM de yyyy', { locale: ptBR })}</h3>
        <p>Não existem aulas agendadas neste mês para os pelotões cadastrados.</p>
      </div>
    `;
  } else {
    for (const item of turmasComAulas) {
      const cor = item.turma.cor || '#2563eb';
      let rowsHtml = '';

      for (const a of item.aulas) {
        const materia = materias.find(m => m.id === a.materiaId);
        const instrutor = instrutores.find(i => i.id === a.instrutorId);
        const assunto = getCleanAssunto(a, materia?.descricao);

        let diaFormatado = '';
        let diaSemana = '';
        try {
          const parsed = parseISO(a.data);
          diaFormatado = format(parsed, 'dd/MM');
          diaSemana = format(parsed, 'EEEE', { locale: ptBR });
        } catch {
          diaFormatado = a.data;
          diaSemana = '';
        }

        const isRealizada = a.status === 'realizada';
        const isPrejudicada = a.status === 'prejudicada';
        const statusBadge = isRealizada
          ? '<span class="badge badge-success">Concluída</span>'
          : isPrejudicada
          ? '<span class="badge badge-warning">Prejudicada</span>'
          : '<span class="badge badge-info">Agendada</span>';

        rowsHtml += `
          <tr>
            <!-- Coluna 1: DIA / DATA (Fundo Suave #f1f5f9) -->
            <td class="col-data">
              <span class="dia-num">${diaFormatado}</span>
              <span class="dia-semana">${diaSemana}</span>
            </td>

            <!-- Coluna 2: TURNO / HORÁRIO (Fundo Branco #ffffff) -->
            <td class="col-turno">
              <span class="turno-nome">${a.turno || 'Integral'}</span>
              ${a.horario ? `<span class="turno-hora">${a.horario}</span>` : ''}
            </td>

            <!-- Coluna 3: MATÉRIA (Fundo Suave #f1f5f9) -->
            <td class="col-materia">
              <div class="materia-nome">
                <span class="dot" style="background-color: ${materia?.cor || '#3b82f6'};"></span>
                <strong>${materia?.nome || 'Matéria'}</strong>
              </div>
              ${materia?.sigla ? `<span class="materia-sigla">SIGLA: ${materia.sigla}</span>` : ''}
            </td>

            <!-- Coluna 4: ASSUNTO MINISTRADO (Fundo Branco #ffffff) -->
            <td class="col-assunto">
              <span class="assunto-texto">${assunto || 'Conteúdo Programático Geral'}</span>
            </td>

            <!-- Coluna 5: INSTRUTOR DESIGNADO (Fundo Suave #f1f5f9) -->
            <td class="col-instrutor">
              <span class="inst-nome">👤 ${instrutor?.nome || 'Instrutor a Designar'}</span>
              ${instrutor?.contato ? `<span class="inst-contato">${instrutor.contato}</span>` : ''}
            </td>

            <!-- Coluna 6: SITUAÇÃO (Fundo Branco #ffffff) -->
            <td class="col-status">
              ${statusBadge}
            </td>
          </tr>
        `;
      }

      sectionsHtml += `
        <div class="pelotao-section">
          <!-- Faixa de Identificação do Pelotão -->
          <div class="pelotao-banner" style="background-color: ${cor}15; border-color: ${cor}40; border-left: 6px solid ${cor};">
            <div class="pelotao-info">
              <h3 style="color: ${cor};">PELOTÃO: ${item.turma.nome.toUpperCase()} (${item.turma.sigla.toUpperCase()})</h3>
              ${item.turma.descricao ? `<span class="pelotao-desc">${item.turma.descricao}</span>` : ''}
            </div>
            <div class="pelotao-count">
              <strong>${item.aulas.length}</strong> ${item.aulas.length === 1 ? 'instrução' : 'instruções'} no mês
            </div>
          </div>

          <!-- Tabela de Dados com Colunas Alternadas -->
          <table class="qts-table">
            <thead>
              <tr>
                <th style="width: 13%;">Dia / Data</th>
                <th style="width: 14%;">Turno / Horário</th>
                <th style="width: 25%;">Matéria</th>
                <th style="width: 24%;">Assunto Ministrado</th>
                <th style="width: 15%;">Instrutor</th>
                <th style="width: 9%; text-align: center;">Situação</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      `;
    }
  }

  const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeFilename}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #0f172a;
      color: #0f172a;
      line-height: 1.35;
      padding-top: 60px;
    }

    /* BARRA FLUTUANTE SUPERIOR DE AÇÕES (Oculta na Impressão) */
    .top-actions-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 56px;
      background: #090d16;
      border-bottom: 1px solid #1e293b;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }

    .top-actions-bar .bar-title {
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .top-actions-bar .bar-pill {
      font-size: 11px;
      background: rgba(59, 130, 246, 0.2);
      color: #93c5fd;
      border: 1px solid rgba(59, 130, 246, 0.4);
      padding: 2px 8px;
      border-radius: 999px;
      font-weight: 600;
    }

    .top-actions-bar .bar-buttons {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-print {
      background: #2563eb;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 8px 18px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
      transition: background 0.15s ease, transform 0.1s ease;
    }

    .btn-print:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
    }

    .btn-close {
      background: rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .btn-close:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }

    /* FOLHA A4 RETRATO */
    .a4-page-container {
      width: 100%;
      max-width: 860px;
      margin: 24px auto 50px auto;
      padding: 0 16px;
    }

    .a4-sheet {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
      padding: 36px 40px;
      min-height: 1100px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* CABEÇALHO OFICIAL */
    .doc-header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 14px;
      margin-bottom: 22px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }

    .header-branding {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .shield-badge {
      width: 48px;
      height: 48px;
      background: #0f172a;
      color: #f59e0b;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
      border: 1px solid #1e293b;
    }

    .header-titles .org-title {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #475569;
      text-transform: uppercase;
    }

    .header-titles .main-title {
      font-size: 16px;
      font-weight: 900;
      color: #020617;
      text-transform: uppercase;
      letter-spacing: -0.3px;
      margin-top: 2px;
    }

    .header-titles .sub-title {
      font-size: 11px;
      font-weight: 600;
      color: #334155;
      margin-top: 2px;
    }

    .month-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 8px 14px;
      text-align: right;
      flex-shrink: 0;
    }

    .month-card .month-label {
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #64748b;
      text-transform: uppercase;
      display: block;
    }

    .month-card .month-val {
      font-size: 13px;
      font-weight: 900;
      color: #1e3a8a;
      text-transform: uppercase;
      display: block;
      margin-top: 1px;
    }

    .month-card .gen-date {
      font-size: 8px;
      color: #94a3b8;
      display: block;
      margin-top: 2px;
    }

    /* SEÇÕES DO PELOTÃO */
    .pelotao-section {
      margin-bottom: 26px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .pelotao-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-radius: 8px;
      margin-bottom: 8px;
    }

    .pelotao-info h3 {
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.2px;
    }

    .pelotao-desc {
      font-size: 9px;
      color: #475569;
      display: block;
    }

    .pelotao-count {
      font-size: 10px;
      font-weight: 700;
      background: #ffffff;
      padding: 2px 8px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      color: #1e293b;
    }

    /* TABELA DE DADOS */
    .qts-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      font-size: 11px;
    }

    .qts-table thead tr {
      background: #0f172a;
      color: #ffffff;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
    }

    .qts-table th {
      padding: 8px 10px;
      font-weight: 800;
      border: 1px solid #334155;
      text-align: left;
    }

    .qts-table td {
      padding: 7px 10px;
      border: 1px solid #cbd5e1;
      vertical-align: middle;
    }

    /* CORES ALTERNADAS DAS COLUNAS (SOLICITADO EXPRESSAMENTE) */
    .col-data {
      background: #f1f5f9;
      text-align: center;
      white-space: nowrap;
    }

    .col-data .dia-num {
      font-size: 12px;
      font-weight: 900;
      color: #020617;
      display: block;
    }

    .col-data .dia-semana {
      font-size: 9px;
      font-weight: 600;
      color: #475569;
      text-transform: capitalize;
      display: block;
      margin-top: 1px;
    }

    .col-turno {
      background: #ffffff;
      text-align: center;
      white-space: nowrap;
    }

    .col-turno .turno-nome {
      font-weight: 700;
      color: #0f172a;
      display: block;
    }

    .col-turno .turno-hora {
      font-size: 9px;
      color: #64748b;
      display: block;
      margin-top: 1px;
    }

    .col-materia {
      background: #f1f5f9;
    }

    .materia-nome {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #0f172a;
      font-weight: 800;
    }

    .materia-nome .dot {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      flex-shrink: 0;
    }

    .materia-sigla {
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
      display: block;
      margin-left: 13px;
      margin-top: 1px;
    }

    .col-assunto {
      background: #ffffff;
    }

    .assunto-texto {
      font-weight: 700;
      color: #0f172a;
      display: block;
      line-height: 1.3;
    }

    .col-instrutor {
      background: #f1f5f9;
      white-space: nowrap;
    }

    .inst-nome {
      font-weight: 900;
      color: #020617;
      display: block;
    }

    .inst-contato {
      font-size: 9px;
      color: #64748b;
      display: block;
      margin-top: 1px;
    }

    .col-status {
      background: #ffffff;
      text-align: center;
      white-space: nowrap;
    }

    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .badge-info {
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #7dd3fc;
    }

    .badge-success {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }

    .badge-warning {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }

    /* ESTADO VAZIO */
    .empty-state {
      padding: 60px 20px;
      text-align: center;
      background: #f8fafc;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      margin: 30px 0;
    }

    .empty-state h3 {
      font-size: 14px;
      font-weight: 800;
      color: #1e293b;
    }

    .empty-state p {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }

    /* RODAPÉ E ASSINATURAS */
    .doc-footer {
      border-top: 2px solid #cbd5e1;
      padding-top: 20px;
      margin-top: 30px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .signatures-grid {
      display: flex;
      justify-content: space-around;
      gap: 30px;
      text-align: center;
      margin-bottom: 20px;
    }

    .sig-box {
      flex: 1;
      max-width: 320px;
    }

    .sig-line {
      border-bottom: 1px solid #64748b;
      height: 28px;
      margin-bottom: 6px;
    }

    .sig-title {
      font-size: 11px;
      font-weight: 800;
      color: #0f172a;
    }

    .sig-sub {
      font-size: 9px;
      color: #64748b;
    }

    .doc-meta {
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 8px;
      color: #64748b;
    }

    /* ESTILOS DE IMPRESSÃO A4 */
    @media print {
      .top-actions-bar {
        display: none !important;
      }

      body {
        background: #ffffff !important;
        padding: 0 !important;
        margin: 0 !important;
      }

      .a4-page-container {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .a4-sheet {
        border-radius: 0 !important;
        box-shadow: none !important;
        padding: 0 !important;
        min-height: auto !important;
      }

      @page {
        size: A4 portrait;
        margin: 10mm 12mm 12mm 12mm;
      }

      thead {
        display: table-header-group !important;
      }

      tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
  </style>
</head>
<body>
  <!-- Barra Superior de Controle na Guia Nova -->
  <div class="top-actions-bar">
    <div class="bar-title">
      <span>📄 Pré-visualização do Cronograma de Instruções</span>
      <span class="bar-pill">Formato A4 Retrato</span>
    </div>
    <div class="bar-buttons">
      <button class="btn-print" onclick="window.print()">
        🖨️ Imprimir / Salvar em PDF
      </button>
      <button class="btn-close" onclick="window.close()">
        Fechar Guia
      </button>
    </div>
  </div>

  <!-- Folha A4 em Exibição -->
  <div class="a4-page-container">
    <div class="a4-sheet">
      <div>
        <!-- Cabeçalho Oficial -->
        <div class="doc-header">
          <div class="header-branding">
            <div class="shield-badge">🛡️</div>
            <div class="header-titles">
              <div class="org-title">POLÍCIA MILITAR DO ESTADO DE SÃO PAULO</div>
              <h1 class="main-title">PLANO MENSAL DE INSTRUÇÃO E TREINAMENTO — QTS</h1>
              <div class="sub-title">19º Batalhão de Polícia Militar do Interior • Força Tática</div>
            </div>
          </div>

          <div class="month-card">
            <span class="month-label">MÊS DE REFERÊNCIA</span>
            <span class="month-val">${monthNameUpper}</span>
            <span class="gen-date">Emissão: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</span>
          </div>
        </div>

        <!-- Seções das Tabelas por Pelotão -->
        ${sectionsHtml}
      </div>

      <!-- Rodapé Oficial com Assinaturas -->
      <div class="doc-footer">
        <div class="signatures-grid">
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-title">Oficial de Instrução e Treinamento</div>
            <div class="sig-sub">Pelotões de Força Tática — 19º BPM/I</div>
          </div>

          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-title">Comandante da Subunidade / Batalhão</div>
            <div class="sig-sub">19º Batalhão de Polícia Militar do Interior</div>
          </div>
        </div>

        <div class="doc-meta">
          <span>Quadro de Trabalho Semanal (QTS) — Sistema de Gestão de Instruções FT</span>
          <span>Formato Oficial Retrato A4 • Total no Mês: ${totalAulasNoMes} instruções programadas</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  newWindow.document.open();
  newWindow.document.write(fullHtml);
  newWindow.document.close();
}
