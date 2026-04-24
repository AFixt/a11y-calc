export type Operator = '+' | '-' | '*' | '/' | '^';

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

export type AngleMode = 'deg' | 'rad';

export type CalculatorMode = 'basic' | 'scientific';

export interface ParenFrame {
  previousValue: string | null;
  operator: Operator | null;
  waitingForOperand: boolean;
  expression: string;
}

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
