import type { FullConfig } from '@playwright/test';

/**
 * The demo shell's `<title>`. Used as an identity marker so the suite can tell
 * whether the server on the preview port is actually ours.
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
 */
async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use.baseURL ?? 'http://localhost:4173';

  let html: string;
  try {
    const response = await fetch(baseURL);
    html = await response.text();
  } catch (error) {
    const cause = error instanceof Error ? error.message : String(error);
    throw new Error(
      `E2E preflight: could not reach the preview server at ${baseURL} (${cause}). ` +
        `Start it with \`npm run preview\`, or let Playwright's webServer start it.`,
    );
  }

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
