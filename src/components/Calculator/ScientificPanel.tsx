import { CalcButton } from './CalcButton';

import type { ButtonPanelProps } from './ButtonPanel';
import type { Operator } from '../../types/calculator';
import type { ReactElement } from 'react';

interface ScientificSpacerProps {
  count: number;
}

function Spacers({ count }: ScientificSpacerProps): ReactElement {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key -- static spacer cells with no semantics
        <span key={i} className="calc-btn-spacer" aria-hidden="true" />
      ))}
    </>
  );
}

function ScientificRow1(props: ButtonPanelProps): ReactElement {
  const {
    onOpenParen,
    onCloseParen,
    onScientificFunction,
    onOperator,
    isSecondFunction,
    onToggleSecondFunction,
  } = props;
  return (
    <>
      <CalcButton
        label="("
        ariaLabel="Open parenthesis"
        variant="scientific"
        onClick={onOpenParen}
      />
      <CalcButton
        label=")"
        ariaLabel="Close parenthesis"
        variant="scientific"
        onClick={onCloseParen}
      />
      <CalcButton
        label={isSecondFunction ? 'x³' : 'x²'}
        ariaLabel={isSecondFunction ? 'x cubed' : 'x squared'}
        variant="scientific"
        onClick={() => {
          onScientificFunction(isSecondFunction ? 'cube' : 'square');
        }}
      />
      <CalcButton
        label="xⁿ"
        ariaLabel="x to the power of n"
        variant="scientific"
        onClick={() => {
          onOperator('^');
        }}
      />
      <CalcButton
        label={isSecondFunction ? '10ˣ' : 'eˣ'}
        ariaLabel={isSecondFunction ? '10 to the power of x' : 'e to the power of x'}
        variant="scientific"
        onClick={() => {
          onScientificFunction(isSecondFunction ? 'tenPow' : 'exp');
        }}
      />
      <CalcButton
        label="2nd"
        ariaLabel={
          isSecondFunction ? 'Second function active, click for primary' : 'Second function'
        }
        variant="scientific"
        className={isSecondFunction ? 'calc-btn--second-active' : ''}
        onClick={onToggleSecondFunction}
      />
    </>
  );
}

function ScientificRow2(props: ButtonPanelProps): ReactElement {
  const { onScientificFunction, isSecondFunction, onConstant } = props;
  return (
    <>
      <CalcButton
        label="1/x"
        ariaLabel="Reciprocal"
        variant="scientific"
        onClick={() => {
          onScientificFunction('reciprocal');
        }}
      />
      <CalcButton
        label={isSecondFunction ? '∛x' : '√x'}
        ariaLabel={isSecondFunction ? 'Cube root' : 'Square root'}
        variant="scientific"
        onClick={() => {
          onScientificFunction(isSecondFunction ? 'cbrt' : 'sqrt');
        }}
      />
      <CalcButton
        label="x!"
        ariaLabel="Factorial"
        variant="scientific"
        onClick={() => {
          onScientificFunction('factorial');
        }}
      />
      <CalcButton
        label={isSecondFunction ? 'log₁₀' : 'ln'}
        ariaLabel={isSecondFunction ? 'Log base 10' : 'Natural log'}
        variant="scientific"
        onClick={() => {
          onScientificFunction(isSecondFunction ? 'log10' : 'ln');
        }}
      />
      <CalcButton
        label="e"
        ariaLabel="Euler's number e"
        variant="scientific"
        onClick={() => {
          onConstant('e');
        }}
      />
      <CalcButton
        label="π"
        ariaLabel="Pi"
        variant="scientific"
        onClick={() => {
          onConstant('pi');
        }}
      />
    </>
  );
}

function ScientificRow3(props: ButtonPanelProps): ReactElement {
  const { onScientificFunction, isSecondFunction } = props;
  const trig: { fn: 'sin' | 'cos' | 'tan'; inverse: 'asin' | 'acos' | 'atan'; label: string }[] = [
    { fn: 'sin', inverse: 'asin', label: 'sin' },
    { fn: 'cos', inverse: 'acos', label: 'cos' },
    { fn: 'tan', inverse: 'atan', label: 'tan' },
  ];
  const hyp: {
    fn: 'sinh' | 'cosh' | 'tanh';
    inverse: 'asinh' | 'acosh' | 'atanh';
    label: string;
  }[] = [
    { fn: 'sinh', inverse: 'asinh', label: 'sinh' },
    { fn: 'cosh', inverse: 'acosh', label: 'cosh' },
    { fn: 'tanh', inverse: 'atanh', label: 'tanh' },
  ];
  const trigLabel = (t: (typeof trig)[number]): string => (isSecondFunction ? t.inverse : t.label);
  const trigAria = (t: (typeof trig)[number]): string => {
    const baseName = t.label === 'sin' ? 'Sine' : t.label === 'cos' ? 'Cosine' : 'Tangent';
    const arcName =
      t.label === 'sin' ? 'Arc sine' : t.label === 'cos' ? 'Arc cosine' : 'Arc tangent';
    return isSecondFunction ? arcName : baseName;
  };
  const hypLabel = (h: (typeof hyp)[number]): string => (isSecondFunction ? h.inverse : h.label);
  const hypAria = (h: (typeof hyp)[number]): string => {
    const baseName =
      h.label === 'sinh'
        ? 'Hyperbolic sine'
        : h.label === 'cosh'
          ? 'Hyperbolic cosine'
          : 'Hyperbolic tangent';
    const invName =
      h.label === 'sinh'
        ? 'Inverse hyperbolic sine'
        : h.label === 'cosh'
          ? 'Inverse hyperbolic cosine'
          : 'Inverse hyperbolic tangent';
    return isSecondFunction ? invName : baseName;
  };

  return (
    <>
      {trig.map((t) => (
        <CalcButton
          key={t.label}
          label={trigLabel(t)}
          ariaLabel={trigAria(t)}
          variant="scientific"
          onClick={() => {
            onScientificFunction(isSecondFunction ? t.inverse : t.fn);
          }}
        />
      ))}
      {hyp.map((h) => (
        <CalcButton
          key={h.label}
          label={hypLabel(h)}
          ariaLabel={hypAria(h)}
          variant="scientific"
          onClick={() => {
            onScientificFunction(isSecondFunction ? h.inverse : h.fn);
          }}
        />
      ))}
    </>
  );
}

