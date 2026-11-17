import React, { useState, useEffect, useMemo } from 'react';
import {
  PesquisaOrganizacional,
  TopicoPesquisa,
  PerguntaPesquisa,
  TipoRespostaPesquisa,
  RespostaPesquisa,
  SurveyAdminTab
} from '../../types/survey';
import {
  fetchSurveysAndResponses,
  saveSurveyToCloud,
  deleteSurveyFromCloud,
  deleteSurveyResponseFromCloud,
  createDefaultSurveyTemplate
} from '../../services/surveyService';
import { PublicSurveyPage } from './PublicSurveyPage';
import {
  ClipboardList,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Share2,
  BarChart3,
  FileEdit,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Download,
  Sparkles,
  CheckCircle2,
  Lock,
  Unlock,
  Eye,
  ArrowLeft,
  MessageSquare,
  Hash,
  ListChecks,
  Sliders,
  AlignLeft,
  HelpCircle
} from 'lucide-react';

interface SurveyAdminModuleProps {
  initialView: SurveyAdminTab;
  onCloseModule: () => void;
}

const QUESTION_TYPE_LABELS: Record<TipoRespostaPesquisa, { label: string; desc: string }> = {
  escala_likert: {
    label: 'Escala 1 a 5 (Concordância / Satisfação)',
    desc: 'Botões de 1 a 5 com extremos personalizáveis'
  },
  nota_numerica: {
    label: 'Nota de 0 a 10 (Avaliação / NPS)',
    desc: 'Escala numérica de 0 a 10 com cálculo de média e favorabilidade'
  },
  numero: {
    label: 'Número Livre (Quantidade / Valor)',
    desc: 'Campo numérico aberto (calcula média, mínimo, máximo e soma)'
  },
  escolha_unica: {
    label: 'Escolha Única (1 opção)',
    desc: 'O participante escolhe apenas uma entre as opções cadastradas'
  },
  multipla_escolha: {
    label: 'Múltipla Escolha (Várias opções)',
    desc: 'O participante pode marcar uma ou mais opções'
  },
  sim_nao: {
    label: 'Sim / Parcialmente / Não',
    desc: 'Três botões rápidos de decisão objetiva'
  },
  texto_curto: {
    label: 'Texto Curto (1 linha)',
    desc: 'Resposta escrita curta e direta'
  },
  texto_longo: {
    label: 'Texto Longo (Sugestão / Relato Aberto)',
    desc: 'Campo amplo para opiniões, sugestões e observações'
  }
};

