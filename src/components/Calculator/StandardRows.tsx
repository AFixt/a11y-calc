import { CalcButton } from './CalcButton';

import type { ButtonPanelProps } from './ButtonPanel';
import type { Operator } from '../../types/calculator';
import type { ReactElement } from 'react';

/**
 * Props common to every standard-row sub-component. A subset of
 * {@link ButtonPanelProps} sufficient to render the shared 4-column
 * layout used by both basic and scientific panels.
 */
export type StandardRowProps = Pick<
  ButtonPanelProps,
  | 'onDigit'
  | 'onDecimal'
  | 'onOperator'
  | 'onEquals'
  | 'onClear'
  | 'onToggleSign'
  | 'onPercent'
  | 'activeOperator'
  | 'waitingForOperand'
>;

function pressedFor(op: Operator, props: StandardRowProps): boolean {
  return props.activeOperator === op && props.waitingForOperand;
}

/** Row 1: AC / ± / % / ÷ */
export function StandardRow1(props: StandardRowProps): ReactElement {
  const { onClear, onToggleSign, onPercent, onOperator } = props;
  return (
    <>
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
        pressed={pressedFor('/', props)}
        onClick={() => {
          onOperator('/');
        }}
      />
    </>
  );
}

/** Row 2: 7 / 8 / 9 / × */
export function StandardRow2(props: StandardRowProps): ReactElement {
  const { onDigit, onOperator } = props;
  return (
    <>
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
        pressed={pressedFor('*', props)}
        onClick={() => {
          onOperator('*');
        }}
      />
    </>
  );
}

/** Row 3: 4 / 5 / 6 / − */
export function StandardRow3(props: StandardRowProps): ReactElement {
  const { onDigit, onOperator } = props;
  return (
    <>
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
        pressed={pressedFor('-', props)}
        onClick={() => {
          onOperator('-');
        }}
      />
    </>
  );
}

/** Row 4: 1 / 2 / 3 / + */
export function StandardRow4(props: StandardRowProps): ReactElement {
  const { onDigit, onOperator } = props;
  return (
    <>
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
        pressed={pressedFor('+', props)}
        onClick={() => {
          onOperator('+');
        }}
      />
    </>
  );
}

/** Row 5: 0 (wide) / . / = */
export function StandardRow5(props: StandardRowProps): ReactElement {
  const { onDigit, onDecimal, onEquals } = props;
  return (
    <>
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
    </>
  );
}
