# Architecture Decision Records

This directory holds ADRs — short, numbered markdown files that record
non-obvious engineering decisions and the reasoning behind them.

## When to write an ADR

Write one when you:

- Choose between two or more tools, patterns, or architectures.
- Decline to adopt something an issue, RFC, or external guideline prescribed —
  the ground-rule exception needs written justification.
- Replace or remove something a future reader might wonder about ("Why isn't X
  in here anymore?").
- Take on a constraint that will outlive the current task (e.g., a naming
  convention, a deprecation plan, a compatibility floor).

Routine refactors, bug fixes, and small implementation choices do not need ADRs.
When in doubt, write one — they are cheap.

## Format

Use [`../templates/adr-template.md`](../templates/adr-template.md) and number
sequentially starting at `0001`.

## Index

- [ADR 0001 — Keep split tsconfig and vite-plugin-dts for the library build](./0001-keep-split-tsconfig-and-vite-plugin-dts.md)
- [ADR 0002 — Adopt the standardized tooling stack in phases](./0002-phased-tooling-adoption.md)
- [ADR 0003 — Run CodeQL, OWASP Dependency-Check, and OWASP ZAP locally, not only in scheduled Actions](./0003-heavy-scanner-placement.md)
- [ADR 0004 — Allow BEM class selectors and disable `a11y/selector-pseudo-class-focus`](./0004-stylelint-bem-and-pseudo-class-focus.md)
- [ADR 0005 — ESLint expansion calibrations and refactors](./0005-eslint-expansion-calibrations.md)
- [ADR 0006 — Husky hook composition and local gate ordering](./0006-husky-and-local-gates.md)
- [ADR 0007 — GitHub Actions safety net and Dependabot](./0007-github-actions-and-dependabot.md)
- [ADR 0008 — Performance budgets and web-vitals placement](./0008-performance-budgets.md)
- [ADR 0009 — Accessibility layering and Phase 6 docs](./0009-a11y-layering-and-docs.md)
- [ADR 0010 — Automated npm release workflow](./0010-release-workflow.md)
- [ADR 0011 — React Compiler annual review (2026)](./0011-react-compiler-2026-review.md)
- [ADR 0012 — Use TruffleHog instead of gitleaks for secret scanning](./0012-trufflehog-instead-of-gitleaks.md)
