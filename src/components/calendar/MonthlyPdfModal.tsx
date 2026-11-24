import React, { useState, useMemo } from 'react';
import { Aula, Turma, Materia, Instrutor } from '../../types';
import { useApp } from '../../context/AppContext';
import { getAulaAssunto } from './ClassCard';
import {
  format,
  parseISO,
  addMonths,
  subMonths
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  X,
  Printer,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  User,
  Layers,
  Calendar,
  Sparkles
} from 'lucide-react';

interface MonthlyPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: Date;
}

export const MonthlyPdfModal: React.FC<MonthlyPdfModalProps> = ({
  isOpen,
  onClose,
  initialDate
}) => {
  const {
    aulas,
    turmas,
    materias,
    instrutores,
    getTurma,
    getMateria,
    getInstrutor
  } = useApp();

  const [viewMonth, setViewMonth] = useState<Date>(initialDate || new Date());
  const [selectedTurmaFilter, setSelectedTurmaFilter] = useState<string>('all');

  // Atualiza o mês caso mude na visualização inicial
  React.useEffect(() => {
    if (initialDate) {
      setViewMonth(initialDate);
    }
  }, [initialDate, isOpen]);

  if (!isOpen) return null;

  const monthPrefix = format(viewMonth, 'yyyy-MM');
  const monthNameFormatted = format(viewMonth, 'MMMM yyyy', { locale: ptBR });
  const monthNameUpper = format(viewMonth, 'MMMM / yyyy', { locale: ptBR }).toUpperCase();

  // Aulas do mês selecionado ordenadas cronologicamente
  const monthAulas = useMemo(() => {
    return aulas
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
  }, [aulas, monthPrefix]);

  // Agrupa as aulas por Turma / Pelotão (apenas pelotões que têm aula no mês)
  const turmasComAulas = useMemo(() => {
    const relevantTurmas = selectedTurmaFilter === 'all'
      ? turmas
      : turmas.filter(t => t.id === selectedTurmaFilter);

    const result: { turma: Turma; aulas: Aula[] }[] = [];

    for (const t of relevantTurmas) {
      const aulasDoPelotao = monthAulas.filter(a => a.turmaId === t.id);
      if (aulasDoPelotao.length > 0) {
        result.push({ turma: t, aulas: aulasDoPelotao });
      }
    }

    // Aulas sem turma cadastrada
    const knownIds = new Set(turmas.map(t => t.id));
    const aulasSemTurma = monthAulas.filter(a => !knownIds.has(a.turmaId));
    if (aulasSemTurma.length > 0 && selectedTurmaFilter === 'all') {
      result.push({
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

    return result;
  }, [turmas, monthAulas, selectedTurmaFilter]);

  const totalAulasNoMes = useMemo(() => {
    return turmasComAulas.reduce((acc, curr) => acc + curr.aulas.length, 0);
  }, [turmasComAulas]);

  const handlePrevMonth = () => setViewMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setViewMonth(prev => addMonths(prev, 1));
  const handleTodayMonth = () => setViewMonth(new Date());

  const handlePrint = () => {
    const originalTitle = document.title;
    const safeMonthSlug = format(viewMonth, 'yyyy_MM');
    document.title = `QTS_Instrucoes_${safeMonthSlug}`;

    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 1200);
  };

  const formatDayName = (dateStr: string): string => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'EEEE', { locale: ptBR });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto modal-pdf-overlay">
      {/* Backdrop para fechar */}
      <div
        className="fixed inset-0 modal-pdf-backdrop"
        onClick={onClose}
      />

      {/* Card Principal do Modal */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl my-auto flex flex-col max-h-[96vh] overflow-hidden z-10 modal-pdf-card">
        {/* Barra Superior de Controles (Não aparece na impressão) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 modal-pdf-header-controls">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Gerar PDF do Calendário</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Formato A4 Retrato
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tabela mensal de instruções separada por pelotão com colunas alternadas para impressão e envio
              </p>
            </div>
          </div>

          {/* Navegação de Mês e Filtro de Turma */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Seletor Mês */}
            <div className="flex items-center bg-slate-800/90 rounded-xl p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                title="Mês Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleTodayMonth}
                className="px-2.5 py-1 text-xs font-bold text-white capitalize"
                title="Ir para o mês atual"
              >
                {monthNameFormatted}
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                title="Próximo Mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Filtro por Turma / Pelotão */}
            <div className="relative">
              <select
                value={selectedTurmaFilter}
                onChange={e => setSelectedTurmaFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os Pelotões (Separados)</option>
                {turmas.map(t => (
                  <option key={t.id} value={t.id}>
                    Pelotão: {t.sigla} — {t.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Botão de Imprimir / Salvar em PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Salvar em PDF / Imprimir</span>
            </button>

            {/* Botão Fechar */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Área de Visualização da Folha A4 (Com rolagem na tela, 100% visível na impressão) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-950/80 flex justify-center">
          {/* Folha A4 Simulada */}
          <div
            id="qts-pdf-print-sheet"
            className="w-full max-w-[820px] bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-9 border border-slate-200 min-h-[1050px] flex flex-col justify-between"
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
            }}
          >
            <div>
              {/* CABEÇALHO OFICIAL DO DOCUMENTO */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 border border-slate-800 flex items-center justify-center shrink-0 shadow-xs">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-slate-600 uppercase block">
                        POLÍCIA MILITAR DO ESTADO DE SÃO PAULO
                      </span>
                      <h1 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight leading-tight mt-0.5">
                        PLANO MENSAL DE INSTRUÇÃO E TREINAMENTO — QTS
                      </h1>
                      <span className="text-xs font-semibold text-slate-700 block mt-0.5">
                        19º Batalhão de Polícia Militar do Interior • Força Tática
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-300">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                      MÊS DE REFERÊNCIA
                    </span>
                    <span className="text-sm font-black text-blue-900 uppercase block tracking-tight">
                      {monthNameUpper}
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">
                      Emissão: {format(new Date(), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                </div>
              </div>

              {/* LISTAGEM DAS TABELAS SEPARADAS POR PELOTÃO */}
              {turmasComAulas.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 my-8">
                  <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <h3 className="font-bold text-slate-800 text-sm">
                    Nenhuma instrução programada para {monthNameFormatted}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Não existem aulas ou instruções agendadas neste mês para os pelotões selecionados.
                  </p>
                </div>
              ) : (
                <div className="space-y-7">
                  {turmasComAulas.map((item, idx) => {
                    const turmaColor = item.turma.cor || '#2563eb';

                    return (
                      <div key={item.turma.id} className="print-no-break">
                        {/* Faixa de Identificação do Pelotão */}
                        <div
                          className="flex items-center justify-between px-3.5 py-2 rounded-xl mb-2.5 border"
                          style={{
                            backgroundColor: `${turmaColor}12`,
                            borderColor: `${turmaColor}40`
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-3.5 h-3.5 rounded-md shrink-0 shadow-2xs"
                              style={{ backgroundColor: turmaColor }}
                            />
                            <div>
                              <h3
                                className="text-xs sm:text-sm font-black uppercase tracking-tight"
                                style={{ color: turmaColor }}
                              >
                                PELOTÃO: {item.turma.nome} ({item.turma.sigla})
                              </h3>
                              {item.turma.descricao && (
                                <span className="text-[10px] text-slate-600 block leading-tight">
                                  {item.turma.descricao}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-800 shadow-2xs">
                              {item.aulas.length} {item.aulas.length === 1 ? 'instrução' : 'instruções'}
                            </span>
                          </div>
                        </div>

                        {/* TABELA DE DADOS COM COLUNAS DE CORES ALTERNADAS */}
                        <div className="overflow-hidden rounded-xl border border-slate-300">
                          <table className="w-full border-collapse text-left">
                            <thead>
                              <tr className="bg-slate-900 text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                                <th className="py-2 px-3 border border-slate-700 text-center w-24">
                                  Dia / Data
                                </th>
                                <th className="py-2 px-2.5 border border-slate-700 text-center w-24">
                                  Turno
                                </th>
                                <th className="py-2 px-3 border border-slate-700 w-44">
                                  Matéria
                                </th>
                                <th className="py-2 px-3 border border-slate-700">
                                  Assunto Ministrado
                                </th>
                                <th className="py-2 px-3 border border-slate-700 w-44">
                                  Instrutor
                                </th>
                                <th className="py-2 px-2.5 border border-slate-700 text-center w-24">
                                  Situação
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.aulas.map((aula, aIdx) => {
                                const materia = getMateria(aula.materiaId);
                                const instrutor = getInstrutor(aula.instrutorId);
                                const assunto = getAulaAssunto(aula, materia?.descricao);

                                return (
                                  <tr
                                    key={aula.id}
                                    className="border-b border-slate-300 text-[11px] leading-tight"
                                  >
                                    {/* COLUNA 1: DIA / DATA (Fundo Cinza Suave #f1f5f9) */}
                                    <td className="py-2 px-3 border border-slate-300 bg-slate-100/90 text-center whitespace-nowrap">
                                      <span className="font-black text-slate-950 text-xs block">
                                        {format(parseISO(aula.data), 'dd/MM')}
                                      </span>
                                      <span className="text-[10px] font-semibold text-slate-600 capitalize block mt-0.5">
                                        {formatDayName(aula.data)}
                                      </span>
                                    </td>

                                    {/* COLUNA 2: TURNO / HORÁRIO (Fundo Branco #ffffff) */}
                                    <td className="py-2 px-2.5 border border-slate-300 bg-white text-center whitespace-nowrap">
                                      <span className="font-bold text-slate-900 block">
                                        {aula.turno || 'Integral'}
                                      </span>
                                      {aula.horario && (
                                        <span className="text-[10px] text-slate-500 block mt-0.5">
                                          {aula.horario}
                                        </span>
                                      )}
                                    </td>

                                    {/* COLUNA 3: MATÉRIA (Fundo Cinza Suave #f1f5f9) */}
                                    <td className="py-2 px-3 border border-slate-300 bg-slate-100/90">
                                      <div className="flex items-center gap-1.5">
                                        <span
                                          className="w-2 h-2 rounded-full shrink-0"
                                          style={{ backgroundColor: materia?.cor || '#3b82f6' }}
                                        />
                                        <span className="font-extrabold text-slate-900 block leading-snug">
                                          {materia?.nome || 'Matéria'}
                                        </span>
                                      </div>
                                      {materia?.sigla && (
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block ml-3.5 mt-0.5">
                                          SIGLA: {materia.sigla}
                                        </span>
                                      )}
                                    </td>

                                    {/* COLUNA 4: ASSUNTO MINISTRADO (Fundo Branco #ffffff) */}
                                    <td className="py-2 px-3 border border-slate-300 bg-white">
                                      <span className="font-bold text-slate-900 block leading-snug">
                                        {assunto || 'Conteúdo Programático Geral'}
                                      </span>
                                    </td>

                                    {/* COLUNA 5: INSTRUTOR DESIGNADO (Fundo Cinza Suave #f1f5f9) */}
                                    <td className="py-2 px-3 border border-slate-300 bg-slate-100/90 whitespace-nowrap">
                                      <div className="flex items-center gap-1 font-black text-slate-950">
                                        <User className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                                        <span>{instrutor?.nome || 'Instrutor a Designar'}</span>
                                      </div>
                                      {instrutor?.contato && (
                                        <span className="text-[10px] text-slate-500 block ml-4.5 mt-0.5">
                                          {instrutor.contato}
                                        </span>
                                      )}
                                    </td>

                                    {/* COLUNA 6: SITUAÇÃO (Fundo Branco #ffffff) */}
                                    <td className="py-2 px-2.5 border border-slate-300 bg-white text-center whitespace-nowrap">
                                      {aula.status === 'realizada' ? (
                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                          Concluída
                                        </span>
                                      ) : aula.status === 'prejudicada' ? (
                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                                          Prejudicada
                                        </span>
                                      ) : (
                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300">
                                          Agendada
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RODAPÉ OFICIAL COM CAMPOS DE ASSINATURA */}
            <div className="mt-10 pt-6 border-t-2 border-slate-300 print-no-break">
              <div className="grid grid-cols-2 gap-8 text-center">
                <div>
                  <div className="border-b border-slate-400 w-4/5 mx-auto mb-1.5 h-8"></div>
                  <span className="text-xs font-black text-slate-900 block">
                    Oficial de Instrução e Treinamento
                  </span>
                  <span className="text-[10px] text-slate-600 block">
                    Pelotões de Força Tática — 19º BPM/I
                  </span>
                </div>

                <div>
                  <div className="border-b border-slate-400 w-4/5 mx-auto mb-1.5 h-8"></div>
                  <span className="text-xs font-black text-slate-900 block">
                    Comandante da Subunidade / Batalhão
                  </span>
                  <span className="text-[10px] text-slate-600 block">
                    19º Batalhão de Polícia Militar do Interior
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-[9px] text-slate-500 border-t border-slate-200 pt-2.5">
                <span>
                  Quadro de Trabalho Semanal (QTS) — Sistema de Gestão de Instruções FT
                </span>
                <span className="font-semibold">
                  Formato Retrato A4 • Total no Mês: {totalAulasNoMes} instruções
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
