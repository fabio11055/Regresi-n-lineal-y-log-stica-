import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { ArrowRight, LineChart, Binary, Compass } from 'lucide-react';
import heroImage from '../assets/images/hero_ml_regression_1790107536358.jpg';

interface HeroBannerProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onNavigate }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
      {/* Background visual asset */}
      <div className="absolute inset-0 z-0">
        {!imgError ? (
          <img
            src={heroImage}
            alt="Visualización conceptual de regresión lineal y logística en Machine Learning"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover opacity-20 filter brightness-75 mix-blend-screen"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 opacity-90" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 p-6 sm:p-10 max-w-4xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-3">
          <Compass className="w-4 h-4" />
          <span>Guía Maestra Visual e Interactiva</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 font-normal">Machine Learning para Todos</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight text-balance mb-4">
          ¿Predecir un <span className="text-cyan-400">número</span> o tomar una <span className="text-emerald-400">decisión</span>?
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mb-8">
          La <strong>Regresión Lineal</strong> y la <strong>Regresión Logística</strong> son las dos técnicas fundamentales más utilizadas en el mundo real. Aquí las aprenderás tocando los datos, moviendo rectas, ajustando umbrales de decisión y probando simulaciones vivas sin abrumarte con jerga técnica.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('lineal')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <LineChart className="w-4 h-4" />
            <span>Explorar Regresión Lineal</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('logistica')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 font-semibold text-sm transition-all cursor-pointer"
          >
            <Binary className="w-4 h-4" />
            <span>Explorar Regresión Logística</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('comparativa')}
            className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-sm font-medium transition-colors cursor-pointer"
          >
            Ver Cuadro Comparativo
          </button>
        </div>
      </div>
    </div>
  );
};
