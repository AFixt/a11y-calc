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

export function evaluateScientificFunction(
  value: number,
  fn: ScientificFunction,
  angleMode: AngleMode,
): number {
  switch (fn) {
    case 'sin':
      return Math.sin(angleMode === 'deg' ? degreesToRadians(value) : value);
    case 'cos':
      return Math.cos(angleMode === 'deg' ? degreesToRadians(value) : value);
    case 'tan':
      return Math.tan(angleMode === 'deg' ? degreesToRadians(value) : value);
    case 'asin': {
      const result = Math.asin(value);
      return angleMode === 'deg' ? radiansToDegrees(result) : result;
    }
    case 'acos': {
      const result = Math.acos(value);
      return angleMode === 'deg' ? radiansToDegrees(result) : result;
    }
    case 'atan': {
      const result = Math.atan(value);
      return angleMode === 'deg' ? radiansToDegrees(result) : result;
    }
    case 'sinh':
      return Math.sinh(value);
    case 'cosh':
      return Math.cosh(value);
    case 'tanh':
      return Math.tanh(value);
    case 'asinh':
      return Math.asinh(value);
    case 'acosh':
      return Math.acosh(value);
    case 'atanh':
      return Math.atanh(value);
    case 'ln':
      return Math.log(value);
    case 'log10':
      return Math.log10(value);
    case 'square':
      return value ** 2;
    case 'cube':
      return value ** 3;
    case 'exp':
      return Math.exp(value);
    case 'tenPow':
      return 10 ** value;
    case 'reciprocal':
      return value === 0 ? Infinity : 1 / value;
    case 'sqrt':
      return value < 0 ? NaN : Math.sqrt(value);
    case 'cbrt':
      return Math.cbrt(value);
    case 'factorial':
      return factorial(value);
  }
}

export function scientificFunctionToWord(fn: ScientificFunction): string {
  switch (fn) {
    case 'sin':
      return 'sine of';
    case 'cos':
      return 'cosine of';
    case 'tan':
      return 'tangent of';
    case 'asin':
      return 'arc sine of';
    case 'acos':
      return 'arc cosine of';
    case 'atan':
      return 'arc tangent of';
    case 'sinh':
      return 'hyperbolic sine of';
    case 'cosh':
      return 'hyperbolic cosine of';
    case 'tanh':
      return 'hyperbolic tangent of';
    case 'asinh':
      return 'inverse hyperbolic sine of';
    case 'acosh':
      return 'inverse hyperbolic cosine of';
    case 'atanh':
      return 'inverse hyperbolic tangent of';
    case 'ln':
      return 'natural log of';
    case 'log10':
      return 'log base 10 of';
    case 'square':
      return 'square of';
    case 'cube':
      return 'cube of';
    case 'exp':
      return 'e to the power of';
    case 'tenPow':
      return '10 to the power of';
    case 'reciprocal':
      return '1 over';
    case 'sqrt':
      return 'square root of';
    case 'cbrt':
      return 'cube root of';
    case 'factorial':
      return 'factorial of';
  }
}
