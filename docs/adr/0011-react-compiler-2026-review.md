# ADR 0011: React Compiler annual review (2026)

- **Status:** Accepted
- **Date:** 2026-04-30
- **Deciders:** Karl Groves

## Context

ADR 0008 deferred adoption of React Compiler (`babel-plugin-react-compiler`)
with three reasons:

1. The library ships **pre-built** ESM/CJS, so consumers using React 19 + the
   compiler in their own builds already benefit. Adding the plugin to our Vite
   config would only affect the demo build.
2. The compiler was still maturing (then on a `0.0.0-experimental-*` tag).
3. Diagnosing miscompilation would require new tests we don't have.

Issue #12 schedules an annual review of those reasons.

## What changed since ADR 0008

- **`babel-plugin-react-compiler` reached 1.0**
  (`npm view babel-plugin-react-compiler version` → `1.0.0` as of 2026-04-30).
  Reason #2 (still maturing) no longer fully applies.
- Reason #1 (pre-built library) is structural and has not changed.
- Reason #3 (no miscompilation tests) has not changed.

## Benchmark

Built `dist/index.{mjs,cjs}` with and without the compiler enabled in
`vite.config.ts` via `@vitejs/plugin-react`'s `babel.plugins` slot:

| Bundle | Without compiler        | With compiler                                |
| ------ | ----------------------- | -------------------------------------------- |
| ESM    | 21.22 kB / 5.20 kB gzip | **21.22 kB / 5.20 kB gzip (byte-identical)** |
| CJS    | 15.66 kB / 4.52 kB gzip | **15.66 kB / 4.52 kB gzip (byte-identical)** |
| CSS    | 5.97 kB / 1.67 kB gzip  | unchanged (CSS not touched by compiler)      |

The compiler emitted no observable change in the published bundle. Either it
declined to compile our component (e.g., because the heuristics found nothing
worth memoizing for a `useReducer`-driven component with one main render path)
or it compiled to bytewise-equivalent output. In either case, the published
artifact is unchanged.

## Decision

**Defer adoption again. Re-evaluate 2027-04 (one year cadence).**

For this specific library, adopting React Compiler in the build provides:

- **Zero bundle-size benefit** (measured: bytewise identical).
- **No measurable runtime benefit** for a calculator that re-renders once per
  user action with ~40 buttons. Compiler-level memoization wins compound on
  large component trees with frequent prop-equality checks; this component has
  neither.
- **Zero benefit to consumers** beyond what they already get when they enable
  the compiler in their own build.

It would, however, add:

- A new build-time dependency on the babel pipeline (currently optional via
  `@vitejs/plugin-react`'s default SWC pipeline path, but the compiler forces
  Babel).
- A new failure mode: if the compiler regresses, our build breaks even though no
  consumer would have seen the regression in their own build.
- Maintenance overhead in tracking compiler versions in our own repo.

## Pre-compiled library output: not currently viable

A second question raised by issue #12: could the library ship pre-compiled
output so even non-compiler consumers benefit?

Investigation: the compiler's output uses `react/compiler-runtime` (the
`useMemoCache` hook), which is a React 19 runtime feature. Shipping pre-compiled
output would:

- Hard-pin the published artifact to React 19, breaking the React 18
  `peerDependencies` range.
- Make the library indistinguishable to consumer-side compilers that re-process
  it (causing wasted work or double-compilation issues).

The React team's guidance for libraries is currently: **do not ship pre-compiled
output**. Let the consumer compile if they want compiler benefits. This guidance
may change; revisit at the next annual review.

## Re-trigger conditions before 2027-04

Adopt sooner if any of these become true:

- Consumer-side compiler enablement is no longer the norm (e.g., React Compiler
  becomes part of `react-dom` itself, eliminating the build-time choice).
- React team publishes an official "compile your library and ship that" path.
- This library grows to multiple components with shared state where compiler
  memoization measurably helps in profiling.

## Consequences

- ADR 0008's React Compiler section remains in effect, with this ADR as its
  current status pointer.
- Issue #12 closed with a recorded decision and benchmark.
- Next review: 2027-04 (annual cadence).
