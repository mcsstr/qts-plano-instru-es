import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  generatePeriodSchedule,
  generateSpecificDaysSchedule,
  GeneratedAulaPreview
} from '../../utils/rotationAlgorithm';
import { formatDateBr, formatDayOfWeek } from '../../utils/dateUtils';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Calendar,
  Users,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Trash2,
  CalendarCheck2
} from 'lucide-react';

interface BatchGeneratorViewProps {
  onSuccess: () => void;
}

export const BatchGeneratorView: React.FC<BatchGeneratorViewProps> = ({ onSuccess }) => {
  const { turmas, materias, instrutores, aulas, batchInsertAulas } = useApp();
  const { canEdit, openLoginModal } = useAuth();

  // Modalidade: 'periodo_rodizio' (Dias da Semana + Rodízio) ou 'dias_mes_fixo' (Mês + Dias por vírgula + Mesmas Matérias)
  const [modoGeracao, setModoGeracao] = useState<'periodo_rodizio' | 'dias_mes_fixo'>('periodo_rodizio');

  // Form State Comum
  const [turmaId, setTurmaId] = useState(turmas[0]?.id || '');

  // Modo 1: Período e Dias da Semana
  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [dataFim, setDataFim] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // 2 semanas por padrão
    return d.toISOString().split('T')[0];
  });
  const [diasSemana, setDiasSemana] = useState<number[]>([1, 2, 3, 4, 5]); // Seg a Sex

  // Modo 2: Mês e Dias Específicos por Vírgula (Sem Rodízio)
  const [mesEspecifico, setMesEspecifico] = useState<number>(() => new Date().getMonth() + 1);
  const [anoEspecifico, setAnoEspecifico] = useState<number>(() => new Date().getFullYear());
  const [diasPorVirgulaInput, setDiasPorVirgulaInput] = useState<string>('');

  const [selectedMateriaIds, setSelectedMateriaIds] = useState<string[]>(
    materias.map(m => m.id)
  );

  const [estrategiaRodizio, setEstrategiaRodizio] = useState<'equilibrado' | 'sequencial' | 'aleatorio'>('equilibrado');
  const [estrategiaInstrutor, setEstrategiaInstrutor] = useState<'apto_preferencial' | 'rotativo' | 'fixo'>('apto_preferencial');
  const [instrutorFixoId, setInstrutorFixoId] = useState(instrutores[0]?.id || '');
  const [pularDiasComAulaExistente, setPularDiasComAulaExistente] = useState(true);
  const [assuntoPadrao, setAssuntoPadrao] = useState('');
  const [usarAssuntosCadastrados, setUsarAssuntosCadastrados] = useState(true);
  const [selectedAssuntosByMateria, setSelectedAssuntosByMateria] = useState<Record<string, string[]>>({});

  // Inicializa todos os assuntos das matérias selecionadas por padrão
  React.useEffect(() => {
    setSelectedAssuntosByMateria(prev => {
      const next = { ...prev };
      materias.forEach(m => {
        if (next[m.id] === undefined) {
          next[m.id] = (m.assuntos || []).map(a => a.id);
        }
      });
      return next;
    });
  }, [materias]);

  const toggleAssuntoInMateria = (materiaId: string, assuntoId: string) => {
    setSelectedAssuntosByMateria(prev => {
      const current = prev[materiaId] || [];
      const exists = current.includes(assuntoId);
      return {
        ...prev,
        [materiaId]: exists ? current.filter(id => id !== assuntoId) : [...current, assuntoId]
      };
    });
  };

  // Previews
  const [previewList, setPreviewList] = useState<GeneratedAulaPreview[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Converte a string de dias por vírgula em array de números válidos do mês
  const maxDaysInSelectedMonth = new Date(anoEspecifico, mesEspecifico, 0).getDate();

  const parseDiasPorVirgula = (str: string): number[] => {
    return Array.from(
      new Set(
        str
          .split(/[,;\s]+/)
          .map(s => parseInt(s.trim(), 10))
          .filter(n => !isNaN(n) && n >= 1 && n <= maxDaysInSelectedMonth)
      )
    ).sort((a, b) => a - b);
  };

  const parsedSpecificDays = parseDiasPorVirgula(diasPorVirgulaInput);

  // Toggle dia da semana
  const toggleDiaSemana = (dayNum: number) => {
    setDiasSemana(prev =>
      prev.includes(dayNum) ? prev.filter(d => d !== dayNum) : [...prev, dayNum].sort()
    );
  };

  // Toggle matéria
  const toggleMateria = (id: string) => {
    setSelectedMateriaIds(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSelectAllMaterias = () => {
    if (selectedMateriaIds.length === materias.length) {
      setSelectedMateriaIds([]);
    } else {
      setSelectedMateriaIds(materias.map(m => m.id));
    }
  };

  const handleGeneratePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!turmaId || selectedMateriaIds.length === 0) {
      alert('Selecione a turma e pelo menos uma matéria.');
      return;
    }

    const turma = turmas.find(t => t.id === turmaId);

    if (modoGeracao === 'dias_mes_fixo') {
      const dias = parseDiasPorVirgula(diasPorVirgulaInput);
      if (dias.length === 0) {
        alert('Informe pelo menos um dia válido do mês separado por vírgula (ex: 5, 10, 18, 25).');
        return;
      }

      const previews = generateSpecificDaysSchedule(
        {
          turmaId,
          ano: anoEspecifico,
          mes: mesEspecifico,
          diasDoMes: dias,
          materiasIds: selectedMateriaIds,
          estrategiaInstrutor,
          instrutorFixoId,
          turnoPadrao: turma?.turnoPadrao || 'Integral',
          horarioPadrao: '08:00 - 17:00',
          pularDiasComAulaExistente,
          assuntoPadrao,
          selectedAssuntosByMateria,
          usarAssuntosCadastrados
        },
        aulas,
        instrutores,
        materias
      );

      setPreviewList(previews);
      setHasGenerated(true);
      return;
    }

    if (!dataInicio || !dataFim) {
      alert('Preencha as datas de início e término do período.');
      return;
    }

    const previews = generatePeriodSchedule(
      {
        turmaId,
        dataInicio,
        dataFim,
        diasSemana,
        materiasIds: selectedMateriaIds,
        estrategiaRodizio,
        estrategiaInstrutor,
        instrutorFixoId,
        turnoPadrao: turma?.turnoPadrao || 'Integral',
        horarioPadrao: '08:00 - 17:00',
        pularDiasComAulaExistente,
        assuntoPadrao,
        selectedAssuntosByMateria,
        usarAssuntosCadastrados
      },
      aulas,
      materias,
      instrutores
    );

    setPreviewList(previews);
    setHasGenerated(true);
  };

  const handleUpdatePreviewItem = (tempId: string, field: 'materiaId' | 'instrutorId' | 'observacoes', value: string) => {
    setPreviewList(prev =>
      prev.map(item => {
        if (item.tempId !== tempId) return item;
        const updated = { ...item, [field]: value };
        if (field === 'materiaId' || field === 'instrutorId') {
          const inst = instrutores.find(i => i.id === updated.instrutorId);
          updated.instrutorApto = inst ? inst.materiasAptas.includes(updated.materiaId) : false;
        }
        return updated;
      })
    );
  };

  const handleRemovePreviewItem = (tempId: string) => {
    setPreviewList(prev => prev.filter(item => item.tempId !== tempId));
  };

  const handleCommitBatch = () => {
    if (previewList.length === 0) return;
    batchInsertAulas(previewList);
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }
    onSuccess();
  };

  if (!canEdit) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-10 text-center max-w-lg mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4 text-amber-700">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Permissão de Gestor Necessária</h2>
        <p className="text-sm text-slate-600 mb-6">
          O gerador inteligente de períodos e rodízio de matérias altera o cronograma das turmas e requer autenticação de gestor.
        </p>
        <button
          onClick={openLoginModal}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md shadow-blue-500/20 transition-all inline-flex items-center space-x-2"
        >
          <span>Entrar como Gestor</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const diasNomes = [
    { num: 1, label: 'Seg' },
    { num: 2, label: 'Ter' },
    { num: 3, label: 'Qua' },
    { num: 4, label: 'Qui' },
    { num: 5, label: 'Sex' },
    { num: 6, label: 'Sáb' },
    { num: 0, label: 'Dom' }
  ];

  const mesesNomes = [
    { num: 1, nome: 'Janeiro' },
    { num: 2, nome: 'Fevereiro' },
    { num: 3, nome: 'Março' },
    { num: 4, nome: 'Abril' },
    { num: 5, nome: 'Maio' },
    { num: 6, nome: 'Junho' },
    { num: 7, nome: 'Julho' },
    { num: 8, nome: 'Agosto' },
    { num: 9, nome: 'Setembro' },
    { num: 10, nome: 'Outubro' },
    { num: 11, nome: 'Novembro' },
    { num: 12, nome: 'Dezembro' }
  ];

  return (
    <div className="space-y-5 max-w-6xl mx-auto w-full min-w-0">
      {/* Formulário de Configuração do Lote */}
      <form onSubmit={handleGeneratePreview} className="w-full min-w-0 bg-white rounded-2xl border border-indigo-100 shadow-sm p-4 sm:p-6 space-y-5 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <span>1. Parâmetros do Período e Turma</span>
          </h2>

          {/* Seletor Compacto de Modalidade */}
          <div className="grid grid-cols-2 sm:inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
            <button
              type="button"
              onClick={() => {
                setModoGeracao('periodo_rodizio');
                setPularDiasComAulaExistente(true);
              }}
              className={`flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                modoGeracao === 'periodo_rodizio'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Dias da semana</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setModoGeracao('dias_mes_fixo');
                setPularDiasComAulaExistente(false);
              }}
              className={`flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                modoGeracao === 'dias_mes_fixo'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck2 className="w-3.5 h-3.5 shrink-0" />
              <span>Dias do mês</span>
            </button>
          </div>
        </div>

        {/* Explicação da modalidade escolhida */}
        <div
          className={`px-3.5 py-2.5 rounded-xl border text-xs font-medium ${
            modoGeracao === 'periodo_rodizio'
              ? 'bg-blue-50/70 border-blue-200/80 text-blue-900'
              : 'bg-indigo-50/70 border-indigo-200/80 text-indigo-900'
          }`}
        >
          {modoGeracao === 'periodo_rodizio'
            ? 'Modo Rodízio: distribui e alterna as matérias selecionadas ao longo dos dias da semana dentro do período informado.'
            : 'Modo Matérias Fixas: insere todas as matérias selecionadas em cada dia do mês informado, sem fazer rodízio.'}
        </div>

        {/* MODO 1: PERÍODO + DIAS DA SEMANA (RODÍZIO) */}
        {modoGeracao === 'periodo_rodizio' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-0">
              {/* Turma */}
              <div className="min-w-0">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  Turma Beneficiária *
                </label>
                <select
                  value={turmaId}
                  onChange={e => setTurmaId(e.target.value)}
                  className="w-full min-w-0 max-w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {turmas.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nome} ({t.sigla})
                    </option>
                  ))}
                </select>
              </div>

              {/* Data Início */}
              <div className="min-w-0 w-full overflow-hidden">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Data de Início do Período *
                </label>
                <div className="w-full min-w-0 overflow-hidden rounded-xl">
                  <input
                    type="date"
                    required
                    value={dataInicio}
                    onChange={e => setDataInicio(e.target.value)}
                    className="w-full min-w-0 max-w-full block box-border appearance-none bg-white px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Data Fim */}
              <div className="min-w-0 w-full overflow-hidden">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Data de Término do Período *
                </label>
                <div className="w-full min-w-0 overflow-hidden rounded-xl">
                  <input
                    type="date"
                    required
                    value={dataFim}
                    onChange={e => setDataFim(e.target.value)}
                    className="w-full min-w-0 max-w-full block box-border appearance-none bg-white px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Dias da semana e Pular existentes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Dias da Semana com Aula:
                </label>
                <div className="flex flex-wrap gap-2">
                  {diasNomes.map(d => {
                    const active = diasSemana.includes(d.num);
                    return (
                      <button
                        type="button"
                        key={d.num}
                        onClick={() => toggleDiaSemana(d.num)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                          active
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-3 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200 w-full hover:bg-slate-100/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={pularDiasComAulaExistente}
                    onChange={e => setPularDiasComAulaExistente(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Pular dias que já possuem aula agendada para esta turma (evitar sobreposição)
                  </span>
                </label>
              </div>
            </div>
          </>
        ) : (
          /* MODO 2: SELECIONAR MÊS E DIAS POR VÍRGULA (SEM RODÍZIO - INSERE AS MESMAS MATÉRIAS) */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Turma */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  Turma Beneficiária *
                </label>
                <select
                  value={turmaId}
                  onChange={e => setTurmaId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {turmas.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nome} ({t.sigla})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mês */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mês de Referência *
                </label>
                <select
                  value={mesEspecifico}
                  onChange={e => setMesEspecifico(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {mesesNomes.map(m => (
                    <option key={m.num} value={m.num}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ano */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Ano *
                </label>
                <select
                  value={anoEspecifico}
                  onChange={e => setAnoEspecifico(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {[2025, 2026, 2027, 2028].map(y => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campo de Dias separados por vírgula */}
            <div className="p-4 bg-indigo-50/50 border border-indigo-200/80 rounded-2xl space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="block text-xs font-bold text-indigo-950">
                  Dias de {mesesNomes.find(m => m.num === mesEspecifico)?.nome}/{anoEspecifico} em que a(s) matéria(s) será(ão) inserida(s) (separados por vírgula): *
                </label>
                {parsedSpecificDays.length > 0 && (
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    {parsedSpecificDays.length} {parsedSpecificDays.length === 1 ? 'dia selecionado' : 'dias selecionados'}
                  </span>
                )}
              </div>

              <input
                type="text"
                value={diasPorVirgulaInput}
                onChange={e => setDiasPorVirgulaInput(e.target.value)}
                placeholder="Ex: 3, 7, 12, 18, 24, 28"
                className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-300 bg-white text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        <hr className="border-slate-100" />

        {/* 2. Seleção de Matérias e Estratégia */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 min-w-0">
              <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">
                {modoGeracao === 'dias_mes_fixo'
                  ? `2. Matérias Fixas (${selectedMateriaIds.length})`
                  : `2. Matérias do Rodízio (${selectedMateriaIds.length})`}
              </span>
            </h2>
            <button
              type="button"
              onClick={handleSelectAllMaterias}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 shrink-0 whitespace-nowrap"
            >
              {selectedMateriaIds.length === materias.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
            </button>
          </div>

          {/* Grid de Matérias */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {materias.map(m => {
              const selected = selectedMateriaIds.includes(m.id);
              const assuntosCount = m.assuntos?.length || 0;
              return (
                <div
                  key={m.id}
                  onClick={() => toggleMateria(m.id)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                    selected
                      ? 'border-blue-600 bg-blue-50/70 text-slate-900 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: m.cor }}
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold block truncate">{m.nome}</span>
                      <span className="text-[10px] text-slate-400 block">
                        {assuntosCount > 0 ? `${assuntosCount} assunto(s)` : 'Sem assuntos'}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => {}}
                    className="w-3.5 h-3.5 text-blue-600 rounded shrink-0 pointer-events-none ml-1"
                  />
                </div>
              );
            })}
          </div>

          {/* Opções de Rodízio e Instrutores */}
          <div className={`grid grid-cols-1 ${modoGeracao === 'periodo_rodizio' ? 'sm:grid-cols-2' : ''} gap-4 pt-2`}>
            {modoGeracao === 'periodo_rodizio' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Estratégia de Rodízio de Matérias
                </label>
                <select
                  value={estrategiaRodizio}
                  onChange={e => setEstrategiaRodizio(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="equilibrado">
                    🧠 Rodízio Inteligente (Prioriza matérias com menor contagem prévia)
                  </option>
                  <option value="sequencial">
                    🔄 Sequencial Cíclico (Matéria 1, Matéria 2, Matéria 3...)
                  </option>
                  <option value="aleatorio">
                    🎲 Aleatório Balanceado
                  </option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alocação de Instrutores
              </label>
              <select
                value={estrategiaInstrutor}
                onChange={e => setEstrategiaInstrutor(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="apto_preferencial">
                  ⭐ Instrutores Aptos Preferenciais (Equilibra dias trabalhados)
                </option>
                <option value="rotativo">
                  🔄 Rodízio Geral entre todos os instrutores
                </option>
                <option value="fixo">
                  👤 Instrutor Fixo para todo o período
                </option>
              </select>
            </div>
          </div>

          {estrategiaInstrutor === 'fixo' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selecione o Instrutor Fixo:
              </label>
              <select
                value={instrutorFixoId}
                onChange={e => setInstrutorFixoId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white"
              >
                {instrutores.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 3. Parametrização de Assuntos das Matérias Selecionadas */}
          <div className="pt-2 space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    3. Distribuição dos Assuntos Pré-cadastrados
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Os assuntos cadastrados em cada matéria são distribuídos automaticamente respeitando a importância (1x, 2x, 3x).
                  </span>
                </div>

                <label className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
                  <input
                    type="checkbox"
                    checked={usarAssuntosCadastrados}
                    onChange={e => setUsarAssuntosCadastrados(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Usar Assuntos Cadastrados
                  </span>
                </label>
              </div>

              {usarAssuntosCadastrados && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {materias
                    .filter(m => selectedMateriaIds.includes(m.id) && m.assuntos && m.assuntos.length > 0)
                    .map(m => {
                      const activeIds = selectedAssuntosByMateria[m.id] || [];
                      return (
                        <div key={m.id} className="bg-white p-2.5 rounded-xl border border-slate-200/85 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.cor }} />
                              <span className="truncate">{m.nome}</span>
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                              {activeIds.length}/{m.assuntos?.length}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {m.assuntos!.map(ass => {
                              const checked = activeIds.includes(ass.id);
                              return (
                                <button
                                  key={ass.id}
                                  type="button"
                                  onClick={() => toggleAssuntoInMateria(m.id, ass.id)}
                                  className={`text-[10.5px] font-medium px-2 py-0.5 rounded-md border transition-all flex items-center gap-1 ${
                                    checked
                                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                                      : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                                  }`}
                                >
                                  <span>{ass.nome}</span>
                                  {(ass.peso || 1) > 1 && (
                                    <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1 rounded">
                                      {ass.peso}x
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assunto Padrão de Apoio (usado quando a matéria não tiver assuntos cadastrados — Opcional)
              </label>
              <input
                type="text"
                value={assuntoPadrao}
                onChange={e => setAssuntoPadrao(e.target.value)}
                placeholder="Ex: Instrução Geral (você também pode editar aula por aula na prévia)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Botão de Gerar Prévia */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md shadow-indigo-500/20 transition-all text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Gerar Prévia do Rodízio</span>
          </button>
        </div>
      </form>

      {/* Tabela de Prévia e Confirmação */}
      {hasGenerated && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Prévia do Agendamento ({previewList.length} aulas geradas)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Você pode ajustar a matéria ou instrutor diretamente na prévia antes de salvar no calendário.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setPreviewList([])}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                Descartar Prévia
              </button>

              <button
                type="button"
                disabled={previewList.length === 0}
                onClick={handleCommitBatch}
                className="flex items-center space-x-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Inserir Todas no Calendário</span>
              </button>
            </div>
          </div>

          {previewList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Nenhuma data disponível encontrada para os parâmetros informados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Dia</th>
                    <th className="py-2.5 px-3">Matéria</th>
                    <th className="py-2.5 px-3">Assunto da Aula</th>
                    <th className="py-2.5 px-3">Instrutor Alocado</th>
                    <th className="py-2.5 px-2 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewList.map(item => {
                    return (
                      <tr key={item.tempId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">
                          {formatDateBr(item.data)}
                        </td>
                        <td className="py-2 px-3 text-slate-500 capitalize whitespace-nowrap">
                          {formatDayOfWeek(item.data)}
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={item.materiaId}
                            onChange={e => handleUpdatePreviewItem(item.tempId, 'materiaId', e.target.value)}
                            className="text-xs py-1 px-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {materias.map(m => (
                              <option key={m.id} value={m.id}>
                                {m.nome}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3 min-w-[200px]">
                          <div className="flex flex-col gap-1">
                            {(() => {
                              const mat = materias.find(m => m.id === item.materiaId);
                              const matAssuntos = mat?.assuntos || [];
                              if (matAssuntos.length === 0) return null;
                              return (
                                <select
                                  value={matAssuntos.some(a => a.nome === item.observacoes) ? item.observacoes : ''}
                                  onChange={e => {
                                    if (e.target.value) {
                                      handleUpdatePreviewItem(item.tempId, 'observacoes', e.target.value);
                                    }
                                  }}
                                  className="w-full text-[11px] py-1 px-2 rounded-lg border border-blue-200 bg-blue-50/50 text-blue-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="">Escolher assunto cadastrado...</option>
                                  {matAssuntos.map(a => (
                                    <option key={a.id} value={a.nome}>
                                      {a.nome} {(a.peso || 1) > 1 ? `(${a.peso}x)` : ''}
                                    </option>
                                  ))}
                                </select>
                              );
                            })()}
                            <input
                              type="text"
                              value={item.observacoes || ''}
                              onChange={e => handleUpdatePreviewItem(item.tempId, 'observacoes', e.target.value)}
                              placeholder="Digite o assunto..."
                              className="w-full text-xs py-1 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center space-x-1.5">
                            <select
                              value={item.instrutorId}
                              onChange={e => handleUpdatePreviewItem(item.tempId, 'instrutorId', e.target.value)}
                              className="text-xs py-1 px-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              {instrutores.map(i => {
                                const apto = i.materiasAptas.includes(item.materiaId);
                                return (
                                  <option key={i.id} value={i.id}>
                                    {i.nome} {apto ? '⭐ (Apto)' : ''}
                                  </option>
                                );
                              })}
                            </select>
                            {item.instrutorApto ? (
                              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                                ⭐ Apto
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                                Geral
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemovePreviewItem(item.tempId)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                            title="Remover este dia da prévia"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

