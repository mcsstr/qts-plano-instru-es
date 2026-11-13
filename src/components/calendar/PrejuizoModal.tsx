import React, { useState } from 'react';
import { Aula } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatDateBr, addDays, format, parseISO } from '../../utils/dateUtils';
import {
  AlertTriangle,
  ArrowRightLeft,
  XCircle,
  Calendar,
  User,
  Check,
  X,
  Clock,
  Sparkles
} from 'lucide-react';

interface PrejuizoModalProps {
  isOpen: boolean;
  onClose: () => void;
  aula: Aula | null;
}

export const PrejuizoModal: React.FC<PrejuizoModalProps> = ({ isOpen, onClose, aula }) => {
  const { remanejarAula, marcarPrejuizo, getTurma, getMateria, getInstrutor, instrutores } = useApp();

  const [acao, setAcao] = useState<'remanejar' | 'pular'>('remanejar');
  const [motivo, setMotivo] = useState('');
  const [novaData, setNovaData] = useState(() => {
    if (!aula) return '';
    try {
      // Sugere o próximo dia útil
      const nextDay = addDays(parseISO(aula.data), 1);
      return format(nextDay, 'yyyy-MM-dd');
    } catch {
      return '';
    }
  });
  const [novoInstrutorId, setNovoInstrutorId] = useState('');

  if (!isOpen || !aula) return null;

  const turma = getTurma(aula.turmaId);
  const materia = getMateria(aula.materiaId);
  const instrutor = getInstrutor(aula.instrutorId);

  const motivosPredefinidos = [
    'Condições climáticas adversas (Chuva / Tempestade)',
    'Indisponibilidade / Atestado médico do instrutor',
    'Falta de energia ou infraestrutura no local',
    'Manutenção emergencial do estande/instalações',
    'Missão operacional externa prioritária',
    'Necessidade de adequação de cronograma da turma'
  ];

  const handleConfirm = () => {
    if (!motivo.trim()) {
      alert('Por favor, informe a justificativa ou motivo do prejuízo.');
      return;
    }

    if (acao === 'remanejar') {
      if (!novaData) {
        alert('Por favor, informe a nova data para remanejamento.');
        return;
      }
      remanejarAula(
        aula.id,
        novaData,
        motivo,
        aula.turno,
        novoInstrutorId || aula.instrutorId
      );
    } else {
      marcarPrejuizo(aula.id, motivo, 'prejudicada');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] modal-safe-overlay flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header com tom de aviso / atenção */}
        <div className="p-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Registrar Prejuízo na Aula</h2>
              <p className="text-xs text-amber-100">
                A aula sofreu interrupção, cancelamento ou necessidade de reposição
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

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Card Resumo da Aula Afetada */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
            <div className="font-semibold text-slate-800 text-sm flex items-center justify-between">
              <span>{materia?.nome || 'Matéria'}</span>
              <span className="text-slate-500 font-normal">{formatDateBr(aula.data)}</span>
            </div>
            <div className="text-slate-600 flex items-center gap-3">
              <span>Turma: <strong>{turma?.nome}</strong></span>
              <span>•</span>
              <span>Instrutor: <strong>{instrutor?.nome}</strong></span>
            </div>
          </div>

          {/* Escolha da Ação */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Como deseja tratar essa aula?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAcao('remanejar')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  acao === 'remanejar'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <ArrowRightLeft className={`w-5 h-5 ${acao === 'remanejar' ? 'text-blue-600' : 'text-slate-400'}`} />
                  {acao === 'remanejar' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <div>
                  <p className="font-bold text-sm">Remanejar Aula</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Marca esta como prejudicada e cria nova aula na data escolhida
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAcao('pular')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  acao === 'pular'
                    ? 'border-amber-600 bg-amber-50/70 text-amber-900 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <XCircle className={`w-5 h-5 ${acao === 'pular' ? 'text-amber-600' : 'text-slate-400'}`} />
                  {acao === 'pular' && <Check className="w-4 h-4 text-amber-600" />}
                </div>
                <div>
                  <p className="font-bold text-sm">Pular / Registrar</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Mantém no calendário marcada com prejuízo sem reposição
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Dados do Remanejamento (caso acao == remanejar) */}
          {acao === 'remanejar' && (
            <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                Dados da Nova Data de Aplicação
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nova Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={novaData}
                    onChange={e => setNovaData(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Instrutor na Nova Data
                  </label>
                  <select
                    value={novoInstrutorId || aula.instrutorId}
                    onChange={e => setNovoInstrutorId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {instrutores.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.nome} {i.materiasAptas.includes(aula.materiaId) ? '⭐' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Justificativa / Motivo do Prejuízo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Motivo / Justificativa do Prejuízo *
            </label>

            {/* Pílulas de motivos rápidos */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {motivosPredefinidos.map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMotivo(m)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {m}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              required
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Descreva o que motivou o prejuízo na aula..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Dica visual */}
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              A aula receberá o marcador visual ⚠️ <strong>Prejudicada</strong> no calendário e será computada nas estatísticas para controle pedagógico e operacional.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center space-x-1.5 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl shadow-md shadow-amber-500/20 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar {acao === 'remanejar' ? 'Remanejamento' : 'Registro de Prejuízo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

