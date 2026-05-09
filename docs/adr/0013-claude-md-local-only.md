# ADR 0013: Keep `CLAUDE.md` gitignored as local-only context

- **Status:** Accepted
- **Date:** 2026-05-09
- **Deciders:** Karl Groves

## Context

Issue #1's acceptance criteria call for a `CLAUDE.md` at the repository root
(and per-directory `CLAUDE.md` files for non-obvious subsystems) to give Claude
Code a stable session-priming context. The Phase 6 work (PR #16) added that file
at the root.

In commit `3471311` the file was moved into `.gitignore` alongside `.claude/`,
so neither `CLAUDE.md` nor the local `.claude/` state directory ships in the
repository. The audit performed for issue #1 surfaced this as the one
outstanding gap against the acceptance checklist.

The forces in play:

- The committed `README.md` already documents installation, scripts, the
  `npm run check:all` workflow, gates, and theming — the same surface a root
  `CLAUDE.md` would otherwise restate. Two sources of truth for the same facts
  is a maintenance hazard.
- This is a small single-package library. The architectural notes that would
  belong in a per-directory `CLAUDE.md` already live in the per-file headers,
  the ADR series, and the typed module boundaries. Strict types, enforced TSDoc
  on exports, `max-lines`/`max-lines-per-function`, and short modules already
  give Claude Code most of what a `CLAUDE.md` would.
- A committed `CLAUDE.md` becomes a public statement of how to drive Claude Code
  on this repo. The author iterates on that prompt frequently and privately;
  treating it as committed source pulls those iterations into the PR review
  surface, which is friction for no clear reader benefit at this scale.
- `.claude/` is unambiguously local (transcripts, settings, scratch state).
  Gitignoring `.claude/` and `CLAUDE.md` together keeps the rule simple: Claude
  Code's working files do not enter version control.

## Decision

We keep `CLAUDE.md` gitignored at the repository root. Contributors who use
Claude Code (or any LLM-driven editor) maintain a local `CLAUDE.md` for their
own session priming. The repository's source of truth for contributor-facing
documentation is `README.md`, the ADR series in `docs/adr/`, and the templates
in `docs/templates/`.

This is a deliberate deviation from item 23 of issue #1's acceptance checklist.

## Alternatives considered

- **Commit a `CLAUDE.md` at the root.** Rejected — would duplicate the
  `README.md`'s install/scripts/gates content. Drift between the two is
  near-certain on a small repo with few contributors.
- **Commit a thin `CLAUDE.md` that links to `README.md` and the ADR index.**
  Rejected — adds a file whose only purpose is redirection. Claude Code reads
  `README.md` and `docs/adr/` directly when asked.
- **Commit per-directory `CLAUDE.md` files for `src/components/Calculator/`,
  `src/hooks/`, `src/utils/`.** Rejected for now — these subsystems are short
  enough that strict types plus TSDoc give equivalent guidance without a
  parallel doc surface to maintain. Reconsider if any of them grows past the
  `max-lines` ceiling or accretes non-obvious invariants that the types do not
  express.

## Consequences

- Item 23 of issue #1's acceptance checklist is recorded as a deliberate
  deviation, documented here. The remaining 24 items are satisfied; see the
  audit summary on the issue close.
- New contributors see no `CLAUDE.md` after a fresh clone. The `README.md`
  contributing section already directs them to `npm run check:all` and the ADR
  index, which covers the practical onboarding path.
- Reconsider this decision if any of the following becomes true:
  - The repo grows past a single package (monorepo split, additional public
    components, server-side surface).
  - Multiple contributors regularly drive Claude Code against this repo and find
    themselves reconstructing the same priming context.
  - A subsystem accretes invariants that cannot be expressed in types or short
    TSDoc and would benefit from a directory-local `CLAUDE.md`.
- No tooling change is needed — the `.gitignore` entry is already in place.
