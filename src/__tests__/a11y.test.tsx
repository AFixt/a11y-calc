import { jestAdapter } from '@afixt/a11y-assert';
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, it } from 'vitest';

import { Calculator } from '../components/Calculator/Calculator';

afterEach(() => {
  document.body.innerHTML = '';
});

// Render the Calculator inside the same landmark structure the demo uses
// (and that consumers are expected to use). Running page-scoped rules from
// @afixt/a11y-assert against a bare <Calculator> would flag missing-h1 and
// missing-landmark violations that aren't the component's job to satisfy.
function renderInPageShell(element: React.ReactElement): void {
  render(
    <>
      <h1 className="sr-only">Test shell</h1>
      <main>{element}</main>
    </>,
  );
}

// Limit to fully-automatic rules. auto_assisted rules like WCAG 2.5.3
// "Label in Name" pattern-match visible text against accessible name and
// flag correct-but-heuristically-different pairs (e.g., `<button aria-label=
// "Divide">÷</button>`). Fixing those is its own tracked follow-up; adding
// the gate now without disabling noise would block every PR on a
// pre-existing finding.
const OPTIONS = { engineOptions: { type: 'automatic' as const } };

describe('Calculator a11y-assert (component)', () => {
  it('basic mode passes accessibility assertions on first render', async () => {
    renderInPageShell(<Calculator />);
    await jestAdapter(() => Promise.resolve(document.body), [], OPTIONS);
  });

  it('scientific mode passes accessibility assertions on first render', async () => {
    renderInPageShell(<Calculator initialMode="scientific" />);
    await jestAdapter(() => Promise.resolve(document.body), [], OPTIONS);
  });

  it('still passes after a few interactions in scientific mode', async () => {
    const user = userEvent.setup();
    renderInPageShell(<Calculator initialMode="scientific" />);

    await user.click(document.querySelector<HTMLButtonElement>('[aria-label="7"]')!);
    await user.click(document.querySelector<HTMLButtonElement>('[aria-label="Multiply"]')!);
    await user.click(document.querySelector<HTMLButtonElement>('[aria-label="Open parenthesis"]')!);
    await user.click(document.querySelector<HTMLButtonElement>('[aria-label="3"]')!);
    await user.click(
      document.querySelector<HTMLButtonElement>('[aria-label="Close parenthesis"]')!,
    );

    await jestAdapter(() => Promise.resolve(document.body), [], OPTIONS);
  });
});
