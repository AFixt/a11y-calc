# ADR 0012: Use TruffleHog instead of gitleaks for secret scanning

- **Status:** Accepted
- **Date:** 2026-05-07
- **Deciders:** Karl Groves

## Context

Issue #1 prescribes gitleaks at pre-commit and in CI as the secret-scanning
gate. The repository was originally bootstrapped with gitleaks, and ADR 0006
documents the pre-commit ordering on that basis.

Both tools cover the same surface (regex-based detection of credentials in git
history and working trees). They differ on the dimension that matters here:
which findings actually require action.

- gitleaks reports every regex hit, verified or not. Triage is on the developer.
- TruffleHog can verify findings against the originating service's API and
  surface only credentials that are still live (`--only-verified`).

For a small library repo with infrequent commits, regex-only scanners produce a
long tail of false positives — placeholder values in tests, base64 fixtures,
JWT-shaped strings in fixtures — that train developers to bypass the hook with
`--no-verify`. Verified findings have a near-zero false-positive rate.

Both binaries are available via Homebrew on macOS; both ship as a single static
binary on Linux.

## Decision

We replace gitleaks with TruffleHog (≥3.x) at every gate that previously ran
gitleaks:

- `.husky/pre-commit` —
  `trufflehog git file://. --since-commit HEAD --only-verified --fail --no-update`
- `.husky/pre-push` — asserts `trufflehog` on PATH; the actual scan runs via the
  `security:secrets` script inside `npm run check:all`.
- `package.json` `security:secrets` —
  `trufflehog git file://. --only-verified --fail --no-update`
- `.github/workflows/ci.yml` — installs TruffleHog via the upstream installer
  script before `check:ci`.
- `scripts/bootstrap.sh` — installs `trufflehog` (Homebrew on macOS, release
  binary hint on Linux/WSL).

The `eslint-plugin-no-secrets` rule remains in `eslint.config.js` as a second
layer for pasted high-entropy strings, exactly as issue #1 prescribes. That
plugin and TruffleHog are complementary: ESLint catches strings in source files
at lint time; TruffleHog catches credentials in git history and working tree at
commit/push time.

## Alternatives considered

- **Keep gitleaks.** Rejected — verified-only scanning materially reduces
  false-positive triage. Gitleaks does not verify findings.
- **Run both gitleaks and TruffleHog.** Rejected — duplicate gates with
  overlapping scope add latency and noise without raising the floor.
- **Use TruffleHog without `--only-verified`.** Rejected — defeats the main
  reason we chose it. Unverified noise will push developers to `--no-verify`. If
  a real credential leaks for a service TruffleHog cannot verify, the ESLint
  `no-secrets` rule and CodeQL still provide coverage.

## Consequences

- ADR 0006's hook-composition table lists `gitleaks` as the pre-commit scanner.
  ADR 0006 is updated in this commit to reflect TruffleHog so the table stays
  accurate.
- Pre-commit latency is comparable to gitleaks for small diffs (sub-second on
  this repo). The `--since-commit HEAD` scope keeps the scan tight.
- `npm run security:secrets` in `check:all` walks full history. On a repo this
  size that is still fast (a few seconds); large repos may want to scope the
  command to a recent range.
- Verification is online — TruffleHog reaches out to the relevant service to
  validate findings. That is acceptable here; if the network is down the hook
  still exits 0 on no findings and 1 on findings, just without verification of
  unknowns.
- New contributors must run `bash scripts/bootstrap.sh` (or
  `brew install trufflehog`) to satisfy the pre-commit/pre-push binary check.
  This matches the existing pattern for semgrep, lychee, osv-scanner, etc.
