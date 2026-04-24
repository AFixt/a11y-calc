import { BasicPanel } from './BasicPanel';
import { ScientificPanel } from './ScientificPanel';

import type {
  AngleMode,
  CalculatorMode,
  Operator,
  ScientificFunction,
} from '../../types/calculator';
import type { ReactElement } from 'react';

/**
 * Props for {@link ButtonPanel} and its basic/scientific sub-panels.
 * One shape covers both modes; scientific-only handlers are unused in
 * basic mode.
 */
export interface ButtonPanelProps {
  mode: CalculatorMode;
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onOperator: (op: Operator) => void;
  onEquals: () => void;
  onClear: () => void;
  onToggleSign: () => void;
  onPercent: () => void;
  activeOperator: Operator | null;
  waitingForOperand: boolean;
  angleMode: AngleMode;
  isSecondFunction: boolean;
  onScientificFunction: (fn: ScientificFunction) => void;
  onToggleAngleMode: () => void;
  onToggleSecondFunction: () => void;
  onConstant: (c: 'pi' | 'e') => void;
  onOpenParen: () => void;
  onCloseParen: () => void;
}

/**
 * Render the calculator button grid, delegating to the appropriate panel for
 * the active mode. The panels own their own grid layout and keyboard targets.
 */
export function ButtonPanel(props: ButtonPanelProps): ReactElement {
  return props.mode === 'scientific' ? <ScientificPanel {...props} /> : <BasicPanel {...props} />;
}
