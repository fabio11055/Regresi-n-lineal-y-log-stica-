import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { ArrowRight, CheckCircle2, HelpCircle, Sparkles, TrendingUp, ShieldAlert, Cpu } from 'lucide-react';
import linearCardImg from '../assets/images/card_linear_regression_1790107547342.jpg';
import logisticCardImg from '../assets/images/card_logistic_regression_1790107557524.jpg';

interface ComparisonTabProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const ComparisonTab: React.FC<ComparisonTabProps> = ({ onNavigate }) => {
  const [linearImgErr, setLinearImgErr] = useState(false);
  const [logisticImgErr, setLogisticImgErr] = useState(false);

  // Interactive decision assistant state
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(0);

  const decisionScenarios = [
    {
      id: 0,
      title: 'Precio de un automóvil usado',
      description: 'Queremos calcular el valor estimado en euros según los kilómetros recorridos y el año de fabricación.',
      recommended: 'lineal',
      reason: 'El precio es una cantidad numérica continua (ej. 14.500 €, 14.520 €). No es un Sí o No.',
      targetLabel: 'Número continuo en euros',
    },
    {
      id: 1,
      title: 'Detección de Spam en Gmail',
      description: 'Queremos filtrar si un correo nuevo es correo no deseado (Spam) o correo legítimo (Bandeja de entrada).',
      recommended: 'logistica',
      reason: 'El resultado es una categoría binaria (1 = Spam, 0 = Legítimo), basándose en la probabilidad de que lo sea.',
      targetLabel: 'Clasificación binaria (Sí/No)',
    },
    {
      id: 2,
      title: 'Tiempo estimado de entrega (ETA)',
      description: 'Una app de delivery predice cuántos minutos tardará el repartidor en llegar a tu domicilio.',
      recommended: 'lineal',
      reason: 'El tiempo es una variable continua medida en minutos (ej. 23.4 min, 45.1 min).',
      targetLabel: 'Número continuo en minutos',
    },
    {
      id: 3,
      title: 'Aprobación de tarjeta de crédito',
      description: 'El banco evalúa si conceder la tarjeta (Aprobada) o denegarla (Rechazada) según el historial del solicitante.',
      recommended: 'logistica',
      reason: 'Es una decisión binaria de riesgo basada en la probabilidad de impago.',
      targetLabel: 'Decisión binaria (Aprobar / Denegar)',
    },
    {
      id: 4,
      title: 'Facturación mensual esperada',
      description: 'Una tienda online predice sus ingresos totales del mes que viene según el tráfico publicitario.',
      recommended: 'lineal',
      reason: 'El volumen de facturación es un número real continuo.',
      targetLabel: 'Monto numérico en ingresos',
    },
    {
      id: 5,
      title: 'Cancelación de clientes (Churn)',
      description: 'Predecir si un suscriptor de streaming cancelará su suscripción el próximo mes.',
      recommended: 'logistica',
      reason: 'Queremos estimar la probabilidad de deserción (0 a 100%) para lanzar ofertas de retención si supera un umbral.',
      targetLabel: 'Probabilidad de deserción (Sí/No)',
    },
  ];

