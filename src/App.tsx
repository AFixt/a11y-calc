import { Calculator } from './components/Calculator/Calculator';

import type { ReactElement } from 'react';

/**
 * Demo app shell. Hosts a single `<Calculator>` with a visually-hidden page
 * heading. Imported by `main.tsx` for the local dev/demo preview only.
 */
function App(): ReactElement {
  return (
    <main className="app">
      <h1 className="sr-only">Accessible Calculator</h1>
      <Calculator />
    </main>
  );
}

export default App;
