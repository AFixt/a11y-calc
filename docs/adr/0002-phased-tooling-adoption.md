# ADR 0002: Adopt the standardized tooling stack in phases

- **Status:** Accepted
- **Date:** 2026-04-23
- **Deciders:** Karl Groves

## Context

Issue #1 specifies a large, opinionated tooling stack spanning TypeScript
strictness, ESLint plugins, Prettier, Stylelint, markdownlint, jscpd, lychee,
license-checker, Husky hooks, commitlint, gitleaks, Semgrep, OSV-Scanner, OWASP
Dependency-Check, OWASP ZAP, CodeQL, size-limit, Lighthouse CI, a11y assertion
libraries, GitHub Actions, Dependabot, and ADR/docs scaffolding.

Adopting everything in a single change would:

- Produce an unreviewable mega-PR.
- Mix cheap/safe additions (editorconfig, npmrc) with invasive changes
  (`strict-type-checked` ESLint rules, `max-lines-per-function: 75`,
  `sonarjs/cognitive-complexity: 15`) that demand per-function judgment.
- Make bisection of regressions difficult.

## Decision

We adopt the stack across six PRs, each stand-alone and revertable:

1. **Foundations & formatting** (this phase) — `.editorconfig`, `.npmrc`,
   `.nvmrc`, `.node-version`, Prettier + `prettier-plugin-organize-imports` +
   `eslint-config-prettier`, Stylelint + a11y plugin, markdownlint-cli2,
   `@total-typescript/ts-reset`, tightened TS strictness, `docs/adr/`,
   `docs/templates/`, new npm scripts (`typecheck`, `format`, `stylelint`,
   `markdownlint`, and their `:fix` variants), `engines.node`.
2. **ESLint expansion** — `jsx-a11y`, `sonarjs`, `security`, `unicorn`,
   `import-x`, `promise`, `n`, `jsdoc`, `no-secrets`, `strict-type-checked`.
   Rules land at `warn` first, then are tightened to `error` as code is updated.
   Complexity/length caps (`max-lines-per-function`, `cognitive-complexity`) are
   calibrated to the existing code base and potentially file-split refactors are
   tracked separately.
3. **Husky + local gates** — Husky, lint-staged, commitlint, gitleaks, jscpd,
   lychee, license-checker, Semgrep, OSV-Scanner, CodeQL CLI, OWASP
   Dependency-Check CLI, OWASP ZAP. Wired into `pre-commit`, `commit-msg`,
   `pre-push`, and `post-merge`. CodeQL and Dependency-Check run in `pre-push`;
   ZAP runs via a dedicated `test:zap` script that spins up `vite preview` on
   demand (not on every push). See ADR 0003.
4. **GitHub Actions + Dependabot** — CI safety net, scheduled security and docs
   workflows, Dependabot config.
5. **Performance** — size-limit, Lighthouse CI (performance, SEO, best-practices
   only; a11y covered by `@afix/a11y-assert`), `web-vitals` in dev.
6. **A11y depth + docs** — `@afix/a11y-assert` at component, E2E, and CI-preview
   layers; README standard sections; bootstrap script.

Each PR must leave `npm run check:all` (as it exists at that point) green on a
clean clone.

## Alternatives considered

- **Single mega-PR.** Rejected — unreviewable, high merge risk, hard to revert a
  single faulty item.
- **Feature-branch stacking with all phases open simultaneously.** Rejected for
  Phase 1 because acceptance of Phase 1 settings affects downstream tuning
  (e.g., BEM naming exceptions, `strict` tsconfig) and we want each earlier
  decision to land before layering the next.
- **Skip phases 4–6 entirely.** Rejected — performance and a11y-CI gates are
  explicitly called for in the issue.

## Consequences

- Phase 1 ships a narrow, low-risk change and establishes the ADR and docs
  structure that subsequent phases will reference.
- Each phase carries its own acceptance checklist derived from issue #1.
- Some items from issue #1 are deferred without being dropped — trackers for
  each deferred item live in the corresponding phase PR description.
- Ground-rule exceptions and "keep over replace" decisions are documented as
  ADRs rather than silently absorbed.
