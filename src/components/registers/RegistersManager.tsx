import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Turma, Materia, Instrutor, Gestor, Turno } from '../../types';
import {
  Users,
  BookOpen,
  UserCheck,
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Check,
  Phone,
  ArrowRight,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

export const RegistersManager: React.FC = () => {
  const {
    turmas,
    materias,
    instrutores,
    gestores,
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
    deleteGestor
  } = useApp();

  const { canEdit, openLoginModal } = useAuth();

  const [activeTab, setActiveTab] = useState<'turmas' | 'materias' | 'instrutores' | 'gestores'>('turmas');

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

  // FORM STATES - INSTRUTOR
  const [instNome, setInstNome] = useState('');
  const [instContato, setInstContato] = useState('');
  const [instMateriasAptas, setInstMateriasAptas] = useState<string[]>([]);
  const [instObs, setInstObs] = useState('');

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
    } else {
      setEditingMateria(null);
      setMateriaNome('');
      setMateriaSigla('');
      setMateriaCor(COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]);
      setMateriaMetaDias(10);
      setMateriaDesc('');
    }
    setIsMateriaModalOpen(true);
  };

  const handleOpenInstrutorModal = (instrutor?: Instrutor) => {
    if (instrutor) {
      setEditingInstrutor(instrutor);
      setInstNome(instrutor.nome);
      setInstContato(instrutor.contato || '');
      setInstMateriasAptas(instrutor.materiasAptas || []);
      setInstObs(instrutor.observacoes || '');
    } else {
      setEditingInstrutor(null);
      setInstNome('');
      setInstContato('');
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

    if (editingMateria) {
      updateMateria({
        ...editingMateria,
        nome: materiaNome,
        sigla: materiaSigla.toUpperCase(),
        cor: materiaCor,
        cargaDiasObjetivo: Number(materiaMetaDias),
        descricao: materiaDesc
      });
    } else {
      addMateria({
        nome: materiaNome,
        sigla: materiaSigla.toUpperCase(),
        cor: materiaCor,
        cargaDiasObjetivo: Number(materiaMetaDias),
        descricao: materiaDesc,
        ativa: true
      });
    }
    setIsMateriaModalOpen(false);
  };

  const handleSaveInstrutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instNome.trim()) return;

    if (editingInstrutor) {
      updateInstrutor({
        ...editingInstrutor,
        nome: instNome,
        contato: instContato,
        materiasAptas: instMateriasAptas,
        observacoes: instObs
      });
    } else {
      addInstrutor({
        nome: instNome,
        contato: instContato,
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

      {/* 2. ABA MATÉRIAS */}
      {activeTab === 'materias' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materias.map(m => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3 relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: m.cor }}
              />

              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: m.cor }}
                  />
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase">{m.sigla}</span>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{m.nome}</h3>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenMateriaModal(m)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir a matéria ${m.nome}?`)) deleteMateria(m.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2">
                {m.descricao || 'Sem descrição cadastrada'}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Meta: <strong>{m.cargaDiasObjetivo || 0} encontros</strong></span>
                <span className="text-emerald-600 font-semibold">Ativa</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. ABA INSTRUTORES */}
      {activeTab === 'instrutores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {instrutores.map(i => (
            <div
              key={i.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{i.nome}</h3>
                  {i.contato && (
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {i.contato}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenInstrutorModal(i)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir o instrutor ${i.nome}?`)) deleteInstrutor(i.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Matérias Aptas */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Conhecimento Pertinente ({i.materiasAptas.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {i.materiasAptas.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">Nenhuma matéria específica (Geral)</span>
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

              {i.observacoes && (
                <p className="text-xs text-slate-500 italic pt-1 border-t border-slate-100">
                  "{i.observacoes}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}

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

      {/* MODAL MATÉRIA */}
      {isMateriaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingMateria ? 'Editar Matéria' : 'Cadastrar Nova Matéria'}
            </h3>

            <form onSubmit={handleSaveMateria} className="space-y-3">
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

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsMateriaModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md"
                >
                  Salvar Matéria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INSTRUTOR */}
      {isInstrutorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 shrink-0">
              {editingInstrutor ? 'Editar Instrutor' : 'Cadastrar Novo Instrutor'}
            </h3>

            <form onSubmit={handleSaveInstrutor} className="space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Instrutor *</label>
                <input
                  type="text"
                  required
                  value={instNome}
                  onChange={e => setInstNome(e.target.value)}
                  placeholder="Ex: Capitão Rocha"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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

              {/* Seleção de Conhecimento Pertinente */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Matérias com Conhecimento Pertinente (Aptidão)
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Selecione as matérias em que este instrutor possui especialização. Ainda assim, ele poderá lecionar qualquer matéria no cronograma.
                </p>

                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
                  {materias.map(m => {
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

              <div className="pt-2 flex justify-end space-x-2 shrink-0 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInstrutorModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md"
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