export const SurveyAdminModule: React.FC<SurveyAdminModuleProps> = ({
  initialView,
  onCloseModule
}) => {
  const [activeView, setActiveView] = useState<SurveyAdminTab>(initialView);
  const [surveys, setSurveys] = useState<PesquisaOrganizacional[]>([]);
  const [responses, setResponses] = useState<RespostaPesquisa[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [newOptionInputs, setNewOptionInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);

  const loadAll = async () => {
    setLoading(true);
    const data = await fetchSurveysAndResponses();
    let loadedSurveys = data.surveys;

    if (loadedSurveys.length === 0) {
      const template = createDefaultSurveyTemplate();
      await saveSurveyToCloud(template);
      loadedSurveys = [template];
    }

    setSurveys(loadedSurveys);
    setResponses(data.responses);
    if (!selectedSurveyId || !loadedSurveys.some(s => s.id === selectedSurveyId)) {
      setSelectedSurveyId(loadedSurveys[0]?.id || '');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const currentSurvey = useMemo(
    () => surveys.find(s => s.id === selectedSurveyId) || surveys[0] || null,
    [surveys, selectedSurveyId]
  );

  const currentResponses = useMemo(() => {
    if (!currentSurvey) return [];
    return responses.filter(r => r.pesquisaId === currentSurvey.id);
  }, [responses, currentSurvey]);

  const showTemporaryFeedback = (msg: string) => {
    setSaveFeedback(msg);
    setTimeout(() => {
      setSaveFeedback(null);
    }, 3200);
  };

  const updateCurrentSurveyLocal = (updater: (prev: PesquisaOrganizacional) => PesquisaOrganizacional) => {
    if (!currentSurvey) return;
    const updated = updater({
      ...currentSurvey,
      atualizadaEm: new Date().toISOString()
    });
    setSurveys(prev => prev.map(s => (s.id === updated.id ? updated : s)));
  };

  const handleSaveSurvey = async (publishStatus?: 'rascunho' | 'publicada' | 'encerrada') => {
    if (!currentSurvey) return;
    setSaving(true);
    try {
      const toSave: PesquisaOrganizacional = {
        ...currentSurvey,
        status: publishStatus || currentSurvey.status,
        atualizadaEm: new Date().toISOString()
      };
      setSurveys(prev => prev.map(s => (s.id === toSave.id ? toSave : s)));
      await saveSurveyToCloud(toSave);

      if (publishStatus === 'publicada') {
        showTemporaryFeedback('Pesquisa publicada e link gerado com sucesso!');
        setActiveView('divulgar');
      } else {
        showTemporaryFeedback('Alterações salvas na nuvem!');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewSurvey = async (useTemplate: boolean) => {
    const shortId = Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    const newSurvey: PesquisaOrganizacional = useTemplate
      ? createDefaultSurveyTemplate()
      : {
          id: `pesq_${shortId}`,
          titulo: 'Nova Pesquisa Organizacional',
          descricao: 'Descreva o objetivo desta pesquisa para orientar os participantes.',
          anonima: true,
          solicitarPelotao: true,
          status: 'rascunho',
          criadaEm: now,
          atualizadaEm: now,
          topicos: [
            {
              id: `top_${shortId}_1`,
              titulo: '1. Tópico Inicial',
              descricao: '',
              perguntas: [
                {
                  id: `perg_${shortId}_1`,
                  texto: 'Digite o enunciado da primeira pergunta...',
                  tipo: 'escala_likert',
                  obrigatoria: true,
                  rotuloMin: 'Discordo Totalmente',
                  rotuloMax: 'Concordo Totalmente'
                }
              ]
            }
          ]
        };

    setSurveys(prev => [newSurvey, ...prev]);
    setSelectedSurveyId(newSurvey.id);
    setActiveView('criar');
    await saveSurveyToCloud(newSurvey);
    showTemporaryFeedback('Nova pesquisa criada!');
  };

  const handleDeleteSurvey = async (surveyId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta pesquisa? Esta ação não pode ser desfeita.')) return;
    await deleteSurveyFromCloud(surveyId);
    const remaining = surveys.filter(s => s.id !== surveyId);
    setSurveys(remaining);
    setSelectedSurveyId(remaining[0]?.id || '');
  };

  // =========================================================================
  // MANIPULAÇÃO DE TÓPICOS E PERGUNTAS
  // =========================================================================
  const handleAddTopic = () => {
    const shortId = Math.random().toString(36).substring(2, 8);
    updateCurrentSurveyLocal(s => ({
      ...s,
      topicos: [
        ...s.topicos,
        {
          id: `top_${shortId}`,
          titulo: `${s.topicos.length + 1}. Novo Tópico da Pesquisa`,
          descricao: '',
          perguntas: [
            {
              id: `perg_${shortId}_1`,
              texto: 'Nova pergunta deste tópico...',
              tipo: 'escala_likert',
              obrigatoria: true,
              rotuloMin: 'Discordo Totalmente',
              rotuloMax: 'Concordo Totalmente'
            }
          ]
        }
      ]
    }));
  };

  const handleMoveTopic = (idx: number, dir: -1 | 1) => {
    updateCurrentSurveyLocal(s => {
      const next = [...s.topicos];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return s;
      const temp = next[idx];
      next[idx] = next[target];
      next[target] = temp;
      return { ...s, topicos: next };
    });
  };

  const handleDeleteTopic = (topicId: string) => {
    if (!currentSurvey || currentSurvey.topicos.length <= 1) {
      alert('A pesquisa deve ter pelo menos 1 tópico.');
      return;
    }
    if (!confirm('Remover este tópico e todas as perguntas dentro dele?')) return;
    updateCurrentSurveyLocal(s => ({
      ...s,
      topicos: s.topicos.filter(t => t.id !== topicId)
    }));
  };

  const handleAddQuestion = (topicId: string) => {
    const shortId = Math.random().toString(36).substring(2, 8);
    updateCurrentSurveyLocal(s => ({
      ...s,
      topicos: s.topicos.map(t =>
        t.id === topicId
          ? {
              ...t,
              perguntas: [
                ...t.perguntas,
                {
                  id: `perg_${shortId}`,
                  texto: '',
                  tipo: 'escala_likert',
                  obrigatoria: true,
                  rotuloMin: 'Discordo Totalmente',
                  rotuloMax: 'Concordo Totalmente',
                  opcoes: ['Opção 1', 'Opção 2', 'Opção 3']
                }
              ]
            }
          : t
      )
    }));
  };

  const handleUpdateQuestion = (
    topicId: string,
    questionId: string,
    patch: Partial<PerguntaPesquisa>
  ) => {
    updateCurrentSurveyLocal(s => ({
      ...s,
      topicos: s.topicos.map(t =>
        t.id === topicId
          ? {
              ...t,
              perguntas: t.perguntas.map(p => {
                if (p.id !== questionId) return p;
                const updated = { ...p, ...patch };
                if (
                  (updated.tipo === 'escolha_unica' || updated.tipo === 'multipla_escolha') &&
                  (!updated.opcoes || updated.opcoes.length === 0)
                ) {
                  updated.opcoes = ['Opção 1', 'Opção 2', 'Opção 3'];
                }
                return updated;
              })
            }
          : t
      )
    }));
  };

  const handleMoveQuestion = (topicId: string, qIdx: number, dir: -1 | 1) => {
    updateCurrentSurveyLocal(s => ({
      ...s,
      topicos: s.topicos.map(t => {
        if (t.id !== topicId) return t;
        const next = [...t.perguntas];
        const target = qIdx + dir;
        if (target < 0 || target >= next.length) return t;
        const temp = next[qIdx];
        next[qIdx] = next[target];
        next[target] = temp;
        return { ...t, perguntas: next };
      })
    }));
  };

  const handleDeleteQuestion = (topicId: string, questionId: string) => {
    updateCurrentSurveyLocal(s => ({
      ...s,
      topicos: s.topicos.map(t =>
        t.id === topicId
          ? { ...t, perguntas: t.perguntas.filter(p => p.id !== questionId) }
          : t
      )
    }));
  };

  const handleAddOptionToQuestion = (topicId: string, questionId: string) => {
    const text = (newOptionInputs[questionId] || '').trim();
    if (!text) return;
    updateCurrentSurveyLocal(s => ({
      ...s,
      topicos: s.topicos.map(t =>
        t.id === topicId
          ? {
              ...t,
              perguntas: t.perguntas.map(p =>
                p.id === questionId
                  ? { ...p, opcoes: [...(p.opcoes || []), text] }
                  : p
              )
            }
          : t
      )
    }));
    setNewOptionInputs(prev => ({ ...prev, [questionId]: '' }));
  };

  const handleRemoveOptionFromQuestion = (topicId: string, questionId: string, optIdx: number) => {
    updateCurrentSurveyLocal(s => ({
      ...s,
      topicos: s.topicos.map(t =>
        t.id === topicId
          ? {
              ...t,
              perguntas: t.perguntas.map(p =>
                p.id === questionId
                  ? { ...p, opcoes: (p.opcoes || []).filter((_, i) => i !== optIdx) }
                  : p
              )
            }
          : t
      )
    }));
  };

  // =========================================================================
  // CÁLCULO DE MÉTRICAS E EXPORTAÇÃO CSV
  // =========================================================================
  const publicUrl = useMemo(() => {
    if (!currentSurvey) return '';
    return `${window.location.origin}/?pesquisa=${encodeURIComponent(currentSurvey.id)}`;
  }, [currentSurvey]);

  const handleCopyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!currentSurvey || !publicUrl) return;
    const text = `📋 *${currentSurvey.titulo}*\n\nParticipe da nossa pesquisa organizacional acessando o link abaixo:\n${publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleExportCSV = () => {
    if (!currentSurvey || currentResponses.length === 0) return;
    const allQs = currentSurvey.topicos.flatMap((t, tIdx) =>
      t.perguntas.map((p, pIdx) => ({
        ...p,
        code: `${tIdx + 1}.${pIdx + 1} ${p.texto}`
      }))
    );

    const headers = [
      'Data/Hora',
      'Identificação',
      'Pelotão/Equipe',
      ...allQs.map(q => `"${q.code.replace(/"/g, '""')}"`)
    ];

    const rows = currentResponses.map(r => {
      const cols = [
        `"${new Date(r.respondidaEm).toLocaleString('pt-BR')}"`,
        `"${(r.identificacaoNome || 'Anônimo').replace(/"/g, '""')}"`,
        `"${(r.identificacaoPelotao || '-').replace(/"/g, '""')}"`,
        ...allQs.map(q => {
          const val = r.respostas[q.id];
          const formatted = Array.isArray(val) ? val.join('; ') : val !== undefined ? String(val) : '';
          return `"${formatted.replace(/"/g, '""')}"`;
        })
      ];
      return cols.join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultados_${currentSurvey.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Cálculo de favorabilidade geral e por tópico
  const topicScores = useMemo(() => {
    if (!currentSurvey || currentResponses.length === 0) return [];
    return currentSurvey.topicos.map(topico => {
      let sumNormalized = 0;
      let countNormalized = 0;

      for (const p of topico.perguntas) {
        for (const r of currentResponses) {
          const raw = r.respostas[p.id];
          if (raw === undefined || raw === null || raw === '') continue;
          if (p.tipo === 'escala_likert') {
            const n = Number(raw);
            if (!isNaN(n)) {
              sumNormalized += ((n - 1) / 4) * 100;
              countNormalized++;
            }
          } else if (p.tipo === 'nota_numerica') {
            const n = Number(raw);
            if (!isNaN(n)) {
              sumNormalized += (n / 10) * 100;
              countNormalized++;
            }
          } else if (p.tipo === 'sim_nao') {
            if (raw === 'Sim') {
              sumNormalized += 100;
              countNormalized++;
            } else if (raw === 'Parcialmente') {
              sumNormalized += 50;
              countNormalized++;
            } else if (raw === 'Não') {
              sumNormalized += 0;
              countNormalized++;
            }
          }
        }
      }

      const scorePct = countNormalized > 0 ? Math.round(sumNormalized / countNormalized) : null;
      return {
        topicoId: topico.id,
        titulo: topico.titulo,
        scorePct
      };
    });
  }, [currentSurvey, currentResponses]);

  const overallFavorability = useMemo(() => {
    const valid = topicScores.filter(t => t.scorePct !== null) as { scorePct: number }[];
    if (valid.length === 0) return null;
    const sum = valid.reduce((acc, item) => acc + item.scorePct, 0);
    return Math.round(sum / valid.length);
  }, [topicScores]);

  if (previewMode && currentSurvey) {
    return (
      <PublicSurveyPage
        surveyId={currentSurvey.id}
        isAdminPreview={true}
        onExitPreview={() => setPreviewMode(false)}
      />
    );
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-12">
      {/* Barra Superior do Módulo de Pesquisa Organizacional */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <button
              type="button"
              onClick={onCloseModule}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 shrink-0 transition-colors"
              title="Voltar ao Quadro de Instruções FT"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                  Exclusivo Administrador
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight mt-0.5">
                Central de Pesquisa Organizacional
              </h1>
            </div>
          </div>

          {/* Navegação entre as 3 Páginas Independentes da Pesquisa */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveView('criar')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeView === 'criar'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">1. Criar Pesquisa</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('divulgar')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeView === 'divulgar'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">2. Divulgar Link</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('metricas')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeView === 'metricas'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">3. Metrificar ({currentResponses.length})</span>
            </button>
          </div>
        </div>

        {/* Barra Seletora de Pesquisa Ativa */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-500 shrink-0">Pesquisa Selecionada:</span>
            <select
              value={currentSurvey?.id || ''}
              onChange={e => setSelectedSurveyId(e.target.value)}
              className="flex-1 min-w-0 px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {surveys.map(s => (
                <option key={s.id} value={s.id}>
                  {s.titulo} ({s.status === 'publicada' ? 'Publicada' : s.status === 'encerrada' ? 'Encerrada' : 'Rascunho'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleCreateNewSurvey(false)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova em Branco</span>
            </button>
            <button
              type="button"
              onClick={() => handleCreateNewSurvey(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Novo Modelo FT</span>
            </button>
            {surveys.length > 1 && currentSurvey && (
              <button
                type="button"
                onClick={() => handleDeleteSurvey(currentSurvey.id)}
                className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                title="Excluir esta pesquisa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {saveFeedback && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveFeedback}</span>
          </div>
        )}
      </div>

      {loading || !currentSurvey ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs font-bold text-slate-500">
          Carregando estrutura da pesquisa...
        </div>
      ) : (
        <>
          {/* =================================================================
              PÁGINA 1: CRIAR E ESTRUTURAR PESQUISA (TÓPICOS E PERGUNTAS)
             ================================================================= */}
          {activeView === 'criar' && (
            <div className="space-y-4">
              {/* Configurações Gerais da Pesquisa */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                      Configurações Gerais da Pesquisa
                    </h2>
                    <p className="text-xs text-slate-500">
                      Defina o título, instruções de abertura e regras de identificação
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewMode(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Pré-visualizar</span>
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSaveSurvey()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{saving ? 'Salvando...' : 'Salvar Rascunho'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSaveSurvey('publicada')}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Publicar & Gerar Link</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Título da Pesquisa Organizacional *
                    </label>
                    <input
                      type="text"
                      value={currentSurvey.titulo}
                      onChange={e =>
                        updateCurrentSurveyLocal(s => ({ ...s, titulo: e.target.value }))
                      }
                      placeholder="Ex: Pesquisa de Clima e Diagnóstico Organizacional — FT"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Texto de Abertura / Orientações ao Participante
                    </label>
                    <textarea
                      rows={2}
                      value={currentSurvey.descricao}
                      onChange={e =>
                        updateCurrentSurveyLocal(s => ({ ...s, descricao: e.target.value }))
                      }
                      placeholder="Explique brevemente o objetivo da pesquisa..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Respostas Anônimas
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Não exige o nome do policial ao responder
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentSurvey.anonima}
                      onChange={e =>
                        updateCurrentSurveyLocal(s => ({ ...s, anonima: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Perguntar Pelotão / Equipe
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Inclui campo opcional de pelotão/função no início
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentSurvey.solicitarPelotao}
                      onChange={e =>
                        updateCurrentSurveyLocal(s => ({
                          ...s,
                          solicitarPelotao: e.target.checked
                        }))
                      }
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Lista de Tópicos e Perguntas */}
              <div className="space-y-4">
                {currentSurvey.topicos.map((topico: TopicoPesquisa, tIdx: number) => (
                  <div
                    key={topico.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
                  >
                    {/* Barra do Tópico */}
                    <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                            Tópico {tIdx + 1}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({topico.perguntas.length} {topico.perguntas.length === 1 ? 'pergunta' : 'perguntas'})
                          </span>
                        </div>
                        <input
                          type="text"
                          value={topico.titulo}
                          onChange={e =>
                            updateCurrentSurveyLocal(s => ({
                              ...s,
                              topicos: s.topicos.map(t =>
                                t.id === topico.id ? { ...t, titulo: e.target.value } : t
                              )
                            }))
                          }
                          placeholder="Título do Tópico (Ex: 1. Liderança e Comunicação)"
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-blue-400"
                        />
                        <input
                          type="text"
                          value={topico.descricao || ''}
                          onChange={e =>
                            updateCurrentSurveyLocal(s => ({
                              ...s,
                              topicos: s.topicos.map(t =>
                                t.id === topico.id ? { ...t, descricao: e.target.value } : t
                              )
                            }))
                          }
                          placeholder="Subtítulo / orientação opcional deste tópico..."
                          className="w-full px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700/70 text-slate-300 text-xs focus:outline-none focus:border-blue-400"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveTopic(tIdx, -1)}
                          disabled={tIdx === 0}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
                          title="Subir Tópico"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveTopic(tIdx, 1)}
                          disabled={tIdx === currentSurvey.topicos.length - 1}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
                          title="Descer Tópico"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTopic(topico.id)}
                          className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/50"
                          title="Excluir Tópico"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Perguntas do Tópico */}
                    <div className="p-4 sm:p-5 space-y-3 bg-slate-50/50">
                      {topico.perguntas.map((p: PerguntaPesquisa, pIdx: number) => (
                        <div
                          key={p.id}
                          className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                              Pergunta {tIdx + 1}.{pIdx + 1}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 mr-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={p.obrigatoria}
                                  onChange={e =>
                                    handleUpdateQuestion(topico.id, p.id, {
                                      obrigatoria: e.target.checked
                                    })
                                  }
                                  className="rounded text-blue-600"
                                />
                                <span>Obrigatória</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => handleMoveQuestion(topico.id, pIdx, -1)}
                                disabled={pIdx === 0}
                                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-500"
                                title="Subir pergunta"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveQuestion(topico.id, pIdx, 1)}
                                disabled={pIdx === topico.perguntas.length - 1}
                                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-500"
                                title="Descer pergunta"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteQuestion(topico.id, p.id)}
                                className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                                title="Remover pergunta"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                            {/* Enunciado da Pergunta */}
                            <div className="md:col-span-7">
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Enunciado da Pergunta *
                              </label>
                              <input
                                type="text"
                                value={p.texto}
                                onChange={e =>
                                  handleUpdateQuestion(topico.id, p.id, { texto: e.target.value })
                                }
                                placeholder="Digite a pergunta..."
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            {/* Tipo de Resposta */}
                            <div className="md:col-span-5">
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Formato da Resposta
                              </label>
                              <select
                                value={p.tipo}
                                onChange={e =>
                                  handleUpdateQuestion(topico.id, p.id, {
                                    tipo: e.target.value as TipoRespostaPesquisa
                                  })
                                }
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {(Object.keys(QUESTION_TYPE_LABELS) as TipoRespostaPesquisa[]).map(
                                  tipoKey => (
                                    <option key={tipoKey} value={tipoKey}>
                                      {QUESTION_TYPE_LABELS[tipoKey].label}
                                    </option>
                                  )
                                )}
                              </select>
                            </div>
                          </div>

                          {/* Configurações extras para Escala Likert */}
                          {p.tipo === 'escala_likert' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                  Rótulo Nota 1 (Mínimo)
                                </label>
                                <input
                                  type="text"
                                  value={p.rotuloMin || ''}
                                  onChange={e =>
                                    handleUpdateQuestion(topico.id, p.id, {
                                      rotuloMin: e.target.value
                                    })
                                  }
                                  placeholder="Ex: Discordo Totalmente"
                                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs text-slate-800"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                  Rótulo Nota 5 (Máximo)
                                </label>
                                <input
                                  type="text"
                                  value={p.rotuloMax || ''}
                                  onChange={e =>
                                    handleUpdateQuestion(topico.id, p.id, {
                                      rotuloMax: e.target.value
                                    })
                                  }
                                  placeholder="Ex: Concordo Totalmente"
                                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs text-slate-800"
                                />
                              </div>
                            </div>
                          )}

                          {/* Editor de Opções para Escolha Única ou Múltipla Escolha */}
                          {(p.tipo === 'escolha_unica' || p.tipo === 'multipla_escolha') && (
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                              <span className="text-[11px] font-bold text-slate-700 block">
                                Opções de Resposta ({(p.opcoes || []).length})
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {(p.opcoes || []).map((opt, optIdx) => (
                                  <span
                                    key={optIdx}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800"
                                  >
                                    <span>{opt}</span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveOptionFromQuestion(topico.id, p.id, optIdx)
                                      }
                                      className="text-slate-400 hover:text-rose-600 font-bold"
                                      title="Remover opção"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                <input
                                  type="text"
                                  value={newOptionInputs[p.id] || ''}
                                  onChange={e =>
                                    setNewOptionInputs(prev => ({
                                      ...prev,
                                      [p.id]: e.target.value
                                    }))
                                  }
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddOptionToQuestion(topico.id, p.id);
                                    }
                                  }}
                                  placeholder="Nova opção de resposta..."
                                  className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddOptionToQuestion(topico.id, p.id)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0"
                                >
                                  + Opção
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleAddQuestion(topico.id)}
                        className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 text-slate-600 hover:text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Pergunta neste Tópico</span>
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 border-2 border-dashed border-slate-300 text-slate-800 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-2xs transition-all"
                  >
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span>Adicionar Novo Tópico à Pesquisa</span>
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveSurvey('publicada')}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Publicar Pesquisa e Gerar Link de Divulgação</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              PÁGINA 2: DIVULGAR PESQUISA (LINK DIRETO, WHATSAPP E QR CODE)
             ================================================================= */}
          {activeView === 'divulgar' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        currentSurvey.status === 'publicada'
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentSurvey.status === 'encerrada'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {currentSurvey.status === 'publicada'
                        ? '● Pesquisa Publicada & Ativa'
                        : currentSurvey.status === 'encerrada'
                        ? '● Pesquisa Encerrada'
                        : '● Em Rascunho'}
                    </span>
                    <h2 className="text-lg font-extrabold text-slate-900 mt-1.5">
                      {currentSurvey.titulo}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Compartilhe o link abaixo com o efetivo. Quem abrir o link verá apenas a página exclusiva da pesquisa.
                    </p>
                  </div>
                </div>

                {/* Caixa do Link Gerado */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Link Exclusivo da Página de Resposta
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      readOnly
                      value={publicUrl}
                      className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-semibold text-slate-800 select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className={`px-4 py-2.5 rounded-xl font-extrabold text-xs inline-flex items-center justify-center gap-1.5 shrink-0 transition-all ${
                        copiedLink
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
                    </button>
                  </div>
                </div>

                {/* Botões de Ação Rápida de Divulgação */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Compartilhar no WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Abrir Página de Resposta</span>
                  </button>
                </div>

                {/* Controle de Status (Publicar / Encerrar) */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600">
                    Controle de Recebimento de Respostas:
                  </span>
                  <div className="flex items-center gap-2">
                    {currentSurvey.status !== 'publicada' ? (
                      <button
                        type="button"
                        onClick={() => handleSaveSurvey('publicada')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Ativar / Publicar Pesquisa</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSaveSurvey('encerrada')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Encerrar Recebimento</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card do QR Code para Mural / Telão */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
                  QR Code de Acesso Rápido
                </span>
                <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-xs">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                      publicUrl
                    )}`}
                    alt="QR Code da Pesquisa"
                    className="w-44 h-44 rounded-lg"
                  />
                </div>
                <p className="text-xs text-slate-500 max-w-xs">
                  Projete este QR Code durante a instrução ou imprima no mural para que o efetivo responda pelo celular.
                </p>
              </div>
            </div>
          )}

          {/* =================================================================
              PÁGINA 3: METRIFICAR RESULTADOS (INDICADORES E RESPOSTAS)
             ================================================================= */}
          {activeView === 'metricas' && (
            <div className="space-y-4">
              {/* Topo de Ações e KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">
                    Total de Participações
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                    {currentResponses.length}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    Respostas sincronizadas
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">
                    Índice de Favorabilidade
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
                    {overallFavorability !== null ? `${overallFavorability}%` : '—'}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Média global das escalas
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">
                    Estrutura Avaliada
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                    {currentSurvey.topicos.length}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Tópicos ({currentSurvey.topicos.reduce((a, t) => a + t.perguntas.length, 0)} perguntas)
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">
                    Ações de Dados
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={loadAll}
                      className="flex-1 py-2 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Atualizar</span>
                    </button>
                    <button
                      type="button"
                      disabled={currentResponses.length === 0}
                      onClick={handleExportCSV}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold inline-flex items-center justify-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV</span>
                    </button>
                  </div>
                </div>
              </div>

              {currentResponses.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
                  <BarChart3 className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-base font-extrabold text-slate-800">
                    Nenhuma resposta recebida ainda
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Assim que os participantes responderem pelo link de divulgação, os gráficos, médias e análises aparecerão automaticamente aqui.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveView('divulgar')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Ir para Divulgação do Link</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Termômetro Comparativo por Tópico */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Desempenho Consolidado por Tópico
                    </h3>
                    <div className="space-y-2.5">
                      {topicScores.map(ts => (
                        <div key={ts.topicoId} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                            <span>{ts.titulo}</span>
                            <span className="text-blue-600">
                              {ts.scorePct !== null ? `${ts.scorePct}% favorável` : 'Qualitativo'}
                            </span>
                          </div>
                          {ts.scorePct !== null && (
                            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  ts.scorePct >= 75
                                    ? 'bg-emerald-500'
                                    : ts.scorePct >= 50
                                    ? 'bg-blue-600'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${ts.scorePct}%` }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Análise Detalhada por Tópico e Pergunta */}
                  {currentSurvey.topicos.map((topico, tIdx) => (
                    <div
                      key={topico.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
                    >
                      <div className="bg-slate-900 text-white px-5 py-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                          Tópico {tIdx + 1}
                        </span>
                        <h3 className="text-sm sm:text-base font-extrabold">{topico.titulo}</h3>
                      </div>

                      <div className="divide-y divide-slate-100 p-4 sm:p-6 space-y-6">
                        {topico.perguntas.map((p, pIdx) => {
                          const rawValues = currentResponses
                            .map(r => r.respostas[p.id])
                            .filter(v => v !== undefined && v !== null && v !== '');

                          return (
                            <div key={p.id} className={pIdx > 0 ? 'pt-5' : ''}>
                              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                                  <span className="text-blue-600 mr-1.5">
                                    {tIdx + 1}.{pIdx + 1}
                                  </span>
                                  {p.texto}
                                </h4>
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                  {rawValues.length} resposta(s)
                                </span>
                              </div>

                              {/* Métricas para Escala 1-5 ou Nota 0-10 */}
                              {(p.tipo === 'escala_likert' || p.tipo === 'nota_numerica') && (() => {
                                const nums = rawValues.map(v => Number(v)).filter(n => !isNaN(n));
                                const avg =
                                  nums.length > 0
                                    ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1)
                                    : '—';
                                const scaleKeys =
                                  p.tipo === 'escala_likert'
                                    ? [5, 4, 3, 2, 1]
                                    : [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];

                                return (
                                  <div className="space-y-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200/80 text-xs font-bold text-blue-900 mb-1">
                                      <Sliders className="w-3.5 h-3.5 text-blue-600" />
                                      <span>
                                        Média atingida: <strong>{avg}</strong> /{' '}
                                        {p.tipo === 'escala_likert' ? '5.0' : '10.0'}
                                      </span>
                                    </div>
                                    <div className="space-y-1.5">
                                      {scaleKeys.map(k => {
                                        const count = nums.filter(n => n === k).length;
                                        const pct =
                                          nums.length > 0
                                            ? Math.round((count / nums.length) * 100)
                                            : 0;
                                        return (
                                          <div
                                            key={k}
                                            className="flex items-center gap-2.5 text-xs"
                                          >
                                            <span className="w-12 font-bold text-slate-600 text-right shrink-0">
                                              Nota {k}
                                            </span>
                                            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                              <div
                                                className="h-full bg-blue-600 rounded-full"
                                                style={{ width: `${pct}%` }}
                                              />
                                            </div>
                                            <span className="w-20 text-[11px] font-bold text-slate-600 shrink-0">
                                              {count} ({pct}%)
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Métricas para Número Livre */}
                              {p.tipo === 'numero' && (() => {
                                const nums = rawValues.map(v => Number(v)).filter(n => !isNaN(n));
                                const sum = nums.reduce((a, b) => a + b, 0);
                                const avg = nums.length > 0 ? (sum / nums.length).toFixed(1) : '—';
                                const min = nums.length > 0 ? Math.min(...nums) : '—';
                                const max = nums.length > 0 ? Math.max(...nums) : '—';

                                return (
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                        Média
                                      </span>
                                      <span className="text-base font-extrabold text-slate-900">
                                        {avg}
                                      </span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                        Mínimo
                                      </span>
                                      <span className="text-base font-extrabold text-slate-900">
                                        {min}
                                      </span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                        Máximo
                                      </span>
                                      <span className="text-base font-extrabold text-slate-900">
                                        {max}
                                      </span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                        Soma Total
                                      </span>
                                      <span className="text-base font-extrabold text-blue-600">
                                        {sum}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Métricas para Escolha Única, Múltipla Escolha ou Sim/Não */}
                              {(p.tipo === 'escolha_unica' ||
                                p.tipo === 'multipla_escolha' ||
                                p.tipo === 'sim_nao') && (() => {
                                const optionsList =
                                  p.tipo === 'sim_nao'
                                    ? ['Sim', 'Parcialmente', 'Não']
                                    : p.opcoes || [];
                                const countsMap = new Map<string, number>();
                                optionsList.forEach(o => countsMap.set(o, 0));

                                rawValues.forEach(val => {
                                  if (Array.isArray(val)) {
                                    val.forEach(item =>
                                      countsMap.set(item, (countsMap.get(item) || 0) + 1)
                                    );
                                  } else {
                                    const s = String(val);
                                    countsMap.set(s, (countsMap.get(s) || 0) + 1);
                                  }
                                });

                                return (
                                  <div className="space-y-2">
                                    {Array.from(countsMap.entries()).map(([optName, count]) => {
                                      const pct =
                                        rawValues.length > 0
                                          ? Math.round((count / rawValues.length) * 100)
                                          : 0;
                                      return (
                                        <div key={optName} className="space-y-1">
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-slate-800">
                                              {optName}
                                            </span>
                                            <span className="font-bold text-slate-600">
                                              {count} ({pct}%)
                                            </span>
                                          </div>
                                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                              className="h-full bg-indigo-600 rounded-full"
                                              style={{ width: `${pct}%` }}
                                            />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })()}

                              {/* Respostas abertas de Texto Curto / Texto Longo */}
                              {(p.tipo === 'texto_curto' || p.tipo === 'texto_longo') && (
                                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                  {rawValues.length === 0 ? (
                                    <span className="text-xs text-slate-400 italic">
                                      Nenhum comentário registrado nesta pergunta.
                                    </span>
                                  ) : (
                                    rawValues.map((txt, idx) => (
                                      <div
                                        key={idx}
                                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 flex items-start gap-2"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                        <span className="leading-relaxed">{String(txt)}</span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Lista de Participações Individuais */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Registro de Participações Individuais ({currentResponses.length})
                    </h3>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {currentResponses.map((r, idx) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                              #{currentResponses.length - idx}
                            </span>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate">
                                {r.identificacaoNome || 'Participante Anônimo'}
                                {r.identificacaoPelotao ? ` • ${r.identificacaoPelotao}` : ''}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {new Date(r.respondidaEm).toLocaleString('pt-BR')}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm('Excluir esta resposta individual?')) {
                                await deleteSurveyResponseFromCloud(r.id);
                                setResponses(prev => prev.filter(item => item.id !== r.id));
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Excluir resposta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
