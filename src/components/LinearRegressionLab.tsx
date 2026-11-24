import React, { useState, useMemo, useRef } from 'react';
import { LINEAR_DATASETS } from '../data/datasets';
import { DataPoint, LinearDataset } from '../types';
import { calculateOLS, calculateMSE } from '../utils/math';
import { 
  RotateCcw, 
  Sparkles, 
  HelpCircle, 
  Sliders, 
  Plus, 
  Trash2, 
  Info, 
  Check, 
  Eye, 
  EyeOff,
  Calculator
} from 'lucide-react';

interface LinearRegressionLabProps {
  // Can receive external reset trigger if needed
}

export const LinearRegressionLab: React.FC<LinearRegressionLabProps> = () => {
  // Current active dataset
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('casas');
  const activeDatasetConfig = useMemo(() => {
    return LINEAR_DATASETS.find((d) => d.id === selectedDatasetId) || LINEAR_DATASETS[0];
  }, [selectedDatasetId]);

  // Points in memory (can be modified by user)
  const [points, setPoints] = useState<DataPoint[]>(activeDatasetConfig.points);

  // When dataset changes, sync points and predictor midpoint
  const handleDatasetChange = (dataset: LinearDataset) => {
    setSelectedDatasetId(dataset.id);
    setPoints(dataset.points);
    setPredictX(Math.round((dataset.xMin + dataset.xMax) / 2));
    setManualSlope(dataset.typicalSlope);
    setManualIntercept(dataset.typicalIntercept);
  };

  // Regression calculation from current points
  const ols = useMemo(() => calculateOLS(points), [points]);

  // Mode: 'auto' (fitted via OLS) or 'manual' (sliders)
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');

  // Manual slope & intercept
  const [manualSlope, setManualSlope] = useState<number>(activeDatasetConfig.typicalSlope);
  const [manualIntercept, setManualIntercept] = useState<number>(activeDatasetConfig.typicalIntercept);

  // Sync manual parameters when switching to manual or when dataset changes
  const setOptimalToManual = () => {
    setManualSlope(Number(ols.slope.toFixed(2)));
    setManualIntercept(Number(ols.intercept.toFixed(1)));
  };

  // Current active slope and intercept
  const currentSlope = mode === 'auto' ? ols.slope : manualSlope;
  const currentIntercept = mode === 'auto' ? ols.intercept : manualIntercept;

  // Manual MSE calculation
  const currentMetrics = useMemo(() => {
    if (mode === 'auto') {
      return { mse: ols.mse, r2: ols.r2 };
    }
    return calculateMSE(points, manualSlope, manualIntercept);
  }, [mode, ols, points, manualSlope, manualIntercept]);

  // Display options
  const [showResiduals, setShowResiduals] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  // Interactive Prediction Calculator X
  const [predictX, setPredictX] = useState<number>(
    Math.round((activeDatasetConfig.xMin + activeDatasetConfig.xMax) / 2)
  );

  const predictedY = currentSlope * predictX + currentIntercept;

  // Coordinate scales for SVG
  const width = 640;
  const height = 400;
  const padding = { top: 30, right: 30, bottom: 50, left: 60 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Dynamic bounds based on current points and dataset config
  const xMin = 0;
  const xMax = Math.max(activeDatasetConfig.xMax, ...points.map((p) => p.x * 1.1), predictX * 1.1);
  const yMin = 0;
  const yMax = Math.max(activeDatasetConfig.yMax, ...points.map((p) => p.y * 1.1), predictedY * 1.1);

  const scaleX = (x: number) => padding.left + (x / xMax) * plotWidth;
  const scaleY = (y: number) => height - padding.bottom - (y / yMax) * plotHeight;
  const unscaleX = (svgX: number) => Math.max(0, ((svgX - padding.left) / plotWidth) * xMax);
  const unscaleY = (svgY: number) => Math.max(0, ((height - padding.bottom - svgY) / plotHeight) * yMax);

  // SVG ref for click-to-add
  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if within plot boundaries
    if (
      clickX >= padding.left &&
      clickX <= width - padding.right &&
      clickY >= padding.top &&
      clickY <= height - padding.bottom
    ) {
      const realX = Math.round(unscaleX(clickX) * 10) / 10;
      const realY = Math.round(unscaleY(clickY) * 10) / 10;

      const newPoint: DataPoint = {
        id: `custom_${Date.now()}`,
        x: realX,
        y: realY,
        label: `Nuevo Dato (${realX}, ${realY})`,
      };
      setPoints((prev) => [...prev, newPoint]);
    }
  };

  const handleRemovePoint = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (points.length <= 2) return;
    setPoints((prev) => prev.filter((p) => p.id !== id));
  };

  const resetCurrentDataset = () => {
    setPoints(activeDatasetConfig.points);
    setMode('auto');
    setPredictX(Math.round((activeDatasetConfig.xMin + activeDatasetConfig.xMax) / 2));
  };

  // Compare manual score against optimal
  const manualAccuracyPercentage = useMemo(() => {
    if (ols.mse === 0) return 100;
    const ratio = ols.mse / (currentMetrics.mse || 1);
    return Math.min(100, Math.max(0, Math.round(ratio * 100)));
  }, [ols.mse, currentMetrics.mse]);

  return (
    <div className="space-y-8">
      {/* Header and Dataset Selectors */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <span>Laboratorio Interactivo</span>
            <span className="text-slate-600">·</span>
            <span>y = m · x + b</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Regresión Lineal: La Recta del Mejor Ajuste
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            {activeDatasetConfig.description}
          </p>
        </div>

        {/* Dataset pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
          {LINEAR_DATASETS.map((d) => (
            <button
              key={d.id}
              onClick={() => handleDatasetChange(d)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                selectedDatasetId === d.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              {d.name.split(' vs ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Sandbox: Two-zone split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Canvas */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col justify-between shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">Plano de Dispersión</span>
              <span className="text-xs text-slate-500">
                ({points.length} puntos observados · Haz clic en el plano para agregar)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResiduals(!showResiduals)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                  showResiduals
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="Muestra u oculta las líneas de distancia/error entre cada punto y la recta"
              >
                {showResiduals ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showResiduals ? 'Ocultar Errores' : 'Ver Errores (Residuos)'}</span>
              </button>

              <button
                onClick={resetCurrentDataset}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Reiniciar a los puntos iniciales del dataset"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Reiniciar Puntos</span>
              </button>
            </div>
          </div>

          {/* SVG Canvas Area */}
          <div className="relative w-full aspect-[16/10] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden cursor-crosshair select-none">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full"
              onClick={handleSvgClick}
            >
              <defs>
                {/* Subtle grid pattern */}
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                </pattern>
                {/* Glow filter */}
                <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid backdrop */}
              <rect x={padding.left} y={padding.top} width={plotWidth} height={plotHeight} fill="url(#grid)" />

              {/* Axes lines */}
              <line
                x1={padding.left}
                y1={height - padding.bottom}
                x2={width - padding.right}
                y2={height - padding.bottom}
                stroke="#475569"
                strokeWidth="1.5"
              />
              <line
                x1={padding.left}
                y1={padding.top}
                x2={padding.left}
                y2={height - padding.bottom}
                stroke="#475569"
                strokeWidth="1.5"
              />

              {/* Axis Ticks & Labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const xVal = Math.round(xMin + ratio * (xMax - xMin));
                const svgX = scaleX(xVal);
                const yVal = Math.round(yMin + ratio * (yMax - yMin));
                const svgY = scaleY(yVal);

                return (
                  <g key={`ticks_${ratio}`}>
                    {/* X tick */}
                    <line x1={svgX} y1={height - padding.bottom} x2={svgX} y2={height - padding.bottom + 5} stroke="#64748b" />
                    <text
                      x={svgX}
                      y={height - padding.bottom + 18}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="middle"
                      className="font-mono tabular-nums"
                    >
                      {xVal}
                    </text>

                    {/* Y tick */}
                    <line x1={padding.left - 5} y1={svgY} x2={padding.left} y2={svgY} stroke="#64748b" />
                    <text
                      x={padding.left - 10}
                      y={svgY + 3}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="end"
                      className="font-mono tabular-nums"
                    >
                      {yVal}
                    </text>
                  </g>
                );
              })}

              {/* Residuals (Error lines) */}
              {showResiduals &&
                points.map((p) => {
                  const yPredicted = currentSlope * p.x + currentIntercept;
                  const xSvg = scaleX(p.x);
                  const yActualSvg = scaleY(p.y);
                  const yPredSvg = scaleY(yPredicted);

                  return (
                    <line
                      key={`res_${p.id}`}
                      x1={xSvg}
                      y1={yActualSvg}
                      x2={xSvg}
                      y2={yPredSvg}
                      stroke="#f43f5e"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      opacity="0.8"
                    />
                  );
                })}

              {/* Regression Line */}
              {(() => {
                const x1 = 0;
                const y1 = currentIntercept;
                const x2 = xMax;
                const y2 = currentSlope * x2 + currentIntercept;

                return (
                  <line
                    x1={scaleX(x1)}
                    y1={scaleY(y1)}
                    x2={scaleX(x2)}
                    y2={scaleY(y2)}
                    stroke={mode === 'auto' ? '#22d3ee' : '#f59e0b'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    filter="url(#glow-cyan)"
                  />
                );
              })()}

              {/* Interactive Prediction Marker on Line */}
              {predictX >= 0 && (
                <g>
                  {/* Guide lines to axes */}
                  <line
                    x1={scaleX(predictX)}
                    y1={scaleY(predictedY)}
                    x2={scaleX(predictX)}
                    y2={height - padding.bottom}
                    stroke="#38bdf8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.7"
                  />
                  <line
                    x1={padding.left}
                    y1={scaleY(predictedY)}
                    x2={scaleX(predictX)}
                    y2={scaleY(predictedY)}
                    stroke="#38bdf8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.7"
                  />

                  {/* Marker Circle */}
                  <circle
                    cx={scaleX(predictX)}
                    cy={scaleY(predictedY)}
                    r="7"
                    fill="#38bdf8"
                    stroke="#0f172a"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                  <text
                    x={scaleX(predictX) + 10}
                    y={scaleY(predictedY) - 10}
                    fill="#38bdf8"
                    fontSize="11"
                    fontWeight="bold"
                    className="font-mono tabular-nums"
                  >
                    Predicción: {predictedY.toFixed(1)} {activeDatasetConfig.yUnit}
                  </text>
                </g>
              )}

              {/* Data Points */}
              {points.map((p) => {
                const cx = scaleX(p.x);
                const cy = scaleY(p.y);
                const isHovered = hoveredPoint?.id === p.id;

                return (
                  <g
                    key={p.id}
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePoint(p.id, e);
                    }}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 7 : 5}
                      fill={isHovered ? '#38bdf8' : '#06b6d4'}
                      stroke="#0f172a"
                      strokeWidth="2"
                      className="transition-all duration-150"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div className="absolute top-3 right-3 bg-slate-900/95 border border-slate-700 p-2.5 rounded-lg shadow-lg text-xs pointer-events-none z-20">
                <div className="font-semibold text-white">{hoveredPoint.label || 'Dato Observado'}</div>
                <div className="text-slate-300 font-mono tabular-nums mt-0.5">
                  X = {hoveredPoint.x} {activeDatasetConfig.xUnit} · Y = {hoveredPoint.y} {activeDatasetConfig.yUnit}
                </div>
                {activeDatasetConfig.yUnit === 'M COP' && (
                  <div className="text-[11px] text-cyan-300 font-mono tabular-nums mt-0.5">
                    Valor: ${Math.round(hoveredPoint.y * 1_000_000).toLocaleString('es-CO')} COP (~$
                    {Math.round((hoveredPoint.y * 1_000_000) / Math.max(1, hoveredPoint.x)).toLocaleString('es-CO')}/m²)
                  </div>
                )}
                <div className="text-[10px] text-rose-400 mt-1">
                  Residuo / Error: {(hoveredPoint.y - (currentSlope * hoveredPoint.x + currentIntercept)).toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">(Haz clic sobre el punto para eliminarlo)</div>
              </div>
            )}
          </div>

          {/* Canvas Footnote / Axis labels */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-300">Eje X: </span>
              {activeDatasetConfig.xLabel} ({activeDatasetConfig.xUnit})
            </div>
            <div>
              <span className="font-semibold text-slate-300">Eje Y: </span>
              {activeDatasetConfig.yLabel} ({activeDatasetConfig.yUnit})
            </div>
          </div>
        </div>

        {/* Right: Control Deck & Real-time Metrics */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mode Switcher */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Modo de Ajuste
              </span>
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
                <button
                  onClick={() => setMode('auto')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    mode === 'auto'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Automático
                </button>
                <button
                  onClick={() => {
                    setMode('manual');
                    setOptimalToManual();
                  }}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    mode === 'manual'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Manual (Juego)
                </button>
              </div>
            </div>

            {/* Current Math Equation */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center mb-4">
              <div className="text-[11px] text-slate-400 mb-1">Ecuación de la Recta Calculada</div>
              <div className="text-lg font-bold text-white font-mono">
                y = <span className="text-cyan-400">{currentSlope.toFixed(2)}</span> · x +{' '}
                <span className="text-amber-400">{currentIntercept.toFixed(1)}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {activeDatasetConfig.interpretation}
              </div>
            </div>

            {/* Controls depending on mode */}
            {mode === 'manual' ? (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Pendiente (m):</span>
                  <span className="text-cyan-400 font-mono font-bold">{manualSlope.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="10"
                  step="0.05"
                  value={manualSlope}
                  onChange={(e) => setManualSlope(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Intercepto base (b):</span>
                  <span className="text-amber-400 font-mono font-bold">{manualIntercept.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={activeDatasetConfig.yMax * 0.8}
                  step="1"
                  value={manualIntercept}
                  onChange={(e) => setManualIntercept(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Precisión vs Óptimo:</span>
                  <span
                    className={`font-bold font-mono ${
                      manualAccuracyPercentage >= 90
                        ? 'text-emerald-400'
                        : manualAccuracyPercentage >= 70
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {manualAccuracyPercentage}%{' '}
                    {manualAccuracyPercentage >= 95 ? '¡Excelente!' : manualAccuracyPercentage >= 80 ? 'Cerca' : 'Ajusta más'}
                  </span>
                </div>

                <button
                  onClick={setOptimalToManual}
                  className="w-full py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Copiar Valores Óptimos Automáticos
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Método matemático:</span>
                  <span className="font-semibold text-cyan-300">Mínimos Cuadrados (OLS)</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  El algoritmo calcula de forma analítica exacta la única recta que minimiza la suma de todos los errores al cuadrado (las líneas rojas discontinuas).
                </p>
              </div>
            )}
          </div>

          {/* Model Quality Metrics */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Métricas Clave de Calidad
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 mb-1">R² (Bondad de ajuste)</div>
                <div className="text-xl font-extrabold text-cyan-400 font-mono tabular-nums">
                  {(currentMetrics.r2 * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Explica el {(currentMetrics.r2 * 100).toFixed(0)}% de la variación
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400 mb-1">MSE (Error Cuadrático)</div>
                <div className="text-xl font-extrabold text-rose-400 font-mono tabular-nums">
                  {currentMetrics.mse.toFixed(1)}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Menor es mejor (0 = perfecto)
                </div>
              </div>
            </div>

            {/* Explanation box */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">¿Por qué error al cuadrado? </span>
              Elevar al cuadrado evita que los errores hacia arriba (+5) se cancelen con los errores hacia abajo (-5) y castiga con mucha más severidad las predicciones que se alejan demasiado de la realidad.
            </div>
          </div>

          {/* Interactive Predictor Widget */}
          <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Simulador de Predicción en Vivo
              </h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Si {activeDatasetConfig.xLabel} es:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {predictX} {activeDatasetConfig.xUnit}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.round(xMax)}
                step={1}
                value={predictX}
                onChange={(e) => setPredictX(parseInt(e.target.value) || 0)}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400 mb-0.5">La Recta proyecta:</div>
              <div className="text-2xl font-black text-cyan-300 font-mono tabular-nums">
                {predictedY.toFixed(1)} <span className="text-sm font-medium">{activeDatasetConfig.yUnit}</span>
              </div>
              {activeDatasetConfig.yUnit === 'M COP' && (
                <div className="text-xs text-emerald-300 font-mono tabular-nums mt-1">
                  ≈ ${Math.round(Math.max(0, predictedY) * 1_000_000).toLocaleString('es-CO')} COP
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
