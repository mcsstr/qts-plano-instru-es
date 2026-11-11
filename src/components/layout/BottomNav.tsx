import React from 'react';
import { Calendar, Layers, BarChart3, Users, Settings } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openSettings: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab, openSettings }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 safe-bottom">
      <div className="grid grid-cols-5 h-16">
        <button
          onClick={() => setCurrentTab('calendario')}
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            currentTab === 'calendario' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[11px] leading-none">Aulas</span>
        </button>

        <button
          onClick={() => setCurrentTab('gerador')}
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            currentTab === 'gerador' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[11px] leading-none">Gerador</span>
        </button>

        <button
          onClick={() => setCurrentTab('metricas')}
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            currentTab === 'metricas' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[11px] leading-none">Métricas</span>
        </button>

        <button
          onClick={() => setCurrentTab('cadastros')}
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            currentTab === 'cadastros' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[11px] leading-none">Cadastros</span>
        </button>

        <button
          onClick={openSettings}
          className="flex flex-col items-center justify-center space-y-1 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[11px] leading-none">Ajustes</span>
        </button>
      </div>
    </div>
  );
};

