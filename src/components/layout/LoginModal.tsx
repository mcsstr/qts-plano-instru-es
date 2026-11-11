import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Shield, Lock, X, ArrowRight, Info, User, CheckCircle2, KeyRound } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login, loginAsGestor } = useAuth();
  const { gestores } = useApp();

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(usuario, senha);
    if (!success) {
      setError(true);
    } else {
      setUsuario('');
      setSenha('');
      setError(false);
    }
  };

  const handleSelectQuickGestor = (gestor: any) => {
    loginAsGestor(gestor);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative">
          <button
            onClick={closeLoginModal}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold">Acesso de Gestor</h2>
          <p className="text-sm text-blue-100 mt-1">
            Entre com seu usuário e senha cadastrados para gerenciar o QTS.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Usuário / Login *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={usuario}
                  onChange={e => {
                    setUsuario(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="Ex: admin ou rocha"
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 placeholder-slate-400 text-sm"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Senha / PIN *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={e => {
                    setSenha(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="Senha cadastrada"
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    error ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                  } focus:outline-none focus:ring-2 text-slate-900 placeholder-slate-400 text-sm`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
              {error && (
                <p className="text-xs text-red-600 mt-1.5">
                  Usuário ou senha incorretos. Verifique os dados ou utilize o login rápido abaixo.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md shadow-blue-500/20 transition-all text-sm"
            >
              <span>Entrar no Painel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Gestores Cadastrados - Acesso com 1 clique */}
          {gestores.length > 0 && (
            <div className="pt-2">
              <div className="relative flex py-2 items-center">
                <div className="grow border-t border-slate-200"></div>
                <span className="shrink mx-3 text-[11px] text-slate-400 uppercase font-semibold">
                  Gestores Cadastrados
                </span>
                <div className="grow border-t border-slate-200"></div>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {gestores.map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleSelectQuickGestor(g)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 text-left transition-all group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                        {g.nome}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Login: <strong>{g.login}</strong> {g.cargo ? `• ${g.cargo}` : ''}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-blue-600 bg-white px-2 py-1 rounded-lg border border-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      Entrar
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-blue-800 border border-blue-100">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Você pode cadastrar novos gestores, trocar senhas ou criar novos logins a qualquer momento na aba <strong>Cadastros &gt; Gestores</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
