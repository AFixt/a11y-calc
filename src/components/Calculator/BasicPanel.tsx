import { CalcButton } from './CalcButton';

import type { ButtonPanelProps } from './ButtonPanel';
import type { Operator } from '../../types/calculator';
import type { ReactElement } from 'react';

/**
 * 4-column basic calculator grid: AC / ± / % / ÷ / 7-9 × / 4-6 − / 1-3 + /
 * 0 (wide) . =. Does not render any scientific-mode controls.
 */
export function BasicPanel(props: ButtonPanelProps): ReactElement {
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
    <fieldset className="calc-buttons" aria-label="Calculator buttons">
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
