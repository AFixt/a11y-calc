import type { AngleMode, ScientificFunction } from '../types/calculator';

function degreesToRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function radiansToDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

type Evaluator = (value: number, angleMode: AngleMode) => number;

const EVALUATORS: Record<ScientificFunction, Evaluator> = {
  sin: (v, m) => Math.sin(m === 'deg' ? degreesToRadians(v) : v),
  cos: (v, m) => Math.cos(m === 'deg' ? degreesToRadians(v) : v),
  tan: (v, m) => Math.tan(m === 'deg' ? degreesToRadians(v) : v),
  asin: (v, m) => {
    const r = Math.asin(v);
    return m === 'deg' ? radiansToDegrees(r) : r;
  },
  acos: (v, m) => {
    const r = Math.acos(v);
    return m === 'deg' ? radiansToDegrees(r) : r;
  },
  atan: (v, m) => {
    const r = Math.atan(v);
    return m === 'deg' ? radiansToDegrees(r) : r;
  },
  sinh: (v) => Math.sinh(v),
  cosh: (v) => Math.cosh(v),
  tanh: (v) => Math.tanh(v),
  asinh: (v) => Math.asinh(v),
  acosh: (v) => Math.acosh(v),
  atanh: (v) => Math.atanh(v),
  ln: (v) => Math.log(v),
  log10: (v) => Math.log10(v),
  square: (v) => v ** 2,
  cube: (v) => v ** 3,
  exp: (v) => Math.exp(v),
  tenPow: (v) => 10 ** v,
  reciprocal: (v) => (v === 0 ? Infinity : 1 / v),
  sqrt: (v) => (v < 0 ? NaN : Math.sqrt(v)),
  cbrt: (v) => Math.cbrt(v),
  factorial: (v) => factorial(v),
};

const FUNCTION_TO_WORD: Record<ScientificFunction, string> = {
  sin: 'sine of',
  cos: 'cosine of',
  tan: 'tangent of',
  asin: 'arc sine of',
  acos: 'arc cosine of',
  atan: 'arc tangent of',
  sinh: 'hyperbolic sine of',
  cosh: 'hyperbolic cosine of',
  tanh: 'hyperbolic tangent of',
  asinh: 'inverse hyperbolic sine of',
  acosh: 'inverse hyperbolic cosine of',
  atanh: 'inverse hyperbolic tangent of',
  ln: 'natural log of',
  log10: 'log base 10 of',
  square: 'square of',
  cube: 'cube of',
  exp: 'e to the power of',
  tenPow: '10 to the power of',
  reciprocal: '1 over',
  sqrt: 'square root of',
  cbrt: 'cube root of',
  factorial: 'factorial of',
};

/**
 * Evaluate a unary scientific function at the given value. Trig functions
 * honor the angle mode; inverse trig returns results in that same mode.
 * Domain errors return `NaN` or `Infinity`, which downstream formatting
 * renders as `'Error'`.
 */
export function evaluateScientificFunction(
  value: number,
  fn: ScientificFunction,
  angleMode: AngleMode,
): number {
  return EVALUATORS[fn](value, angleMode);
}

/**
 * Return the screen-reader-friendly phrase for a scientific function
 * (e.g. `'sin'` → `'sine of'`).
 */
export function scientificFunctionToWord(fn: ScientificFunction): string {
  return FUNCTION_TO_WORD[fn];
}
