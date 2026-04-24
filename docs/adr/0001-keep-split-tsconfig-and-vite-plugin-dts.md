# ADR 0001: Keep split tsconfig and vite-plugin-dts for the library build

- **Status:** Accepted
- **Date:** 2026-04-23
- **Deciders:** Karl Groves

## Context

Issue #1 proposes a single `tsconfig.json` that sets `declaration: true`,
`declarationMap: true`, `sourceMap: true`, and `outDir: "./dist"` so that `tsc`
alone emits types and declaration maps for the library.

The current project uses a split setup:

- `tsconfig.json` — a project-references root that delegates to app and node
  configs.
- `tsconfig.app.json` — for `src` with `noEmit: true`.
- `tsconfig.node.json` — for `vite.config.ts` and `vite.demo.config.ts` with
  `noEmit: true`.
- `vite.config.ts` uses `vite-plugin-dts` to emit `.d.ts` files into
  `dist/src/**` during the library build.

The `dist/src/index.d.ts` path is referenced by the published `package.json` via
`types`, `exports.import.types`, and `exports.require.types`.

## Decision

We keep the split tsconfig setup and `vite-plugin-dts` as the mechanism that
emits published type declarations. We do not switch to a single `tsconfig.json`
with `declaration: true` and `tsc`-based emission.

We apply the strictness options from issue #1 (`strict`,
`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`,
`noImplicitReturns`, `allowUnreachableCode: false`, `allowUnusedLabels: false`)
to both referenced configs.

## Alternatives considered

- **Single tsconfig with tsc emission.** Would require rewiring the build
  (`tsc -b` stops being a type-check-only step, `dist/` layout changes, the
  `types` paths in `package.json` change, `vite-plugin-dts` is removed). Creates
  churn for consumers pinning specific `dist/` paths and risks regressing the
  currently working published-types layout. No demonstrable quality win over the
  status quo.
- **Replace vite-plugin-dts with `tsc --declaration` post-build.** Adds a second
  tool to the build graph without removing Vite, without an obvious benefit.

Per issue #1's ground rule — "Do not replace anything that already exists …
unless the new proposal leads to a demonstrably higher quality outcome" — the
existing setup stays.

## Consequences

- Strictness options are added to `tsconfig.app.json` and `tsconfig.node.json`
  instead of to a single root config.
- `typecheck` script is `tsc -b --force` to walk the references and type-check
  everything without emitting.
- The library's published types continue to live under `dist/src/**` and the
  `package.json` `types`/`exports.*.types` paths are unchanged.
- Future phases that touch the build (e.g., size-limit, Lighthouse CI,
  publishing) do not need to account for an `outDir` switch.
