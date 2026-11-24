import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Turma, Materia, AssuntoMateria, Instrutor, Gestor, Turno, HorarioConfig } from '../../types';
import {
  Users,
  BookOpen,
  UserCheck,
  ShieldCheck,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Check,
  Phone,
  ArrowRight,
  KeyRound,
  Eye,
  EyeOff,
  Search,
  Layers,
  Tag,
  ChevronDown,
  ChevronUp,
  Award,
  Filter,
  X
} from 'lucide-react';
import {
  PM_RANKS_HIERARCHY,
  getInstrutorRank,
  getNomeDeGuerraSemPosto,
  groupInstrutoresByAntiguidade
} from '../../utils/rankUtils';

const naturalCompare = (a: string, b: string): number =>
  (a || '').localeCompare(b || '', 'pt-BR', { numeric: true, sensitivity: 'base' });

const sortAssuntosAlphabetically = (list: AssuntoMateria[] = []): AssuntoMateria[] =>
  [...list].sort((a, b) => naturalCompare(a.nome, b.nome));

export const RegistersManager: React.FC = () => {
  const {
    turmas,
    materias,
    instrutores,
    gestores,
    horarios,
    addTurma,
    updateTurma,
    deleteTurma,
    addMateria,
    updateMateria,
    deleteMateria,
    addInstrutor,
    updateInstrutor,
    deleteInstrutor,
    addGestor,
    updateGestor,
    deleteGestor,
    addHorario,
    updateHorario,
    deleteHorario,
    setDefaultHorario
  } = useApp();

  const { canEdit, openLoginModal } = useAuth();

  const [activeTab, setActiveTab] = useState<'turmas' | 'materias' | 'instrutores' | 'horarios' | 'gestores'>('turmas');

  // Estados de visualização e busca dentro da Aba Matérias
  const [materiasViewMode, setMateriasViewMode] = useState<'por_materia' | 'por_assunto'>('por_materia');
  const [searchMateriaQuery, setSearchMateriaQuery] = useState('');
  const [searchAssuntoQuery, setSearchAssuntoQuery] = useState('');
  const [areAllMateriasExpanded, setAreAllMateriasExpanded] = useState(false);
  const [expandedMateriaIds, setExpandedMateriaIds] = useState<Record<string, boolean>>({});

  // Modal específico para editar um Assunto individual (na visão "Pesquisar por Assunto")
  const [isEditAssuntoModalOpen, setIsEditAssuntoModalOpen] = useState(false);
  const [editAssuntoId, setEditAssuntoId] = useState('');
  const [editAssuntoNome, setEditAssuntoNome] = useState('');
  const [editAssuntoPeso, setEditAssuntoPeso] = useState<number>(1);
  const [editAssuntoOriginMateriaId, setEditAssuntoOriginMateriaId] = useState('');
  const [editAssuntoTargetMateriaId, setEditAssuntoTargetMateriaId] = useState('');

  // Matérias ordenadas alfabeticamente (suporta numeração sequencial 1, 2, 10...)
  const sortedMaterias = React.useMemo(
    () => [...materias].sort((a, b) => naturalCompare(a.nome, b.nome)),
    [materias]
  );

  const toggleExpandMateriaCard = (materiaId: string) => {
    setExpandedMateriaIds(prev => {
      const current = prev[materiaId] !== undefined ? prev[materiaId] : areAllMateriasExpanded;
      return { ...prev, [materiaId]: !current };
    });
  };

  const handleToggleAllMateriasExpanded = () => {
    const next = !areAllMateriasExpanded;
    setAreAllMateriasExpanded(next);
    setExpandedMateriaIds({});
  };

  const handleOpenEditSpecificAssunto = (assunto: AssuntoMateria, originMateria: Materia) => {
    setEditAssuntoId(assunto.id);
    setEditAssuntoNome(assunto.nome);
    setEditAssuntoPeso(assunto.peso || 1);
    setEditAssuntoOriginMateriaId(originMateria.id);
    setEditAssuntoTargetMateriaId(originMateria.id);
    setIsEditAssuntoModalOpen(true);
  };

  const handleSaveSpecificAssunto = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNome = editAssuntoNome.trim();
    if (!trimmedNome || !editAssuntoTargetMateriaId) return;

    const originMat = materias.find(m => m.id === editAssuntoOriginMateriaId);
    const targetMat = materias.find(m => m.id === editAssuntoTargetMateriaId);
    if (!originMat || !targetMat) return;

    if (originMat.id === targetMat.id) {
      // Atualiza o assunto dentro da mesma matéria e mantém em ordem alfabética
      const updatedAssuntos = sortAssuntosAlphabetically(
        (originMat.assuntos || []).map(a =>
          a.id === editAssuntoId
            ? { ...a, nome: trimmedNome, peso: editAssuntoPeso || 1 }
            : a
        )
      );
      updateMateria({
        ...originMat,
        assuntos: updatedAssuntos
      });
    } else {
      // Move o assunto da matéria de origem para a nova matéria selecionada
      const remainingInOrigin = sortAssuntosAlphabetically(
        (originMat.assuntos || []).filter(a => a.id !== editAssuntoId)
      );
      const addedToTarget = sortAssuntosAlphabetically([
        ...(targetMat.assuntos || []),
        {
          id: editAssuntoId,
          nome: trimmedNome,
          peso: editAssuntoPeso || 1
        }
      ]);

      updateMateria({
        ...originMat,
        assuntos: remainingInOrigin
      });
      updateMateria({
        ...targetMat,
        assuntos: addedToTarget
      });
    }

    setIsEditAssuntoModalOpen(false);
  };

  // Modais de Criação / Edição
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [isTurmaModalOpen, setIsTurmaModalOpen] = useState(false);

  const [editingMateria, setEditingMateria] = useState<Materia | null>(null);
  const [isMateriaModalOpen, setIsMateriaModalOpen] = useState(false);

  const [editingInstrutor, setEditingInstrutor] = useState<Instrutor | null>(null);
  const [isInstrutorModalOpen, setIsInstrutorModalOpen] = useState(false);

  const [editingGestor, setEditingGestor] = useState<Gestor | null>(null);
  const [isGestorModalOpen, setIsGestorModalOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [id: string]: boolean }>({});

  const [editingHorario, setEditingHorario] = useState<HorarioConfig | null>(null);
  const [isHorarioModalOpen, setIsHorarioModalOpen] = useState(false);
  const [horarioNome, setHorarioNome] = useState('');
  const [horarioTurno, setHorarioTurno] = useState<Turno>('Tarde');
  const [horarioTexto, setHorarioTexto] = useState('13:00 - 17:00');
  const [horarioIsPadrao, setHorarioIsPadrao] = useState(false);

  // FORM STATES - TURMA
  const [turmaNome, setTurmaNome] = useState('');
  const [turmaSigla, setTurmaSigla] = useState('');
  const [turmaCor, setTurmaCor] = useState('#2563eb');
  const [turmaTurno, setTurmaTurno] = useState<Turno>('Integral');
  const [turmaDesc, setTurmaDesc] = useState('');

  // FORM STATES - MATERIA
  const [materiaNome, setMateriaNome] = useState('');
  const [materiaSigla, setMateriaSigla] = useState('');
  const [materiaCor, setMateriaCor] = useState('#3b82f6');
  const [materiaMetaDias, setMateriaMetaDias] = useState<number>(10);
  const [materiaDesc, setMateriaDesc] = useState('');
  const [materiaAssuntos, setMateriaAssuntos] = useState<AssuntoMateria[]>([]);
  const [novoAssuntoNome, setNovoAssuntoNome] = useState('');
  const [novoAssuntoPeso, setNovoAssuntoPeso] = useState<number>(1);

  // FORM STATES - INSTRUTOR
  const [instPosto, setInstPosto] = useState('Cap PM');
  const [instNome, setInstNome] = useState('');
  const [instContato, setInstContato] = useState('');
  const [instTurmaId, setInstTurmaId] = useState('');
  const [instMateriasAptas, setInstMateriasAptas] = useState<string[]>([]);
  const [instObs, setInstObs] = useState('');

  // FILTROS - ABA INSTRUTORES
  const [instrutorSearchQuery, setInstrutorSearchQuery] = useState('');
  const [selectedInstrutorTurmaFilter, setSelectedInstrutorTurmaFilter] = useState<string>('all');
  const [selectedInstrutorRankFilter, setSelectedInstrutorRankFilter] = useState<string>('all');

  // FORM STATES - GESTOR
  const [gestorNome, setGestorNome] = useState('');
  const [gestorLogin, setGestorLogin] = useState('');
  const [gestorSenha, setGestorSenha] = useState('');
  const [gestorCargo, setGestorCargo] = useState('');

  // Paleta expandida de 27 cores distintas para Turmas e Matérias
  const COLOR_PALETTE = [
    '#1d4ed8', '#2563eb', '#0284c7', '#0891b2', '#0d9488',
    '#059669', '#16a34a', '#15803d', '#65a30d', '#4d7c0f',
    '#eab308', '#ca8a04', '#d97706', '#ea580c', '#c2410c',
    '#dc2626', '#991b1b', '#e11d48', '#db2777', '#be185d',
    '#9333ea', '#7c3aed', '#4f46e5', '#312e81', '#78350f',
    '#475569', '#0f172a'
  ];

  // Open modal helpers
  const handleOpenTurmaModal = (turma?: Turma) => {
    if (turma) {
      setEditingTurma(turma);
      setTurmaNome(turma.nome);
      setTurmaSigla(turma.sigla);
      setTurmaCor(turma.cor);
      setTurmaTurno(turma.turnoPadrao || 'Integral');
      setTurmaDesc(turma.descricao || '');
    } else {
      setEditingTurma(null);
      setTurmaNome('');
      setTurmaSigla('');
      setTurmaCor(COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]);
      setTurmaTurno('Integral');
      setTurmaDesc('');
    }
    setIsTurmaModalOpen(true);
  };

  const handleOpenMateriaModal = (materia?: Materia) => {
    if (materia) {
      setEditingMateria(materia);
      setMateriaNome(materia.nome);
      setMateriaSigla(materia.sigla);
      setMateriaCor(materia.cor);
      setMateriaMetaDias(materia.cargaDiasObjetivo || 10);
      setMateriaDesc(materia.descricao || '');
      setMateriaAssuntos(
        Array.isArray(materia.assuntos)
          ? sortAssuntosAlphabetically(materia.assuntos.map(a => ({ ...a })))
          : []
      );
    } else {
      setEditingMateria(null);
      setMateriaNome('');
      setMateriaSigla('');
      setMateriaCor(COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]);
      setMateriaMetaDias(10);
      setMateriaDesc('');
      setMateriaAssuntos([]);
    }
    setNovoAssuntoNome('');
    setNovoAssuntoPeso(1);
    setIsMateriaModalOpen(true);
  };

  const handleAddAssuntoToMateria = () => {
    const trimmed = novoAssuntoNome.trim();
    if (!trimmed) return;
    setMateriaAssuntos(prev =>
      sortAssuntosAlphabetically([
        ...prev,
        {
          id: `ass_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          nome: trimmed,
          peso: novoAssuntoPeso || 1
        }
      ])
    );
    setNovoAssuntoNome('');
    setNovoAssuntoPeso(1);
  };

  const handleUpdateAssuntoPeso = (assId: string, peso: number) => {
    setMateriaAssuntos(prev =>
      prev.map(a => (a.id === assId ? { ...a, peso } : a))
    );
  };

  const handleRemoveAssuntoFromMateria = (assId: string) => {
    setMateriaAssuntos(prev => prev.filter(a => a.id !== assId));
  };

  const handleOpenInstrutorModal = (instrutor?: Instrutor, defaultRank?: string) => {
    if (instrutor) {
      setEditingInstrutor(instrutor);
      const detectedRank = getInstrutorRank(instrutor.nome);
      if (detectedRank.id !== 'outros') {
        setInstPosto(detectedRank.sigla);
        setInstNome(getNomeDeGuerraSemPosto(instrutor.nome));
      } else {
        setInstPosto('');
        setInstNome(instrutor.nome);
      }
      setInstContato(instrutor.contato || '');
      setInstTurmaId(instrutor.turmaId || '');
      setInstMateriasAptas(instrutor.materiasAptas || []);
      setInstObs(instrutor.observacoes || '');
    } else {
      setEditingInstrutor(null);
      setInstPosto(defaultRank || '1º Sgt PM');
      setInstNome('');
      setInstContato('');
      setInstTurmaId('');
      setInstMateriasAptas([]);
      setInstObs('');
    }
    setIsInstrutorModalOpen(true);
  };

  const handleOpenGestorModal = (gestor?: Gestor) => {
    if (gestor) {
      setEditingGestor(gestor);
      setGestorNome(gestor.nome);
      setGestorLogin(gestor.login);
      setGestorSenha(gestor.senha);
      setGestorCargo(gestor.cargo || '');
    } else {
      setEditingGestor(null);
      setGestorNome('');
      setGestorLogin('');
      setGestorSenha('');
      setGestorCargo('');
    }
    setIsGestorModalOpen(true);
  };

  // Submits
  const handleSaveTurma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!turmaNome.trim() || !turmaSigla.trim()) return;

    if (editingTurma) {
      updateTurma({
        ...editingTurma,
        nome: turmaNome,
        sigla: turmaSigla.toUpperCase(),
        cor: turmaCor,
        turnoPadrao: turmaTurno,
        descricao: turmaDesc
      });
    } else {
      addTurma({
        nome: turmaNome,
        sigla: turmaSigla.toUpperCase(),
        cor: turmaCor,
        turnoPadrao: turmaTurno,
        descricao: turmaDesc,
        ativa: true
      });
    }
    setIsTurmaModalOpen(false);
  };

  const handleSaveMateria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materiaNome.trim() || !materiaSigla.trim()) return;

    const sortedAssuntos = sortAssuntosAlphabetically(materiaAssuntos);

    if (editingMateria) {
      updateMateria({
        ...editingMateria,
        nome: materiaNome,
        sigla: materiaSigla.toUpperCase(),
        cor: materiaCor,
        cargaDiasObjetivo: Number(materiaMetaDias),
        descricao: materiaDesc,
        assuntos: sortedAssuntos
      });
    } else {
      addMateria({
        nome: materiaNome,
        sigla: materiaSigla.toUpperCase(),
        cor: materiaCor,
        cargaDiasObjetivo: Number(materiaMetaDias),
        descricao: materiaDesc,
        assuntos: sortedAssuntos,
        ativa: true
      });
    }
    setIsMateriaModalOpen(false);
  };

  const handleSaveInstrutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instNome.trim()) return;

    const cleanGuerra = getNomeDeGuerraSemPosto(instNome.trim());
    const finalNome = instPosto ? `${instPosto} ${cleanGuerra}`.trim() : instNome.trim();

    if (editingInstrutor) {
      updateInstrutor({
        ...editingInstrutor,
        nome: finalNome,
        contato: instContato,
        turmaId: instTurmaId ? instTurmaId : undefined,
        materiasAptas: instMateriasAptas,
        observacoes: instObs
      });
    } else {
      addInstrutor({
        nome: finalNome,
        contato: instContato,
        turmaId: instTurmaId ? instTurmaId : undefined,
        materiasAptas: instMateriasAptas,
        ativo: true,
        observacoes: instObs
      });
    }
    setIsInstrutorModalOpen(false);
  };

  const handleSaveGestor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gestorNome.trim() || !gestorLogin.trim() || !gestorSenha.trim()) {
      alert('Preencha o Nome, Login e Senha do Gestor.');
      return;
    }

    if (editingGestor) {
      updateGestor({
        ...editingGestor,
        nome: gestorNome,
        login: gestorLogin.toLowerCase().trim(),
        senha: gestorSenha.trim(),
        cargo: gestorCargo.trim()
      });
    } else {
      addGestor({
        nome: gestorNome,
        login: gestorLogin.toLowerCase().trim(),
        senha: gestorSenha.trim(),
        cargo: gestorCargo.trim(),
        ativo: true
      });
    }
    setIsGestorModalOpen(false);
  };

  const handleOpenHorarioModal = (h?: HorarioConfig) => {
    if (h) {
      setEditingHorario(h);
      setHorarioNome(h.nome);
      setHorarioTurno(h.turno);
      setHorarioTexto(h.horario);
      setHorarioIsPadrao(Boolean(h.padrao));
    } else {
      setEditingHorario(null);
      setHorarioNome('');
      setHorarioTurno('Tarde');
      setHorarioTexto('13:00 - 17:00');
      setHorarioIsPadrao(false);
    }
    setIsHorarioModalOpen(true);
  };

  const handleSaveHorario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!horarioNome.trim() || !horarioTexto.trim()) {
      alert('Preencha o Nome e o Horário.');
      return;
    }

    if (editingHorario) {
      updateHorario({
        ...editingHorario,
        nome: horarioNome.trim(),
        turno: horarioTurno,
        horario: horarioTexto.trim(),
        padrao: horarioIsPadrao,
        ativo: true
      });
    } else {
      addHorario({
        nome: horarioNome.trim(),
        turno: horarioTurno,
        horario: horarioTexto.trim(),
        padrao: horarioIsPadrao,
        ativo: true
      });
    }
    setIsHorarioModalOpen(false);
  };

  const toggleInstMateria = (id: string) => {
    setInstMateriasAptas(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const toggleShowPassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!canEdit) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-10 text-center max-w-lg mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4 text-blue-700">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Cadastros do Sistema</h2>
        <p className="text-sm text-slate-600 mb-6">
          Para adicionar ou alterar cadastros de turmas, matérias, instrutores e gestores, entre com uma conta de gestor.
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Gestão de Cadastros Base
              </h1>
              <p className="text-xs text-slate-500">
                Gerencie turmas, catálogo de matérias, corpo de instrutores e gestores do sistema
              </p>
            </div>
          </div>

          {/* Action button based on tab */}
          <div>
            {activeTab === 'turmas' && (
              <button
                onClick={() => handleOpenTurmaModal()}
                className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Turma</span>
              </button>
            )}

            {activeTab === 'materias' && (
              <button
                onClick={() => handleOpenMateriaModal()}
                className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Matéria</span>
              </button>
            )}

            {activeTab === 'instrutores' && (
              <button
                onClick={() => handleOpenInstrutorModal()}
                className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Instrutor</span>
              </button>
            )}

            {activeTab === 'gestores' && (
              <button
                onClick={() => handleOpenGestorModal()}
                className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Gestor</span>
              </button>
            )}

            {activeTab === 'horarios' && (
              <button
                onClick={() => handleOpenHorarioModal()}
                className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Horário</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab selector */}
        <div className="flex border-b border-slate-200 mt-6 space-x-6 text-sm font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('turmas')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'turmas'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Turmas ({turmas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('materias')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'materias'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Matérias ({materias.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('instrutores')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'instrutores'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Instrutores ({instrutores.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('horarios')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'horarios'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Horários ({(horarios || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gestores')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'gestores'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Gestores & Logins ({gestores.length})</span>
          </button>
        </div>
      </div>

      {/* 1. ABA TURMAS */}
      {activeTab === 'turmas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {turmas.map(t => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3 relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: t.cor }}
              />

              <div className="flex items-start justify-between">
                <div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-1"
                    style={{ backgroundColor: `${t.cor}18`, color: t.cor }}
                  >
                    {t.sigla}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">{t.nome}</h3>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenTurmaModal(t)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir a turma ${t.nome}?`)) deleteTurma(t.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2">
                {t.descricao || 'Sem descrição cadastrada'}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Turno: <strong>{t.turnoPadrao || 'Integral'}</strong></span>
                <span className="text-emerald-600 font-semibold">Ativa</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. ABA MATÉRIAS (COM BOTÕES DE CONSULTA POR MATÉRIA OU POR ASSUNTO) */}
      {activeTab === 'materias' && (
        <div className="space-y-4">
          {/* Painel de Alternância e Pesquisa (Por Matéria vs Por Assunto) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Consulta de Matérias e Assuntos Cadastrados
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Escolha abaixo se deseja pesquisar pela Matéria (para ver seus assuntos) ou pelo Assunto (para ver a qual matéria pertence)
                </p>
              </div>

              {/* Botões de Alternância de Modo */}
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setMateriasViewMode('por_materia')}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    materiasViewMode === 'por_materia'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>Pesquisar por Matéria</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMateriasViewMode('por_assunto')}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    materiasViewMode === 'por_assunto'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  <span>Pesquisar por Assunto</span>
                </button>
              </div>
            </div>

            {/* Controles da Visão POR MATÉRIA (Busca + Botão Expandir/Recolher Assuntos no lugar da linha Todas as Matérias) */}
            {materiasViewMode === 'por_materia' && (
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-1 min-w-0">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchMateriaQuery}
                    onChange={e => setSearchMateriaQuery(e.target.value)}
                    placeholder="Pesquisar matéria por nome ou sigla (Ex: Tiro, CQB, Direito, POP)..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 bg-slate-50/70 focus:bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleToggleAllMateriasExpanded}
                  className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 ${
                    areAllMateriasExpanded
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {areAllMateriasExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span>Recolher Assuntos</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>Expandir Assuntos</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Controles da Visão POR ASSUNTO */}
            {materiasViewMode === 'por_assunto' && (
              <div className="pt-2 border-t border-slate-100">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchAssuntoQuery}
                    onChange={e => setSearchAssuntoQuery(e.target.value)}
                    placeholder="Digite o nome do assunto para ver a qual matéria ele está vinculado..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 bg-slate-50/70 focus:bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* RESULTADO MODO 1: POR MATÉRIA (ORDEM ALFABÉTICA + EXPANSÃO OPCIONAL DOS ASSUNTOS) */}
          {materiasViewMode === 'por_materia' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {sortedMaterias
                .filter(m => {
                  if (!searchMateriaQuery.trim()) return true;
                  const q = searchMateriaQuery.toLowerCase().trim();
                  const matchMateria =
                    m.nome.toLowerCase().includes(q) ||
                    m.sigla.toLowerCase().includes(q) ||
                    (m.descricao || '').toLowerCase().includes(q);
                  const matchAssunto = (m.assuntos || []).some(a =>
                    a.nome.toLowerCase().includes(q)
                  );
                  return matchMateria || matchAssunto;
                })
                .map(m => {
                  const sortedAssuntos = sortAssuntosAlphabetically(m.assuntos || []);
                  const isCardExpanded =
                    expandedMateriaIds[m.id] !== undefined
                      ? expandedMateriaIds[m.id]
                      : areAllMateriasExpanded || Boolean(searchMateriaQuery.trim());

                  return (
                    <div
                      key={m.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3 relative overflow-hidden flex flex-col justify-between"
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-1.5"
                        style={{ backgroundColor: m.cor }}
                      />

                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2 min-w-0">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: m.cor }}
                            />
                            <div className="min-w-0">
                              <span className="text-[11px] font-bold text-slate-500 uppercase block truncate">
                                {m.sigla}
                              </span>
                              <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">
                                {m.nome}
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              onClick={() => handleOpenMateriaModal(m)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Editar Matéria e Assuntos"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Excluir a matéria ${m.nome}?`)) deleteMateria(m.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Excluir Matéria"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {m.descricao && (
                          <p className="text-xs text-slate-500 line-clamp-2">{m.descricao}</p>
                        )}

                        {/* Bloco de Assuntos (Recolhido por padrão no celular e expansível por botão) */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => toggleExpandMateriaCard(m.id)}
                              className="flex items-center gap-1.5 text-left text-[10px] font-extrabold text-slate-700 uppercase tracking-wider hover:text-blue-600 transition-colors"
                            >
                              <span>Assuntos desta Matéria ({sortedAssuntos.length})</span>
                              {isCardExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                              )}
                            </button>

                            <div className="flex items-center gap-2">
                              {sortedAssuntos.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => toggleExpandMateriaCard(m.id)}
                                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                                >
                                  {isCardExpanded ? 'Ocultar' : 'Ver'}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleOpenMateriaModal(m)}
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                              >
                                + Gerenciar
                              </button>
                            </div>
                          </div>

                          {isCardExpanded && (
                            <>
                              {sortedAssuntos.length > 0 ? (
                                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5 pt-1">
                                  {sortedAssuntos.map(ass => (
                                    <div
                                      key={ass.id}
                                      className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/90 text-xs"
                                    >
                                      <span className="font-semibold text-slate-800 truncate">
                                        {ass.nome}
                                      </span>
                                      <span
                                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                          (ass.peso || 1) >= 3
                                            ? 'bg-amber-100 text-amber-800'
                                            : (ass.peso || 1) === 2
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-slate-100 text-slate-600'
                                        }`}
                                      >
                                        {ass.peso || 1}x
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic pt-0.5">
                                  Nenhum assunto cadastrado nesta matéria ainda.
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          Meta: <strong>{m.cargaDiasObjetivo || 0} encontros</strong>
                        </span>
                        <span className="text-emerald-600 font-semibold">Ativa</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* RESULTADO MODO 2: POR ASSUNTO (ORDEM ALFABÉTICA + EDIÇÃO ESPECÍFICA DO ASSUNTO E SUA MATÉRIA) */}
          {materiasViewMode === 'por_assunto' && (() => {
            const allAssuntosItems = sortedMaterias
              .flatMap(m =>
                (m.assuntos || []).map(ass => ({
                  assunto: ass,
                  assuntoId: ass.id,
                  assuntoNome: ass.nome,
                  peso: ass.peso || 1,
                  materia: m
                }))
              )
              .sort((a, b) => naturalCompare(a.assuntoNome, b.assuntoNome));

            const q = searchAssuntoQuery.toLowerCase().trim();
            const filteredItems = allAssuntosItems.filter(
              item =>
                !q ||
                item.assuntoNome.toLowerCase().includes(q) ||
                item.materia.nome.toLowerCase().includes(q) ||
                item.materia.sigla.toLowerCase().includes(q)
            );

            return (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Assuntos em Ordem Alfabética ({filteredItems.length})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Clique no lápis para editar o assunto ou trocar de matéria
                  </span>
                </div>

                {filteredItems.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <p className="text-xs font-bold text-slate-600">
                      Nenhum assunto pré-cadastrado encontrado para esta pesquisa.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Você pode adicionar novos assuntos clicando em "+ Gerenciar" dentro de qualquer matéria.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {filteredItems.map(item => (
                      <div
                        key={`${item.materia.id}_${item.assuntoId}`}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-slate-50/60 transition-all"
                        style={{
                          borderLeftWidth: '4px',
                          borderLeftColor: item.materia.cor
                        }}
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {item.assuntoNome}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                item.peso >= 3
                                  ? 'bg-amber-100 text-amber-800'
                                  : item.peso === 2
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-200/80 text-slate-700'
                              }`}
                            >
                              {item.peso}x
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>Matéria vinculada:</span>
                            <span
                              className="font-extrabold px-2 py-0.5 rounded-md text-[10px]"
                              style={{
                                backgroundColor: `${item.materia.cor}18`,
                                color: item.materia.cor
                              }}
                            >
                              {item.materia.nome} ({item.materia.sigla})
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenEditSpecificAssunto(item.assunto, item.materia)
                          }
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 shrink-0 transition-colors"
                          title="Editar nome do assunto ou transferir para outra matéria"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* 3. ABA INSTRUTORES (SEPARADOS EM GRUPOS POR ANTIGUIDADE COM FILTROS E VÍNCULO A TURMAS) */}
      {activeTab === 'instrutores' && (() => {
        // Filtragem dos instrutores
        const filteredInstrutores = instrutores.filter(inst => {
          // Busca textual por nome, contato, matérias aptas ou observações
          if (instrutorSearchQuery.trim()) {
            const q = instrutorSearchQuery.toLowerCase().trim();
            const matchesNome = inst.nome.toLowerCase().includes(q);
            const matchesContato = (inst.contato || '').toLowerCase().includes(q);
            const matchesObs = (inst.observacoes || '').toLowerCase().includes(q);
            const matchesMat = inst.materiasAptas.some(mId => {
              const mat = materias.find(m => m.id === mId);
              return mat && (mat.nome.toLowerCase().includes(q) || mat.sigla.toLowerCase().includes(q));
            });
            if (!matchesNome && !matchesContato && !matchesObs && !matchesMat) return false;
          }

          // Filtro por Turma
          if (selectedInstrutorTurmaFilter === 'sem_turma') {
            if (inst.turmaId) return false;
          } else if (selectedInstrutorTurmaFilter !== 'all') {
            if (inst.turmaId !== selectedInstrutorTurmaFilter) return false;
          }

          // Filtro por Posto/Graduação
          if (selectedInstrutorRankFilter !== 'all') {
            const r = getInstrutorRank(inst.nome);
            if (r.id !== selectedInstrutorRankFilter) return false;
          }

          return true;
        });

        const isFiltered =
          selectedInstrutorTurmaFilter !== 'all' ||
          selectedInstrutorRankFilter !== 'all' ||
          instrutorSearchQuery.trim().length > 0;

        // Exibe APENAS os grupos que possuem pelo menos 1 instrutor cadastrado
        let groupedInstrutores = groupInstrutoresByAntiguidade(filteredInstrutores, false).filter(
          g => g.items.length > 0
        );

        if (selectedInstrutorRankFilter !== 'all') {
          groupedInstrutores = groupedInstrutores.filter(g => g.rank.id === selectedInstrutorRankFilter);
        }

        return (
          <div className="space-y-5">
            {/* Barra de Filtros Gerais: Busca Textual, Filtro por Turma e Filtro por Posto/Graduação */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Busca Textual */}
                <div className="sm:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={instrutorSearchQuery}
                    onChange={e => setInstrutorSearchQuery(e.target.value)}
                    placeholder="Buscar por nome, contato ou matéria..."
                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                  {instrutorSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setInstrutorSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filtro por Turma */}
                <div className="sm:col-span-4">
                  <div className="relative">
                    <select
                      value={selectedInstrutorTurmaFilter}
                      onChange={e => setSelectedInstrutorTurmaFilter(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todas as Turmas</option>
                      <option value="sem_turma">Geral / Sem Turma Vinculada</option>
                      {turmas.map(t => (
                        <option key={t.id} value={t.id}>
                          Turma: {t.nome} ({t.sigla})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filtro por Posto / Graduação */}
                <div className="sm:col-span-3">
                  <div className="relative">
                    <select
                      value={selectedInstrutorRankFilter}
                      onChange={e => setSelectedInstrutorRankFilter(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Postos / Patentes</option>
                      {PM_RANKS_HIERARCHY.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.sigla} ({r.titulo})
                        </option>
                      ))}
                      <option value="outros">Outro / Sem Posto</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Status e Limpar Filtros */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500">
                  Mostrando <strong className="text-slate-900">{filteredInstrutores.length}</strong> de <strong className="text-slate-900">{instrutores.length}</strong> instrutores
                  {isFiltered && ' (filtros aplicados)'}
                </span>

                {isFiltered && (
                  <button
                    type="button"
                    onClick={() => {
                      setInstrutorSearchQuery('');
                      setSelectedInstrutorTurmaFilter('all');
                      setSelectedInstrutorRankFilter('all');
                    }}
                    className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Limpar Filtros</span>
                  </button>
                )}
              </div>
            </div>

            {/* Listagem de Grupos por Antiguidade Militar */}
            {groupedInstrutores.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">
                  Nenhum instrutor encontrado com os filtros atuais
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Tente alterar os filtros de turma, posto ou termo de busca para visualizar os instrutores cadastrados.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setInstrutorSearchQuery('');
                    setSelectedInstrutorTurmaFilter('all');
                    setSelectedInstrutorRankFilter('all');
                  }}
                  className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl transition-colors"
                >
                  Limpar todos os filtros
                </button>
              </div>
            ) : (
              groupedInstrutores.map(group => (
                <div
                  key={group.rank.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
                >
                  {/* Cabeçalho do Grupo de Antiguidade (Posto / Graduação) com Botão de Adicionar Direto */}
                  <div className="bg-slate-900 text-white px-4 sm:px-5 py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-extrabold tracking-wide shrink-0">
                        {group.rank.sigla}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-extrabold text-white truncate">
                          {group.rank.titulo}
                        </h3>
                        <span className="text-[10px] text-slate-400 block leading-none mt-0.5">
                          {group.rank.categoria}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700 shrink-0">
                        {group.items.length} {group.items.length === 1 ? 'instrutor' : 'instrutores'}
                      </span>

                      {/* Botão de Adicionar Instrutor diretamente neste Posto/Graduação */}
                      <button
                        type="button"
                        onClick={() => handleOpenInstrutorModal(undefined, group.rank.sigla)}
                        className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                        title={`Adicionar Instrutor no posto ${group.rank.sigla}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Adicionar</span>
                      </button>
                    </div>
                  </div>

                  {/* Grid de Instrutores deste Posto/Graduação */}
                  <div className="p-4 sm:p-5 bg-slate-50/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {group.items.map(i => {
                      const linkedTurma = i.turmaId ? turmas.find(t => t.id === i.turmaId) : null;

                      return (
                        <div
                          key={i.id}
                          className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 space-y-3 flex flex-col justify-between"
                        >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                                    {i.nome}
                                  </h4>

                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    {/* Tag de Turma Vinculada */}
                                    {linkedTurma ? (
                                      <span
                                        className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-md border"
                                        style={{
                                          backgroundColor: `${linkedTurma.cor}18`,
                                          color: linkedTurma.cor,
                                          borderColor: `${linkedTurma.cor}44`
                                        }}
                                        title={`Vinculado à Turma ${linkedTurma.nome}`}
                                      >
                                        <Users className="w-3 h-3 shrink-0" />
                                        <span>Turma {linkedTurma.sigla}</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                                        Geral / Sem Turma
                                      </span>
                                    )}

                                    {/* Contato Telefônico */}
                                    {i.contato && (
                                      <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span>{i.contato}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-1 shrink-0">
                                  <button
                                    onClick={() => handleOpenInstrutorModal(i)}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                                    title="Editar Instrutor"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Excluir o instrutor ${i.nome}?`)) deleteInstrutor(i.id);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                                    title="Excluir Instrutor"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Matérias Aptas */}
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                  Conhecimento Pertinente ({i.materiasAptas.length})
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {i.materiasAptas.length === 0 ? (
                                    <span className="text-xs text-slate-400 italic">
                                      Nenhuma matéria específica (Geral)
                                    </span>
                                  ) : (
                                    i.materiasAptas.map(matId => {
                                      const mat = materias.find(m => m.id === matId);
                                      return (
                                        <span
                                          key={matId}
                                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200"
                                        >
                                          {mat?.sigla || mat?.nome || 'Matéria'}
                                        </span>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            </div>

                            {i.observacoes && (
                              <p className="text-xs text-slate-500 italic pt-2 border-t border-slate-100">
                                "{i.observacoes}"
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                </div>
              ))
            )}
          </div>
        );
      })()}

      {/* 4. ABA GESTORES & LOGINS */}
      {activeTab === 'gestores' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start space-x-3 text-xs text-blue-900">
            <KeyRound className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm block mb-0.5">Controle de Logins de Gestores</span>
              <p>
                Os gestores cadastrados aqui têm permissão para inserir aulas, gerar rodízios, editar e excluir registros. Qualquer alteração feita aqui é sincronizada diretamente com a aba <strong>Gestores</strong> na sua Planilha Google.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gestores.map(g => {
              const isPasswordVisible = !!showPasswords[g.id];

              return (
                <div
                  key={g.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {g.cargo || 'Gestor'}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1.5">{g.nome}</h3>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenGestorModal(g)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Editar Gestor"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir o gestor ${g.nome}?`)) deleteGestor(g.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Excluir Gestor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Detalhes de Credenciais */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Usuário de Login:</span>
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {g.login}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Senha / PIN:</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {isPasswordVisible ? g.senha : '••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleShowPassword(g.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded"
                          title={isPasswordVisible ? 'Ocultar senha' : 'Ver senha'}
                        >
                          {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. ABA HORÁRIOS */}
      {activeTab === 'horarios' && (
        <div className="space-y-4">
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-900 space-y-1">
              <p className="font-bold">Horários e Turnos Pré-Cadastrados</p>
              <p>
                Os horários cadastrados aqui alimentam automaticamente a seleção rápida ao agendar aulas no calendário. Você pode definir horários padrão para a Tarde, Manhã, Noite ou Integral, evitando digitação manual repetitiva.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(horarios || []).map(h => {
              const turnoColors: Record<Turno, { bg: string; text: string; border: string }> = {
                Tarde: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
                Manhã: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
                Integral: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
                Noite: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' }
              };
              const colors = turnoColors[h.turno] || turnoColors['Tarde'];

              return (
                <div
                  key={h.id}
                  className={`bg-white rounded-2xl border p-5 space-y-3 relative transition-all ${
                    h.padrao ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20' : 'border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                          {h.turno}
                        </span>
                        {h.padrao && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600 text-white">
                            ⭐ Padrão
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mt-2">{h.nome}</h3>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenHorarioModal(h)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Editar Horário"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir o horário "${h.nome}" (${h.horario})?`)) deleteHorario(h.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Excluir Horário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Horário de Instrução</span>
                      <span className="text-sm font-extrabold text-slate-900 font-mono">{h.horario}</span>
                    </div>

                    {!h.padrao && (
                      <button
                        type="button"
                        onClick={() => setDefaultHorario(h.id)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Definir como Padrão
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL HORÁRIO */}
      {isHorarioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingHorario ? 'Editar Horário' : 'Cadastrar Novo Horário'}
            </h3>

            <form onSubmit={handleSaveHorario} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome / Identificação *</label>
                <input
                  type="text"
                  required
                  value={horarioNome}
                  onChange={e => setHorarioNome(e.target.value)}
                  placeholder="Ex: Tarde (Padrão), Manhã Operacional..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Turno *</label>
                  <select
                    value={horarioTurno}
                    onChange={e => {
                      const t = e.target.value as Turno;
                      setHorarioTurno(t);
                      if (!editingHorario) {
                        if (t === 'Tarde') setHorarioTexto('13:00 - 17:00');
                        else if (t === 'Manhã') setHorarioTexto('08:00 - 12:00');
                        else if (t === 'Integral') setHorarioTexto('08:00 - 17:00');
                        else if (t === 'Noite') setHorarioTexto('18:00 - 22:00');
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Tarde">Tarde</option>
                    <option value="Manhã">Manhã</option>
                    <option value="Integral">Integral</option>
                    <option value="Noite">Noite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horário (Início - Fim) *</label>
                  <input
                    type="text"
                    required
                    value={horarioTexto}
                    onChange={e => setHorarioTexto(e.target.value)}
                    placeholder="Ex: 13:00 - 17:00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={horarioIsPadrao}
                    onChange={e => setHorarioIsPadrao(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-xs text-slate-700 font-semibold">
                    Definir como horário padrão para novas aulas
                  </span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsHorarioModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
                >
                  Salvar Horário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TURMA */}
      {isTurmaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingTurma ? 'Editar Turma' : 'Cadastrar Nova Turma'}
            </h3>

            <form onSubmit={handleSaveTurma} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Turma *</label>
                <input
                  type="text"
                  required
                  value={turmaNome}
                  onChange={e => setTurmaNome(e.target.value)}
                  placeholder="Ex: Turma Alfa - Formação Geral"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sigla *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={turmaSigla}
                    onChange={e => setTurmaSigla(e.target.value)}
                    placeholder="ALFA"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Turno Padrão</label>
                  <select
                    value={turmaTurno}
                    onChange={e => setTurmaTurno(e.target.value as Turno)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Integral">Integral</option>
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noite">Noite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Cor da Turma</label>
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_PALETTE.map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setTurmaCor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        turmaCor === c ? 'scale-125 ring-2 ring-slate-900 shadow-sm' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <label
                    title="Escolher outra cor personalizada"
                    className="w-7 h-7 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform overflow-hidden relative"
                    style={{ backgroundColor: turmaCor }}
                  >
                    <input
                      type="color"
                      value={turmaCor}
                      onChange={e => setTurmaCor(e.target.value)}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                    <span className="text-[10px] font-black text-white drop-shadow">+</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={turmaDesc}
                  onChange={e => setTurmaDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTurmaModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md"
                >
                  Salvar Turma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MATÉRIA (Com botões principais fixos no rodapé do card) */}
      {isMateriaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-5 sm:p-6 max-h-[85vh] flex flex-col overflow-hidden">
            <h3 className="text-lg font-bold text-slate-900 shrink-0 pb-3 border-b border-slate-100">
              {editingMateria ? 'Editar Matéria' : 'Cadastrar Nova Matéria'}
            </h3>

            <form onSubmit={handleSaveMateria} className="flex flex-col flex-1 min-h-0 pt-3">
              {/* Corpo rolável interno */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Matéria *</label>
                  <input
                    type="text"
                    required
                    value={materiaNome}
                    onChange={e => setMateriaNome(e.target.value)}
                    placeholder="Ex: Tiro Prático e Armamento"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sigla *</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={materiaSigla}
                      onChange={e => setMateriaSigla(e.target.value)}
                      placeholder="TIRO"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Meta de Encontros (Dias)</label>
                    <input
                      type="number"
                      min={1}
                      value={materiaMetaDias}
                      onChange={e => setMateriaMetaDias(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Cor da Matéria</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {COLOR_PALETTE.map(c => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setMateriaCor(c)}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          materiaCor === c ? 'scale-125 ring-2 ring-slate-900 shadow-sm' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <label
                      title="Escolher outra cor personalizada"
                      className="w-7 h-7 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform overflow-hidden relative"
                      style={{ backgroundColor: materiaCor }}
                    >
                      <input
                        type="color"
                        value={materiaCor}
                        onChange={e => setMateriaCor(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                      <span className="text-[10px] font-black text-white drop-shadow">+</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição</label>
                  <textarea
                    rows={2}
                    value={materiaDesc}
                    onChange={e => setMateriaDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Parametrização de Assuntos Pré-cadastrados (Organizados Alfabeticamente) */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3 overflow-hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <label className="block text-xs font-bold text-slate-800">
                        Assuntos Pré-cadastrados & Importância (Ordem Alfabética)
                      </label>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                        Assuntos com peso 2x ou 3x se repetem proporcionalmente no gerador de período.
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {materiaAssuntos.length} {materiaAssuntos.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>

                  {/* Bloco de Adição de Assunto (Responsivo e 100% contido no card) */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
                    <input
                      type="text"
                      value={novoAssuntoNome}
                      onChange={e => setNovoAssuntoNome(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddAssuntoToMateria();
                        }
                      }}
                      placeholder="Nome do assunto (Ex: 01. Abordagem ou Tiro em baixa luminosidade)..."
                      className="w-full min-w-0 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />

                    <div className="flex items-center gap-2">
                      <select
                        value={novoAssuntoPeso}
                        onChange={e => setNovoAssuntoPeso(Number(e.target.value))}
                        title="Importância / Repetição no rodízio"
                        className="flex-1 min-w-0 px-2.5 py-2 rounded-lg border border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>Peso 1x — Normal</option>
                        <option value={2}>Peso 2x — Importante</option>
                        <option value={3}>Peso 3x — Prioritário</option>
                      </select>

                      <button
                        type="button"
                        onClick={handleAddAssuntoToMateria}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg shrink-0 inline-flex items-center justify-center gap-1 shadow-2xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar</span>
                      </button>
                    </div>
                  </div>

                  {materiaAssuntos.length > 0 && (
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5">
                      {sortAssuntosAlphabetically(materiaAssuntos).map(ass => (
                        <div
                          key={ass.id}
                          className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/90 shadow-2xs text-xs min-w-0"
                        >
                          <span className="font-semibold text-slate-800 truncate min-w-0">
                            {ass.nome}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <select
                              value={ass.peso || 1}
                              onChange={e => handleUpdateAssuntoPeso(ass.id, Number(e.target.value))}
                              className="text-[11px] font-bold px-2 py-1 rounded-lg border border-blue-200 bg-blue-50/80 text-blue-700 focus:outline-none"
                            >
                              <option value={1}>1x</option>
                              <option value={2}>2x</option>
                              <option value={3}>3x</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleRemoveAssuntoFromMateria(ass.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Remover assunto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Rodapé Fixo com os Botões Principais */}
              <div className="pt-3.5 mt-3 flex justify-end space-x-2 shrink-0 border-t border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setIsMateriaModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  Salvar Matéria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ESPECÍFICO: EDITAR ASSUNTO INDIVIDUAL (NOME DO ASSUNTO OU MATÉRIA VINCULADA) */}
      {isEditAssuntoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 sm:p-6 max-h-[85vh] flex flex-col overflow-hidden">
            <h3 className="text-lg font-bold text-slate-900 shrink-0 pb-3 border-b border-slate-100">
              Editar Assunto Cadastrado
            </h3>

            <form onSubmit={handleSaveSpecificAssunto} className="flex flex-col flex-1 min-h-0 pt-3">
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome do Assunto *
                  </label>
                  <input
                    type="text"
                    required
                    value={editAssuntoNome}
                    onChange={e => setEditAssuntoNome(e.target.value)}
                    placeholder="Digite o nome do assunto..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Matéria Vinculada *
                  </label>
                  <select
                    required
                    value={editAssuntoTargetMateriaId}
                    onChange={e => setEditAssuntoTargetMateriaId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sortedMaterias.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nome} ({m.sigla})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Se você escolher outra matéria da lista, este assunto será transferido automaticamente para ela.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Importância / Repetição no Gerador
                  </label>
                  <select
                    value={editAssuntoPeso}
                    onChange={e => setEditAssuntoPeso(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Peso 1x — Normal</option>
                    <option value={2}>Peso 2x — Importante</option>
                    <option value={3}>Peso 3x — Prioritário</option>
                  </select>
                </div>
              </div>

              {/* Rodapé Fixo no Final do Card */}
              <div className="pt-3.5 mt-4 flex justify-end space-x-2 shrink-0 border-t border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setIsEditAssuntoModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INSTRUTOR (Com botões principais fixos no rodapé do card) */}
      {isInstrutorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-5 sm:p-6 max-h-[85vh] flex flex-col overflow-hidden">
            <h3 className="text-lg font-bold text-slate-900 shrink-0 pb-3 border-b border-slate-100">
              {editingInstrutor ? 'Editar Instrutor' : 'Cadastrar Novo Instrutor'}
            </h3>

            <form onSubmit={handleSaveInstrutor} className="flex flex-col flex-1 min-h-0 pt-3">
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Posto / Graduação *
                    </label>
                    <select
                      value={instPosto}
                      onChange={e => setInstPosto(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PM_RANKS_HIERARCHY.map(r => (
                        <option key={r.id} value={r.sigla}>
                          {r.sigla} ({r.titulo})
                        </option>
                      ))}
                      <option value="">Outro / Sem Posto</option>
                    </select>
                  </div>

                  <div className="sm:col-span-7">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome de Guerra / Nome *
                    </label>
                    <input
                      type="text"
                      required
                      value={instNome}
                      onChange={e => setInstNome(e.target.value)}
                      placeholder="Ex: Teodoro, Marcos Sotero..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contato / Telefone</label>
                  <input
                    type="text"
                    value={instContato}
                    onChange={e => setInstContato(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Turma Vinculada (Opcional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Turma Vinculada (Opcional)
                  </label>
                  <select
                    value={instTurmaId}
                    onChange={e => setInstTurmaId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Geral / Sem vínculo (Disponível para qualquer turma)</option>
                    {turmas.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nome} ({t.sigla})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Vincule este instrutor a uma turma específica ou deixe geral para atuar em todo o batalhão.
                  </p>
                </div>

                {/* Seleção de Conhecimento Pertinente (Em ordem alfabética) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Matérias com Conhecimento Pertinente (Aptidão)
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Selecione as matérias em que este instrutor possui especialização. Ainda assim, ele poderá lecionar qualquer matéria no cronograma.
                  </p>

                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
                    {sortedMaterias.map(m => {
                      const isSelected = instMateriasAptas.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          onClick={() => toggleInstMateria(m.id)}
                          className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer border transition-colors ${
                            isSelected
                              ? 'bg-blue-100/70 border-blue-300 text-blue-900 font-medium'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <span className="truncate pr-1">{m.nome}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Observações Gerais</label>
                  <textarea
                    rows={2}
                    value={instObs}
                    onChange={e => setInstObs(e.target.value)}
                    placeholder="Ex: Instrutor credenciado, disponibilidade aos fins de semana..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3.5 mt-3 flex justify-end space-x-2 shrink-0 border-t border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setIsInstrutorModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Salvar Instrutor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GESTOR */}
      {isGestorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingGestor ? 'Editar Gestor' : 'Cadastrar Novo Gestor'}
            </h3>

            <form onSubmit={handleSaveGestor} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={gestorNome}
                  onChange={e => setGestorNome(e.target.value)}
                  placeholder="Ex: Cap. Rocha ou Coordenação"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Usuário / Login *</label>
                  <input
                    type="text"
                    required
                    value={gestorLogin}
                    onChange={e => setGestorLogin(e.target.value)}
                    placeholder="Ex: rocha ou admin"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Senha / PIN *</label>
                  <input
                    type="text"
                    required
                    value={gestorSenha}
                    onChange={e => setGestorSenha(e.target.value)}
                    placeholder="Ex: 1234"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cargo / Função</label>
                <input
                  type="text"
                  value={gestorCargo}
                  onChange={e => setGestorCargo(e.target.value)}
                  placeholder="Ex: Oficial de Ensino, Chefe de Curso"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsGestorModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md"
                >
                  Salvar Gestor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
