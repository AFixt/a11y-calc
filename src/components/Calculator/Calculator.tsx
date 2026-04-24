import {
  useCallback,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
} from 'react';

import { useCalculator } from '../../hooks/useCalculator';

import { ButtonPanel } from './ButtonPanel';
import { Display } from './Display';

import type { CalculatorMode, CalculatorTheme, Operator } from '../../types/calculator';

import './Calculator.css';

const KEY_TO_OPERATOR: Record<string, Operator> = {
  '+': '+',
  '-': '-',
  '*': '*',
  '/': '/',
  '^': '^',
};

/**
 * Public props for {@link Calculator}.
 */
export interface CalculatorProps {
  /** Optional CSS custom property overrides applied as inline style on the root. */
  theme?: CalculatorTheme;
  /** Which button layout to start in. Defaults to `'basic'`. */
  initialMode?: CalculatorMode;
}

/**
 * Accessible calculator component with basic and scientific modes.
 * Owns its own keyboard handler, live region, and mode/2nd-function toggles,
 * and wraps the `useCalculator` hook for arithmetic state.
 */
export function Calculator({ theme, initialMode = 'basic' }: CalculatorProps): ReactElement {
  const {
    displayValue,
    operator,
    waitingForOperand,
    expression,
    announcement,
    announcementKey,
    angleMode,
    parenDepth,
    inputDigit,
    inputDecimal,
    inputOperator,
    performCalculation,
    clearAll,
    toggleSign,
    inputPercent,
    backspace,
    applyScientificFunction,
    toggleAngleMode,
    inputConstant,
    openParen,
    closeParen,
  } = useCalculator();

  const [mode, setMode] = useState<CalculatorMode>(initialMode);
  const [isSecondFunction, setIsSecondFunction] = useState(false);

  const handleToggleMode = useCallback(() => {
    setMode((m) => (m === 'basic' ? 'scientific' : 'basic'));
  }, []);

  const handleToggleSecondFunction = useCallback(() => {
    setIsSecondFunction((s) => !s);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const { key } = e;
      const mappedOperator = KEY_TO_OPERATOR[key];

      if (key >= '0' && key <= '9') {
        e.preventDefault();
        inputDigit(key);
      } else if (key === '.') {
        e.preventDefault();
        inputDecimal();
      } else if (mappedOperator !== undefined) {
        e.preventDefault();
        inputOperator(mappedOperator);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        performCalculation();
      } else if (key === 'Escape') {
        e.preventDefault();
        clearAll();
      } else if (key === 'Backspace') {
        e.preventDefault();
        backspace();
      } else if (key === '%') {
        e.preventDefault();
        inputPercent();
      } else if (key === '(' && mode === 'scientific') {
        e.preventDefault();
        openParen();
      } else if (key === ')' && mode === 'scientific') {
        e.preventDefault();
        closeParen();
      }
    },
    [
      inputDigit,
      inputDecimal,
      inputOperator,
      performCalculation,
      clearAll,
      backspace,
      inputPercent,
      openParen,
      closeParen,
      mode,
    ],
  );

  const themeStyle: CSSProperties | undefined = theme
    ? (Object.fromEntries(
        Object.entries(theme).map(([key, value]) => [`--${key}`, value]),
      ) as CSSProperties)
    : undefined;

  const containerClass = mode === 'scientific' ? 'calculator calculator--scientific' : 'calculator';

  return (
    // role="application" is the correct semantic for a calculator widget that
    // owns its own keyboard model. The jsx-a11y heuristic does not understand
    // this pattern, so the rule is disabled on this element.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      className={containerClass}
      style={themeStyle}
      role="application"
      aria-label="Calculator"
      aria-roledescription="calculator"
      onKeyDown={handleKeyDown}
    >
      {/* Live region for screen reader announcements */}
      <div
        key={announcementKey}
        className="sr-only"
        role="log"
        aria-live="polite"
        aria-atomic="true"
        aria-label="Calculator announcements"
        data-testid="announcements"
      >
        {announcement}
      </div>

      <div className="calc-toolbar">
        <button
          type="button"
          className="calc-mode-toggle"
          aria-pressed={mode === 'scientific'}
          onClick={handleToggleMode}
          data-testid="mode-toggle"
        >
          {mode === 'scientific' ? 'Basic' : 'Scientific'}
        </button>
      </div>

      <Display
        value={displayValue}
        expression={expression}
        mode={mode}
        angleMode={angleMode}
        parenDepth={parenDepth}
      />
      <ButtonPanel
        mode={mode}
        onDigit={inputDigit}
        onDecimal={inputDecimal}
        onOperator={inputOperator}
        onEquals={performCalculation}
        onClear={clearAll}
        onToggleSign={toggleSign}
        onPercent={inputPercent}
        activeOperator={operator}
        waitingForOperand={waitingForOperand}
        angleMode={angleMode}
        isSecondFunction={isSecondFunction}
        onScientificFunction={applyScientificFunction}
        onToggleAngleMode={toggleAngleMode}
        onToggleSecondFunction={handleToggleSecondFunction}
        onConstant={inputConstant}
        onOpenParen={openParen}
        onCloseParen={closeParen}
      />
    </div>
  );
}
