import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, X, ArrowRight, User, Eye, EyeOff } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    window.scrollTo(0, 0);
    const success = login(usuario, senha);
    if (!success) {
      setError(true);
    } else {
      setUsuario('');
      setSenha('');
      setError(false);
    }
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
            Informe seu usuário e senha cadastrados para gerenciar o QTM.
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Digite seu usuário"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 placeholder-slate-400 text-base sm:text-sm"
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={senha}
                  onChange={e => {
                    setSenha(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="Digite sua senha"
                  className={`w-full pl-4 pr-11 py-2.5 rounded-xl border ${
                    error ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-blue-500'
                  } focus:outline-none focus:ring-2 text-slate-900 placeholder-slate-400 text-base sm:text-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <p className="text-xs text-red-600 mt-1.5 font-medium">
                  Usuário ou senha incorretos. Verifique suas credenciais cadastradas.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all text-sm"
            >
              <span>Entrar no Painel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
