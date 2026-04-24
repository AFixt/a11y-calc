# ADR 0005: ESLint expansion calibrations and refactors

- **Status:** Accepted
- **Date:** 2026-04-23
- **Deciders:** Karl Groves

## Context

Phase 2 adopts the full ESLint plugin set prescribed by issue #1
(`strict-type-checked`, `stylistic-type-checked`, `jsx-a11y`, `sonarjs`,
`security`, `unicorn`, `import-x`, `promise`, `n`, `jsdoc`, `no-secrets`,
`react`). A number of rules required either calibration away from the issue's
default thresholds, small rule-level adjustments, or source refactors to pass
without silently weakening the gate.

## Decision

### Threshold calibrations

| Rule                           | Issue default | This repo | Rationale                                                                                                                        |
| ------------------------------ | ------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `max-lines`                    | 300           | 400       | Reducer + handler-map pattern in `useCalculator.ts` sits at ~350 lines; splitting across files adds indirection without benefit. |
| `max-lines-per-function`       | 75            | 200       | `ScientificPanel` render function still exceeds 75 after row extraction. Dropping to 75 would force pointless micro-components.  |
| `complexity` (cyclomatic)      | 10            | 15        | Each `if/else if` ladder in `handleKeyDown` registers as one complexity point; the keyboard dispatcher is still readable at 12.  |
| `sonarjs/cognitive-complexity` | 15            | 20        | Same concern as `complexity`, applied to sonarjs's cognitive variant.                                                            |

Thresholds remain strict enough to flag genuinely complex code; the calibrations
match the shape of an accessible-calculator React library rather than a backend
service.

### Source refactors to meet rules

- **`calculate.ts`, `scientificCalculate.ts`** — the symbol/word mappings
  (`operatorToSymbol`, `operatorToWord`, `scientificFunctionToWord`) and the
  scientific evaluator (`evaluateScientificFunction`) moved from exhaustive
  `switch` statements to `Record<K, V>` lookup tables. Drops four complexity
  violations and clarifies that these functions are pure data dispatch.
- **`useCalculator.ts`** — the 230-line reducer became a
  `Record<ActionType, Handler>` dispatch table with one small pure function per
  action type. Drops cognitive complexity from 62 to well under 20 and brings
  the reducer body to a single line.
- **`ButtonPanel.tsx`** — the monolithic 229-line panel became a thin dispatcher
  calling either `<BasicPanel>` or `<ScientificPanel>`. The scientific panel
  delegates its scientific rows to four small row components (`ScientificRow1` …
  `ScientificRow4`). Trig/hyperbolic buttons collapse into `.map()` over a typed
  table rather than hand-written JSX.
- **`<div role="group">` → `<fieldset>`** — the button grid in both panels now
  uses `<fieldset>` with `aria-label`, satisfying
  `jsx-a11y/prefer-tag-over-role` without adding a wrapper.
- **JSDoc on public surface** — every exported function, type, and interface
  gained a TSDoc-style block description. Internal helpers do not require JSDoc
  (enforced via `publicOnly: true`).
- **Explicit return types on exported functions** — component exports now carry
  `: ReactElement` return types per
  `@typescript-eslint/explicit-module-boundary-types`.

### Rule-level adjustments beyond issue #1

- `@typescript-eslint/naming-convention` — added `function` and `import`
  selectors with `['camelCase', 'PascalCase']` so React component names and
  their imports pass without per-file overrides.
- `@typescript-eslint/restrict-template-expressions` — `{ allowNumber: true }`
  because the calculator legitimately interpolates numbers (paren depth, parsed
  display values) into speech strings.
- `jsdoc/require-jsdoc` — `publicOnly: true`. Issue #1's context list included
  `TSInterfaceDeclaration` and `TSTypeAliasDeclaration` without the
  `ExportNamedDeclaration >` parent selector, which fires on internal types.
  Only public types merit documentation.
- `unicorn/filename-case` — added `camelCase` to the allowed set because React
  hooks (`useCalculator.ts`) are conventionally camelCase.
- `security/detect-object-injection` — disabled. The existing
  `KEY_TO_OPERATOR[key]` and `parenStack[len-1]` patterns are safe
  (bounded-domain indexes and stack tops); the rule reports only noise on a
  component library with no user-controlled object lookups.
- `@typescript-eslint/no-non-null-assertion` — disabled in `main.tsx` only, for
  the canonical `document.getElementById('root')!` Vite bootstrap.
- `import-x/no-default-export` — disabled for entrypoints and config files
  (`src/main.tsx`, `src/App.tsx`, `vite.config.ts`, `vite.demo.config.ts`,
  `eslint.config.js`, `playwright.config.ts`).
- `jsx-a11y/no-noninteractive-element-interactions` — disabled on the single
  line where the calculator root renders
  `<div role="application" onKeyDown={...}>`. `application` is the correct ARIA
  semantic for a widget owning its own keyboard model, but the plugin's static
  heuristic does not recognize it.

### Tooling interactions

- `prettier-plugin-organize-imports` was **removed** from the Prettier plugin
  set. It and `eslint-plugin-import-x`'s `import-x/order` rule produce
  conflicting orderings (plugin collapses into a single group alphabetized; rule
  enforces multi-group with newlines between). ESLint's `import-x/order` is now
  the sole import organizer.
- `tsconfig.test.json` added as a third project reference so ESLint's typed-lint
  rules can parse test files, `src/test-setup.ts`, and the Playwright config.
  `tsconfig.app.json` excludes those files because they must not ship in the
  library type output.

## Alternatives considered

- **Ship issue #1's thresholds unchanged** — the reducer, the scientific panel,
  and the keyboard dispatcher would all need either rule suppressions or very
  artificial splits. Calibrated thresholds read as "this gate catches genuinely
  big/complex code, not a reducer with 13 legitimate cases."
- **Disable `complexity` and `cognitive-complexity` entirely** — would let
  future drift slip through unnoticed. Rejected.
- **Keep `prettier-plugin-organize-imports`** — would need to either drop
  `import-x/order` or write a custom format matching the plugin's single-group
  output. Rejected because `import-x/order` is the rule prescribed by issue #1.

## Consequences

- Phase 3 (Husky) can wire `npm run lint` into `pre-commit` knowing it will flag
  genuine regressions, not trigger on baseline code.
- New code reviewers now have explicit threshold guidance: if a new function
  exceeds 200 lines or 20 cognitive complexity, something is probably wrong and
  should be split.
- Adding new scientific button rows follows the established `<ScientificRowN>`
  pattern instead of growing the single-render function.
- Public API surface is documented via TSDoc; consumers importing the library
  see hover-doc for every exported symbol.
- Imports are governed by a single tool. Developers should not install a VS Code
  "organize imports on save" extension that conflicts with `import-x/order`.
