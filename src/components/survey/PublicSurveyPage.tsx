import React, { useState, useEffect, useMemo } from 'react';
import { PesquisaOrganizacional, RespostaPesquisa } from '../../types/survey';
import { fetchSurveysAndResponses, submitSurveyResponseToCloud } from '../../services/surveyService';
import {
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  AlertCircle,
  Send,
  ArrowLeft,
  Lock,
  Sparkles
} from 'lucide-react';

interface PublicSurveyPageProps {
  surveyId: string;
  isAdminPreview?: boolean;
  onExitPreview?: () => void;
}

export const PublicSurveyPage: React.FC<PublicSurveyPageProps> = ({
  surveyId,
  isAdminPreview = false,
  onExitPreview
}) => {
  const [survey, setSurvey] = useState<PesquisaOrganizacional | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [identificacaoNome, setIdentificacaoNome] = useState('');
  const [identificacaoPelotao, setIdentificacaoPelotao] = useState('');
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const { surveys } = await fetchSurveysAndResponses();
      if (!mounted) return;
      const found = surveys.find(s => s.id === surveyId) || null;
      setSurvey(found);
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [surveyId]);

  const allQuestions = useMemo(() => {
    if (!survey) return [];
    return survey.topicos.flatMap(t => t.perguntas);
  }, [survey]);

  const answeredCount = useMemo(() => {
    return allQuestions.filter(q => {
      const val = answers[q.id];
      if (val === undefined || val === null) return false;
      if (Array.isArray(val)) return val.length > 0;
      return String(val).trim() !== '';
    }).length;
  }, [allQuestions, answers]);

  const progressPct = allQuestions.length > 0 ? Math.round((answeredCount / allQuestions.length) * 100) : 0;

  const handleSetAnswer = (perguntaId: string, value: string | number | string[]) => {
    setErrorMsg(null);
    setAnswers(prev => ({
      ...prev,
      [perguntaId]: value
    }));
  };

  const handleToggleMultiChoice = (perguntaId: string, option: string) => {
    setErrorMsg(null);
    setAnswers(prev => {
      const current = Array.isArray(prev[perguntaId]) ? (prev[perguntaId] as string[]) : [];
      const exists = current.includes(option);
      const next = exists ? current.filter(o => o !== option) : [...current, option];
      return {
        ...prev,
        [perguntaId]: next
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey) return;

    if (!survey.anonima && !identificacaoNome.trim()) {
      setErrorMsg('Por favor, informe sua identificação antes de enviar.');
      return;
    }

    for (const topico of survey.topicos) {
      for (const p of topico.perguntas) {
        if (p.obrigatoria) {
          const val = answers[p.id];
          const isEmpty =
            val === undefined ||
            val === null ||
            (Array.isArray(val) && val.length === 0) ||
            String(val).trim() === '';
          if (isEmpty) {
            setErrorMsg(`Por favor, responda a pergunta obrigatória: "${p.texto}"`);
            const el = document.getElementById(`q_${p.id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
          }
        }
      }
    }

    setSubmitting(true);
    try {
      const shortId = Math.random().toString(36).substring(2, 9);
      const payload: RespostaPesquisa = {
        id: `${survey.id}_${shortId}`,
        pesquisaId: survey.id,
        respondidaEm: new Date().toISOString(),
        identificacaoNome: survey.anonima ? undefined : identificacaoNome.trim(),
        identificacaoPelotao: identificacaoPelotao.trim() || undefined,
        respostas: answers
      };

      await submitSurveyResponseToCloud(payload);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrorMsg('Não foi possível enviar sua resposta no momento. Verifique sua conexão e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f3f5] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center animate-pulse mb-3">
          <ClipboardList className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-800">Carregando Pesquisa Organizacional...</p>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-[#f1f3f5] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-md w-full text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-extrabold text-slate-900">Pesquisa Não Encontrada</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            O link acessado não corresponde a uma pesquisa ativa ou foi removido pelo administrador.
          </p>
          {onExitPreview && (
            <button
              onClick={onExitPreview}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Painel</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (survey.status === 'encerrada' && !isAdminPreview) {
    return (
      <div className="min-h-screen bg-[#f1f3f5] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-md w-full text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-extrabold text-slate-900">{survey.titulo}</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Esta pesquisa organizacional já foi encerrada e não está mais recebendo novas respostas. Agradecemos seu interesse!
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f1f3f5] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Participação Registrada!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Suas respostas para <strong>{survey.titulo}</strong> foram salvas com sucesso. Agradecemos sua contribuição para o aprimoramento organizacional.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
            >
              Enviar outra resposta
            </button>
            {onExitPreview && (
              <button
                type="button"
                onClick={onExitPreview}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Voltar ao Painel do Administrador
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f5] text-slate-800 pb-16">
      {/* Top Bar Exclusiva da Pesquisa */}
      <header className="sticky top-0 z-30 bg-[#090d16] text-white border-b border-[#1e293b] safe-top-header md:pt-0">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block leading-none">
                Pesquisa Organizacional FT
              </span>
              <h1 className="font-extrabold text-xs sm:text-sm text-white truncate mt-0.5">
                {survey.titulo}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#162032] border border-[#2d3a52] text-slate-200">
              {answeredCount}/{allQuestions.length} ({progressPct}%)
            </span>
            {onExitPreview && (
              <button
                type="button"
                onClick={onExitPreview}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-extrabold hover:bg-amber-400 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Painel Admin</span>
              </button>
            )}
          </div>
        </div>
        {/* Barra de Progresso */}
        <div className="w-full h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 sm:px-6 pt-4 space-y-4">
        {/* Card de Apresentação da Pesquisa */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {survey.anonima ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Pesquisa 100% Anônima</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pesquisa Identificada</span>
              </span>
            )}
            <span className="text-[11px] font-semibold text-slate-400">
              • {survey.topicos.length} {survey.topicos.length === 1 ? 'tópico' : 'tópicos'} ({allQuestions.length} perguntas)
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            {survey.titulo}
          </h2>
          {survey.descricao && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {survey.descricao}
            </p>
          )}

          {/* Campos de Identificação ou Pelotão quando configurados */}
          {(!survey.anonima || survey.solicitarPelotao) && (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {!survey.anonima && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome / Identificação *
                  </label>
                  <input
                    type="text"
                    required
                    value={identificacaoNome}
                    onChange={e => setIdentificacaoNome(e.target.value)}
                    placeholder="Ex: Sd PM Silva"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              {survey.solicitarPelotao && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pelotão / Equipe (Opcional)
                  </label>
                  <input
                    type="text"
                    value={identificacaoPelotao}
                    onChange={e => setIdentificacaoPelotao(e.target.value)}
                    placeholder="Ex: 1º Pelotão / Comando"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Formulário com Tópicos e Perguntas */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {survey.topicos.map((topico, tIdx) => (
            <div
              key={topico.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
            >
              {/* Cabeçalho do Tópico */}
              <div className="bg-slate-900 text-white px-5 py-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                  Tópico {tIdx + 1} de {survey.topicos.length}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold tracking-tight mt-0.5">
                  {topico.titulo}
                </h3>
                {topico.descricao && (
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {topico.descricao}
                  </p>
                )}
              </div>

              {/* Lista de Perguntas do Tópico */}
              <div className="divide-y divide-slate-100 p-4 sm:p-6 space-y-5">
                {topico.perguntas.map((p, pIdx) => {
                  const val = answers[p.id];

                  return (
                    <div key={p.id} id={`q_${p.id}`} className={pIdx > 0 ? 'pt-5' : ''}>
                      <div className="mb-3">
                        <label className="block text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          <span className="text-blue-600 mr-1.5">{tIdx + 1}.{pIdx + 1}</span>
                          {p.texto}
                          {p.obrigatoria && <span className="text-rose-500 ml-1">*</span>}
                        </label>
                        {p.descricaoAuxiliar && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{p.descricaoAuxiliar}</p>
                        )}
                      </div>

                      {/* 1. ESCALA LIKERT (1 a 5) */}
                      {p.tipo === 'escala_likert' && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
                            {[1, 2, 3, 4, 5].map(num => {
                              const active = Number(val) === num;
                              return (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => handleSetAnswer(p.id, num)}
                                  className={`py-2.5 px-2 rounded-xl border font-extrabold text-sm transition-all flex flex-col items-center justify-center gap-0.5 ${
                                    active
                                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm scale-[1.02]'
                                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                                  }`}
                                >
                                  <span>{num}</span>
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 px-1">
                            <span>1 = {p.rotuloMin || 'Discordo Totalmente'}</span>
                            <span>5 = {p.rotuloMax || 'Concordo Totalmente'}</span>
                          </div>
                        </div>
                      )}

                      {/* 2. NOTA NUMÉRICA (0 a 10) */}
                      {p.tipo === 'nota_numerica' && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                              const active = val !== undefined && val !== '' && Number(val) === num;
                              return (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => handleSetAnswer(p.id, num)}
                                  className={`py-2 rounded-xl border font-extrabold text-xs sm:text-sm transition-all ${
                                    active
                                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm scale-105'
                                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                                  }`}
                                >
                                  {num}
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 px-1">
                            <span>0 = Muito Baixo / Insatisfeito</span>
                            <span>10 = Excelente / Muito Satisfeito</span>
                          </div>
                        </div>
                      )}

                      {/* 3. NÚMERO LIVRE */}
                      {p.tipo === 'numero' && (
                        <input
                          type="number"
                          value={val !== undefined ? String(val) : ''}
                          onChange={e => handleSetAnswer(p.id, e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="Digite um valor numérico..."
                          className="w-full sm:max-w-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/60 focus:bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}

                      {/* 4. SIM / NÃO / PARCIALMENTE */}
                      {p.tipo === 'sim_nao' && (
                        <div className="grid grid-cols-3 gap-2">
                          {['Sim', 'Parcialmente', 'Não'].map(opt => {
                            const active = val === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleSetAnswer(p.id, opt)}
                                className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                                  active
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* 5. ESCOLHA ÚNICA */}
                      {p.tipo === 'escolha_unica' && (
                        <div className="space-y-2">
                          {(p.opcoes || []).map(opt => {
                            const active = val === opt;
                            return (
                              <div
                                key={opt}
                                onClick={() => handleSetAnswer(p.id, opt)}
                                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                                  active
                                    ? 'bg-blue-50/80 border-blue-600 text-slate-900 font-bold'
                                    : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200 text-slate-700 font-medium'
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    active ? 'border-blue-600 bg-blue-600' : 'border-slate-400 bg-white'
                                  }`}
                                >
                                  {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <span className="text-xs sm:text-sm">{opt}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 6. MÚLTIPLA ESCOLHA (CHECKBOXES) */}
                      {p.tipo === 'multipla_escolha' && (
                        <div className="space-y-2">
                          {(p.opcoes || []).map(opt => {
                            const selectedList = Array.isArray(val) ? val : [];
                            const active = selectedList.includes(opt);
                            return (
                              <div
                                key={opt}
                                onClick={() => handleToggleMultiChoice(p.id, opt)}
                                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                                  active
                                    ? 'bg-blue-50/80 border-blue-600 text-slate-900 font-bold'
                                    : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200 text-slate-700 font-medium'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={active}
                                  onChange={() => {}}
                                  className="w-4 h-4 rounded text-blue-600 pointer-events-none shrink-0"
                                />
                                <span className="text-xs sm:text-sm">{opt}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 7. TEXTO CURTO */}
                      {p.tipo === 'texto_curto' && (
                        <input
                          type="text"
                          value={val !== undefined ? String(val) : ''}
                          onChange={e => handleSetAnswer(p.id, e.target.value)}
                          placeholder="Digite sua resposta..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/60 focus:bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}

                      {/* 8. TEXTO LONGO */}
                      {p.tipo === 'texto_longo' && (
                        <textarea
                          rows={3}
                          value={val !== undefined ? String(val) : ''}
                          onChange={e => handleSetAnswer(p.id, e.target.value)}
                          placeholder="Escreva aqui sua resposta detalhada, observação ou sugestão..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/60 focus:bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Botão de Envio */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white font-extrabold text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Enviando Respostas...' : 'Enviar Respostas da Pesquisa'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
