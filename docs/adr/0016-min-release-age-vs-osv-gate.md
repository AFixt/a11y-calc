# ADR 0016: Resolve the `min-release-age` / `security:osv` deadlock with documented grace-period ignores

- **Status:** Accepted
- **Date:** 2026-08-14
- **Deciders:** Karl Groves

## Context

Two deliberate supply-chain controls in this repo can pull in opposite
directions:

| Control                 | Where                       | Effect                                                                                                                                                                                    |
| ----------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `min-release-age=7`     | `.npmrc`                    | npm refuses to install any package version published less than 7 days ago. Defends against a compromised release being pulled in before the ecosystem has had time to notice and yank it. |
| `security:osv` (gating) | `package.json` → `check:ci` | osv-scanner **fails the build** the moment an advisory matches the lockfile.                                                                                                              |

When a security advisory is published and its fix ships at roughly the same time
— the normal shape of a coordinated disclosure — `security:osv` starts failing
immediately, while `min-release-age` refuses to install the remedy for up to
another 7 days. During that window **no version satisfies both controls**, and
`check:ci` is red on `develop` for reasons unrelated to any given PR. Every open
PR inherits that red — the exact failure mode issue #78 was filed to end.

Concrete instance (issue #86): `GHSA-2v37-7h3g-55p8` (nanoid, HIGH) was
published 2026-07-29; the clean `nanoid@3.3.18` was published 2026-08-07, so it
was uninstallable under `min-release-age=7` until 2026-08-14 — an ~8-day red
window for a dev-only transitive.

Both controls are individually defensible, so this is a policy question, not a
bug: how do we keep both intact without normalising a week-long red `develop`?

## Decision

We keep **both** controls exactly as they are, and resolve each collision with a
**documented, self-expiring grace-period ignore** in `osv-scanner.toml`.

When the deadlock occurs:

1. Add an `[[IgnoredVulns]]` entry for the specific advisory, with:
   - `id` — the GHSA/CVE id;
   - `ignoreUntil` — set to the `min-release-age` cooldown expiry for the fixed
     version (publish date + 7 days), **not** an arbitrary far-future date;
   - `reason` — the package, the dependency path, that it is the
     `min-release-age`-vs-`osv` collision, and a pointer to the tracking issue.
2. Once `ignoreUntil` passes, osv-scanner stops filtering the advisory. If the
   fixed version is by then installable (it will be — the cooldown has expired),
   refresh the lockfile and **delete the entry**. If for any reason it is still
   outstanding, the gate goes red again, which is the intended failsafe.

This is the same mechanism already used for the `extract-zip` advisory
(GHSA-jmr9-qjv8-65gv), differing only in that these entries are short-lived (one
cooldown window) rather than pending an upstream fix.

## Alternatives considered

- **Exempt security fixes from the cooldown** (narrow `min-release-age` so an
  advisory-remediating version can be taken early). Rejected: a malicious
  release paired with a bogus advisory is precisely the attack `min-release-age`
  exists to stop, so this weakens the control exactly where it matters most.
- **Downgrade `security:osv` to non-gating for dev-only transitives** (warn on
  `dev: true`, fail only for anything reachable from the published package).
  Reasonable and matches the real risk profile — nothing in this repo's
  `files`/`dist` is affected by the recent findings — but it silently drops the
  gate for a genuine dev-toolchain compromise. Not adopted now; kept on file as
  a future option if grace-period churn proves noisy.
- **Accept a red `develop` during cooldown windows.** Rejected: re-normalises
  the "CI is red for reasons unrelated to my PR" state that #78 called out.
- **Shorten `min-release-age`.** Rejected: trades a smaller collision window for
  less protection against the compromised-release scenario the setting exists
  for.

## Consequences

- Both controls stay fully intact; every exception is visible in
  `osv-scanner.toml`, justified, and dated.
- Each collision costs a small PR that adds (and later removes) one
  `[[IgnoredVulns]]` entry. This is deliberate churn — the exception is meant to
  be seen and expire, not to accumulate silently.
- `ignoreUntil` must be set to the cooldown expiry, never further out. An entry
  that outlives its cooldown hides a finding whose fix is already installable.
- Grace-period entries are distinguishable from open-ended ones by their
  `reason` string (which names the `min-release-age` collision) and their
  near-term `ignoreUntil`.
- Complements ADR 0003 (heavy-scanner placement) and ADR 0006 (Husky and local
  gates); `min-release-age` had no ADR before this one.
