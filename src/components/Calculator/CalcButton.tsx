import type { ButtonHTMLAttributes } from 'react';

interface CalcButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  ariaLabel: string;
  variant?: 'number' | 'operator' | 'function' | 'scientific';
  wide?: boolean;
  pressed?: boolean;
}

export function CalcButton({
  label,
  ariaLabel,
  variant = 'number',
  wide = false,
  pressed,
  className = '',
  ...rest
}: CalcButtonProps) {
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
