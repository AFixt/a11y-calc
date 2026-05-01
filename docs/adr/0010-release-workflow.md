# ADR 0010: Automated npm release workflow

- **Status:** Accepted
- **Date:** 2026-04-30
- **Deciders:** Karl Groves

## Context

ADR 0007 deferred the release workflow because it required up-front decisions on
auth, provenance, and trigger model that did not belong inside the broader
"GitHub Actions safety net" PR. Issue #11 tracked the follow-up. Today we
publish via local `npm publish` after `prepublishOnly` runs lint, tests, and
build. That works for a one-person maintainer cadence but has three problems:

1. The artifact's provenance cannot be cryptographically attested — npm's
   provenance feature requires the publish to happen from a known CI environment
   over OIDC.
2. A laptop-published release is whatever happened to be on disk at the time. A
   CI release reproduces from the tagged commit only.
3. Pre-publish gates can be skipped locally (`npm publish --ignore-scripts`,
   environment differences). CI runs the same `check:ci` as every PR.

## Decision

### Auth: OIDC trusted publisher (no `NPM_TOKEN`)

We use npm's [trusted publisher](https://docs.npmjs.com/trusted-publishers)
configuration with GitHub Actions as the OIDC issuer. No long-lived `NPM_TOKEN`
is stored in GitHub secrets. The npm package settings page lists this repo + the
`Release` workflow + the `npm-publish` environment as the trusted publisher; npm
exchanges the GitHub OIDC token for a short-lived publish token at job time.

This requires `permissions: id-token: write` on the job, which the workflow sets
explicitly. `contents: read` is the only other permission needed.

### Provenance: enabled

`npm publish --provenance --access public` attaches a sigstore-backed
attestation tying the published tarball to the workflow run, the commit, and the
source repo. Consumers can verify with `npm audit signatures`. Given the
security-heavy stack already in this repo (CodeQL, OWASP scanners, gitleaks),
shipping unattested artifacts would be inconsistent.

### Trigger: tag push only (with `workflow_dispatch` escape hatch)

The workflow fires on `push: tags: ['v*.*.*']` and on manual `workflow_dispatch`
(for re-running a previously created tag). It does **not** fire on merge to
`main`. Rationale:

- Tag push is an explicit, human-authored release event. There is no scenario
  where a merged PR should silently publish a new version.
- `semantic-release`-style automation requires Conventional Commits to drive
  version bumps. Commitlint already enforces Conventional Commits in this repo,
  but version planning still benefits from a human in the loop for a pre-1.0
  component library where minor/major boundaries are judgment calls.
- The `bump-and-go` workflow already used by this maintainer ends with a
  human-cut tag; the release workflow picks up from there.

The workflow verifies the tag matches `package.json` version before publishing,
so a stale tag or a mismatched bump fails fast.

### Pre-publish gates: full `check:ci` plus build

The job runs `npm run check:ci` (the same gate every PR runs) and then
`npm run build` before `npm publish`. We do not rely on `prepublishOnly` to
re-run gates — when CI is the publisher, gates run as explicit named steps so
failures are visible per-step in the run summary.

`size-limit` is included via `check:ci`, so a release that breaks the bundle
budget fails the publish job.

### Environment: `npm-publish`

The job declares `environment: npm-publish`. This:

- Lets us add required reviewers in the future without changing the workflow.
- Surfaces the publish target separately in the GitHub deployments UI.
- Scopes any future environment-specific secrets/variables to publish runs only.

The environment exists with no protection rules today; protection can be added
later without touching the workflow.

## Alternatives considered

- **`NPM_TOKEN` secret.** Simpler to set up but creates a long-lived publish
  credential that has to be rotated and audited. OIDC eliminates the secret
  entirely.
- **`semantic-release`.** Powerful but assumes the project is past the pre-1.0
  point where every minor bump needs human judgment. Reconsider after v1.0.0.
- **Trigger on merge to `main`.** Conflates "code is mergeable" with "code is
  releasable." A typo fix on `main` should not produce an npm release.
- **Skip provenance.** Saves nothing — `--provenance` is a single flag once OIDC
  is configured.

## Operational notes

- First publish requires configuring the trusted publisher on
  `npmjs.com/package/@afixt/a11y-calc/access` after the first manual publish.
  Until then, the workflow will fail with `ENEEDAUTH`.
- To cut a release: `npm version patch|minor|major`, push the tag.
- To re-run a publish for an existing tag: GitHub UI → Actions → Release → Run
  workflow → enter `vX.Y.Z`.

## Consequences

- One more workflow file to maintain (`.github/workflows/release.yml`).
- Releases are reproducible from CI and cryptographically attested.
- Maintainer no longer needs npm credentials on local machines.
- Issue #11 can be closed.
