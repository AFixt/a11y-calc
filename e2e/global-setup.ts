import type { FullConfig } from '@playwright/test';

/**
 * The demo shell's `<title>`. Used as an identity marker so the suite can tell
 * whether the server on the preview port is actually ours.
 *
 * Kept in sync with the `<title>` in `index.html` (there is a comment there
 * pointing back here). If the demo title changes, update both — otherwise this
 * guard reports "not the a11y-calc demo" against the real demo.
 */
const EXPECTED_TITLE = 'Accessible Calculator';

/**
 * Guard against `reuseExistingServer` running the whole suite against an
 * unrelated app.
 *
 * With `reuseExistingServer: !process.env.CI`, if anything already holds the
 * preview port locally, Playwright reuses it instead of starting the demo — so
 * the suite silently runs against whatever that process serves. A wrong app
 * produces a wall of confusing timeouts and wrong-content failures; a *similar*
 * app could even produce false passes. Neither is obvious without an `lsof`.
 *
 * This preflight fetches the base URL once and fails fast, with a message that
 * names the actual cause, if the served page is not the a11y-calc demo. See
 * issue #87.
 *
 * Ordering assumption: this relies on Playwright starting the configured
 * `webServer` *before* running globalSetup, so the fetch hits a live server.
 * That holds in the pinned Playwright version; if a future upgrade reverses it,
 * the fetch below fails on every run and the "could not reach" message makes
 * the cause obvious.
 */
async function globalSetup(config: FullConfig): Promise<void> {
  // Read the base URL from the resolved config rather than re-hardcoding the
  // port (it lives in playwright.config.ts). Fail loudly if it is somehow
  // absent instead of papering over it with a literal that could drift.
  const baseURL = config.projects[0]?.use.baseURL;
  if (!baseURL) {
    throw new Error(
      'E2E preflight: no base URL is configured — expected `use.baseURL` in playwright.config.ts.',
    );
  }

  let response: Awaited<ReturnType<typeof fetch>>;
  try {
    response = await fetch(baseURL);
  } catch (error) {
    const cause = error instanceof Error ? error.message : String(error);
    throw new Error(
      `E2E preflight: could not reach the preview server at ${baseURL} (${cause}). ` +
        `Start it with \`npm run preview\`, or let Playwright's webServer start it.`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `E2E preflight: the server at ${baseURL} responded ${response.status} ${response.statusText}. ` +
        `Expected the a11y-calc demo — check that the preview server built and served correctly.`,
    );
  }

  const html = await response.text();
  if (!html.includes(`<title>${EXPECTED_TITLE}</title>`)) {
    throw new Error(
      `E2E preflight: the server at ${baseURL} is not the a11y-calc demo ` +
        `(expected \`<title>${EXPECTED_TITLE}</title>\` in the served HTML). ` +
        `Something else is holding the preview port and \`reuseExistingServer\` picked it up. ` +
        `Find it with \`lsof -i :4173\` and stop it, then re-run the E2E suite.`,
    );
  }
}

// Playwright resolves `globalSetup` to the module's default export, so this file
// must default-export despite the repo-wide preference for named exports.
// eslint-disable-next-line import-x/no-default-export -- required by Playwright's globalSetup contract
export default globalSetup;
