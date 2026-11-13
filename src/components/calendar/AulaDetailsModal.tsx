import React from 'react';
import { Aula } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/Badge';
import { formatDateBr, formatDayOfWeek } from '../../utils/dateUtils';
import {
  X,
  Calendar,
  Clock,
  Users,
  User,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Edit2,
  Trash2,
  FileText,
  RotateCcw
} from 'lucide-react';

interface AulaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  aula: Aula | null;
  onEdit: (aula: Aula) => void;
  onOpenPrejuizo: (aula: Aula) => void;
}

export const AulaDetailsModal: React.FC<AulaDetailsModalProps> = ({
  isOpen,
  onClose,
  aula,
  onEdit,
  onOpenPrejuizo
}) => {
  const { getTurma, getMateria, getInstrutor, deleteAula, updateAula, showToast } = useApp();
  const { canEdit } = useAuth();

  if (!isOpen || !aula) return null;

  const turma = getTurma(aula.turmaId);
  const materia = getMateria(aula.materiaId);
  const instrutor = getInstrutor(aula.instrutorId);
  const isInstrutorApto = instrutor?.materiasAptas.includes(aula.materiaId);

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir esta aula do cronograma?')) {
      deleteAula(aula.id);
      onClose();
    }
  };

  const handleMarkAsDone = () => {
    updateAula({
      ...aula,
      status: 'realizada'
    });
    onClose();
  };

  const handleClearPrejuizo = () => {
    // Se houve aula de reposição criada quando marcou prejuízo, pergunta se deseja excluí-la também
    if (aula.remanejadaParaId) {
      const removerReposicao = confirm(
        'Esta aula possuía uma reposição agendada. Deseja remover também a aula de reposição que havia sido criada?'
      );
      if (removerReposicao) {
        deleteAula(aula.remanejadaParaId);
      }
    }

    // Limpa o texto de prejuízo das observações se houver
    const cleanedObs = aula.observacoes
      ? aula.observacoes
          .replace(/\s*\|\s*Prejuízo registrado:.*$/i, '')
          .replace(/\s*\|\s*Remanejada para.*$/i, '')
          .replace(/^Prejuízo registrado:.*$/i, '')
          .replace(/^Remanejada para.*$/i, '')
          .trim()
      : undefined;

    updateAula({
      ...aula,
      status: 'agendada',
      motivoPrejuizo: undefined,
      remanejadaParaId: undefined,
      observacoes: cleanedObs || undefined
    });

    showToast({
      type: 'info',
      title: 'Prejuízo Desmarcado!',
      message: 'A aula voltou para o status normal (Agendada).'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header com a cor da matéria ou turma */}
        <div
          className="p-5 text-white flex items-center justify-between shrink-0"
          style={{ backgroundColor: materia?.cor || '#2563eb' }}
        >
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded-full inline-block">
              {turma?.nome || 'Turma'}
            </span>
            <h2 className="text-xl font-bold leading-tight">
              {materia?.nome || 'Matéria'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Status Badge + Data */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2 text-slate-800 text-sm font-semibold">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{formatDateBr(aula.data)}</span>
              <span className="text-slate-400 font-normal capitalize">({formatDayOfWeek(aula.data)})</span>
            </div>
            <StatusBadge status={aula.status} />
          </div>

          {/* Destaque de Prejuízo (se houver) + Botão Rápido para Desmarcar Prejuízo */}
          {aula.status === 'prejudicada' && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Ocorrência / Prejuízo Registrado</span>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={handleClearPrejuizo}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-400 rounded-lg text-[11px] font-bold shadow-2xs transition-colors shrink-0"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-700" />
                    <span>Desmarcar Prejuízo</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-amber-800">
                {aula.motivoPrejuizo || 'Aula interrompida ou prejudicada na data.'}
              </p>
              {aula.remanejadaParaId && (
                <div className="pt-1 flex items-center text-[11px] text-amber-900 font-medium">
                  <ArrowRightLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Esta aula foi remanejada para uma nova data de reposição.</span>
                </div>
              )}
            </div>
          )}

          {/* Destaque caso seja reposição */}
          {aula.remanejadaDeId && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center space-x-2 text-xs text-purple-900">
              <ArrowRightLeft className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Aula originada de reposição por prejuízo anterior.</span>
            </div>
          )}

          {/* Informações detalhadas */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <span className="text-slate-500 block mb-1">Turno / Horário</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {aula.turno} {aula.horario ? `(${aula.horario})` : ''}
              </span>
            </div>

            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <span className="text-slate-500 block mb-1">Turma</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                {turma?.sigla} - {turma?.nome}
              </span>
            </div>
          </div>

          {/* Instrutor */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Instrutor Responsável
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isInstrutorApto
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {isInstrutorApto ? '⭐ Conhecimento Específico' : 'Habilitado Geral'}
              </span>
            </div>
            <div className="font-bold text-slate-900 text-sm">{instrutor?.nome || 'Não definido'}</div>
            {instrutor?.contato && (
              <div className="text-xs text-slate-500 mt-0.5">Contato: {instrutor.contato}</div>
            )}
          </div>

          {/* Assunto da Aula / Observações */}
          {(aula.observacoes || materia?.descricao) && (
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 text-xs">
              <span className="text-blue-800 font-bold block mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Assunto que será tratado na Aula
              </span>
              <p className="text-slate-800 font-medium whitespace-pre-wrap">
                {aula.observacoes || materia?.descricao}
              </p>
            </div>
          )}
        </div>

        {/* Footer com Ações de Gestor */}
        {canEdit && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                title="Excluir Aula"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(aula);
                }}
                className="p-2 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
                title="Editar Aula"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              {aula.status === 'prejudicada' ? (
                <button
                  type="button"
                  onClick={handleClearPrejuizo}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 text-xs font-bold rounded-xl transition-colors border border-blue-300"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-700" />
                  <span>Desmarcar Prejuízo</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPrejuizo(aula);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold rounded-xl transition-colors border border-amber-300"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Registrar Prejuízo</span>
                </button>
              )}

              {aula.status !== 'realizada' && (
                <button
                  type="button"
                  onClick={handleMarkAsDone}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Realizada</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
