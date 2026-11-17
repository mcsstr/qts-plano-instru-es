import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  BarChart3,
  Award,
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Filter,
  TrendingUp,
  Clock,
  Layers,
  Search
} from 'lucide-react';
import { getAulaAssunto } from '../calendar/ClassCard';

export const MetricsDashboard: React.FC = () => {
  const { aulas, materias, instrutores, turmas } = useApp();

  const [turmaFilter, setTurmaFilter] = useState<string>('all');
  const [periodoFilter, setPeriodoFilter] = useState<'all' | '30dias' | 'mesAtual'>('all');
  const [activeTab, setActiveTab] = useState<'todas' | 'materias' | 'assuntos' | 'instrutores' | 'prejuizos'>('todas');
  const [assuntoMateriaFilter, setAssuntoMateriaFilter] = useState<string>('all');
  const [assuntoSearchQuery, setAssuntoSearchQuery] = useState<string>('');

  // Filtragem de dados com base nos filtros da página de métricas
  const filteredAulas = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    return aulas.filter(aula => {
      if (turmaFilter !== 'all' && aula.turmaId !== turmaFilter) return false;

      if (periodoFilter === '30dias') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        const limitStr = d.toISOString().split('T')[0];
        if (aula.data < limitStr) return false;
      } else if (periodoFilter === 'mesAtual') {
        const currentMonthPrefix = todayStr.substring(0, 7);
        if (!aula.data.startsWith(currentMonthPrefix)) return false;
      }

      return true;
    });
  }, [aulas, turmaFilter, periodoFilter]);

  // 1. Estatística de Matérias Mais Aplicadas
  const materiasStats = useMemo(() => {
    const countMap = new Map<string, { total: number; realizadas: number; prejudicadas: number }>();
    materias.forEach(m => countMap.set(m.id, { total: 0, realizadas: 0, prejudicadas: 0 }));

    filteredAulas.forEach(aula => {
      const current = countMap.get(aula.materiaId) || { total: 0, realizadas: 0, prejudicadas: 0 };
      current.total += 1;
      if (aula.status === 'realizada') current.realizadas += 1;
      if (aula.status === 'prejudicada') current.prejudicadas += 1;
      countMap.set(aula.materiaId, current);
    });

    return materias
      .map(m => {
        const stats = countMap.get(m.id) || { total: 0, realizadas: 0, prejudicadas: 0 };
        return {
          id: m.id,
          nome: m.nome,
          sigla: m.sigla,
          cor: m.cor,
          total: stats.total,
          realizadas: stats.realizadas,
          prejudicadas: stats.prejudicadas,
          metaDias: m.cargaDiasObjetivo || 0
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [filteredAulas, materias]);

  // 1.5. Estatística de Assuntos Ministrados e Repetidos
  const assuntosStats = useMemo(() => {
    interface AssuntoStatItem {
      key: string;
      assuntoNome: string;
      materiaId: string;
      materiaNome: string;
      materiaSigla: string;
      materiaCor: string;
      peso: number;
      total: number;
      realizadas: number;
      prejudicadas: number;
    }

    const statsMap = new Map<string, AssuntoStatItem>();

    // Inicializa com todos os assuntos pré-cadastrados dentro de cada matéria
    materias.forEach(m => {
      (m.assuntos || []).forEach(ass => {
        const cleanAssunto = ass.nome.trim();
        if (!cleanAssunto) return;
        const key = `${m.id}::${cleanAssunto.toLowerCase()}`;
        if (!statsMap.has(key)) {
          statsMap.set(key, {
            key,
            assuntoNome: cleanAssunto,
            materiaId: m.id,
            materiaNome: m.nome,
            materiaSigla: m.sigla,
            materiaCor: m.cor || '#3b82f6',
            peso: ass.peso || 1,
            total: 0,
            realizadas: 0,
            prejudicadas: 0
          });
        }
      });
    });

    // Contabiliza todas as aulas agendadas/aplicadas por assunto
    filteredAulas.forEach(aula => {
      if (aula.status === 'cancelada') return;
      const mat = materias.find(m => m.id === aula.materiaId);
      const extractedAssunto = getAulaAssunto(aula, mat?.descricao);
      const assuntoFinal = (extractedAssunto || mat?.nome || 'Assunto Geral').trim();
      const key = `${aula.materiaId}::${assuntoFinal.toLowerCase()}`;

      const existing = statsMap.get(key) || {
        key,
        assuntoNome: assuntoFinal,
        materiaId: aula.materiaId,
        materiaNome: mat?.nome || 'Matéria',
        materiaSigla: mat?.sigla || 'MAT',
        materiaCor: mat?.cor || '#3b82f6',
        peso: 1,
        total: 0,
        realizadas: 0,
        prejudicadas: 0
      };

      existing.total += 1;
      if (aula.status === 'realizada') existing.realizadas += 1;
      if (aula.status === 'prejudicada') existing.prejudicadas += 1;
      statsMap.set(key, existing);
    });

    const q = assuntoSearchQuery.toLowerCase().trim();

    return Array.from(statsMap.values())
      .filter(item => {
        if (assuntoMateriaFilter !== 'all' && item.materiaId !== assuntoMateriaFilter) {
          return false;
        }
        if (q) {
          return (
            item.assuntoNome.toLowerCase().includes(q) ||
            item.materiaNome.toLowerCase().includes(q) ||
            item.materiaSigla.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => b.total - a.total || a.assuntoNome.localeCompare(b.assuntoNome));
  }, [filteredAulas, materias, assuntoMateriaFilter, assuntoSearchQuery]);

  // 2. Estatística de Instrutores por Dias Aplicados (Contabilização por DIA, não por hora)
  const instrutoresStats = useMemo(() => {
    // Para cada instrutor, calculamos os DIAS ÚNICOS de aula dada
    const datesMap = new Map<string, Set<string>>();
    const realizadasDatesMap = new Map<string, Set<string>>();

    instrutores.forEach(i => {
      datesMap.set(i.id, new Set<string>());
      realizadasDatesMap.set(i.id, new Set<string>());
    });

    filteredAulas.forEach(aula => {
      if (aula.status !== 'cancelada') {
        const allSet = datesMap.get(aula.instrutorId) || new Set<string>();
        allSet.add(aula.data);
        datesMap.set(aula.instrutorId, allSet);

        if (aula.status === 'realizada') {
          const rSet = realizadasDatesMap.get(aula.instrutorId) || new Set<string>();
          rSet.add(aula.data);
          realizadasDatesMap.set(aula.instrutorId, rSet);
        }
      }
    });

    return instrutores
      .map(i => {
        const totalDias = (datesMap.get(i.id) || new Set()).size;
        const diasRealizados = (realizadasDatesMap.get(i.id) || new Set()).size;
        return {
          id: i.id,
          nome: i.nome,
          totalDias,
          diasRealizados,
          materiasAptasCount: i.materiasAptas.length
        };
      })
      .sort((a, b) => b.totalDias - a.totalDias);
  }, [filteredAulas, instrutores]);

  // 3. Status Geral das Aulas (Pizza / Rosca)
  const statusStats = useMemo(() => {
    let realizadas = 0;
    let agendadas = 0;
    let prejudicadas = 0;
    let canceladas = 0;

    filteredAulas.forEach(a => {
      if (a.status === 'realizada') realizadas++;
      else if (a.status === 'prejudicada') prejudicadas++;
      else if (a.status === 'cancelada') canceladas++;
      else agendadas++;
    });

    return [
      { name: 'Realizadas', value: realizadas, color: '#10b981' },
      { name: 'Agendadas', value: agendadas, color: '#3b82f6' },
      { name: 'Prejudicadas', value: prejudicadas, color: '#f59e0b' },
      { name: 'Canceladas', value: canceladas, color: '#ef4444' }
    ].filter(item => item.value > 0);
  }, [filteredAulas]);

  const totalAulasCount = filteredAulas.length;
  const totalPrejudicadas = filteredAulas.filter(a => a.status === 'prejudicada').length;
  const totalRealizadas = filteredAulas.filter(a => a.status === 'realizada').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Painel de Métricas & Desempenho
              </h1>
              <p className="text-xs text-slate-500">
                Frequência de matérias aplicadas e parametrização de instrutores por dia de atuação
              </p>
            </div>
          </div>

          {/* Filtros da página de métricas */}
          <div className="flex items-center flex-wrap gap-2.5">
            <select
              value={turmaFilter}
              onChange={e => setTurmaFilter(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Todas as Turmas</option>
              {turmas.map(t => (
                <option key={t.id} value={t.id}>
                  {t.sigla} - {t.nome}
                </option>
              ))}
            </select>

            <select
              value={periodoFilter}
              onChange={e => setPeriodoFilter(e.target.value as any)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Todo o Histórico</option>
              <option value="mesAtual">Mês Atual</option>
              <option value="30dias">Últimos 30 Dias</option>
            </select>
          </div>
        </div>

        {/* Resumo Rápido em Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Total de Aulas</span>
            <span className="text-2xl font-black text-slate-900">{totalAulasCount}</span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-xl">
            <span className="text-[11px] font-semibold text-emerald-700 block mb-1">Aulas Concluídas</span>
            <span className="text-2xl font-black text-emerald-800">{totalRealizadas}</span>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-xl">
            <span className="text-[11px] font-semibold text-amber-700 block mb-1">Prejuízos Registrados</span>
            <span className="text-2xl font-black text-amber-800">{totalPrejudicadas}</span>
          </div>

          <div className="bg-blue-50/70 border border-blue-200/80 p-3.5 rounded-xl">
            <span className="text-[11px] font-semibold text-blue-700 block mb-1">Instrutor Mais Escalado</span>
            <span className="text-sm font-bold text-blue-900 truncate block mt-1" title={instrutoresStats[0]?.nome}>
              {instrutoresStats[0]?.nome || 'Nenhum'} ({instrutoresStats[0]?.totalDias || 0} dias)
            </span>
          </div>
        </div>

        {/* Sub-Tabs de Métricas */}
        <div className="flex border-b border-slate-200 mt-6 space-x-4 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('todas')}
            className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'todas'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Visão Geral Completa
          </button>
          <button
            onClick={() => setActiveTab('materias')}
            className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'materias'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Matérias Mais Aplicadas
          </button>
          <button
            onClick={() => setActiveTab('assuntos')}
            className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'assuntos'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Assuntos Aplicados & Repetições
          </button>
          <button
            onClick={() => setActiveTab('instrutores')}
            className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'instrutores'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Instrutores (Dias Aplicados)
          </button>
          <button
            onClick={() => setActiveTab('prejuizos')}
            className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'prejuizos'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Ocorrências & Prejuízos
          </button>
        </div>
      </div>

      {/* 1. SEÇÃO DE MATÉRIAS */}
      {(activeTab === 'todas' || activeTab === 'materias') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de Barras */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>Matérias Mais Aplicadas (Total de Encontros)</span>
                </h3>
                <p className="text-xs text-slate-500">Distribuição comparativa de aulas por matéria</p>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={materiasStats} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="sigla" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} aulas`, 'Total']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', borderColor: '#e2e8f0' }}
                  />
                  <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                    {materiasStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor || '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ranking e Metas de Matérias */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Ranking de Aplicação</span>
            </h3>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {materiasStats.map((mat, idx) => (
                <div key={mat.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 truncate max-w-[170px]" title={mat.nome}>
                      {idx + 1}. {mat.nome}
                    </span>
                    <span className="font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      {mat.total} aulas
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{mat.realizadas} realizadas</span>
                    {mat.prejudicadas > 0 && (
                      <span className="text-amber-700 font-semibold">{mat.prejudicadas} com prejuízo</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 1.5. SEÇÃO DE ASSUNTOS APLICADOS E REPETIÇÕES */}
      {(activeTab === 'todas' || activeTab === 'assuntos') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>Metrificação de Assuntos Ministrados & Repetições</span>
              </h3>
              <p className="text-xs text-slate-500">
                Acompanhe quantas vezes cada assunto foi aplicado ou repetido no período e a qual matéria está vinculado
              </p>
            </div>

            {/* Filtro por Matéria + Busca por Assunto */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={assuntoSearchQuery}
                  onChange={e => setAssuntoSearchQuery(e.target.value)}
                  placeholder="Filtrar assunto..."
                  className="w-full sm:w-48 pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={assuntoMateriaFilter}
                onChange={e => setAssuntoMateriaFilter(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todas as Matérias ({materias.length})</option>
                {materias.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nome} ({m.sigla})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {assuntosStats.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Nenhum assunto encontrado para os filtros selecionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Gráfico dos Top 10 Assuntos Mais Aplicados/Repetidos */}
              <div className="lg:col-span-6 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Top Assuntos por Quantidade de Repetições / Encontros
                </span>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={assuntosStats.slice(0, 10).map(item => ({
                        ...item,
                        shortName:
                          item.assuntoNome.length > 22
                            ? item.assuntoNome.slice(0, 22) + '...'
                            : item.assuntoNome
                      }))}
                      layout="vertical"
                      margin={{ top: 5, right: 24, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="shortName"
                        width={135}
                        tick={{ fontSize: 10.5, fontWeight: 600 }}
                      />
                      <Tooltip
                        formatter={(val: any, _name: any, props: any) => [
                          `${val} encontro(s) — Matéria: ${props?.payload?.materiaNome || ''}`,
                          props?.payload?.assuntoNome || 'Assunto'
                        ]}
                        contentStyle={{
                          borderRadius: '12px',
                          fontSize: '12px',
                          borderColor: '#e2e8f0'
                        }}
                      />
                      <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                        {assuntosStats.slice(0, 10).map((entry, index) => (
                          <Cell key={`cell-ass-${index}`} fill={entry.materiaCor || '#4f46e5'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Lista Detalhada de Assuntos e Repetições */}
              <div className="lg:col-span-6 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Detalhamento por Assunto ({assuntosStats.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Ordenado por nº de aulas
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {assuntosStats.map((item, idx) => (
                    <div
                      key={item.key}
                      className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 flex items-center justify-between gap-3 text-xs"
                      style={{
                        borderLeftWidth: '4px',
                        borderLeftColor: item.materiaCor
                      }}
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 truncate">
                            {idx + 1}. {item.assuntoNome}
                          </span>
                          {item.peso > 1 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 shrink-0">
                              Peso {item.peso}x
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span
                            className="font-bold px-1.5 py-0.2 rounded text-[10px]"
                            style={{
                              backgroundColor: `${item.materiaCor}18`,
                              color: item.materiaCor
                            }}
                          >
                            {item.materiaNome} ({item.materiaSigla})
                          </span>
                          <span>• {item.realizadas} concluída(s)</span>
                          {item.prejudicadas > 0 && (
                            <span className="text-amber-700 font-semibold">
                              • {item.prejudicadas} com prejuízo
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span
                          className={`inline-block font-extrabold px-2.5 py-1 rounded-full text-xs ${
                            item.total > 0
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-200/70 text-slate-500'
                          }`}
                        >
                          {item.total} {item.total === 1 ? 'aula' : 'aulas'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. SEÇÃO DE INSTRUTORES (DIAS APLICADOS) */}
      {(activeTab === 'todas' || activeTab === 'instrutores') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Parametrização de Instrutores por Dia Aplicado</span>
              </h3>
              <p className="text-xs text-slate-500">
                Contabilização rigorosa por <strong>dias trabalhados</strong> (não por horas). Cada dia com atuação conta como 1 dia aplicado.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {instrutoresStats.map((inst, index) => {
              const isTop = index === 0 && inst.totalDias > 0;

              return (
                <div
                  key={inst.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isTop
                      ? 'bg-gradient-to-br from-amber-50/80 to-white border-amber-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        isTop ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {index + 1}º
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{inst.nome}</h4>
                        <span className="text-[11px] text-slate-500">
                          {inst.materiasAptasCount} matérias de aptidão
                        </span>
                      </div>
                    </div>

                    {isTop && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        Destaque
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Dias Totais Escalados</span>
                      <span className="text-xl font-extrabold text-slate-900">{inst.totalDias} dias</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Dias Realizados</span>
                      <span className="text-xl font-extrabold text-emerald-700">{inst.diasRealizados} dias</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SEÇÃO DE PREJUÍZOS E STATUS GERAL */}
      {(activeTab === 'todas' || activeTab === 'prejuizos') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Status */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Proporção de Status das Aulas</span>
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusStats}
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} aulas`, 'Quantidade']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lista de Aulas com Prejuízo Registrado */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Histórico de Prejuízos & Interrupções</span>
              </h3>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                {totalPrejudicadas} ocorrências
              </span>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {filteredAulas.filter(a => a.status === 'prejudicada').length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nenhum prejuízo registrado neste filtro.
                </div>
              ) : (
                filteredAulas
                  .filter(a => a.status === 'prejudicada')
                  .map(a => {
                    const mat = materias.find(m => m.id === a.materiaId);
                    const inst = instrutores.find(i => i.id === a.instrutorId);
                    return (
                      <div key={a.id} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-amber-950">
                          <span>{mat?.nome || 'Matéria'}</span>
                          <span className="text-slate-500 font-normal">{a.data}</span>
                        </div>
                        <p className="text-amber-900 text-[11px]">
                          <strong>Motivo:</strong> {a.motivoPrejuizo || 'Não detalhado'}
                        </p>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                          <span>Instrutor: {inst?.nome}</span>
                          {a.remanejadaParaId && (
                            <span className="text-purple-700 font-semibold">✓ Remanejada</span>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

