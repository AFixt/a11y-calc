# @afixt/a11y-calc

An accessible calculator React component styled after the macOS built-in
calculator, with basic and scientific modes. Built with accessibility as the
primary design constraint.

## Features

- **Basic mode** — standard four-function calculator (add, subtract, multiply,
  divide, percent, sign toggle)
- **Scientific mode** — trigonometric, logarithmic, exponential, power, root,
  and factorial functions, parentheses, constants (π, e), degree/radian toggle,
  and a "2nd" function key
- **Fully accessible** — screen reader announcements, keyboard support, ARIA
  attributes, high-contrast and reduced-motion support
- **Themeable** — all colors and sizes exposed as CSS custom properties and an
  optional `theme` prop

## Installation

```bash
npm install @afixt/a11y-calc
```

## Usage

```tsx
import { Calculator } from '@afixt/a11y-calc';
import '@afixt/a11y-calc/style.css';

// Basic usage
<Calculator />

// Start in scientific mode
<Calculator initialMode="scientific" />

// Custom theme
<Calculator theme={{
  'calc-bg': '#1a1a2e',
  'btn-operator-bg': '#e94560',
  'btn-number-bg': '#16213e',
  'btn-number-text': '#eee',
  'display-bg': '#0f3460',
  'display-text': '#ffffff',
}} />
```

### Props

| Prop          | Type                      | Default   | Description                         |
| ------------- | ------------------------- | --------- | ----------------------------------- |
| `initialMode` | `'basic' \| 'scientific'` | `'basic'` | Which mode the calculator starts in |
| `theme`       | `CalculatorTheme`         | —         | Partial theme override object       |

## Theming

Every visual property is exposed as a CSS custom property. You can override them
globally in CSS or per-instance via the `theme` prop.

### CSS Custom Properties

| Property                      | Default (dark) | Description                             |
| ----------------------------- | -------------- | --------------------------------------- |
| `--calc-bg`                   | `#2a2a2a`      | Calculator body background              |
| `--calc-radius`               | `12px`         | Border radius of the calculator         |
| `--calc-width`                | `320px`        | Width in basic mode                     |
| `--calc-width-scientific`     | `720px`        | Width in scientific mode                |
| `--display-bg`                | `#1c1c1c`      | Display area background                 |
| `--display-text`              | `#ffffff`      | Display text color                      |
| `--display-font-size`         | `3rem`         | Display number size                     |
| `--btn-size`                  | `70px`         | Minimum button height                   |
| `--btn-font-size`             | `1.5rem`       | Button text size                        |
| `--btn-number-bg`             | `#505050`      | Number button background                |
| `--btn-number-text`           | `#ffffff`      | Number button text                      |
| `--btn-number-hover`          | `#6a6a6a`      | Number button hover                     |
| `--btn-function-bg`           | `#a5a5a5`      | Function button (AC, %, +/-) background |
| `--btn-function-text`         | `#000000`      | Function button text                    |
| `--btn-operator-bg`           | `#f09a36`      | Operator button background              |
| `--btn-operator-text`         | `#ffffff`      | Operator button text                    |
| `--btn-operator-hover`        | `#f5b04e`      | Operator button hover                   |
| `--btn-operator-pressed-bg`   | `#ffffff`      | Active operator background              |
| `--btn-operator-pressed-text` | `#f09a36`      | Active operator text                    |
| `--btn-scientific-bg`         | `#3a3a3a`      | Scientific button background            |
| `--btn-scientific-text`       | `#ffffff`      | Scientific button text                  |
| `--focus-ring-color`          | `#58a6ff`      | Focus indicator color                   |
| `--focus-ring-width`          | `3px`          | Focus indicator width                   |

#### Example: global CSS override

```css
.calculator {
  --calc-bg: #1a1a2e;
  --btn-operator-bg: #e94560;
  --btn-number-bg: #16213e;
}
```

