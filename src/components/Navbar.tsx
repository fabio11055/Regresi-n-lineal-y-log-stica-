import React from 'react';
import { ActiveTab } from '../types';
import { LineChart, Binary, GitCompare, Briefcase, HelpCircle, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onResetToDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onResetToDemo }) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'comparativa', label: 'Comparativa', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'lineal', label: 'Regresión Lineal', icon: <LineChart className="w-4 h-4" /> },
    { id: 'logistica', label: 'Regresión Logística', icon: <Binary className="w-4 h-4" /> },
    { id: 'casos', label: 'Casos Reales', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'quiz', label: 'Quiz & Conceptos', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('comparativa')}
          className="text-left font-bold tracking-tight text-white hover:text-cyan-400 transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block"></span>
          <span className="text-lg">RegresionLab <span className="font-light text-cyan-400">ML</span></span>
        </button>

        {/* Zone 2: Navigation tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Quick action button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onResetToDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            title="Restaura los puntos de ejemplo predeterminados"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Restaurar Ejemplos</span>
            <span className="sm:hidden">Reset</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-800/60 bg-slate-950/95 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 text-[11px] font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
