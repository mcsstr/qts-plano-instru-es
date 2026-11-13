import React from 'react';
import { Calendar, Layers, BarChart3, Users } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab }) => {
  return (
    <nav
      onTouchMove={e => e.preventDefault()}
      className="md:hidden shrink-0 fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 safe-bottom-nav shadow-[0_-4px_12px_-4px_rgba(15,23,42,0.08)] select-none touch-none"
    >
      <div className="grid grid-cols-4 h-13 w-full px-1 pt-1.5 pb-1">
        <button
          onClick={() => setCurrentTab('calendario')}
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            currentTab === 'calendario'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Calendar className={`w-5 h-5 ${currentTab === 'calendario' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] leading-none">Agenda</span>
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
          <span className="text-[10px] leading-none">Gerar</span>
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
          <span className="text-[10px] leading-none">Métricas</span>
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
          <span className="text-[10px] leading-none">Cadastros</span>
        </button>
      </div>
    </nav>
  );
};
