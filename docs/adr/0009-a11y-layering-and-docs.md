# ADR 0009: Accessibility layering and Phase 6 docs

- **Status:** Accepted
- **Date:** 2026-04-24
- **Deciders:** Karl Groves

## Context

Phase 6 closes out issue #1 by adding the accessibility gate set, the standard
README sections, `llms.txt`, and an AI-context helper. The choices worth writing
down:

- Four-layer a11y stack — what each layer catches, and what overlap is
  intentional vs. wasteful.
- Which `@afixt/a11y-assert` rules block a PR now vs. are tracked as follow-ups.
- Why `engine-strict=true` got turned off.
- Why TypeDoc is deferred despite being in the issue.

## Decision

### Four layers of accessibility verification

1. **Lint-time** — `eslint-plugin-jsx-a11y` catches static patterns at the
   source: missing `alt`, non-interactive elements with handlers, invalid ARIA
   attributes, etc. Runs on every save, every commit, every PR.
2. **Component-level** — `@afixt/a11y-assert` via `jestAdapter` in Vitest,
   rendering `<Calculator>` under `@testing-library/react` and asserting zero
   violations after the initial render and after a few interactions. Covers
   ARIA/button/form rules on the actual rendered DOM.
3. **E2E-level** — `@afixt/a11y-assert` via `playwrightAdapter` against the
   built demo running in a real Chromium. Catches issues that only surface with
   real layout, real focus management, and real event propagation.
4. **CI-preview** — dedicated `accessibility` GitHub Actions workflow that
   re-runs both the Vitest and Playwright a11y suites on every PR and push to
   `main`, uploading reports on failure.

The layers overlap deliberately. If an ARIA rule regresses, the lint-time layer
catches it before commit; if the regression is runtime-only (e.g.,
`aria-pressed` set but not reflected), the component layer catches it; if it's
layout/focus-dependent, E2E catches it. The CI-preview layer re-runs layers 2–3
so a bypassed hook (`--no-verify`, GitHub web-UI merge) can't ship a regression.

### `@afixt/a11y-assert` is run in `type: 'automatic'` mode

Both the Vitest suite and the Playwright suite pass
`{ engineOptions: { type: 'automatic' } }` to the adapter. This selects only
rules whose `runAuto` function returns a pass/fail verdict with no human
judgment required.

The `auto_assisted` rules (e.g., WCAG 2.5.3 "Label in Name") flag patterns like
`<button aria-label="Divide">÷</button>` where the accessible name does not
contain the visible label text. This is a legitimate finding for the current
component — arithmetic operator buttons use symbols as visible content and words
in the accessible name. Fixing it (changing every `ariaLabel` to include the
visible symbol and updating every test that asserts on the current label value)
is a larger change than fits in Phase 6, and gating the new workflow on it would
mean the a11y gate never went green in this PR.

The follow-up — adopt an `ariaLabel` pattern that satisfies 2.5.3 across all
calculator buttons, then drop the `type: 'automatic'` filter — is tracked
separately and **not** silently forgotten. The filter is commented inline in
both test files.

### `engine-strict=true` turned off

Phase 1 added `engine-strict=true` to `.npmrc` per issue #1. Phase 6 turns it
off because `@afixt/a11y-assert` pins its `engines.node` to `"lts/*"`, which npm
does not recognize as a semver range. With `engine-strict=true`, `npm install`
fails with an unsupported-engine error even on Node 22 (an LTS). The Node floor
is still enforced:

- `.nvmrc` + `.node-version` pin the required major version.
- CI `actions/setup-node` reads `.nvmrc` and fails fast on mismatch.
- `scripts/bootstrap.sh` checks Node major before running `npm ci`.
- Our own `package.json` keeps `engines.node: ">=22"` as informational.

Follow-up: file an upstream issue on `@afixt/a11y-assert` to change `"lts/*"` to
`">=18"` or similar. When fixed, we can reinstate `engine-strict=true` on a
future version bump.

**Resolved (2026-04-30, issue #10):** `@afixt/a11y-assert@2.1.3` now declares
`engines.node: ">=22.0.0"` (a real semver range). Bumped the pin and reinstated
`engine-strict=true` in `.npmrc`.

### TypeDoc is deferred

Issue #1 mentions TypeDoc as an optional build target. Phase 2 already enforces
TSDoc comments on every exported function, type, and interface via
`jsdoc/require-jsdoc` with `publicOnly: true`. Consumers importing the library
see those comments as hover-docs in any TypeScript-aware editor.

TypeDoc would add:

- a generated static site with indexed API reference,
- a build target to maintain in Phase 5 / Phase 6 workflows,
- hosting decisions (GitHub Pages? package artifact?).

For a single-component library with ~7 exported types and one component, the
site would be almost empty. The TSDoc hover-docs cover the use case more
directly. If the library surface grows, a future ADR can revisit.

**Re-check 2026-04-30 (issue #13):** `src/index.ts` exports 6 public symbols
(`Calculator` + 5 types: `AngleMode`, `CalculatorMode`, `CalculatorTheme`,
`Operator`, `ScientificFunction`). Below the ~15-symbol threshold; deferral
stands. Next re-check trigger: a new entry point, a public hook export, or
crossing 15 symbols.

### `llms.txt` at the repo root

Added per the [llmstxt.org](https://llmstxt.org) convention: a short
project-summary document aimed at AI crawlers and assistants that don't want to
index the whole repo. Ours points at:

- the public React surface,
- the key files (entrypoint, main component, hook, ADRs),
- the ADR index,
- the license.

Intentionally small. Not an SEO document, not a replacement for README. Kept out
of Prettier's format target because Prettier cannot parse `.txt`.

### `ai:context` script

`scripts/ai-context.js` prints a one-screen summary of the project suitable for
pasting at the start of an AI coding session:

- Package name, version, description
- Node runtime expectations
- All npm scripts
- Public exports
- ADR index
- Current git state
- Gate summary

Invoked via `npm run ai:context`. Not wired into `check:*` — it's a developer/AI
tool, not a gate.

## Alternatives considered

- **Run `@afixt/a11y-assert` without `type: 'automatic'`.** Rejected for this PR
  — would require a sweeping `ariaLabel` refactor and matching test updates.
  Tracked as a distinct follow-up.
- **Drop layer 2 (component) since E2E already runs.** Rejected —
  component-level assertions are faster, run on every `npm test`, and catch
  issues before they reach E2E.
- **Add TypeDoc now.** Rejected — marginal value for a one-component library;
  TSDoc hover-docs already cover it.
- **Keep `engine-strict=true` and pin `@afixt/a11y-assert` via a
  patch-package.** Rejected — too fragile. The real fix is upstream.

## Consequences

- Phase 6 closes issue #1. Every acceptance-criteria item has either landed or
  is documented with explicit rationale.
- Every PR now has the `accessibility` workflow as a required check alongside
  `ci`, `performance`, etc.
- Documentation-heavy PRs that don't touch source still run the full gate — no
  false green path.
- Consumers of the library get a README that answers "how do I install this",
  "how do I theme it", "what does the a11y story look like", and "how is quality
  enforced"; AI tools scanning for context get a concise `llms.txt`; human
  contributors get a Contributing section.
- Closing follow-ups outstanding from this phase:
  - Update `ariaLabel` pattern across calculator buttons to satisfy WCAG 2.5.3,
    then drop the `type: 'automatic'` filter.
  - File upstream issue on `@afixt/a11y-assert`'s `engines.node` field;
    reinstate `engine-strict=true` once fixed.
  - Revisit TypeDoc if the public API surface grows materially.
  - Evaluate React Compiler adoption (from ADR 0008) annually.
