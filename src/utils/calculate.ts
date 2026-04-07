import type { Operator } from '../types/calculator';

export function calculate(left: number, right: number, operator: Operator): number {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return right === 0 ? Infinity : left / right;
    case '^':
      return left ** right;
  }
}

const MAX_DISPLAY_LENGTH = 12;

export function formatDisplay(value: number): string {
  if (!isFinite(value)) return 'Error';

  const str = String(value);

  if (str.length <= MAX_DISPLAY_LENGTH) return str;

  // Try toPrecision to fit within display length
  const precise = value.toPrecision(MAX_DISPLAY_LENGTH - 2);
  if (precise.length <= MAX_DISPLAY_LENGTH) return precise;

  // Fall back to exponential
  return value.toExponential(MAX_DISPLAY_LENGTH - 6);
}

export function operatorToSymbol(op: Operator): string {
  switch (op) {
    case '+':
      return '+';
    case '-':
      return '−';
    case '*':
      return '×';
    case '/':
      return '÷';
    case '^':
      return 'xⁿ';
  }
}

export function operatorToWord(op: Operator): string {
  switch (op) {
    case '+':
      return 'plus';
    case '-':
      return 'minus';
    case '*':
      return 'times';
    case '/':
      return 'divided by';
    case '^':
      return 'to the power of';
  }
}
