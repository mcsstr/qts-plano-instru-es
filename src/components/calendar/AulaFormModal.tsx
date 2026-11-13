import React, { useState, useEffect } from 'react';
import { Aula, Turno } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Calendar as CalendarIcon, Clock, BookOpen, Users, User, Check, Sparkles, AlertCircle } from 'lucide-react';

interface AulaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  aulaToEdit?: Aula | null;
  initialDate?: string;
}

export const AulaFormModal: React.FC<AulaFormModalProps> = ({
  isOpen,
  onClose,
  aulaToEdit,
  initialDate
}) => {
  const { turmas, materias, instrutores, addAula, updateAula } = useApp();

  const [data, setData] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [materiaId, setMateriaId] = useState('');
  const [instrutorId, setInstrutorId] = useState('');
  const [turno, setTurno] = useState<Turno>('Integral');
  const [horario, setHorario] = useState('08:00 - 17:00');
  const [observacoes, setObservacoes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (aulaToEdit) {
      setData(aulaToEdit.data);
      setTurmaId(aulaToEdit.turmaId);
      setMateriaId(aulaToEdit.materiaId);
      setInstrutorId(aulaToEdit.instrutorId);
      setTurno(aulaToEdit.turno);
      setHorario(aulaToEdit.horario || '08:00 - 17:00');
      setObservacoes(aulaToEdit.observacoes || '');
    } else {
      setData(initialDate || new Date().toISOString().split('T')[0]);
      setTurmaId(turmas[0]?.id || '');
      setMateriaId(materias[0]?.id || '');
      setInstrutorId(instrutores[0]?.id || '');
      setTurno(turmas[0]?.turnoPadrao || 'Integral');
      setHorario('08:00 - 17:00');
      setObservacoes('');
    }
    setError(null);
  }, [aulaToEdit, initialDate, isOpen, turmas, materias, instrutores]);

  if (!isOpen) return null;

  // Verifica se o instrutor selecionado é apto na matéria selecionada
  const selectedInstructor = instrutores.find(i => i.id === instrutorId);
  const isApto = selectedInstructor ? selectedInstructor.materiasAptas.includes(materiaId) : false;
  const selectedMateria = materias.find(m => m.id === materiaId);
  const materiaAssuntos = selectedMateria?.assuntos || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !turmaId || !materiaId || !instrutorId) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (aulaToEdit) {
      updateAula({
        ...aulaToEdit,
        data,
        turmaId,
        materiaId,
        instrutorId,
        turno,
        horario,
        observacoes
      });
    } else {
      addAula({
        data,
        turmaId,
        materiaId,
        instrutorId,
        turno,
        horario,
        status: 'agendada',
        observacoes
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {aulaToEdit ? 'Editar Aula Agendada' : 'Inserir Nova Aula no QTS'}
              </h2>
              <p className="text-xs text-blue-100">
                {aulaToEdit ? 'Altere as informações da aula selecionada' : 'Defina turma, data, matéria e instrutor'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center space-x-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Data e Turno */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Data da Aula *</label>
              <input
                type="date"
                required
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Turno / Horário *</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={turno}
                  onChange={e => setTurno(e.target.value as Turno)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Integral">Integral</option>
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noite">Noite</option>
                </select>
                <input
                  type="text"
                  value={horario}
                  onChange={e => setHorario(e.target.value)}
                  placeholder="08:00 - 17:00"
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Turma */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Turma *
              </span>
            </label>
            <select
              required
              value={turmaId}
              onChange={e => setTurmaId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {turmas.map(t => (
                <option key={t.id} value={t.id}>
                  {t.nome} ({t.sigla})
                </option>
              ))}
            </select>
          </div>

          {/* Matéria */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                Matéria / Disciplina *
              </span>
            </label>
            <select
              required
              value={materiaId}
              onChange={e => setMateriaId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {materias.map(m => (
                <option key={m.id} value={m.id}>
                  {m.nome} ({m.sigla})
                </option>
              ))}
            </select>
          </div>

          {/* Assunto da Aula (exibido no card do calendário) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assunto da Aula (Exibido no Card do Calendário)
            </label>
            {materiaAssuntos.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {materiaAssuntos.map(ass => {
                  const isActive = observacoes === ass.nome;
                  return (
                    <button
                      key={ass.id}
                      type="button"
                      onClick={() => setObservacoes(ass.nome)}
                      className={`text-[11px] font-medium px-2 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{ass.nome}</span>
                      {(ass.peso || 1) > 1 && (
                        <span className={`text-[9px] font-bold px-1 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>
                          {ass.peso}x
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            <input
              type="text"
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Selecione acima ou digite um assunto específico..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Escolha um assunto pré-cadastrado da matéria ou informe um novo.
            </p>
          </div>

          {/* Instrutor */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Instrutor Designado *
              </label>
              {selectedInstructor && (
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    isApto
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isApto ? '⭐ Instrutor Apto' : 'Conhecimento Geral'}
                </span>
              )}
            </div>

            <select
              required
              value={instrutorId}
              onChange={e => setInstrutorId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {instrutores.map(i => {
                const instrApto = i.materiasAptas.includes(materiaId);
                return (
                  <option key={i.id} value={i.id}>
                    {i.nome} {instrApto ? '⭐ (Apto na matéria)' : ''}
                  </option>
                );
              })}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Qualquer instrutor pode ser vinculado a qualquer matéria, mesmo sem cadastro prévio no perfil.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-md shadow-blue-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{aulaToEdit ? 'Salvar Alterações' : 'Agendar Aula'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

