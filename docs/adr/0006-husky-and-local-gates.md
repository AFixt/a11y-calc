# ADR 0006: Husky hook composition and local gate ordering

- **Status:** Accepted
- **Date:** 2026-04-23
- **Deciders:** Karl Groves

## Context

Phase 3 wires the local gate set into Husky. Issue #1 prescribes hook contents
that mostly match ours, but several choices need justification:

- Where semgrep runs (in `lint-staged` per-file, or as a whole-repo scan on
  pre-push).
- Which external binaries block a push vs. which are opt-in.
- How hooks behave when a required binary is missing from `PATH`.
- Where the shared helper script lives, given that `.husky/_/` is regenerated on
  every `husky install` and its contents are git-ignored by husky itself.
- Whether to refactor duplicated code flagged by `jscpd` vs. raising the
  threshold.

## Decision

### Hook composition

| Hook         | Actions                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------- |
| `pre-commit` | `assert_bin trufflehog` → `lint-staged` → `tsc-files --noEmit` → TruffleHog scan (ADR 0012) |
| `commit-msg` | `commitlint --edit "$1"`                                                                    |
| `pre-push`   | Assert presence of every external binary → `npm run check:all`                              |
| `post-merge` | If `package-lock.json` changed, `npm install` + non-blocking `npm audit`                    |

`lint-staged` runs ESLint + Prettier on changed JS/TS, Stylelint + Prettier on
CSS, markdownlint + Prettier on Markdown, Prettier alone on JSON / YAML.

### Semgrep is in pre-push, not lint-staged

Issue #1's `.lintstagedrc.json` example runs semgrep per-file on every commit.
We run it instead as `security:semgrep` in `check:all` on pre-push. Rationale:

- Semgrep's startup cost (~2–5s per invocation on this repo) is per-file under
  `lint-staged`, so a 5-file commit costs ~15–25s of idle time. A whole-repo
  scan runs in ~10s flat.
- Per-file scans with `p/owasp-top-ten` etc. miss cross-file data-flow findings
  that a repo-scoped scan catches.
- Developers will commit small changes frequently; making pre-commit fast keeps
  the loop tight. Pre-push is the right granularity for heavier scanners.

### Link checking uses `--offline` on pre-push

`npm run links` passes `--offline` to lychee so it only resolves relative file
paths (catches `[foo](./does-not-exist.md)` typos) and never hits the network.
Pre-push stays deterministic and fast (<1s). External link rot is covered by a
separate `npm run links:online` script — wired into the scheduled `docs.yml`
workflow in Phase 4 — which runs with `--max-retries 1 --timeout 15` so even
that can't stall.

### CodeQL, Dependency-Check, and ZAP per ADR 0003

CodeQL and OWASP Dependency-Check are part of `check:all` on pre-push. OWASP ZAP
is not — it needs a running preview server. `test:zap` is a manual script; the
scheduled security workflow (Phase 4) will provide backup coverage.

### Strict binary-presence checks with a shared helper

Every hook that depends on a non-`node_modules` binary calls
`assert_bin <tool> "<hint>"` before doing real work. If the tool is missing, the
hook exits 1 with:

- a colored banner naming the tool,
- a Homebrew-centric install hint,
- a pointer to `scripts/bootstrap.sh`,
- an acknowledgment of `--no-verify` as an opt-out.

The helper lives at `.husky/assert-bin.sh`. It is **not** in `.husky/_/`: husky
regenerates `_/` on every install and its contents are git-ignored by
`.husky/_/.gitignore` (`*`). Scripts that need to travel with the repo must live
one directory up.

### Code deduplication resolves `jscpd`, not threshold relaxation

The initial pre-push `npm run dupes` reported 7.5% duplication between
`BasicPanel.tsx` and `ScientificPanel.tsx`: both files contained the full
standard 4-column button layout (AC / ± / % / ÷, 7-9 ×, 4-6 −, 1-3 +, 0 . =).
The duplication was introduced in Phase 2 when `ButtonPanel` was split into
basic/scientific sub-components.

We extracted those five rows into `StandardRows.tsx` exporting `StandardRow1` …
`StandardRow5`, typed by a `StandardRowProps` `Pick<>` of the full
`ButtonPanelProps`. Both panels now compose the shared rows. `jscpd` reports 0
clones after the refactor.

Rejected alternative: raising the `jscpd` threshold to something like 5% would
silently accept the genuine duplication. The threshold stays at 1%.

### Fieldset accessibility

Phase 2 migrated the button grid from `<div role="group" aria-label="…">` to
`<fieldset aria-label="…">`. Phase 3 completes that migration by adding a
visually-hidden `<legend>` inside each fieldset, satisfying the
`fieldset-has-legend` accessibility heuristic. The `aria-label` on the fieldset
is removed (a `<legend>` is the canonical accessible name for a fieldset).

Some IDE a11y checkers also report `fieldset-not-empty` on these fieldsets
because they don't traverse into child components. That is a false positive —
the fieldset does contain `<button>` elements at runtime via `StandardRow1` …
`StandardRow5`. ESLint's `jsx-a11y` does not report it.

### `check:all` composition

```text
run-p lint typecheck stylelint markdownlint format:check   # parallel
→ test → build → dupes → links
→ security:audit → security:osv → security:semgrep → security:secrets
→ security:codeql → security:depcheck
→ license:check
```

`check` is a fast subset for interactive use (no tests, no build, no security
scanners, no links, no duplication check). `check:all` is the complete gate
invoked from `pre-push`.

## Alternatives considered

- **Run every security scanner in `lint-staged`.** Rejected — too slow on every
  commit; developers reach for `--no-verify`.
- **Skip missing binaries silently.** Rejected — a silent skip means a developer
  can push code that violates a gate just by forgetting to install one tool.
  Strict fails with a helpful hint.
- **Put `assert-bin.sh` in `.husky/_/`.** Rejected — husky regenerates `_/` on
  every install and its `.gitignore` excludes everything in it. The helper would
  vanish on the next `husky install`.
- **Raise `jscpd` threshold to accept the BasicPanel/ScientificPanel
  duplication.** Rejected — the duplication was real and the refactor is small.

## Consequences

- First clone after Phase 3: `npm install` runs `husky` (via `prepare` script)
  and installs hooks. Developer must then run `bash scripts/bootstrap.sh` to
  install the external binaries, or each hook will fail with a clear pointer.
- `pre-push` is the slowest hook. On a warm machine with a warm NVD mirror,
  expect ~1–2 minutes for `check:all`. First push after a clean clone can be
  several minutes because Dependency-Check seeds the NVD mirror. Developers who
  want faster iteration can commit freely; push is the rate-limited step.
- `--no-verify` is acknowledged as an escape hatch, not a pattern. The
  safety-net CI workflow in Phase 4 catches anything pushed with `--no-verify`.
- Adding new scanners (e.g., in Phase 5/6) follows the established pattern: add
  an npm script, assert its binary in the appropriate hook, list it in
  `check:all`, and teach `scripts/bootstrap.sh` to install it.
