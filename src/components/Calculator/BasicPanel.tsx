import {
  StandardRow1,
  StandardRow2,
  StandardRow3,
  StandardRow4,
  StandardRow5,
} from './StandardRows';

import type { ButtonPanelProps } from './ButtonPanel';
import type { ReactElement } from 'react';

/**
 * 4-column basic calculator grid: AC / ± / % / ÷ / 7-9 × / 4-6 − / 1-3 + /
 * 0 (wide) . =. Does not render any scientific-mode controls.
 */
export function BasicPanel(props: ButtonPanelProps): ReactElement {
  return (
    <fieldset className="calc-buttons">
      <legend className="sr-only">Calculator buttons</legend>
      <StandardRow1 {...props} />
      <StandardRow2 {...props} />
      <StandardRow3 {...props} />
      <StandardRow4 {...props} />
      <StandardRow5 {...props} />
    </fieldset>
  );
}
