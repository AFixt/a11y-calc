# CLAUDE.md

Guidance for Claude Code and other agents working in the `a11y-calc` repository.

## CI policy: no scheduled GitHub Actions

**No GitHub Actions workflow in this repository may use a `schedule:` (cron)
trigger, and no scheduled workflow that has been removed may be added back.**
This is a standing constraint, not a default to be traded away for convenience.

A timer-triggered check reports a problem hours or days after it entered the
codebase, attributes it to no one, and gets ignored. The same check run against a
pull request blocks the defect at the point of introduction.

### Rules

- No `on: schedule:` and no `- cron:` in any file under `.github/workflows/`.
- No `.github/dependabot.yml` — Dependabot is a scheduled updater and is covered
  by this policy. GitHub **security alerts** are event-driven notifications, not
  scheduled jobs, and remain enabled.
- Every check a scheduled job would have performed runs as a step in the
  pull-request pipeline instead:
  - Dependency vulnerability and freshness checks (`npm audit`, `npm outdated`,
    OWASP Dependency-Check) run on `pull_request`.
  - Static analysis (CodeQL and equivalents) runs on `pull_request`.
  - Link checking, docs linting, and content checks run on `pull_request`,
    path-filtered to the files that can break them.
  - SBOM generation runs in the release/publish pipeline — an SBOM is a build
    output, not a periodic report.
  - DAST scans (ZAP and equivalents) run against the PR preview environment or
    as a post-deploy gate, not against a static URL on a timer.
  - End-to-end suites run as a smoke subset on `pull_request` and as the full
    matrix on merge to the default branch — never nightly.
- `workflow_dispatch` is allowed. A manual, on-demand run is not a scheduled run.
- Event-driven triggers (`push`, `pull_request`, `release`, `repository_dispatch`,
  `workflow_call`) are allowed and preferred.
- Genuinely periodic *product* work — batch jobs, data pipelines, report
  generation — does not belong in GitHub Actions at all. Run it on real
  infrastructure with its own scheduler, alerting, and retries.

### If you think you need an exception

You do not add the cron. Raise it with the repository owner first.
