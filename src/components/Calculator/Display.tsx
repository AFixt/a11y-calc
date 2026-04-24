import type { AngleMode, CalculatorMode } from '../../types/calculator';
import type { ReactElement } from 'react';

/**
 * Props for {@link Display}.
 */
export interface DisplayProps {
  /** Primary display string (digits, `'Error'`, or a formatted number). */
  value: string;
  /** Secondary "tape" expression shown above the main value. */
  expression: string;
  /** Active calculator mode; indicators are only shown in scientific mode. */
  mode?: CalculatorMode;
  /** Angle unit displayed as a small indicator in scientific mode. */
  angleMode?: AngleMode;
  /** Open-paren depth indicator shown in scientific mode. Defaults to `0`. */
  parenDepth?: number;
}

/**
 * Calculator display. Renders the primary value in an `<output>` element
 * with a dynamic accessible label, plus secondary indicators (angle mode,
 * open-paren depth, expression tape) in scientific mode.
 */
export function Display({
  value,
  expression,
  mode,
  angleMode,
  parenDepth = 0,
}: DisplayProps): ReactElement {
  const spokenValue =
    value === 'Error'
      ? 'Error'
      : parseFloat(value) < 0
        ? `negative ${Math.abs(parseFloat(value))}`
        : value;

  const showIndicators = mode === 'scientific';

  return (
    <div className="calc-display">
      <div className="calc-display__info" aria-hidden="true">
        {showIndicators ? (
          <span className="calc-display__angle-mode">{angleMode === 'deg' ? 'DEG' : 'RAD'}</span>
        ) : null}
        {showIndicators && parenDepth > 0 ? (
          <span className="calc-display__parens">{'('.repeat(parenDepth)}</span>
        ) : null}
        {expression ? <span className="calc-display__expression">{expression}</span> : null}
      </div>
      <output
        className="calc-display__value"
        aria-label={`Result: ${spokenValue}`}
        data-testid="display"
      >
        {value}
      </output>
    </div>
  );
}
