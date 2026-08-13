# ADR 0015: Remove scheduled GitHub Actions; run every check in PR-time CI

- **Status:** Accepted
- **Date:** 2026-08-13
- **Deciders:** Karl Groves

## Context

ADR 0007 split automation into a fast PR-time safety net (`ci.yml`) and two
weekly scheduled workflows: `security.yml` (CodeQL, OWASP Dependency-Check,
OWASP ZAP baseline) and `docs.yml` (lychee online link check that auto-filed a
"Link Checker Report" issue on failure).

Scheduled Actions are being removed across all AFixt projects
([#77](https://github.com/AFixt/a11y-calc/issues/77)). The reasoning:

- A timer-triggered check reports a problem hours or days after it entered the
  codebase, against no particular author, and is routinely ignored. The same
  check on a PR gates the defect at the point of introduction.
- Auto-filed issues from timers are noise: nobody triggered the run, so nobody
  owns the report. Issue [#76](https://github.com/AFixt/a11y-calc/issues/76) — a
  report whose only finding was a transient timeout on `nvd.nist.gov` — is the
  canonical example.

The original justification for scheduling (ADR 0007) was PR runtime cost: CodeQL
adds ~1–2 minutes, and Dependency-Check's first NVD seed is ~1 GB. Caching and
an NVD API key have since made both tolerable in a PR pipeline.

## Decision

We delete every `on.schedule:` block. No regularly scheduled GitHub Action may
ever be added back; `workflow_dispatch` (manual runs) remains allowed — a manual
trigger is not a schedule. The same policy bans Dependabot config (also
timer-driven); this repository has none.

The scheduled work moves into the PR pipeline:

- **`security.yml`** now triggers on `pull_request`, `push` to `main`, and
  `workflow_dispatch`.
  - _CodeQL_ runs unchanged — it supports `pull_request` natively and reports to
    the Security tab.
  - _Dependency-Check_ caches its NVD data directory (`.dc-data`) via
    `actions/cache` with a unique-per-run `key` and a `restore-keys` prefix, so
    each run restores the newest cache and saves a refreshed one. Output
    switches from HTML to SARIF, uploaded to code scanning so findings land on
    the PR that introduced them (the raw report still uploads as an artifact).
  - _ZAP baseline_ already built the demo and scanned a local `vite preview`, so
    it is PR-compatible as-is; it now scans the change under review instead of
    whatever `main` happened to contain on Monday.
- **`docs.yml`** now triggers on `pull_request` path-filtered to Markdown and
  `docs/**`, plus `workflow_dispatch`. It fails the PR directly; the
  issue-filing step and its `issues: write` permission are removed. Retries and
  timeout are raised (`--max-retries 3 --timeout 30`) since transient
  external-host slowness now fails a PR rather than filing a report. The offline
  link check in `check:ci` continues to run on every PR regardless of paths.

ADR 0007's workflow-trigger table and ADR 0003's "scheduled Actions as backup
coverage" language are superseded by this ADR to the extent they describe
schedules; the local-first gate placement they establish is unchanged.

## Alternatives considered

- **Keep weekly schedules alongside PR triggers.** Rejected — the fleet-wide
  policy bans timers outright, and a PR-gated check makes the weekly re-run of
  the same commit redundant.
- **Move the heavy scanners into `check:ci` instead of separate workflows.**
  Rejected — CodeQL and Dependency-Check benefit from GitHub-native SARIF upload
  and per-job caching, and ZAP needs a running server; folding them into the
  single `check:ci` job would push its runtime past acceptable PR feedback times
  (ADR 0007's original concern, still valid).
- **Auto-file issues from PR failures.** Rejected — a failing PR check is
  already attributable and blocking; an issue would duplicate it.

## Consequences

- PR pipelines gain three jobs (CodeQL ~2 min; Dependency-Check a few minutes
  once the NVD cache is warm and `NVD_API_KEY` is set; ZAP baseline ~5 min).
  They run in parallel with `check:ci`, so wall-clock PR feedback time is
  bounded by the slowest job, not the sum.
- The first `dependency-check` run after this change (or after a cache eviction)
  re-seeds the NVD database and is slow; subsequent runs restore the cache.
- Fork PRs cannot read `secrets.NVD_API_KEY` / `secrets.NPM_TOKEN`, so the
  `dependency-check` job would be slow or fail there; this repository takes
  contributions from maintainer branches, so this is accepted.
- No automation files issues anymore; `Link Checker Report` issues stop
  appearing (#76 closed).
- `grep -rn 'cron:' .github/` returns nothing, and must stay that way.