The calculator also responds to `prefers-color-scheme: light`,
`prefers-contrast: more`, and `prefers-reduced-motion: reduce` media queries
automatically.

## Accessibility

### Semantic HTML

- All buttons are native `<button type="button">` elements
- The display uses the `<output>` element
- The calculator container uses `role="application"` with
  `aria-roledescription="calculator"` to allow keyboard passthrough in screen
  readers

### ARIA Attributes

- Every symbolic button has an explicit `aria-label` (e.g., `÷` is labeled
  "Divide", `√x` is "Square root")
- Active operator buttons have `aria-pressed="true"`
- A live region (`aria-live="polite"`) announces every action in natural
  language:
  - Digit press: `"5"`
  - Operator: `"plus"`
  - Equals: `"5 plus 3 equals 8"`
  - Scientific: `"square root of 9 equals 3"`
  - Error: `"Error, cannot divide by zero"`
  - Clear: `"All cleared, 0"`

### Keyboard Support

| Key             | Action                        |
| --------------- | ----------------------------- |
| `0`–`9`         | Input digit                   |
| `.`             | Decimal point                 |
| `+` `-` `*` `/` | Operators                     |
| `Enter` or `=`  | Equals                        |
| `Escape`        | Clear all                     |
| `Backspace`     | Delete last digit             |
| `%`             | Percent                       |
| `^`             | Power (scientific mode)       |
| `(` `)`         | Parentheses (scientific mode) |

### Visual Accessibility

- Minimum 44px touch targets on all calculator buttons
- Visible focus indicators (never suppressed)
- Light/dark mode support (`prefers-color-scheme`)
- High contrast support (`prefers-contrast: more`)
- Reduced motion support (`prefers-reduced-motion`)
- Font sizes use `rem` units

## Scientific Mode Functions

| Button       | Aria Label                                      | Function                          |
| ------------ | ----------------------------------------------- | --------------------------------- |
| sin / asin   | Sine / Arc sine                                 | Trigonometric sine and inverse    |
| cos / acos   | Cosine / Arc cosine                             | Trigonometric cosine and inverse  |
| tan / atan   | Tangent / Arc tangent                           | Trigonometric tangent and inverse |
| sinh / asinh | Hyperbolic sine / Inverse hyperbolic sine       | Hyperbolic functions              |
| cosh / acosh | Hyperbolic cosine / Inverse hyperbolic cosine   | Hyperbolic functions              |
| tanh / atanh | Hyperbolic tangent / Inverse hyperbolic tangent | Hyperbolic functions              |
| ln / log₁₀   | Natural log / Log base 10                       | Logarithms                        |
| x² / x³      | x squared / x cubed                             | Powers                            |
| xⁿ           | x to the power of n                             | Arbitrary power                   |
| eˣ / 10ˣ     | e to the power / 10 to the power                | Exponentials                      |
| √x / ∛x      | Square root / Cube root                         | Roots                             |
| 1/x          | Reciprocal                                      | Reciprocal                        |
| x!           | Factorial                                       | Factorial                         |
| π            | Pi                                              | 3.14159...                        |
| e            | Euler's number e                                | 2.71828...                        |
| Rad/Deg      | Switch angle mode                               | Toggle radians/degrees            |
| 2nd          | Second function                                 | Toggles alternate functions       |

## Development

```bash
npm install            # Install dependencies
npm run dev            # Start demo dev server
npm run build          # Type-check and build library (dist/)
npm run build:demo     # Build the demo app
npm run lint           # ESLint
npm test               # Unit tests (vitest)
npm run test:watch     # Tests in watch mode
npm run test:coverage  # Tests with coverage report
npm run test:e2e       # Build demo + run Playwright E2E tests
```

## Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for bundling
- [Vitest](https://vitest.dev/) +
  [Testing Library](https://testing-library.com/) for unit tests
- [Playwright](https://playwright.dev/) for E2E tests

## License

MIT
