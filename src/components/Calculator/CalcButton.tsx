import type { ButtonHTMLAttributes, ReactElement } from 'react';

/**
 * Props for {@link CalcButton}. Accepts all native `<button>` attributes in
 * addition to the label/variant controls.
 */
export interface CalcButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visible text on the button. */
  label: string;
  /** Screen-reader-friendly description. */
  ariaLabel: string;
  /** Visual variant. Drives background, text color, and hover/active state. */
  variant?: 'number' | 'operator' | 'function' | 'scientific';
  /** Whether the button should span two grid columns (used for `0`). */
  wide?: boolean;
  /**
   * Operator-variant pressed state. When `true`, renders `aria-pressed="true"`
   * and the pressed visual styling. Ignored for non-operator variants.
   */
  pressed?: boolean;
}

/**
 * Native `<button>` wrapper that normalizes the calculator's visual and
 * accessibility patterns: explicit `type="button"`, mandatory `aria-label`,
 * variant-driven class set, and `aria-pressed` for operator toggle state.
 */
export function CalcButton({
  label,
  ariaLabel,
  variant = 'number',
  wide = false,
  pressed,
  className = '',
  ...rest
}: CalcButtonProps): ReactElement {
  const classes = ['calc-btn', `calc-btn--${variant}`, wide ? 'calc-btn--wide' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      aria-label={ariaLabel}
      aria-pressed={variant === 'operator' && pressed !== undefined ? pressed : undefined}
      {...rest}
    >
      {label}
    </button>
  );
}
