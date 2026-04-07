import { useCallback, useState } from 'react';
import type { Operator, CalculatorMode, CalculatorTheme } from '../../types/calculator';
import { useCalculator } from '../../hooks/useCalculator';
import { Display } from './Display';
import { ButtonPanel } from './ButtonPanel';
import './Calculator.css';

const KEY_TO_OPERATOR: Record<string, Operator> = {
  '+': '+',
  '-': '-',
  '*': '*',
  '/': '/',
  '^': '^',
};

interface CalculatorProps {
  theme?: CalculatorTheme;
  initialMode?: CalculatorMode;
}

export function Calculator({ theme, initialMode = 'basic' }: CalculatorProps) {
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
    (e: React.KeyboardEvent) => {
      const { key } = e;

      if (key >= '0' && key <= '9') {
        e.preventDefault();
        inputDigit(key);
      } else if (key === '.') {
        e.preventDefault();
        inputDecimal();
      } else if (key in KEY_TO_OPERATOR) {
        e.preventDefault();
        inputOperator(KEY_TO_OPERATOR[key]);
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
    [inputDigit, inputDecimal, inputOperator, performCalculation, clearAll, backspace, inputPercent, openParen, closeParen, mode],
  );

  const themeStyle = theme
    ? (Object.fromEntries(
        Object.entries(theme).map(([key, value]) => [`--${key}`, value]),
      ) as React.CSSProperties)
    : undefined;

  const containerClass = mode === 'scientific'
    ? 'calculator calculator--scientific'
    : 'calculator';

  return (
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
