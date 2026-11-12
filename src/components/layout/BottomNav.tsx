import React from 'react';
import { Calendar, Layers, BarChart3, Users, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openSettings: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab, openSettings }) => {
  const { isAdmin } = useAuth();

  return (
    <nav className="md:hidden shrink-0 fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 safe-bottom-nav shadow-[0_-4px_12px_-4px_rgba(15,23,42,0.08)]">
      <div className={`grid ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'} h-16 max-w-md mx-auto px-1`}>
        <button
          onClick={() => setCurrentTab('calendario')}
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            currentTab === 'calendario'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Calendar className={`w-5 h-5 ${currentTab === 'calendario' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Agenda</span>
        </button>

        <button
          onClick={() => setCurrentTab('gerador')}
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            currentTab === 'gerador'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Layers className={`w-5 h-5 ${currentTab === 'gerador' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Gerar</span>
        </button>

        <button
          onClick={() => setCurrentTab('metricas')}
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            currentTab === 'metricas'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <BarChart3 className={`w-5 h-5 ${currentTab === 'metricas' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Métricas</span>
        </button>

        <button
          onClick={() => setCurrentTab('cadastros')}
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            currentTab === 'cadastros'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Users className={`w-5 h-5 ${currentTab === 'cadastros' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px]">Cadastros</span>
        </button>

        {isAdmin && (
          <button
            onClick={openSettings}
            className="flex flex-col items-center justify-center space-y-1 text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px]">Ajustes</span>
          </button>
        )}
      </div>
    </nav>
  );
};
