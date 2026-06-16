# ADR 0014: Calculator keyboard focus surface and button-grid grouping

- **Status:** Accepted
- **Date:** 2026-06-15
- **Deciders:** Karl Groves
- **Supersedes:** the button-grid grouping decisions in
  [ADR 0005](./0005-eslint-expansion-calibrations.md) (`<div role="group">` →
  `<fieldset>`) and [ADR 0006](./0006-husky-and-local-gates.md) (adding a
  visually-hidden `<legend>` to each fieldset).

## Context

Two accessibility issues surfaced in the `Calculator` component:

1. **Keystrokes only worked when a descendant button happened to be focused.**
   The keyboard model lives in a single `onKeyDown` handler on the
   `role="application"` container. That handler only runs when a focusable
   descendant bubbles a `keydown` up to it. The container itself had no
   `tabIndex`, so when focus landed anywhere that is _not_ a button — the
   mode-toggle toolbar, the `<output>` display, the container padding, or the
   container after a non-button click — keystrokes went to `document.body` and
   did nothing. The E2E suite only passed because `calc.click()` happened to
   land on a button by layout luck.

2. **The button grid announced a redundant group.** ADR 0005/0006 migrated the
   grid wrapper from `<div role="group" aria-label="Calculator buttons">` to a
   `<fieldset>` with a visually-hidden `<legend>Calculator buttons</legend>`.
   That migration was driven by lint heuristics
   (`jsx-a11y/prefer-tag-over-role`, then `fieldset-has-legend`) rather than by
   a user-facing need. In practice the `<fieldset>`/`<legend>` causes a screen
   reader to announce "Calculator buttons, group" on entry into a widget that is
   _already_ a named `role="application"` ("Calculator"). The grouping adds
   verbosity without adding orientation value, and `<fieldset>` is semantically
   intended to group _form inputs_, not a calculator's action buttons.

## Decision

### Make the application container the focus surface

Add `tabIndex={0}` to the `role="application"` container and a
`.calculator:focus-visible` outline (reusing the existing `--focus-ring-*`
custom properties, so it inherits the high-contrast overrides). The whole widget
is now focusable, so the `onKeyDown` handler receives keystrokes no matter where
focus rests inside it — a focused button (event bubbles up), the toolbar, the
display, the padding, or the container itself after a click or Tab. This is the
standard pattern for a self-contained `role="application"` keyboard widget and
also de-flakes the layout-dependent `calc.click()` E2E pattern.

The individual buttons remain in the tab order and individually operable; the
container is simply one additional, intentional tab stop ahead of them that lets
a user focus the widget and start typing immediately.

### Remove the button-grid grouping entirely

Replace the `<fieldset>` + `<legend>` wrapper in both `BasicPanel` and
`ScientificPanel` with a plain `<div className="calc-buttons">`. The grid keeps
its CSS (all layout is class-driven, never element-driven) and every button
keeps its own `aria-label`, so nothing about per-button accessibility changes.
What goes away is only the redundant group announcement.

This **reverses** the ADR 0005 and ADR 0006 grouping decisions. Those ADRs
remain in the record for history; this ADR is the current source of truth for
the button-grid markup. The bare `<div>` carries no `role`, so the
`jsx-a11y/prefer-tag-over-role` rule that originally drove the `<fieldset>` does
not re-trigger — there is no lint regression.

A `data-testid="button-grid"` is added to each panel's grid as a test-only hook
(the component already uses `data-testid` for the display, announcements, and
mode toggle). Only one panel renders at a time, so the id is never duplicated in
the DOM.

## Alternatives considered

- **Keep the `<fieldset>`/`<legend>` and accept the announcement.** Rejected —
  the grouping is redundant inside a named `role="application"` and `<fieldset>`
  is the wrong semantic for action buttons.
- **Keep a `<div role="group" aria-label>` (the pre-0005 state).** Rejected for
  the same redundancy reason, and it would reintroduce the
  `jsx-a11y/prefer-tag-over-role` lint finding that 0005 resolved.
- **Move the keyboard handler onto each button instead of the container.**
  Rejected — it would duplicate the handler across every button and fight the
  `role="application"` model, which is explicitly "the container owns the
  keyboard."
- **Auto-focus the container on mount.** Rejected — stealing focus on mount is
  hostile to screen-reader and keyboard users who are navigating the page. The
  container is focusable on demand (click/Tab), not grabbed automatically.

## Consequences

- Keyboard input is reliable regardless of where focus lands inside the
  calculator; a regression test
  (`container is focusable so keys work without a button focused`) locks this in
  and fails if `tabIndex` is removed.
- Screen-reader entry into the button grid is quieter — one fewer group
  announcement — with no loss of per-button labeling and no WCAG 2.2 AA
  regression (verified by the component and E2E `@afixt/a11y-assert` suites and
  Lighthouse).
- ADR 0005 and ADR 0006 are partially superseded; future readers should treat
  this ADR as current for the button-grid markup.
- The grid gains one extra tab stop (the container). This is intentional and
  consistent with the `role="application"` pattern.
