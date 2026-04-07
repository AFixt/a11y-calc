import type { AngleMode, CalculatorMode } from '../../types/calculator';

interface DisplayProps {
  value: string;
  expression: string;
  mode?: CalculatorMode;
  angleMode?: AngleMode;
  parenDepth?: number;
}

export function Display({ value, expression, mode, angleMode, parenDepth = 0 }: DisplayProps) {
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
        {showIndicators && (
          <span className="calc-display__angle-mode">
            {angleMode === 'deg' ? 'DEG' : 'RAD'}
          </span>
        )}
        {showIndicators && parenDepth > 0 && (
          <span className="calc-display__parens">
            {'('.repeat(parenDepth)}
          </span>
        )}
        {expression && (
          <span className="calc-display__expression">
            {expression}
          </span>
        )}
      </div>
      <output className="calc-display__value" aria-label={`Result: ${spokenValue}`} data-testid="display">
        {value}
      </output>
    </div>
  );
}
