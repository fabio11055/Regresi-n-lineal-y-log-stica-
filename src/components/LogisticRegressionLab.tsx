import React, { useState, useMemo, useRef } from 'react';
import { LOGISTIC_DATASETS } from '../data/datasets';
import { LogisticDataPoint, LogisticDataset } from '../types';
import { 
  sigmoid, 
  predictLogistic, 
  calculateConfusionMatrix, 
  fitLogisticRegression,
  calculateLogLoss
} from '../utils/math';
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
  AlertTriangle,
  Binary,
  CheckCircle2,
  XCircle,
  Calculator
} from 'lucide-react';

interface LogisticRegressionLabProps {}

export const LogisticRegressionLab: React.FC<LogisticRegressionLabProps> = () => {
  // Current active dataset
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('examen_aprobado');
  const activeDatasetConfig = useMemo(() => {
    return LOGISTIC_DATASETS.find((d) => d.id === selectedDatasetId) || LOGISTIC_DATASETS[0];
  }, [selectedDatasetId]);

  // Points in memory
  const [points, setPoints] = useState<LogisticDataPoint[]>(activeDatasetConfig.points);

  const handleDatasetChange = (dataset: LogisticDataset) => {
    setSelectedDatasetId(dataset.id);
    setPoints(dataset.points);
    setThreshold(0.5);
  };

  // Fitted model parameters (weight & bias)
  const fittedParams = useMemo(() => {
    return fitLogisticRegression(points, activeDatasetConfig.xMin, activeDatasetConfig.xMax);
  }, [points, activeDatasetConfig.xMin, activeDatasetConfig.xMax]);

  // Mode: 'auto' or 'manual'
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [manualWeight, setManualWeight] = useState<number>(activeDatasetConfig.typicalWeight);
  const [manualBias, setManualBias] = useState<number>(activeDatasetConfig.typicalBias);

  // Active parameters
  const currentWeight = mode === 'auto' ? fittedParams.weight : manualWeight;
  const currentBias = mode === 'auto' ? fittedParams.bias : manualBias;

  // Decision Threshold (0.1 to 0.9)
  const [threshold, setThreshold] = useState<number>(0.5);

  // Toggle "What if we used a straight line?"
  const [showStraightLineFailure, setShowStraightLineFailure] = useState<boolean>(false);

  // Confusion matrix & metrics
  const confusion = useMemo(() => {
    return calculateConfusionMatrix(points, currentWeight, currentBias, threshold);
  }, [points, currentWeight, currentBias, threshold]);

  const logLoss = useMemo(() => {
    return calculateLogLoss(points, currentWeight, currentBias);
  }, [points, currentWeight, currentBias]);

  // Interactive Predictor X
  const [predictX, setPredictX] = useState<number>(
    Math.round((activeDatasetConfig.xMin + activeDatasetConfig.xMax) / 2)
  );

  const predictedProb = predictLogistic(predictX, currentWeight, currentBias);
  const predictedClass = predictedProb >= threshold ? 1 : 0;

  // Coordinate scales for SVG
  const width = 640;
  const height = 400;
  const padding = { top: 30, right: 30, bottom: 50, left: 60 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const xMin = activeDatasetConfig.xMin;
  const xMax = activeDatasetConfig.xMax;

  const scaleX = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth;
  const scaleY = (p: number) => height - padding.bottom - p * plotHeight;
  const unscaleX = (svgX: number) => xMin + ((svgX - padding.left) / plotWidth) * (xMax - xMin);

  // X boundary where probability equals threshold: sigmoid(w*x + b) = threshold => w*x + b = ln(t / (1 - t))
  const decisionBoundaryX = useMemo(() => {
    if (Math.abs(currentWeight) < 1e-6) return null;
    const logit = Math.log(threshold / (1 - threshold));
    const xBoundary = (logit - currentBias) / currentWeight;
    return xBoundary;
  }, [threshold, currentBias, currentWeight]);

  // SVG ref for click to add point
  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (
      clickX >= padding.left &&
      clickX <= width - padding.right &&
      clickY >= padding.top &&
      clickY <= height - padding.bottom
    ) {
      const realX = Math.round(unscaleX(clickX));
      // Snap to 0 or 1 based on vertical position
      const realY: 0 | 1 = clickY < height / 2 ? 1 : 0;

      const newPoint: LogisticDataPoint = {
        id: `custom_log_${Date.now()}`,
        x: realX,
        y: realY,
        label: `Dato manual (${realX}, ${realY === 1 ? activeDatasetConfig.yLabel1 : activeDatasetConfig.yLabel0})`,
      };
      setPoints((prev) => [...prev, newPoint]);
    }
  };

  const handleRemovePoint = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (points.length <= 3) return;
    setPoints((prev) => prev.filter((p) => p.id !== id));
  };

  const resetCurrentDataset = () => {
    setPoints(activeDatasetConfig.points);
    setMode('auto');
    setThreshold(0.5);
    setPredictX(Math.round((activeDatasetConfig.xMin + activeDatasetConfig.xMax) / 2));
  };

  // Generate smooth SVG path for the Sigmoid curve
  const sigmoidPathD = useMemo(() => {
    const steps = 100;
    let path = '';
    for (let i = 0; i <= steps; i++) {
      const xVal = xMin + (i / steps) * (xMax - xMin);
      const prob = predictLogistic(xVal, currentWeight, currentBias);
      const svgX = scaleX(xVal);
      const svgY = scaleY(prob);
      if (i === 0) path += `M ${svgX} ${svgY}`;
      else path += ` L ${svgX} ${svgY}`;
    }
    return path;
  }, [xMin, xMax, currentWeight, currentBias]);

  // Generate straight line for comparison
  const straightLinePathD = useMemo(() => {
    // Rough linear regression on binary labels to demonstrate bad fit
    const p1X = xMin;
    const p1Prob = -0.2; // Illustrates negative probability!
    const p2X = xMax;
    const p2Prob = 1.25; // Illustrates probability > 100%!

    return `M ${scaleX(p1X)} ${scaleY(p1Prob)} L ${scaleX(p2X)} ${scaleY(p2Prob)}`;
  }, [xMin, xMax]);

  return (
    <div className="space-y-8">
      {/* Header and Dataset Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <span>Laboratorio Interactivo</span>
            <span className="text-slate-600">·</span>
            <span>Clasificación Binaria y Curva Sigmoide</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Regresión Logística: Prediciendo Probabilidades
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            {activeDatasetConfig.description}
          </p>
        </div>

        {/* Dataset pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
          {LOGISTIC_DATASETS.map((d) => (
            <button
              key={d.id}
              onClick={() => handleDatasetChange(d)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                selectedDatasetId === d.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              {d.name.split(' vs ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive SVG Sigmoid Canvas */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col justify-between shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">Curva Sigmoide & Observaciones</span>
              <span className="text-xs text-slate-500">
                (Haz clic arriba para agregar caso 1, o abajo para caso 0)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStraightLineFailure(!showStraightLineFailure)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                  showStraightLineFailure
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="Muestra por qué una recta normal falla en clasificación binaria"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>¿Por qué no una línea recta?</span>
              </button>

              <button
                onClick={resetCurrentDataset}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reiniciar</span>
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
                <pattern id="grid-log" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                </pattern>
                <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid */}
              <rect x={padding.left} y={padding.top} width={plotWidth} height={plotHeight} fill="url(#grid-log)" />

              {/* Category Bands: Top (1) and Bottom (0) */}
              <rect
                x={padding.left}
                y={scaleY(1) - 15}
                width={plotWidth}
                height={30}
                fill="#059669"
                fillOpacity="0.08"
              />
              <rect
                x={padding.left}
                y={scaleY(0) - 15}
                width={plotWidth}
                height={30}
                fill="#64748b"
                fillOpacity="0.08"
              />

              {/* Threshold horizontal line */}
              <line
                x1={padding.left}
                y1={scaleY(threshold)}
                x2={width - padding.right}
                y2={scaleY(threshold)}
                stroke="#eab308"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.9"
              />
              <text
                x={width - padding.right - 5}
                y={scaleY(threshold) - 6}
                fill="#eab308"
                fontSize="10"
                fontWeight="bold"
                textAnchor="end"
                className="font-mono tabular-nums"
              >
                Umbral: {(threshold * 100).toFixed(0)}%
              </text>

              {/* Decision Boundary vertical line */}
              {decisionBoundaryX !== null && decisionBoundaryX >= xMin && decisionBoundaryX <= xMax && (
                <g>
                  <line
                    x1={scaleX(decisionBoundaryX)}
                    y1={padding.top}
                    x2={scaleX(decisionBoundaryX)}
                    y2={height - padding.bottom}
                    stroke="#eab308"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.6"
                  />
                  <text
                    x={scaleX(decisionBoundaryX) + 4}
                    y={height - padding.bottom - 8}
                    fill="#eab308"
                    fontSize="9"
                    className="font-mono"
                  >
                    Frontera X: {decisionBoundaryX.toFixed(1)}
                  </text>
                </g>
              )}

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

              {/* Axis Ticks (Y is probability 0% to 100%) */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((prob) => {
                const ySvg = scaleY(prob);
                return (
                  <g key={`y_prob_${prob}`}>
                    <line x1={padding.left - 5} y1={ySvg} x2={padding.left} y2={ySvg} stroke="#64748b" />
                    <text
                      x={padding.left - 10}
                      y={ySvg + 3}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="end"
                      className="font-mono tabular-nums"
                    >
                      {(prob * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })}

              {/* Axis Ticks (X feature) */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
                const xVal = Math.round(xMin + ratio * (xMax - xMin));
                const xSvg = scaleX(xVal);
                return (
                  <g key={`x_tick_${ratio}`}>
                    <line x1={xSvg} y1={height - padding.bottom} x2={xSvg} y2={height - padding.bottom + 5} stroke="#64748b" />
                    <text
                      x={xSvg}
                      y={height - padding.bottom + 18}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="middle"
                      className="font-mono tabular-nums"
                    >
                      {xVal}
                    </text>
                  </g>
                );
              })}

              {/* Straight line failure demonstration */}
              {showStraightLineFailure && (
                <g>
                  <path
                    d={straightLinePathD}
                    stroke="#f43f5e"
                    strokeWidth="2.5"
                    strokeDasharray="6 3"
                    opacity="0.8"
                  />
                  <text
                    x={scaleX(xMin + 2)}
                    y={scaleY(-0.1)}
                    fill="#f43f5e"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    ¡Error! Probabilidad negativa (-20%)
                  </text>
                  <text
                    x={scaleX(xMax - 5)}
                    y={scaleY(1.15)}
                    fill="#f43f5e"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    ¡Error! Probabilidad mayor a 100% (125%)
                  </text>
                </g>
              )}

              {/* The Sigmoid Curve */}
              <path
                d={sigmoidPathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
                filter="url(#glow-emerald)"
              />

              {/* Interactive Predictor Marker on Sigmoid */}
              {predictX >= xMin && predictX <= xMax && (
                <g>
                  {/* Vertical guideline */}
                  <line
                    x1={scaleX(predictX)}
                    y1={height - padding.bottom}
                    x2={scaleX(predictX)}
                    y2={scaleY(predictedProb)}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    opacity="0.8"
                  />
                  {/* Horizontal guideline */}
                  <line
                    x1={padding.left}
                    y1={scaleY(predictedProb)}
                    x2={scaleX(predictX)}
                    y2={scaleY(predictedProb)}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    opacity="0.8"
                  />
                  {/* Marker Dot */}
                  <circle
                    cx={scaleX(predictX)}
                    cy={scaleY(predictedProb)}
                    r="8"
                    fill={predictedProb >= threshold ? '#10b981' : '#f59e0b'}
                    stroke="#0f172a"
                    strokeWidth="2.5"
                    className="animate-pulse"
                  />
                  <text
                    x={scaleX(predictX) + 10}
                    y={scaleY(predictedProb) - 8}
                    fill="#10b981"
                    fontSize="11"
                    fontWeight="bold"
                    className="font-mono tabular-nums"
                  >
                    P: {(predictedProb * 100).toFixed(1)}% ({predictedClass === 1 ? 'Clase 1' : 'Clase 0'})
                  </text>
                </g>
              )}

              {/* Data Points */}
              {points.map((p) => {
                const cx = scaleX(p.x);
                const cy = scaleY(p.y);
                const pProb = predictLogistic(p.x, currentWeight, currentBias);
                const isCorrect = (pProb >= threshold ? 1 : 0) === p.y;

                return (
                  <g
                    key={p.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePoint(p.id, e);
                    }}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill={p.y === 1 ? '#10b981' : '#64748b'}
                      stroke={isCorrect ? '#0f172a' : '#f43f5e'}
                      strokeWidth={isCorrect ? 2 : 2.5}
                      className="transition-transform group-hover:scale-125"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Canvas Category Labels */}
          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Categoría 1: {activeDatasetConfig.yLabel1}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block"></span>
              <span>Categoría 0: {activeDatasetConfig.yLabel0}</span>
            </div>
          </div>
        </div>

        {/* Right: Decision Threshold Slider, Confusion Matrix & Metrics */}
        <div className="lg:col-span-4 space-y-6">
          {/* Threshold Controller Card */}
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Umbral de Decisión (Threshold)
                </h3>
              </div>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {(threshold * 100).toFixed(0)}%
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Si la probabilidad calculada por la curva supera este umbral, el sistema clasifica el caso como <strong>1 ({activeDatasetConfig.yLabel1})</strong>; de lo contrario, como <strong>0</strong>.
            </p>

            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-slate-500">
              <span>0.1 (Muy tolerante)</span>
              <span>0.5 (Estándar)</span>
              <span>0.9 (Muy estricto)</span>
            </div>
          </div>

          {/* Interactive Confusion Matrix */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Matriz de Confusión
              </h3>
              <span className="text-[11px] text-slate-400">Total: {points.length} muestras</span>
            </div>

            {/* 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              {/* True Positive */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl">
                <div className="text-[10px] text-emerald-400 uppercase font-semibold">Verdadero Positivo</div>
                <div className="text-xl font-extrabold text-white font-mono my-0.5">{confusion.tp}</div>
                <div className="text-[10px] text-slate-400">Predijo 1 y era 1 (Acierto)</div>
              </div>

              {/* False Positive */}
              <div className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-xl">
                <div className="text-[10px] text-rose-400 uppercase font-semibold">Falso Positivo</div>
                <div className="text-xl font-extrabold text-white font-mono my-0.5">{confusion.fp}</div>
                <div className="text-[10px] text-slate-400">Predijo 1 y era 0 (Falsa Alarma)</div>
              </div>

              {/* False Negative */}
              <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-xl">
                <div className="text-[10px] text-amber-400 uppercase font-semibold">Falso Negativo</div>
                <div className="text-xl font-extrabold text-white font-mono my-0.5">{confusion.fn}</div>
                <div className="text-[10px] text-slate-400">Predijo 0 y era 1 (Omisión)</div>
              </div>

              {/* True Negative */}
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Verdadero Negativo</div>
                <div className="text-xl font-extrabold text-white font-mono my-0.5">{confusion.tn}</div>
                <div className="text-[10px] text-slate-400">Predijo 0 y era 0 (Acierto)</div>
              </div>
            </div>

            {/* Classification Summary Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Exactitud</div>
                <div className="text-sm font-bold text-white font-mono tabular-nums">
                  {(confusion.accuracy * 100).toFixed(0)}%
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Sensibilidad</div>
                <div className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
                  {(confusion.recall * 100).toFixed(0)}%
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Precisión</div>
                <div className="text-sm font-bold text-cyan-400 font-mono tabular-nums">
                  {(confusion.precision * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Diagnostic Predictor Widget */}
          <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Simulador de Diagnóstico / Decisión
              </h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Si {activeDatasetConfig.xLabel} es:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {predictX} {activeDatasetConfig.xUnit}
                </span>
              </div>
              <input
                type="range"
                min={xMin}
                max={xMax}
                step={1}
                value={predictX}
                onChange={(e) => setPredictX(parseInt(e.target.value) || xMin)}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
              <div className="text-[11px] text-slate-400">Probabilidad Estimada por la Curva:</div>
              <div className="text-2xl font-black text-emerald-300 font-mono tabular-nums">
                {(predictedProb * 100).toFixed(1)}%
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-center gap-2 text-xs font-semibold">
                <span>Veredicto:</span>
                {predictedClass === 1 ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> {activeDatasetConfig.yLabel1}
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1 font-bold">
                    <XCircle className="w-4 h-4" /> {activeDatasetConfig.yLabel0}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
