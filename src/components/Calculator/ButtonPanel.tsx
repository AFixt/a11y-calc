import type { Operator, CalculatorMode, AngleMode, ScientificFunction } from '../../types/calculator';
import { CalcButton } from './CalcButton';

interface ButtonPanelProps {
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
  // Scientific props
  angleMode: AngleMode;
  isSecondFunction: boolean;
  onScientificFunction: (fn: ScientificFunction) => void;
  onToggleAngleMode: () => void;
  onToggleSecondFunction: () => void;
  onConstant: (c: 'pi' | 'e') => void;
  onOpenParen: () => void;
  onCloseParen: () => void;
}

export function ButtonPanel({
  mode,
  onDigit,
  onDecimal,
  onOperator,
  onEquals,
  onClear,
  onToggleSign,
  onPercent,
  activeOperator,
  waitingForOperand,
  angleMode,
  isSecondFunction,
  onScientificFunction,
  onToggleAngleMode,
  onToggleSecondFunction,
  onConstant,
  onOpenParen,
  onCloseParen,
}: ButtonPanelProps) {
  const isPressed = (op: Operator) => activeOperator === op && waitingForOperand;
  const isScientific = mode === 'scientific';

  const gridClass = isScientific
    ? 'calc-buttons calc-buttons--scientific'
    : 'calc-buttons';

  return (
    <div className={gridClass} role="group" aria-label="Calculator buttons">
      {isScientific && (
        <>
          {/* Scientific Row 1 */}
          <CalcButton label="(" ariaLabel="Open parenthesis" variant="scientific" onClick={onOpenParen} />
          <CalcButton label=")" ariaLabel="Close parenthesis" variant="scientific" onClick={onCloseParen} />
          <CalcButton
            label={isSecondFunction ? 'x³' : 'x²'}
            ariaLabel={isSecondFunction ? 'x cubed' : 'x squared'}
            variant="scientific"
            onClick={() => onScientificFunction(isSecondFunction ? 'cube' : 'square')}
          />
          <CalcButton
            label="xⁿ"
            ariaLabel="x to the power of n"
            variant="scientific"
            onClick={() => onOperator('^')}
          />
          <CalcButton
            label={isSecondFunction ? '10ˣ' : 'eˣ'}
            ariaLabel={isSecondFunction ? '10 to the power of x' : 'e to the power of x'}
            variant="scientific"
            onClick={() => onScientificFunction(isSecondFunction ? 'tenPow' : 'exp')}
          />
          <CalcButton
            label="2nd"
            ariaLabel={isSecondFunction ? 'Second function active, click for primary' : 'Second function'}
            variant="scientific"
            className={isSecondFunction ? 'calc-btn--second-active' : ''}
            onClick={onToggleSecondFunction}
          />
        </>
      )}

      {/* Standard Row 1: AC, +/-, %, ÷ */}
      <CalcButton label="AC" ariaLabel="All clear" variant="function" onClick={onClear} />
      <CalcButton label="+/−" ariaLabel="Toggle positive negative" variant="function" onClick={onToggleSign} />
      <CalcButton label="%" ariaLabel="Percent" variant="function" onClick={onPercent} />
      <CalcButton label="÷" ariaLabel="Divide" variant="operator" pressed={isPressed('/')} onClick={() => onOperator('/')} />

      {isScientific && (
        <>
          {/* Scientific Row 2 */}
          <CalcButton label="1/x" ariaLabel="Reciprocal" variant="scientific" onClick={() => onScientificFunction('reciprocal')} />
          <CalcButton
            label={isSecondFunction ? '∛x' : '√x'}
            ariaLabel={isSecondFunction ? 'Cube root' : 'Square root'}
            variant="scientific"
            onClick={() => onScientificFunction(isSecondFunction ? 'cbrt' : 'sqrt')}
          />
          <CalcButton label="x!" ariaLabel="Factorial" variant="scientific" onClick={() => onScientificFunction('factorial')} />
          <CalcButton
            label={isSecondFunction ? 'log₁₀' : 'ln'}
            ariaLabel={isSecondFunction ? 'Log base 10' : 'Natural log'}
            variant="scientific"
            onClick={() => onScientificFunction(isSecondFunction ? 'log10' : 'ln')}
          />
          <CalcButton label="e" ariaLabel="Euler's number e" variant="scientific" onClick={() => onConstant('e')} />
          <CalcButton label="π" ariaLabel="Pi" variant="scientific" onClick={() => onConstant('pi')} />
        </>
      )}

      {/* Standard Row 2: 7-9, × */}
      <CalcButton label="7" ariaLabel="7" onClick={() => onDigit('7')} />
      <CalcButton label="8" ariaLabel="8" onClick={() => onDigit('8')} />
      <CalcButton label="9" ariaLabel="9" onClick={() => onDigit('9')} />
      <CalcButton label="×" ariaLabel="Multiply" variant="operator" pressed={isPressed('*')} onClick={() => onOperator('*')} />

      {isScientific && (
        <>
          {/* Scientific Row 3 */}
          <CalcButton
            label={isSecondFunction ? 'asin' : 'sin'}
            ariaLabel={isSecondFunction ? 'Arc sine' : 'Sine'}
            variant="scientific"
            onClick={() => onScientificFunction(isSecondFunction ? 'asin' : 'sin')}
          />
          <CalcButton
            label={isSecondFunction ? 'acos' : 'cos'}
            ariaLabel={isSecondFunction ? 'Arc cosine' : 'Cosine'}
            variant="scientific"
            onClick={() => onScientificFunction(isSecondFunction ? 'acos' : 'cos')}
          />
          <CalcButton
            label={isSecondFunction ? 'atan' : 'tan'}
            ariaLabel={isSecondFunction ? 'Arc tangent' : 'Tangent'}
            variant="scientific"
            onClick={() => onScientificFunction(isSecondFunction ? 'atan' : 'tan')}
          />
          <CalcButton
            label={isSecondFunction ? 'asinh' : 'sinh'}
            ariaLabel={isSecondFunction ? 'Inverse hyperbolic sine' : 'Hyperbolic sine'}
            variant="scientific"
            onClick={() => onScientificFunction(isSecondFunction ? 'asinh' : 'sinh')}
          />
          <CalcButton
            label={isSecondFunction ? 'acosh' : 'cosh'}
            ariaLabel={isSecondFunction ? 'Inverse hyperbolic cosine' : 'Hyperbolic cosine'}
            variant="scientific"
            onClick={() => onScientificFunction(isSecondFunction ? 'acosh' : 'cosh')}
          />
          <CalcButton
            label={isSecondFunction ? 'atanh' : 'tanh'}
            ariaLabel={isSecondFunction ? 'Inverse hyperbolic tangent' : 'Hyperbolic tangent'}
            variant="scientific"
            onClick={() => onScientificFunction(isSecondFunction ? 'atanh' : 'tanh')}
          />
        </>
      )}

      {/* Standard Row 3: 4-6, − */}
      <CalcButton label="4" ariaLabel="4" onClick={() => onDigit('4')} />
      <CalcButton label="5" ariaLabel="5" onClick={() => onDigit('5')} />
      <CalcButton label="6" ariaLabel="6" onClick={() => onDigit('6')} />
      <CalcButton label="−" ariaLabel="Subtract" variant="operator" pressed={isPressed('-')} onClick={() => onOperator('-')} />

      {isScientific && (
        <>
          {/* Scientific Row 4 */}
          <CalcButton
            label={angleMode === 'rad' ? 'Rad' : 'Deg'}
            ariaLabel={angleMode === 'rad' ? 'Currently radians, switch to degrees' : 'Currently degrees, switch to radians'}
            variant="scientific"
            onClick={onToggleAngleMode}
          />
          {/* 5 empty spacer cells */}
          <span className="calc-btn-spacer" aria-hidden="true" />
          <span className="calc-btn-spacer" aria-hidden="true" />
          <span className="calc-btn-spacer" aria-hidden="true" />
          <span className="calc-btn-spacer" aria-hidden="true" />
          <span className="calc-btn-spacer" aria-hidden="true" />
        </>
      )}

      {/* Standard Row 4: 1-3, + */}
      <CalcButton label="1" ariaLabel="1" onClick={() => onDigit('1')} />
      <CalcButton label="2" ariaLabel="2" onClick={() => onDigit('2')} />
      <CalcButton label="3" ariaLabel="3" onClick={() => onDigit('3')} />
      <CalcButton label="+" ariaLabel="Add" variant="operator" pressed={isPressed('+')} onClick={() => onOperator('+')} />

      {isScientific && (
        <>
          {/* Scientific Row 5: spacers to fill left side */}
          <span className="calc-btn-spacer" aria-hidden="true" />
          <span className="calc-btn-spacer" aria-hidden="true" />
          <span className="calc-btn-spacer" aria-hidden="true" />
          <span className="calc-btn-spacer" aria-hidden="true" />
          <span className="calc-btn-spacer" aria-hidden="true" />
          <span className="calc-btn-spacer" aria-hidden="true" />
        </>
      )}

      {/* Standard Row 5: 0 (wide), ., = */}
      <CalcButton label="0" ariaLabel="0" wide onClick={() => onDigit('0')} />
      <CalcButton label="." ariaLabel="Decimal point" onClick={onDecimal} />
      <CalcButton label="=" ariaLabel="Equals" variant="operator" onClick={onEquals} />
    </div>
  );
}
