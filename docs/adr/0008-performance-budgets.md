# ADR 0008: Performance budgets and web-vitals placement

- **Status:** Accepted
- **Date:** 2026-04-24
- **Deciders:** Karl Groves

## Context

Phase 5 of issue #1 adds performance gates. The section in issue #1 is written
for a full web application, but this repo is a React **library** plus a small
demo used for dev and E2E tests. Several items need adaptation:

- Which artifact gets a size budget — library bundles or the demo build?
- Where Lighthouse runs — CI on every PR, scheduled, or both?
- Should we adopt the React Compiler (Vite plugin) for React 19?
- Where does `web-vitals` belong without leaking into the published library?

## Decision

### Size budgets target the **library bundles**

`size-limit` is configured against `dist/index.mjs`, `dist/index.cjs`, and
`dist/style.css` (the published artifacts):

| Artifact                                               | Budget         |
| ------------------------------------------------------ | -------------- |
| ESM bundle (gzipped, with React/ReactDOM externalized) | 6 KB           |
| CJS bundle (gzipped, with React/ReactDOM externalized) | 6 KB           |
| CSS                                                    | 2 KB (gzipped) |

Current measurements: ESM ≈ 3.9 KB, CJS ≈ 4.1 KB, CSS ≈ 1.4 KB. The budgets
leave ~2x headroom so normal dev adds (a new button, a CSS variable) don't trip
the gate, but a sharp regression (e.g. an accidental dependency bundled into the
library) fails fast.

`size-limit` runs in both `check:ci` and `check:all`, and as a PR job in
`performance.yml`. The PR job adds a comment visible to reviewers.

### Lighthouse CI runs on every PR, against the demo

The demo app is a realistic exercise of the calculator in a browser.
`lighthouserc.cjs` serves `./dist-demo/` via LHCI's internal static server and
runs three Lighthouse passes per PR with `preset: desktop`.

Assertions are set to `error` (not `warn`), so regressions block the PR until
the reviewer either fixes or relaxes the budget with documented justification:

| Assertion                   | Target    |
| --------------------------- | --------- |
| `categories:performance`    | ≥ 0.9     |
| `categories:seo`            | ≥ 0.9     |
| `categories:best-practices` | ≥ 0.9     |
| `largest-contentful-paint`  | ≤ 2500 ms |
| `cumulative-layout-shift`   | ≤ 0.1     |
| `total-blocking-time`       | ≤ 200 ms  |

LHCI categories are limited to `performance`, `seo`, and `best-practices`.
Accessibility is intentionally **not** measured here — per issue #1, that layer
is covered by `@afix/a11y-assert` (arriving in Phase 6). Running two a11y
assertion frameworks in CI would double-report and slow PRs.

INP (Interaction to Next Paint) is not directly assertable in static LHCI runs,
so `total-blocking-time` serves as the proxy.

Reports upload to LHCI's `temporary-public-storage` so anyone on the PR can
click through to the full Lighthouse trace. A repo owner can swap in an LHCI
server or GitHub App token later without config churn.

### Demo output moved to `dist-demo/`

The demo build and the library build both wrote to `dist/` before Phase 5.
Running `npm run build:demo` after `npm run build` silently overwrote the
library artifacts (and vice-versa). Phase 5 adds `build.outDir: 'dist-demo'` to
`vite.demo.config.ts` so:

- `dist/` — published library artifacts (`index.mjs`, `index.cjs`, `style.css`,
  `src/**/*.d.ts`).
- `dist-demo/` — demo app (`index.html`, hashed JS/CSS assets).

Playwright's `webServer.command` (`npm run preview`) runs
`vite preview --config vite.demo.config.ts`, which picks up the new outDir
automatically. `dist-demo/` is git-ignored and Prettier/ Stylelint/markdownlint
ignore it.

### `web-vitals` is **dev-only** and imports dynamically

`src/dev-vitals.ts` registers `onCLS`, `onFCP`, `onINP`, `onLCP`, `onTTFB` and
logs each metric to the console. `main.tsx` imports it only when
`import.meta.env.DEV` is true — so the dynamic import is tree-shaken out of the
production demo build and never appears in the library bundle.

The library bundle (`src/index.ts`) does not import `dev-vitals.ts` at all, so
consumers of the library never pull in `web-vitals`.

`src/dev-vitals.ts` is excluded from `vite-plugin-dts` emission and from the
Vitest coverage include list, since it's pure instrumentation with no runtime
behavior worth asserting.

### React Compiler is deferred

Issue #1 suggests `React Compiler via the Vite plugin if on React 19`. We are on
React 19. However:

- The library ships **pre-built** ESM/CJS. React Compiler runs during the
  consumer's build, so library consumers on React 19 with the compiler plugin
  already get the benefit automatically. Adding the plugin to our own Vite
  config would only affect our demo build, not what we publish.
- The compiler is still maturing. Adopting it inside this repo adds a babel
  dependency to our build with very little demonstrable win for a calculator
  component that re-renders once per user action.
- If the compiler miscompiles our component, we have no easy way to diagnose
  without adding targeted tests.

When React Compiler reaches a clear win/cost threshold for library authors, a
follow-up ADR can revisit.

**2026 review:** see ADR 0011 — deferred again with measured byte-identical
bundle output. Next review 2027-04.

## Alternatives considered

- **Run Lighthouse on a schedule only, not on PRs.** Rejected — perf regressions
  are easiest to catch at the PR that introduces them. A scheduled run would
  only tell us _that_ something regressed, not _which change_ caused it.
- **Include accessibility in the Lighthouse categories.** Rejected — Phase 6's
  `@afix/a11y-assert` is the authoritative a11y gate per issue #1. Lighthouse
  a11y rules are a subset and would noise the LHCI output.
- **Measure size on the bundled demo instead of the library.** Rejected — the
  published artifact is what consumers download. The demo bundles React itself,
  which is not what we ship.
- **Adopt React Compiler now.** Rejected per above. Deferred with a tracking
  note.

## Consequences

- Every PR has three new green checks to earn before merging: `size-limit`,
  `lighthouse`, and the existing `check:ci`.
- Lighthouse CI uploads are public (`temporary-public-storage`). Do not put
  sensitive content in the demo app. For this project that is already the case —
  the demo is a calculator.
- `dist-demo/` is a new ignored directory that Phase 6 and downstream tasks can
  point `@afix/a11y-assert` at for CI-preview a11y assertions.
- Size regressions now fail PRs at the `size-limit` step. Adjusting a budget is
  a real decision: update `.size-limit.json` with a comment referencing the PR
  that justified the change.
- If the Lighthouse scores drift below 0.9 we need to either fix the regression,
  accept a new floor (and document why), or relax the assertion (and document
  why). No silent degradation.
- React Compiler adoption is an explicit follow-up, not forgotten.
