import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, Gestor } from '../types';
import { useApp } from './AppContext';

interface AuthContextType {
  user: AuthUser;
  canEdit: boolean;
  isAdmin: boolean;
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

  const checkIsAdminLogin = (loginStr?: string): boolean => {
    if (!loginStr) return false;
    const clean = loginStr.trim().toLowerCase();
    return clean === 'admin' || clean === 'administrador';
  };

  const login = (usuarioOuLogin: string, senhaOuPin: string): boolean => {
    const cleanUser = usuarioOuLogin.trim();
    const cleanPass = senhaOuPin.trim();

    // 1. Tenta validar com os gestores cadastrados no sistema
    const gestorEncontrado = validateGestorLogin(cleanUser, cleanPass);
    if (gestorEncontrado) {
      const isUserAdmin =
        checkIsAdminLogin(gestorEncontrado.login) ||
        gestorEncontrado.id === 'gestor-1';

      setUser({
        nome: gestorEncontrado.nome,
        login: gestorEncontrado.login,
        role: isUserAdmin ? 'admin' : 'gestor',
        autenticado: true
      });
      setIsLoginModalOpen(false);
      return true;
    }

    // 2. Senha mestre do Administrador ("admin" / "1234")
    if (
      (cleanUser.toLowerCase() === 'admin' && (cleanPass === '123' || cleanPass === '1234' || cleanPass === 'admin')) ||
      cleanPass === '1234'
    ) {
      setUser({
        nome: 'Administrador Geral',
        login: 'admin',
        role: 'admin',
        autenticado: true
      });
      setIsLoginModalOpen(false);
      return true;
    }

    return false;
  };

  const loginAsGestor = (gestor: Gestor) => {
    const isUserAdmin =
      checkIsAdminLogin(gestor.login) ||
      gestor.id === 'gestor-1';

    setUser({
      nome: gestor.nome,
      login: gestor.login,
      role: isUserAdmin ? 'admin' : 'gestor',
      autenticado: true
    });
    setIsLoginModalOpen(false);
  };

  const quickLoginAsAdmin = () => {
    const defaultGestor = gestores.find(g => checkIsAdminLogin(g.login)) || gestores[0];
    setUser({
      nome: defaultGestor?.nome || 'Administrador Geral',
      login: 'admin',
      role: 'admin',
      autenticado: true
    });
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    setUser(DEFAULT_USER);
  };

  const canEdit = user.autenticado && (user.role === 'admin' || user.role === 'gestor');
  const isAdmin = user.autenticado && user.role === 'admin' && checkIsAdminLogin(user.login);

  return (
    <AuthContext.Provider
      value={{
        user,
        canEdit,
        isAdmin,
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