function ScientificRow4(props: ButtonPanelProps): ReactElement {
  const { angleMode, onToggleAngleMode } = props;
  return (
    <>
      <CalcButton
        label={angleMode === 'rad' ? 'Rad' : 'Deg'}
        ariaLabel={
          angleMode === 'rad'
            ? 'Currently radians, switch to degrees'
            : 'Currently degrees, switch to radians'
        }
        variant="scientific"
        onClick={onToggleAngleMode}
      />
      <Spacers count={5} />
    </>
  );
}

/**
 * 10-column scientific calculator grid. Columns 1-6 host the scientific
 * functions (paren, power, trig, hyperbolic, constants, angle mode); columns
 * 7-10 mirror the basic calculator layout.
 */
export function ScientificPanel(props: ButtonPanelProps): ReactElement {
  const {
    onDigit,
    onDecimal,
    onOperator,
    onEquals,
    onClear,
    onToggleSign,
    onPercent,
    activeOperator,
    waitingForOperand,
  } = props;
  const isPressed = (op: Operator): boolean => activeOperator === op && waitingForOperand;

  return (
    <fieldset className="calc-buttons calc-buttons--scientific" aria-label="Calculator buttons">
      <ScientificRow1 {...props} />
      <CalcButton label="AC" ariaLabel="All clear" variant="function" onClick={onClear} />
      <CalcButton
        label="+/−"
        ariaLabel="Toggle positive negative"
        variant="function"
        onClick={onToggleSign}
      />
      <CalcButton label="%" ariaLabel="Percent" variant="function" onClick={onPercent} />
      <CalcButton
        label="÷"
        ariaLabel="Divide"
        variant="operator"
        pressed={isPressed('/')}
        onClick={() => {
          onOperator('/');
        }}
      />

      <ScientificRow2 {...props} />
      <CalcButton
        label="7"
        ariaLabel="7"
        onClick={() => {
          onDigit('7');
        }}
      />
      <CalcButton
        label="8"
        ariaLabel="8"
        onClick={() => {
          onDigit('8');
        }}
      />
      <CalcButton
        label="9"
        ariaLabel="9"
        onClick={() => {
          onDigit('9');
        }}
      />
      <CalcButton
        label="×"
        ariaLabel="Multiply"
        variant="operator"
        pressed={isPressed('*')}
        onClick={() => {
          onOperator('*');
        }}
      />

      <ScientificRow3 {...props} />
      <CalcButton
        label="4"
        ariaLabel="4"
        onClick={() => {
          onDigit('4');
        }}
      />
      <CalcButton
        label="5"
        ariaLabel="5"
        onClick={() => {
          onDigit('5');
        }}
      />
      <CalcButton
        label="6"
        ariaLabel="6"
        onClick={() => {
          onDigit('6');
        }}
      />
      <CalcButton
        label="−"
        ariaLabel="Subtract"
        variant="operator"
        pressed={isPressed('-')}
        onClick={() => {
          onOperator('-');
        }}
      />

      <ScientificRow4 {...props} />
      <CalcButton
        label="1"
        ariaLabel="1"
        onClick={() => {
          onDigit('1');
        }}
      />
      <CalcButton
        label="2"
        ariaLabel="2"
        onClick={() => {
          onDigit('2');
        }}
      />
      <CalcButton
        label="3"
        ariaLabel="3"
        onClick={() => {
          onDigit('3');
        }}
      />
      <CalcButton
        label="+"
        ariaLabel="Add"
        variant="operator"
        pressed={isPressed('+')}
        onClick={() => {
          onOperator('+');
        }}
      />

      <Spacers count={6} />
      <CalcButton
        label="0"
        ariaLabel="0"
        wide
        onClick={() => {
          onDigit('0');
        }}
      />
      <CalcButton label="." ariaLabel="Decimal point" onClick={onDecimal} />
      <CalcButton label="=" ariaLabel="Equals" variant="operator" onClick={onEquals} />
    </fieldset>
  );
}
