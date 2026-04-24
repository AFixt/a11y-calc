/**
 * Binary arithmetic operator accepted by the calculator. `^` is the
 * power operator (available in scientific mode).
 */
export type Operator = '+' | '-' | '*' | '/' | '^';

/**
 * Unary scientific function identifier. Covers trig, inverse trig,
 * hyperbolic, inverse hyperbolic, logarithms, powers, roots, reciprocal,
 * and factorial.
 */
export type ScientificFunction =
  | 'sin'
  | 'cos'
  | 'tan'
  | 'asin'
  | 'acos'
  | 'atan'
  | 'sinh'
  | 'cosh'
  | 'tanh'
  | 'asinh'
  | 'acosh'
  | 'atanh'
  | 'ln'
  | 'log10'
  | 'square'
  | 'cube'
  | 'exp'
  | 'tenPow'
  | 'reciprocal'
  | 'sqrt'
  | 'cbrt'
  | 'factorial';

/**
 * Angle unit mode for trig functions. `'deg'` interprets inputs as degrees
 * and produces inverse-trig results in degrees; `'rad'` does the same with
 * radians.
 */
export type AngleMode = 'deg' | 'rad';

/**
 * Which button layout the calculator renders. `'scientific'` shows the
 * 10-column extended grid; `'basic'` shows the standard 4-column layout.
 */
export type CalculatorMode = 'basic' | 'scientific';

/**
 * Snapshot of the arithmetic context captured when a parenthesis opens.
 * Restored when the matching parenthesis closes.
 */
export interface ParenFrame {
  previousValue: string | null;
  operator: Operator | null;
  waitingForOperand: boolean;
  expression: string;
}

/**
 * Full calculator state. Every user interaction produces a new snapshot
 * by returning a replacement object from the reducer — the shape never
 * changes in place.
 */
export interface CalculatorState {
  displayValue: string;
  previousValue: string | null;
  operator: Operator | null;
  waitingForOperand: boolean;
  expression: string;
  announcement: string;
  announcementKey: number;
  angleMode: AngleMode;
  parenDepth: number;
  parenStack: ParenFrame[];
}

/**
 * Consumer-supplied theme overrides. Each key maps to a CSS custom property
 * on the calculator root; omitted keys fall through to the defaults defined
 * in `Calculator.css`.
 */
export interface CalculatorTheme {
  'calc-bg'?: string;
  'calc-radius'?: string;
  'calc-width'?: string;
  'calc-width-scientific'?: string;
  'display-bg'?: string;
  'display-text'?: string;
  'display-font-size'?: string;
  'btn-size'?: string;
  'btn-font-size'?: string;
  'btn-number-bg'?: string;
  'btn-number-text'?: string;
  'btn-number-hover'?: string;
  'btn-function-bg'?: string;
  'btn-function-text'?: string;
  'btn-function-hover'?: string;
  'btn-operator-bg'?: string;
  'btn-operator-text'?: string;
  'btn-operator-hover'?: string;
  'btn-operator-pressed-bg'?: string;
  'btn-operator-pressed-text'?: string;
  'btn-scientific-bg'?: string;
  'btn-scientific-text'?: string;
  'btn-scientific-hover'?: string;
  'focus-ring-color'?: string;
  'focus-ring-width'?: string;
}
