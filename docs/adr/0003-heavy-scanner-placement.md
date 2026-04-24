# ADR 0003: Run CodeQL, OWASP Dependency-Check, and OWASP ZAP locally, not only in scheduled Actions

- **Status:** Accepted
- **Date:** 2026-04-23
- **Deciders:** Karl Groves

## Context

Issue #1's original wording placed CodeQL, OWASP Dependency-Check, and OWASP ZAP
on a weekly scheduled GitHub Action. The project's ground rules prefer "local
gates over GitHub Actions where possible to shorten the feedback loop and reduce
Actions minutes."

Running these scanners locally shifts their cost from CI minutes to developer
machines:

- **CodeQL CLI** — first `codeql database create` is typically 30–90 seconds on
  this code base.
- **OWASP Dependency-Check** — first run downloads the NVD mirror (multi-hundred
  MB to ~1 GB, several minutes). Subsequent runs with a warm mirror are ~15–60
  seconds.
- **OWASP ZAP baseline scan** — requires a running preview server
  (`vite preview`). Typical scan time is 1–3 minutes on top of server spin-up.

Gating every `git push` on all three would push pre-push time well past the
threshold where developers reach for `--no-verify`, which defeats the gate.

## Decision

All three scanners become locally runnable npm scripts and are part of the
default local gate set. They do **not** live only in scheduled Actions.

- `npm run security:codeql` — runs on pre-push.
- `npm run security:depcheck` — runs on pre-push (with a cached NVD mirror).
- `npm run security:zap` — runs via a dedicated `test:zap` workflow that spins
  up `vite preview` on demand. It is **not** in pre-push. A developer invokes it
  explicitly, and it runs on the scheduled security workflow as backup coverage.

## Alternatives considered

- **All three in pre-push.** Rejected — likely 5+ minutes per push, which
  creates pressure to bypass hooks.
- **All three only in scheduled Actions.** Rejected — contradicts the project's
  "local first" principle and the user's explicit preference.
- **All three only as opt-in scripts, never gated.** Rejected — CodeQL and
  Dependency-Check are fast enough on a warm cache to be worth gating; leaving
  them opt-in means they only run when someone remembers.

## Consequences

- Developers must install CodeQL CLI, OWASP Dependency-Check CLI, and OWASP ZAP
  locally. `scripts/bootstrap.sh` (Phase 3) installs them via Homebrew on macOS
  and points Linux users at the upstream release binaries.
- First pre-push after a clean clone takes longer because Dependency-Check must
  seed its NVD mirror. Documented in README.
- ZAP coverage on every PR is replaced by coverage on every developer- triggered
  `npm run test:zap` plus the weekly scheduled Action. Acceptable because ZAP's
  finding surface (HTTP-layer) is narrow for a client-side component library.
- Actions minutes are reduced vs. running all three on every PR.
