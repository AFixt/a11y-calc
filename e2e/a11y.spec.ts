import { playwrightAdapter } from '@afixt/a11y-assert';
import { expect, test } from '@playwright/test';

// Limit to automatic rules — see comment in src/__tests__/a11y.test.tsx for
// rationale. auto_assisted rules like WCAG 2.5.3 are tracked as a follow-up.
const OPTIONS = { engineOptions: { type: 'automatic' as const } };

test.describe('Calculator a11y-assert (E2E)', () => {
  test('basic mode has no automatic violations', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('application', { name: /calculator/i })).toBeVisible();
    await playwrightAdapter(page, [], OPTIONS);
  });

  test('scientific mode has no automatic violations after toggling', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('mode-toggle').click();
    await expect(page.getByRole('button', { name: 'Open parenthesis' })).toBeVisible();
    await playwrightAdapter(page, [], OPTIONS);
  });

  test('scientific mode has no automatic violations after a few interactions', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('mode-toggle').click();

    await page.getByRole('button', { name: '7' }).click();
    await page.getByRole('button', { name: 'Multiply' }).click();
    await page.getByRole('button', { name: 'Open parenthesis' }).click();
    await page.getByRole('button', { name: '3' }).click();
    await page.getByRole('button', { name: 'Close parenthesis' }).click();

    await playwrightAdapter(page, [], OPTIONS);
  });
});
