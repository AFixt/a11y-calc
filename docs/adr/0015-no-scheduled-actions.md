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
adds ~1–2 minutes, and Dependency-Check's first NVD seed is ~1 GB. Two of the
three scheduled security scans turn out not to belong in PR CI regardless:

- **CodeQL** uploads its results to GitHub code scanning by default, which is
  the GHAS / Code Security surface this org does not use
  ([#90](https://github.com/AFixt/a11y-calc/issues/90)).
- **Dependency-Check** needs an `NVD_API_KEY` to seed the NVD database within a
  PR timeout, and its dependency-CVE coverage duplicates `security:osv`, which
  already gates every PR through `check:ci`.

## Decision

We delete every `on.schedule:` block. No regularly scheduled GitHub Action may
ever be added back; `workflow_dispatch` (manual runs) remains allowed — a manual
trigger is not a schedule. The same policy bans Dependabot config (also
timer-driven); this repository has none.

The scheduled work is redistributed as follows:

- **`security.yml`** now triggers on `pull_request`, `push` to `main`, and
  `workflow_dispatch`, and keeps exactly one job:
  - _ZAP baseline_ already built the demo and scanned a local `vite preview`, so
    it is PR-compatible and needs no secret; it now scans the change under
    review instead of whatever `main` happened to contain on Monday. A committed
    `.zap/rules.tsv` `IGNORE`s the demo server's expected missing-header alerts
    (CSP, clickjacking, MIME-sniffing, permissions policy, COEP — all the
    consuming application's responsibility, not the shipped component's), so the
    baseline stays a real gate: any new alert outside that list fails the PR.
  - _CodeQL_ is **removed from CI** entirely. It uploads to GitHub code scanning
    (GHAS), which this org does not use (#90), and `security:codeql` already
    runs locally on the Husky `pre-push` hook (ADR 0003). Removing it also drops
    the last `security-events: write` permission in the repo.
  - _Dependency-Check_ is **removed from CI** entirely. Its dependency-CVE
    coverage already gates every PR via `security:osv` in `check:ci`, and it
    needs an `NVD_API_KEY` to complete within the PR timeout. It stays a local
    pre-push check (`security:depcheck`, ADR 0003).
- **`docs.yml`** now triggers on `pull_request` path-filtered to Markdown and
  `docs/**`, plus `workflow_dispatch`. It fails the PR directly; the
  issue-filing step and its `issues: write` permission are removed. Retries and
  timeout are raised (`--max-retries 3 --timeout 30`) since transient
  external-host slowness now fails a PR rather than filing a report. The offline
  link check in `check:ci` continues to run on every PR regardless of paths.

So the net effect for the two heavy scanners is that their schedule is deleted
and their enforcement returns to the local-first placement ADR 0003 already
established, while `security:osv` (PR CI) covers dependency CVEs at PR time. ADR
0007's workflow-trigger table and ADR 0003's "scheduled Actions as backup
coverage" language are superseded by this ADR to the extent they describe
schedules; the local-first gate placement they establish is unchanged.

## Alternatives considered

- **Keep weekly schedules alongside PR triggers.** Rejected — the fleet-wide
  policy bans timers outright, and a PR-gated check makes the weekly re-run of
  the same commit redundant.
- **Keep CodeQL and Dependency-Check as PR jobs.** Rejected — CodeQL's value is
  the code-scanning upload this org does not consume (#90), and Dependency-Check
  cannot go green in CI without an `NVD_API_KEY` secret while duplicating the
  `security:osv` gate that already runs on every PR. Both keep their local
  pre-push enforcement (ADR 0003).
- **Set ZAP `fail_action: false` to stop the header warnings blocking PRs.**
  Rejected — that turns ZAP into a non-gating report. Instead the known-benign
  alerts are `IGNORE`d in `.zap/rules.tsv`, so ZAP still fails on anything new.
- **Auto-file issues from PR failures.** Rejected — a failing PR check is
  already attributable and blocking; an issue would duplicate it.

## Consequences

- PR pipelines gain one security job (ZAP baseline ~5 min), running in parallel
  with `check:ci`, so wall-clock PR feedback time is bounded by the slowest job,
  not the sum. CodeQL and Dependency-Check add no PR time; they run on pre-push.
- Dependency-CVE coverage at PR time is provided by `security:osv` (already in
  `check:ci`); CodeQL and Dependency-Check remain enforced locally via the
  `pre-push` hook (ADR 0003). A developer who bypasses pre-push loses that
  local-only coverage until it is caught on their machine — the accepted
  trade-off of ADR 0003's local-first placement.
- No `security-events: write` permission remains anywhere in the repo.
- ZAP's `.zap/rules.tsv` must be kept current: if the demo legitimately starts
  emitting a header (or a new benign alert appears), update the rules file
  rather than disabling `fail_action`.
- No automation files issues anymore; `Link Checker Report` issues stop
  appearing (#76 closed).
- `grep -rn 'cron:' .github/` returns nothing, and must stay that way.
