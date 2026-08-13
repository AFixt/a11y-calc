# Calculator use cases

Every user-facing interaction of the `Calculator` component, documented in the
[`@afixt/usecase-runner`](https://www.npmjs.com/package/@afixt/usecase-runner)
YAML DSL so the flows can be exercised by automation. Each `.uc.yaml` file is
one use case; the runner turns each into a Playwright test that targets elements
**through the accessibility tree** (`getByRole` / `getByLabel`). A step that
can't find an element by its role and accessible name is, by design, an
accessibility finding.

This documents [issue #4](https://github.com/AFixt/a11y-calc/issues/4).

## Prerequisites

The use cases drive the bundled demo app (`src/App.tsx`) served at
`http://localhost:4173`. Build and serve it first:

```bash
npm run build:demo
npm run preview        # serves http://localhost:4173
```

Install the runner and Playwright (peer dependency) if you haven't:

```bash
npm install --save-dev @afixt/usecase-runner @playwright/test
npx playwright install chromium
```

## Running

From the repo root, with the demo served on :4173:

```bash
# Validate the YAML without running anything
npx usecase-runner validate ./usecases --config ./usecases/usecase-runner.config.yaml

# Execute every use case and write JSON + HTML reports to ./usecases/reports
npx usecase-runner run ./usecases --config ./usecases/usecase-runner.config.yaml

# Or generate committable Playwright .spec.ts files
npx usecase-runner generate ./usecases --outdir ./usecases/generated \
  --config ./usecases/usecase-runner.config.yaml
```

## What each step asserts

Every interactive step follows the runner's **locate → focus → act** pattern:

1. `locate` — the button is present in the accessibility tree (correct role +
   accessible name).
2. `focus` — the button can take keyboard focus.
3. `activate` / `enter` — the interaction itself.

Results are checked with `verify: live_region "<value>"`. The display is a
native `<output>` element, whose implicit ARIA role is `status` (a polite live
region), so this assertion reads the value exactly as assistive technology would
announce it.

## Coverage

Basic mode:

- `basic-addition.uc.yaml` — add two numbers (`7 + 5 = 12`)
- `basic-subtraction.uc.yaml` — subtract (`8 - 3 = 5`)
- `basic-multiplication.uc.yaml` — multiply (`6 x 7 = 42`)
- `basic-division.uc.yaml` — divide (`8 / 2 = 4`)
- `divide-by-zero.uc.yaml` — error path; extends division, divides by zero
- `decimal-input.uc.yaml` — decimal point entry (`3.14`)
- `chained-operations.uc.yaml` — immediate-execution chaining (`2 + 3 + 4 = 9`)
- `toggle-sign.uc.yaml` — `+/-` sign toggle
- `percent.uc.yaml` — `%` key (`50` becomes `0.5`)
- `clear-all.uc.yaml` — `AC` all-clear

Keyboard:

- `keyboard-arithmetic.uc.yaml` — physical-keyboard digits/operators/Enter
- `keyboard-clear-and-backspace.uc.yaml` — Backspace and Escape keys
- `keyboard-scientific.uc.yaml` — `^`, `(` and `)` keys in scientific mode

Mode and scientific functions:

- `switch-to-scientific-mode.uc.yaml` — mode toggle reveals scientific controls
- `scientific-square.uc.yaml` — square (`5` becomes `25`)
- `scientific-square-root.uc.yaml` — square root (`9` becomes `3`)
- `scientific-power.uc.yaml` — power (`2 ^ 3 = 8`)
- `scientific-factorial.uc.yaml` — factorial (`5` becomes `120`)
- `scientific-reciprocal.uc.yaml` — reciprocal (`4` becomes `0.25`)
- `scientific-logarithm.uc.yaml` — natural log (`ln(1) = 0`)
- `scientific-constants.uc.yaml` — the `pi` and `e` constants
- `scientific-second-function.uc.yaml` — `2nd` toggle swaps `sin` for `asin`
- `scientific-inverse-trig.uc.yaml` — inverse trig in degrees (`asin(1) = 90`)
- `scientific-angle-mode-toggle.uc.yaml` — radians/degrees toggle
- `scientific-parentheses.uc.yaml` — grouping (`(2 + 3) x 4 = 20`)
- `scientific-hyperbolic.uc.yaml` — hyperbolic cosine (`cosh(0) = 1`)
- `scientific-inverse-hyperbolic.uc.yaml` — inverse hyperbolic cosine via 2nd
  (`acosh(1) = 0`)
- `scientific-logarithm-base10.uc.yaml` — log base 10 via 2nd (`log10(100) = 2`)
- `scientific-cube.uc.yaml` — cube via 2nd (`2` becomes `8`)
- `scientific-cube-root.uc.yaml` — cube root via 2nd (`27` becomes `3`)
- `scientific-exponential.uc.yaml` — `eˣ` and `10ˣ` (`e⁰ = 1`, `10² = 100`)
- `scientific-domain-error.uc.yaml` — error path; square root of a negative
  number surfaces `Error`

Accessibility-focused:

- `announce-actions.uc.yaml` — screen-reader announcements (`sr_says`)
- `audit-full-page.uc.yaml` — automated WCAG audit of the page (`audit: page`)
- `every-button-is-reachable.uc.yaml` — every button: present in the a11y tree
  and keyboard-focusable

### Optional peer dependencies

- `announce-actions.uc.yaml` uses `sr_says`, which needs
  `@guidepup/virtual-screen-reader`.
- `audit-full-page.uc.yaml` uses `audit: page`, which needs
  `@afixt/afixt-engine`.

Both files note this inline. The rest run with only `@playwright/test`.
