import React, { useState } from 'react';
import { 
  DollarSign, 
  Car, 
  ShieldAlert, 
  Users, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertOctagon,
  Sparkles
} from 'lucide-react';

export const RealWorldScenarios: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<number>(0);

  // Scenario 1: Ads vs Sales (Linear)
  const [adBudget, setAdBudget] = useState<number>(12000);
  const estimatedSales = 8500 + adBudget * 3.4; // Base 8.5k + 3.4x return
  const estimatedROI = ((estimatedSales - adBudget) / adBudget) * 100;

  // Scenario 2: Car Depreciation (Linear with negative slope)
  const [carAge, setCarAge] = useState<number>(4);
  const initialCarPrice = 32000;
  const estimatedCarValue = Math.max(2500, initialCarPrice - carAge * 3100);

  // Scenario 3: Bank Fraud Detection (Logistic)
  const [txAmount, setTxAmount] = useState<number>(1200);
  const [isForeignLocation, setIsForeignLocation] = useState<boolean>(true);
  // Fraud score logit
  const fraudLogit = -3.8 + (txAmount / 350) + (isForeignLocation ? 2.5 : 0);
  const fraudProbability = 1 / (1 + Math.exp(-fraudLogit));
  const fraudThreshold = 0.35; // Strict 35% threshold for bank security
  const isFraudAlert = fraudProbability >= fraudThreshold;

  // Scenario 4: Customer Churn (Logistic)
  const [supportTickets, setSupportTickets] = useState<number>(3);
  const [daysInactive, setDaysInactive] = useState<number>(14);
  const churnLogit = -2.5 + supportTickets * 0.7 + (daysInactive / 10) * 0.9;
  const churnProbability = 1 / (1 + Math.exp(-churnLogit));
  const isHighChurnRisk = churnProbability >= 0.5;

  const scenarios = [
    {
      id: 0,
      title: 'Inversión en Publicidad vs Ventas',
      technique: 'Regresión Lineal',
      type: 'lineal',
      icon: <DollarSign className="w-4 h-4 text-cyan-400" />,
      tag: 'E-commerce & Marketing',
    },
    {
      id: 1,
      title: 'Depreciación de un Coche por Edad',
      technique: 'Regresión Lineal (Pendiente Negativa)',
      type: 'lineal',
      icon: <Car className="w-4 h-4 text-cyan-400" />,
      tag: 'Automoción & Seguros',
    },
    {
      id: 2,
      title: 'Alerta de Fraude en Tarjetas',
      technique: 'Regresión Logística',
      type: 'logistica',
      icon: <ShieldAlert className="w-4 h-4 text-emerald-400" />,
      tag: 'Banca & Ciberseguridad',
    },
    {
      id: 3,
      title: 'Deserción de Clientes (Churn)',
      technique: 'Regresión Logística',
      type: 'logistica',
      icon: <Users className="w-4 h-4 text-emerald-400" />,
      tag: 'SaaS & Telecomunicaciones',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900/60 p-5 sm:p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Simulador de Negocio y Mundo Real</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Casos de Aplicación en la Industria
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Observa cómo las empresas globales utilizan a diario la regresión lineal y logística para optimizar presupuestos, prevenir estafas y retener usuarios.
        </p>

        {/* Tab buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-6">
          {scenarios.map((sc) => {
            const isSelected = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setActiveScenario(sc.id)}
                className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? sc.type === 'lineal'
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-md text-white'
                      : 'bg-emerald-950/40 border-emerald-500 shadow-md text-white'
                    : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-1 rounded-md bg-slate-900 border border-slate-800">{sc.icon}</div>
                  <span className="text-[10px] text-slate-500">{sc.tag}</span>
                </div>
                <div className="font-bold text-xs line-clamp-1">{sc.title}</div>
                <div
                  className={`text-[10px] mt-0.5 font-medium ${
                    sc.type === 'lineal' ? 'text-cyan-400' : 'text-emerald-400'
                  }`}
                >
                  {sc.technique}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenario Sandbox Content */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        {/* Scenario 0: Ads vs Sales */}
        {activeScenario === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <span>Caso 01 · Regresión Lineal Continua</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Optimización de Presupuesto Publicitario
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Una tienda de comercio electrónico desea saber con exactitud cuánto ingresará en ventas si aumenta su gasto en Google Ads. La regresión lineal modela la relación continua: por cada 1.000 € extra en anuncios, las ventas se incrementan linealmente en 3.400 €.
              </p>

              {/* Interactive control */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 font-medium">Inversión Publicitaria Mensual:</span>
                  <span className="font-mono font-bold text-cyan-400 text-base">
                    {adBudget.toLocaleString('es-ES')} €
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={50000}
                  step={1000}
                  value={adBudget}
                  onChange={(e) => setAdBudget(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>1.000 € (Mínimo)</span>
                  <span>25.000 € (Medio)</span>
                  <span>50.000 € (Campaña masiva)</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Ecuación del modelo: Ventas = 8.500 € (Ventas orgánicas base) + 3,4 · (Inversión en Ads)</span>
              </div>
            </div>

            {/* Results card */}
            <div className="lg:col-span-5 bg-slate-950 border border-cyan-500/30 p-6 rounded-2xl space-y-5 text-center shadow-lg">
              <div className="text-xs text-slate-400 uppercase font-semibold">Proyección del Algoritmo Lineal</div>

              <div>
                <div className="text-3xl sm:text-4xl font-black text-white font-mono tabular-nums">
                  {Math.round(estimatedSales).toLocaleString('es-ES')} €
                </div>
                <div className="text-xs text-cyan-400 mt-1">Facturación total estimada este mes</div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-left">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Beneficio Neto Ads</div>
                  <div className="text-base font-bold text-emerald-400 font-mono">
                    {Math.round(estimatedSales - adBudget).toLocaleString('es-ES')} €
                  </div>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Retorno estimado (ROI)</div>
                  <div className="text-base font-bold text-cyan-400 font-mono">
                    +{estimatedROI.toFixed(0)}%
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                "La regresión lineal entrega un número exacto para planificar la compra de inventario y stock logístico."
              </p>
            </div>
          </div>
        )}

        {/* Scenario 1: Car Depreciation */}
        {activeScenario === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <span>Caso 02 · Regresión Lineal con Pendiente Negativa (m &lt; 0)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Depreciación del Valor de un Vehículo
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                ¡Las rectas no solo suben! Cuando una variable disminuye al aumentar la otra, la pendiente es <strong>negativa</strong>. Una tasadora de seguros calcula cómo pierde valor un coche de 32.000 € por cada año de antigüedad.
              </p>

              {/* Interactive control */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 font-medium">Antigüedad del vehículo:</span>
                  <span className="font-mono font-bold text-cyan-400 text-base">
                    {carAge} {carAge === 1 ? 'año' : 'años'}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={carAge}
                  onChange={(e) => setCarAge(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>0 años (Nuevo de concesionario)</span>
                  <span>5 años (Uso medio)</span>
                  <span>10 años (Veterano)</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Ecuación: Valor = 32.000 € - 3.100 € · (Años). Pendiente negativa: m = -3.100 €/año</span>
              </div>
            </div>

            {/* Results card */}
            <div className="lg:col-span-5 bg-slate-950 border border-cyan-500/30 p-6 rounded-2xl space-y-5 text-center shadow-lg">
              <div className="text-xs text-slate-400 uppercase font-semibold">Tasación Oficial de Mercado</div>

              <div>
                <div className="text-3xl sm:text-4xl font-black text-white font-mono tabular-nums">
                  {estimatedCarValue.toLocaleString('es-ES')} €
                </div>
                <div className="text-xs text-slate-400 mt-1">Valor tasado actual de reventa</div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-left">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Depreciación acumulada</div>
                  <div className="text-base font-bold text-rose-400 font-mono">
                    -{(initialCarPrice - estimatedCarValue).toLocaleString('es-ES')} €
                  </div>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Retención del valor</div>
                  <div className="text-base font-bold text-cyan-400 font-mono">
                    {((estimatedCarValue / initialCarPrice) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                "La recta desciende uniformemente año a año hasta acercarse al valor residual de chatarra/desguace."
              </p>
            </div>
          </div>
        )}

        {/* Scenario 2: Bank Fraud Detection */}
        {activeScenario === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <span>Caso 03 · Regresión Logística y Seguridad Bancaria</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Detección de Fraude en Tiempo Real
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Cuando pagas con tarjeta, un modelo de regresión logística calcula en milisegundos la probabilidad de que la operación sea fraudulenta. Si la probabilidad supera el umbral bancario (35%), el pago se bloquea preventivamente.
              </p>

              {/* Controls */}
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 font-medium">Importe de la Transacción:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {txAmount.toLocaleString('es-ES')} €
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={5000}
                    step={20}
                    value={txAmount}
                    onChange={(e) => setTxAmount(parseInt(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>20 € (Café o compra habitual)</span>
                    <span>2.500 € (Gasto alto)</span>
                    <span>5.000 € (Atípico)</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="text-xs">
                    <div className="font-semibold text-white">Ubicación Geográfica Sospechosa</div>
                    <div className="text-slate-400">¿El cobro proviene de un país extranjero no habitual?</div>
                  </div>
                  <button
                    onClick={() => setIsForeignLocation(!isForeignLocation)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      isForeignLocation
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    {isForeignLocation ? 'Sí (Extranjero)' : 'No (País habitual)'}
                  </button>
                </div>
              </div>
            </div>

            {/* Results card */}
            <div
              className={`lg:col-span-5 p-6 rounded-2xl border space-y-5 text-center shadow-lg transition-colors ${
                isFraudAlert
                  ? 'bg-rose-950/40 border-rose-500/50'
                  : 'bg-emerald-950/30 border-emerald-500/40'
              }`}
            >
              <div className="text-xs uppercase font-semibold text-slate-400">
                Resultado del Algoritmo Logístico
              </div>

              <div>
                <div
                  className={`text-4xl sm:text-5xl font-black font-mono tabular-nums ${
                    isFraudAlert ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {(fraudProbability * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-slate-300 mt-1">Probabilidad de Fraude calculada</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-center gap-2">
                {isFraudAlert ? (
                  <>
                    <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
                    <span className="font-bold text-rose-300">
                      TRANSACCIÓN BLOQUEADA (Supera umbral del 35%)
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="font-bold text-emerald-300">
                      TRANSACCIÓN APROBADA (Riesgo bajo seguro)
                    </span>
                  </>
                )}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isFraudAlert
                  ? 'El banco envía un SMS al titular para verificar su identidad antes de permitir el cargo.'
                  : 'La transacción se procesa instantáneamente sin fricción para el usuario legítimo.'}
              </p>
            </div>
          </div>
        )}

        {/* Scenario 3: Customer Churn */}
        {activeScenario === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <span>Caso 04 · Regresión Logística y Retención de Usuarios (Churn)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Predicción de Cancelación de Suscripciones
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Empresas como Spotify, Netflix o empresas de telefonía analizan el comportamiento del usuario para predecir si cancelará su servicio el próximo mes. Esto permite ofrecerle un descuento proactivo antes de que se marche.
              </p>

              {/* Controls */}
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 font-medium">Reclamaciones a Soporte en 30 días:</span>
                    <span className="font-mono font-bold text-emerald-400">{supportTickets} tickets</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={6}
                    step={1}
                    value={supportTickets}
                    onChange={(e) => setSupportTickets(parseInt(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 font-medium">Días consecutivos sin usar la app:</span>
                    <span className="font-mono font-bold text-emerald-400">{daysInactive} días</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={30}
                    step={1}
                    value={daysInactive}
                    onChange={(e) => setDaysInactive(parseInt(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Results card */}
            <div
              className={`lg:col-span-5 p-6 rounded-2xl border space-y-5 text-center shadow-lg transition-colors ${
                isHighChurnRisk
                  ? 'bg-amber-950/40 border-amber-500/50'
                  : 'bg-emerald-950/30 border-emerald-500/40'
              }`}
            >
              <div className="text-xs uppercase font-semibold text-slate-400">
                Riesgo de Deserción del Cliente
              </div>

              <div>
                <div
                  className={`text-4xl sm:text-5xl font-black font-mono tabular-nums ${
                    isHighChurnRisk ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {(churnProbability * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-slate-300 mt-1">Probabilidad de baja el próximo mes</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-center gap-2">
                {isHighChurnRisk ? (
                  <>
                    <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0" />
                    <span className="font-bold text-amber-300">
                      CLIENTE EN RIESGO CRÍTICO → Activar plan de fidelización
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="font-bold text-emerald-300">
                      CLIENTE SATISFECHO / COMPROMETIDO
                    </span>
                  </>
                )}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isHighChurnRisk
                  ? 'El CRM dispara automáticamente un email con un 30% de descuento o una llamada prioritaria del equipo de éxito del cliente.'
                  : 'El cliente muestra alta interacción y bajo índice de fricción en la plataforma.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