  const comparisonRows = [
    {
      feature: 'Objetivo principal',
      linear: 'Predecir una magnitud numérica continua',
      logistic: 'Calcular una probabilidad y clasificar en categorías (ej. Sí / No)',
    },
    {
      feature: 'Tipo de variable de salida (Y)',
      linear: 'Continua (cualquier número en una escala infinita: precios, notas, kg)',
      logistic: 'Discreta / Categórica (usualmente 0 o 1, verdadero o falso)',
    },
    {
      feature: 'Forma geométrica',
      linear: 'Línea recta plana (o hiperplano en varias dimensiones)',
      logistic: 'Curva suave en forma de "S" (Función Sigmoide)',
    },
    {
      feature: 'Rango de valores posibles',
      linear: 'De -∞ a +∞ (sin límite superior ni inferior)',
      logistic: 'Estrictamente entre 0.0 y 1.0 (de 0% a 100%)',
    },
    {
      feature: 'Función matemática clave',
      linear: 'y = m·x + b (Ecuación lineal)',
      logistic: 'P = 1 / (1 + e^-(w·x + b)) (Ecuación Sigmoide)',
    },
    {
      feature: 'Métrica de evaluación típica',
      linear: 'MSE (Error Cuadrático Medio) y R² (Bondad de ajuste)',
      logistic: 'Exactitud (Accuracy), Matriz de Confusión, Precisión y Recall',
    },
    {
      feature: '¿Requiere Umbral de Decisión?',
      linear: 'No, el resultado numérico se lee directamente',
      logistic: 'Sí (ej. si Probabilidad ≥ 50% clasificar como 1, sino 0)',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Introduction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Linear Regression Card */}
        <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl overflow-hidden shadow-lg transition-all hover:border-cyan-500/60">
          <div className="h-44 sm:h-52 relative overflow-hidden bg-slate-950">
            {!linearImgErr ? (
              <img
                src={linearCardImg}
                alt="Gráfico de dispersión con línea de regresión lineal continua"
                referrerPolicy="no-referrer"
                onError={() => setLinearImgErr(true)}
                className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-cyan-950/20 text-cyan-400">
                <TrendingUp className="w-12 h-12" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-md bg-cyan-500 text-slate-950 text-xs font-bold tracking-wide uppercase">
                Para Cantidades
              </span>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-cyan-400">01.</span> Regresión Lineal
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Traza una <strong>línea recta</strong> para descubrir la tendencia entre variables y predecir un valor numérico exacto en cualquier punto del tiempo o espacio.
            </p>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 mb-6 text-xs text-slate-300 space-y-1.5">
              <div className="text-slate-400 font-medium">Pregunta que responde:</div>
              <div className="text-cyan-300 font-semibold italic text-sm">
                "¿Cuánto valdrá esto?" · "¿Qué cantidad numérica obtendré?"
              </div>
            </div>

            <div className="space-y-2 mb-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Predecir el precio de venta de una vivienda según sus m²</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Calcular los ingresos en ventas según presupuesto de marketing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Estimar el tiempo de trayecto en carretera según el tráfico</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('lineal')}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Abrir Laboratorio de Regresión Lineal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Logistic Regression Card */}
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-lg transition-all hover:border-emerald-500/60">
          <div className="h-44 sm:h-52 relative overflow-hidden bg-slate-950">
            {!logisticImgErr ? (
              <img
                src={logisticCardImg}
                alt="Curva sigmoide de regresión logística clasificando datos binarios"
                referrerPolicy="no-referrer"
                onError={() => setLogisticImgErr(true)}
                className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-emerald-950/20 text-emerald-400">
                <ShieldAlert className="w-12 h-12" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-md bg-emerald-500 text-slate-950 text-xs font-bold tracking-wide uppercase">
                Para Decisiones
              </span>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-emerald-400">02.</span> Regresión Logística
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Usa una <strong>curva suave en forma de "S"</strong> para calcular la probabilidad (de 0% a 100%) de que ocurra un evento binario y clasificarlo de forma tajante.
            </p>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 mb-6 text-xs text-slate-300 space-y-1.5">
              <div className="text-slate-400 font-medium">Pregunta que responde:</div>
              <div className="text-emerald-300 font-semibold italic text-sm">
                "¿Ocurrirá o no?" · "¿Es seguro o es fraude?" · "¿Pertenece al grupo A o B?"
              </div>
            </div>

            <div className="space-y-2 mb-6 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Diagnosticar si un paciente tiene una enfermedad (Sí/No)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Detectar transacciones sospechosas de fraude bancario</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Predecir si un estudiante aprobará o suspenderá la materia</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('logistica')}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Abrir Laboratorio de Regresión Logística</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Decision Assistant */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="max-w-3xl mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Asistente Interactivo de Decisión</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            ¿Cuál técnica deberías utilizar en tu problema?
          </h3>
          <p className="text-sm text-slate-400">
            Selecciona un caso de negocio para ver instantáneamente qué técnica corresponde y la justificación lógica.
          </p>
        </div>

        {/* Buttons of scenarios */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {decisionScenarios.map((sc, idx) => {
            const isSelected = selectedQuestion === idx;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedQuestion(idx)}
                className={`p-3 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-500 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="font-semibold line-clamp-1 mb-1">{sc.title}</div>
                <div className="text-[11px] text-slate-500 line-clamp-1">Caso #{idx + 1}</div>
              </button>
            );
          })}
        </div>

        {/* Selected scenario resolution */}
        {selectedQuestion !== null && (
          <div className="bg-slate-950 p-5 sm:p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Problema analizado:</span>
                <span className="text-xs font-bold text-white">{decisionScenarios[selectedQuestion].title}</span>
              </div>
              <p className="text-sm text-slate-300">
                {decisionScenarios[selectedQuestion].description}
              </p>
              <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="font-semibold text-slate-300">Por qué: </span>
                {decisionScenarios[selectedQuestion].reason}
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Técnica Recomendada</div>
              <div
                className={`text-base font-extrabold mb-1 ${
                  decisionScenarios[selectedQuestion].recommended === 'lineal'
                    ? 'text-cyan-400'
                    : 'text-emerald-400'
                }`}
              >
                {decisionScenarios[selectedQuestion].recommended === 'lineal'
                  ? 'Regresión Lineal'
                  : 'Regresión Logística'}
              </div>
              <div className="text-[11px] text-slate-400 mb-3">
                {decisionScenarios[selectedQuestion].targetLabel}
              </div>
              <button
                onClick={() => onNavigate(decisionScenarios[selectedQuestion].recommended as ActiveTab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  decisionScenarios[selectedQuestion].recommended === 'lineal'
                    ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                }`}
              >
                Ver en el Laboratorio
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Structured Comparison Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <h3 className="text-xl font-bold text-white mb-2">Cuadro Comparativo Exhaustivo</h3>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          Diferencias clave sintetizadas en un solo vistazo para profesionales y principiantes.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-semibold w-1/4">Característica</th>
                <th className="py-3 px-4 font-semibold text-cyan-400 w-3/8">Regresión Lineal</th>
                <th className="py-3 px-4 font-semibold text-emerald-400 w-3/8">Regresión Logística</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {comparisonRows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-400">{row.feature}</td>
                  <td className="py-3.5 px-4 text-slate-200">{row.linear}</td>
                  <td className="py-3.5 px-4 text-slate-200">{row.logistic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
