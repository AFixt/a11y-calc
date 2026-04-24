# ADR 0004: Allow BEM class selectors and disable `a11y/selector-pseudo-class-focus`

- **Status:** Accepted
- **Date:** 2026-04-23
- **Deciders:** Karl Groves

## Context

`stylelint-config-standard` enforces strict kebab-case class names via
`selector-class-pattern`, which rejects BEM names like `.calc-display__value`
and `.calc-btn--operator`. The calculator's CSS uses BEM consistently.

The `@double-great/stylelint-a11y` rule `selector-pseudo-class-focus` requires
every `:hover` rule to be paired with a `:focus` rule on the same selector. The
calculator's CSS uses a different but also-correct pattern: a single
`.calc-btn:focus-visible` rule on the base class provides focus styling for
every variant (`.calc-btn--number`, `.calc-btn--operator`, etc.) through the
cascade, while hover styles are per-variant.

## Decision

- Override `selector-class-pattern` with a regex that accepts both kebab-case
  and BEM (`__` and `--`) segments.
- Disable `a11y/selector-pseudo-class-focus` because `.calc-btn:focus-visible`
  on the base class already provides visible-focus styling for every variant,
  and duplicating a `:focus` rule per variant adds no a11y value while inflating
  the CSS.

## Alternatives considered

- **Rename everything to kebab-case** (e.g., `.calc-display-value`). Rejected —
  BEM is widely understood, the rename would touch every CSS class and every
  `className` in JSX, and the project has no existing reason to abandon BEM.
- **Add `:focus` rules per variant to satisfy the plugin.** Rejected — adds
  duplication without improving focus visibility. `:focus-visible` on
  `.calc-btn` already covers every button. The plugin's heuristic does not
  understand class-cascading focus styles.

## Consequences

- BEM is the documented naming convention for CSS classes in this repo.
- Focus indication is centralized on `.calc-btn:focus-visible` and must be kept
  covering any future button variants. Any new button component that does not
  use the `.calc-btn` base class must add its own `:focus-visible` rule.
- Future reviewers should not expect per-variant `:focus` rules.
