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
  BookOpen,
  Users,
  User,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Edit2,
  Trash2,
  FileText,
  Star
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
  const { getTurma, getMateria, getInstrutor, deleteAula, updateAula } = useApp();
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

          {/* Destaque de Prejuízo (se houver) */}
          {aula.status === 'prejudicada' && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl space-y-1.5 animate-in fade-in">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Ocorrência / Prejuízo Registrado</span>
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
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1">Turno / Horário</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {aula.turno} {aula.horario ? `(${aula.horario})` : ''}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1">Turma</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
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

          {/* Observações */}
          {aula.observacoes && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Observações
              </span>
              <p className="text-slate-700 whitespace-pre-wrap">{aula.observacoes}</p>
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

            <div className="flex items-center space-x-2">
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

