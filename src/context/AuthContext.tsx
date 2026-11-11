import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, Gestor } from '../types';
import { useApp } from './AppContext';

interface AuthContextType {
  user: AuthUser;
  canEdit: boolean;
  login: (usuarioOuLogin: string, senhaOuPin: string) => boolean;
  loginAsGestor: (gestor: Gestor) => void;
  quickLoginAsAdmin: () => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AUTH_STORAGE_KEY = 'qts_auth_user_v2';

const DEFAULT_USER: AuthUser = {
  nome: 'Visitante (Consulta Pública)',
  role: 'publico',
  autenticado: false
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { validateGestorLogin, gestores } = useApp();

  const [user, setUser] = useState<AuthUser>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return DEFAULT_USER;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      // ignore
    }
  }, [user]);

  const login = (usuarioOuLogin: string, senhaOuPin: string): boolean => {
    const cleanUser = usuarioOuLogin.trim();
    const cleanPass = senhaOuPin.trim();

    // 1. Tenta validar com os gestores cadastrados no sistema
    const gestorEncontrado = validateGestorLogin(cleanUser, cleanPass);
    if (gestorEncontrado) {
      setUser({
        nome: gestorEncontrado.nome,
        login: gestorEncontrado.login,
        role: 'admin',
        autenticado: true
      });
      setIsLoginModalOpen(false);
      return true;
    }

    // 2. Senha de emergência / mestre ("1234" ou "admin")
    if (cleanPass === '1234' || cleanPass === 'admin' || cleanUser.toLowerCase() === 'admin') {
      setUser({
        nome: cleanUser ? `Gestor (${cleanUser})` : 'Administrador',
        login: cleanUser || 'admin',
        role: 'admin',
        autenticado: true
      });
      setIsLoginModalOpen(false);
      return true;
    }

    return false;
  };

  const loginAsGestor = (gestor: Gestor) => {
    setUser({
      nome: gestor.nome,
      login: gestor.login,
      role: 'admin',
      autenticado: true
    });
    setIsLoginModalOpen(false);
  };

  const quickLoginAsAdmin = () => {
    const defaultGestor = gestores[0];
    setUser({
      nome: defaultGestor?.nome || 'Administrador Principal',
      login: defaultGestor?.login || 'admin',
      role: 'admin',
      autenticado: true
    });
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    setUser(DEFAULT_USER);
  };

  const canEdit = user.autenticado && (user.role === 'admin' || user.role === 'gestor');

  return (
    <AuthContext.Provider
      value={{
        user,
        canEdit,
        login,
        loginAsGestor,
        quickLoginAsAdmin,
        logout,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
