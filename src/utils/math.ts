import { DataPoint, LogisticDataPoint } from '../types';

/**
 * Computes Ordinary Least Squares (OLS) for Linear Regression
 * Returns slope (m) and intercept (b) where y = m*x + b
 */
export function calculateOLS(points: DataPoint[]): { slope: number; intercept: number; r2: number; mse: number } {
  const n = points.length;
  if (n < 2) {
    return { slope: 1, intercept: 0, r2: 0, mse: 0 };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
    sumY2 += p.y * p.y;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (Math.abs(denominator) < 1e-10) {
    return { slope: 0, intercept: sumY / n, r2: 0, mse: 0 };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Compute MSE & R²
  const meanY = sumY / n;
  let totalSS = 0;
  let residualSS = 0;

  for (const p of points) {
    const yHat = slope * p.x + intercept;
    residualSS += Math.pow(p.y - yHat, 2);
    totalSS += Math.pow(p.y - meanY, 2);
  }

  const mse = residualSS / n;
  const r2 = totalSS > 0 ? Math.max(0, 1 - residualSS / totalSS) : 0;

  return { slope, intercept, r2, mse };
}

/**
 * Computes MSE for an arbitrary slope and intercept
 */
export function calculateMSE(points: DataPoint[], slope: number, intercept: number): { mse: number; r2: number } {
  if (points.length === 0) return { mse: 0, r2: 0 };
  
  let sumY = 0;
  for (const p of points) sumY += p.y;
  const meanY = sumY / points.length;

  let residualSS = 0;
  let totalSS = 0;

  for (const p of points) {
    const yHat = slope * p.x + intercept;
    residualSS += Math.pow(p.y - yHat, 2);
    totalSS += Math.pow(p.y - meanY, 2);
  }

  const mse = residualSS / points.length;
  const r2 = totalSS > 0 ? Math.max(0, 1 - residualSS / totalSS) : 0;

  return { mse, r2 };
}

/**
 * Sigmoid activation function
 */
export function sigmoid(z: number): number {
  // Clamped to avoid overflow
  if (z > 40) return 1;
  if (z < -40) return 0;
  return 1 / (1 + Math.exp(-z));
}

/**
 * Logistic prediction probability: P(Y=1 | x) = sigmoid(w * x + b)
 */
export function predictLogistic(x: number, weight: number, bias: number): number {
  return sigmoid(weight * x + bias);
}

/**
 * Computes binary cross-entropy (Log Loss)
 */
export function calculateLogLoss(points: LogisticDataPoint[], weight: number, bias: number): number {
  if (points.length === 0) return 0;
  const eps = 1e-15;
  let totalLoss = 0;

  for (const p of points) {
    const prob = Math.max(eps, Math.min(1 - eps, predictLogistic(p.x, weight, bias)));
    if (p.y === 1) {
      totalLoss += -Math.log(prob);
    } else {
      totalLoss += -Math.log(1 - prob);
    }
  }

  return totalLoss / points.length;
}

/**
 * Confusion Matrix evaluation based on threshold
 */
export interface ConfusionMatrix {
  tp: number; // True Positive
  fp: number; // False Positive
  tn: number; // True Negative
  fn: number; // False Negative
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

export function calculateConfusionMatrix(
  points: LogisticDataPoint[],
  weight: number,
  bias: number,
  threshold: number = 0.5
): ConfusionMatrix {
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;

  for (const p of points) {
    const prob = predictLogistic(p.x, weight, bias);
    const predicted = prob >= threshold ? 1 : 0;

    if (predicted === 1 && p.y === 1) tp++;
    else if (predicted === 1 && p.y === 0) fp++;
    else if (predicted === 0 && p.y === 0) tn++;
    else if (predicted === 0 && p.y === 1) fn++;
  }

  const total = tp + fp + tn + fn;
  const accuracy = total > 0 ? (tp + tn) / total : 0;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  return { tp, fp, tn, fn, accuracy, precision, recall, f1 };
}

/**
 * Fits a logistic regression model using simple gradient descent
 */
export function fitLogisticRegression(
  points: LogisticDataPoint[],
  xMin: number,
  xMax: number
): { weight: number; bias: number } {
  if (points.length === 0) return { weight: 1, bias: 0 };

  // Normalize x temporarily to [0, 1] for stable gradient descent
  const range = xMax - xMin || 1;
  let normW = 1.0;
  let normB = -0.5;
  const lr = 0.2;
  const epochs = 120;

  for (let e = 0; e < epochs; e++) {
    let gradW = 0;
    let gradB = 0;
    for (const p of points) {
      const normX = (p.x - xMin) / range;
      const prob = sigmoid(normW * normX + normB);
      const err = prob - p.y;
      gradW += err * normX;
      gradB += err;
    }
    normW -= (lr * gradW) / points.length;
    normB -= (lr * gradB) / points.length;
  }

  // De-normalize back to original scale:
  // normW * ((x - xMin) / range) + normB = (normW / range) * x + (normB - (normW * xMin) / range)
  const weight = normW / range;
  const bias = normB - (normW * xMin) / range;

  return { weight, bias };
}
