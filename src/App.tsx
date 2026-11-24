import { useState } from 'react';
import { ActiveTab } from './types';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ComparisonTab } from './components/ComparisonTab';
import { LinearRegressionLab } from './components/LinearRegressionLab';
import { LogisticRegressionLab } from './components/LogisticRegressionLab';
import { RealWorldScenarios } from './components/RealWorldScenarios';
import { GlossaryQuizTab } from './components/GlossaryQuizTab';
import { TutorChatbot } from './components/TutorChatbot';
import { LineChart, Binary, GitCompare, Briefcase, HelpCircle, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('comparativa');
  const [resetKey, setResetKey] = useState<number>(0);

  const handleResetToDemo = () => {
    setResetKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Bar Contract (3 zones) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetToDemo={handleResetToDemo}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'comparativa' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <HeroBanner onNavigate={(tab) => setActiveTab(tab)} />
            <ComparisonTab onNavigate={(tab) => setActiveTab(tab)} />
          </div>
        )}

        {activeTab === 'lineal' && (
          <div key={`linear_${resetKey}`} className="animate-in fade-in duration-300">
            <LinearRegressionLab />
          </div>
        )}

        {activeTab === 'logistica' && (
          <div key={`logistic_${resetKey}`} className="animate-in fade-in duration-300">
            <LogisticRegressionLab />
          </div>
        )}

        {activeTab === 'casos' && (
          <div className="animate-in fade-in duration-300">
            <RealWorldScenarios />
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="animate-in fade-in duration-300">
            <GlossaryQuizTab />
          </div>
        )}
      </main>

      {/* Clean Footer (Anti-slop compliant: quiet copyright and real actions) */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-sm bg-cyan-400"></span>
            <span className="font-semibold text-slate-300">RegresionLab ML</span>
            <span>—</span>
            <span>Guía Interactiva de Regresión Lineal y Logística para Usuarios Finales</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('comparativa')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Comparativa
            </button>
            <button
              onClick={() => setActiveTab('lineal')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Regresión Lineal
            </button>
            <button
              onClick={() => setActiveTab('logistica')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Regresión Logística
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Quiz
            </button>
          </div>
        </div>
      </footer>

      {/* Context-aware interactive tutor chatbot */}
      <TutorChatbot activeTab={activeTab} />
    </div>
  );
}
