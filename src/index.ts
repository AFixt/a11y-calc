export { Calculator } from './components/Calculator/Calculator';
export type { CalculatorProps } from './components/Calculator/Calculator';
export type {
  AngleMode,
  CalculatorMode,
  CalculatorTheme,
  Operator,
  ScientificFunction,
} from './types/calculator';

// `CalculatorState` and `ParenFrame` are intentionally NOT re-exported: they
// are internal `useCalculator` reducer detail, not part of the public API.
// See the note on those types in `./types/calculator`.
