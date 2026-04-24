import type { Operator } from '../types/calculator';

const MAX_DISPLAY_LENGTH = 12;

const OPERATOR_TO_SYMBOL: Record<Operator, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
  '^': 'xⁿ',
};

const OPERATOR_TO_WORD: Record<Operator, string> = {
  '+': 'plus',
  '-': 'minus',
  '*': 'times',
  '/': 'divided by',
  '^': 'to the power of',
};

/**
 * Evaluate a binary arithmetic operation. Division by zero returns `Infinity`;
 * downstream formatting converts that to `'Error'`.
 */
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

/**
 * Format a numeric value for the calculator display, collapsing long results
 * via `toPrecision` or exponential notation so they fit within the display
 * width. Non-finite values render as `'Error'`.
 */
export function formatDisplay(value: number): string {
  if (!isFinite(value)) return 'Error';

  const str = String(value);

  if (str.length <= MAX_DISPLAY_LENGTH) return str;

  const precise = value.toPrecision(MAX_DISPLAY_LENGTH - 2);
  if (precise.length <= MAX_DISPLAY_LENGTH) return precise;

  return value.toExponential(MAX_DISPLAY_LENGTH - 6);
}

/**
 * Return the on-button symbolic label for an operator (e.g. `*` → `×`).
 */
export function operatorToSymbol(op: Operator): string {
  return OPERATOR_TO_SYMBOL[op];
}

/**
 * Return the screen-reader-friendly word form of an operator (e.g. `*` → `times`).
 */
export function operatorToWord(op: Operator): string {
  return OPERATOR_TO_WORD[op];
}
