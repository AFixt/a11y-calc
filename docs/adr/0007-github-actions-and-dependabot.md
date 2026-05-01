# ADR 0007: GitHub Actions safety net and Dependabot

- **Status:** Accepted
- **Date:** 2026-04-24
- **Deciders:** Karl Groves

## Context

Phase 3 put the full gate set on the developer's machine via Husky. Phase 4 adds
GitHub Actions coverage for the two cases local hooks do not cover:

- **Bypassed hooks.** A developer can push with `--no-verify`, and a maintainer
  can merge a PR via the GitHub web UI without ever running local hooks. The
  safety-net CI re-runs the gate on every push and PR.
- **Time-based drift.** New CVEs appear in NVD after code is merged; external
  links rot after README is written; Dependabot proposes dependency updates.
  These are schedule-triggered, not commit-triggered.

Issue #1's sample CI installs semgrep/osv-scanner/gitleaks/lychee and runs
`npm run check:all`. Our Phase 3 `check:all` includes CodeQL and OWASP
Dependency-Check, which are heavy in CI. We need a narrower CI target and a
richer scheduled target.

## Decision

### Three workflows plus Dependabot

| File             | Trigger                                               | Purpose                                                                            |
| ---------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `ci.yml`         | `push: [main]`, `pull_request`                        | Safety net — runs `npm run check:ci`. Installs fast scanners via release binaries. |
| `security.yml`   | `schedule: weekly Mon 06:00 UTC`, `workflow_dispatch` | Heavy scanners: CodeQL, Dependency-Check, ZAP baseline against a built preview.    |
| `docs.yml`       | `schedule: weekly Mon 07:00 UTC`, `workflow_dispatch` | `lychee` online link check; opens a tracking issue on failure.                     |
| `dependabot.yml` | n/a (native GitHub)                                   | Weekly npm + github-actions updates. Minor/patch grouped.                          |

### `check:ci` is `check:all` minus CodeQL and Dependency-Check

Running CodeQL CLI and OWASP Dependency-Check on every PR is wasteful:

- CodeQL: ~1–2 minutes per PR when the scheduled `codeql` job already runs
  weekly against `main` and reports via the GitHub Security tab.
- Dependency-Check: first run seeds the NVD mirror (~1 GB, 20–40 min without an
  NVD API key — see ADR 0003). Without caching, every PR pays this cost. The
  scheduled `dependency-check` job uses an NVD API key and runs once a week.

`check:ci` runs the fast subset:
`check + test + build + dupes + links (offline) + security:audit + security:osv + security:semgrep + security:secrets + license:check`.

`check:all` remains the local pre-push gate (adds `security:codeql` and
`security:depcheck`).

### Release workflow is deferred

Issue #1 mentions `release.yml` "if applicable." We publish to npm today via
`prepublishOnly` + `npm publish` locally. Automated release (tag push → build →
publish) is a sensitive action that needs:

- an `NPM_TOKEN` secret (or OIDC trusted publisher config),
- a signing story (provenance attestations),
- clarity on whether `main` → `npm publish` is automatic or manual.

No release workflow ships in this phase. Adding one is a discrete task that
deserves its own PR and its own ADR.

**Resolved (2026-04-30):** see ADR 0010.

### ZAP runs in CI, not locally

Per ADR 0003, ZAP is not in `pre-push`. It needs a running preview server. The
scheduled `zap-baseline` job builds the demo, runs `vite preview` in the
background, waits for the port, and runs `zaproxy/action-baseline@v0.14.0`.
`fail_action: true` so findings fail the job; `allow_issue_writing: false`
because the docs workflow already uses issue-filing for link rot and we don't
want two sources of automated issues.

### Dependabot grouping

Ungrouped Dependabot opens one PR per dependency, which drowns the queue for
fast-moving ecosystems (ESLint, Vite, Vitest). We group:

- `minor-and-patch` — everything else minor/patch in one PR.
- `eslint` — `eslint` + `eslint-plugin-*` + `@typescript-eslint/*`.
- `react` — `react`, `react-dom`, `@types/react*`.
- `vitest` — `vitest`, `@vitest/*`, `@testing-library/*`.
- `vite` — `vite`, `@vitejs/*`, `vite-*`.

Majors come one-per-PR by default (safer — they often break).

### Secret: `NVD_API_KEY`

Dependency-Check with a free-tier NVD download takes 30+ minutes per run due to
NIST rate limits. Repo maintainers should register an NVD API key at
<https://nvd.nist.gov/developers/request-an-api-key> and store it as
`NVD_API_KEY` in repo secrets. With a key, download drops to a few minutes.
Without the key, the scheduled run still works — just slowly.

### Action version pinning

Third-party actions are pinned to a major version (`@v5`, `@v4`, `@v0.14.0`)
rather than a commit SHA. Dependabot's github-actions ecosystem tracks updates
and proposes bumps weekly. For higher supply-chain assurance a future ADR may
pin to commit SHAs; that trades maintenance burden for a tighter perimeter and
is deferred.

## Alternatives considered

- **Run `check:all` in CI (same as pre-push).** Rejected — duplicates the
  scheduled heavy-scanner work and pushes PR feedback time into the 5+ minute
  range.
- **Only scheduled workflows, no CI.** Rejected — `--no-verify` and web-UI
  merges would ship without any gate. The issue's ground rules explicitly call
  for CI as a safety net.
- **Pin actions to commit SHAs now.** Rejected for this phase — every Dependabot
  PR would churn SHA strings, and the supply-chain risk for
  `actions/checkout@v5` is very low (official GitHub action). Reconsider if the
  project adds a high-risk third-party action.
- **Skip Dependabot grouping.** Rejected — ungrouped Dependabot on this many
  devDependencies would open ~20+ PRs the first week.

## Consequences

- PR feedback cycle: CI runs in roughly 3–5 minutes on Ubuntu.
- Weekly Monday morning surge: Dependabot PRs (06:00 UTC), security scan (06:00
  UTC), docs link check (07:00 UTC). Nothing depends on strict ordering; stagger
  minutes are enough.
- `reports/jscpd/` uploads as an artifact on CI failure so reviewers can inspect
  duplication findings without re-running.
- Scheduled CodeQL findings appear in the repo's Security tab. Scheduled
  Dependency-Check and ZAP reports upload as artifacts on the workflow run.
- Adding a release workflow is a tracked follow-up, not forgotten.
