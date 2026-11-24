export type ActiveTab = 'comparativa' | 'lineal' | 'logistica' | 'casos' | 'quiz';

export interface DataPoint {
  id: string;
  x: number;
  y: number;
  label?: string;
}

export interface LinearDataset {
  id: string;
  name: string;
  description: string;
  xLabel: string;
  yLabel: string;
  xUnit: string;
  yUnit: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  points: DataPoint[];
  typicalSlope: number;
  typicalIntercept: number;
  interpretation: string;
}

export interface LogisticDataPoint {
  id: string;
  x: number;
  y: 0 | 1; // 0: No / Reprobado / Negativo, 1: Sí / Aprobado / Positivo
  label?: string;
}

export interface LogisticDataset {
  id: string;
  name: string;
  description: string;
  xLabel: string;
  xUnit: string;
  yLabel0: string; // e.g. "Reprobado"
  yLabel1: string; // e.g. "Aprobado"
  xMin: number;
  xMax: number;
  points: LogisticDataPoint[];
  typicalWeight: number; // w
  typicalBias: number;   // b
  interpretation: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  technique: 'lineal' | 'logistica' | 'ambas';
}

export interface ConceptCard {
  id: string;
  title: string;
  technique: 'lineal' | 'logistica' | 'ambas';
  summary: string;
  details: string;
  analogy: string;
  formula?: string;
}
