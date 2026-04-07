import { test, expect, type Page } from '@playwright/test';

test.describe('Calculator E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('initial state', () => {
    test('displays 0 on load', async ({ page }) => {
      const display = page.getByTestId('display');
      await expect(display).toHaveText('0');
    });

    test('has the correct page title', async ({ page }) => {
      await expect(page).toHaveTitle('Accessible Calculator');
    });

    test('calculator has role="application"', async ({ page }) => {
      const calc = page.getByRole('application', { name: 'Calculator' });
      await expect(calc).toBeVisible();
    });

    test('calculator has aria-roledescription', async ({ page }) => {
      const calc = page.getByRole('application');
      await expect(calc).toHaveAttribute('aria-roledescription', 'calculator');
    });

    test('has a visually hidden h1', async ({ page }) => {
      const heading = page.getByRole('heading', { name: 'Accessible Calculator' });
      await expect(heading).toBeAttached();
    });

    test('renders 19 calculator buttons plus mode toggle', async ({ page }) => {
      const buttonGroup = page.getByRole('group', { name: /calculator buttons/i });
      const calcButtons = buttonGroup.getByRole('button');
      await expect(calcButtons).toHaveCount(19);
    });
  });

  test.describe('button accessibility', () => {
    test('all digit buttons have correct accessible names', async ({ page }) => {
      for (let i = 0; i <= 9; i++) {
        await expect(page.getByRole('button', { name: String(i), exact: true })).toBeVisible();
      }
    });

    test('operator buttons have descriptive labels', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Subtract' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Multiply' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Divide' })).toBeVisible();
    });

    test('function buttons have descriptive labels', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'All clear' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Toggle positive negative' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Percent' })).toBeVisible();
    });

    test('all buttons have type="button"', async ({ page }) => {
      const buttons = page.getByRole('button');
      const count = await buttons.count();
      for (let i = 0; i < count; i++) {
        await expect(buttons.nth(i)).toHaveAttribute('type', 'button');
      }
    });

    test('operator buttons have aria-pressed attribute', async ({ page }) => {
      const operators = ['Add', 'Subtract', 'Multiply', 'Divide'];
      for (const name of operators) {
        await expect(page.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'false');
      }
    });

    test('Equals button does not have aria-pressed', async ({ page }) => {
      const equals = page.getByRole('button', { name: 'Equals' });
      await expect(equals).not.toHaveAttribute('aria-pressed');
    });
  });

  test.describe('basic arithmetic via clicks', () => {
    test('addition: 5 + 3 = 8', async ({ page }) => {
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: 'Add' }).click();
      await page.getByRole('button', { name: '3', exact: true }).click();
      await page.getByRole('button', { name: 'Equals' }).click();
      await expect(page.getByTestId('display')).toHaveText('8');
    });

    test('subtraction: 9 - 4 = 5', async ({ page }) => {
      await page.getByRole('button', { name: '9', exact: true }).click();
      await page.getByRole('button', { name: 'Subtract' }).click();
      await page.getByRole('button', { name: '4', exact: true }).click();
      await page.getByRole('button', { name: 'Equals' }).click();
      await expect(page.getByTestId('display')).toHaveText('5');
    });

    test('multiplication: 6 × 7 = 42', async ({ page }) => {
      await page.getByRole('button', { name: '6', exact: true }).click();
      await page.getByRole('button', { name: 'Multiply' }).click();
      await page.getByRole('button', { name: '7', exact: true }).click();
      await page.getByRole('button', { name: 'Equals' }).click();
      await expect(page.getByTestId('display')).toHaveText('42');
    });

    test('division: 8 ÷ 2 = 4', async ({ page }) => {
      await page.getByRole('button', { name: '8', exact: true }).click();
      await page.getByRole('button', { name: 'Divide' }).click();
      await page.getByRole('button', { name: '2', exact: true }).click();
      await page.getByRole('button', { name: 'Equals' }).click();
      await expect(page.getByTestId('display')).toHaveText('4');
    });

    test('division by zero shows Error', async ({ page }) => {
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: 'Divide' }).click();
      await page.getByRole('button', { name: '0', exact: true }).click();
      await page.getByRole('button', { name: 'Equals' }).click();
      await expect(page.getByTestId('display')).toHaveText('Error');
    });

    test('multi-digit operands: 12 + 34 = 46', async ({ page }) => {
      await page.getByRole('button', { name: '1', exact: true }).click();
      await page.getByRole('button', { name: '2', exact: true }).click();
      await page.getByRole('button', { name: 'Add' }).click();
      await page.getByRole('button', { name: '3', exact: true }).click();
      await page.getByRole('button', { name: '4', exact: true }).click();
      await page.getByRole('button', { name: 'Equals' }).click();
      await expect(page.getByTestId('display')).toHaveText('46');
    });

    test('decimal arithmetic: 1.5 + 2.5 = 4', async ({ page }) => {
      await page.getByRole('button', { name: '1', exact: true }).click();
      await page.getByRole('button', { name: 'Decimal point' }).click();
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: 'Add' }).click();
      await page.getByRole('button', { name: '2', exact: true }).click();
      await page.getByRole('button', { name: 'Decimal point' }).click();
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: 'Equals' }).click();
      await expect(page.getByTestId('display')).toHaveText('4');
    });

    test('chained operations: 5 + 3 - 2 = 6', async ({ page }) => {
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: 'Add' }).click();
      await page.getByRole('button', { name: '3', exact: true }).click();
      await page.getByRole('button', { name: 'Subtract' }).click();
      await expect(page.getByTestId('display')).toHaveText('8');
      await page.getByRole('button', { name: '2', exact: true }).click();
      await page.getByRole('button', { name: 'Equals' }).click();
      await expect(page.getByTestId('display')).toHaveText('6');
    });
  });

  test.describe('function buttons', () => {
    test('AC clears everything', async ({ page }) => {
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: 'Add' }).click();
      await page.getByRole('button', { name: '3', exact: true }).click();
      await page.getByRole('button', { name: 'All clear' }).click();
      await expect(page.getByTestId('display')).toHaveText('0');
    });

    test('toggle sign: 7 → -7 → 7', async ({ page }) => {
      await page.getByRole('button', { name: '7', exact: true }).click();
      await page.getByRole('button', { name: 'Toggle positive negative' }).click();
      await expect(page.getByTestId('display')).toHaveText('-7');
      await page.getByRole('button', { name: 'Toggle positive negative' }).click();
      await expect(page.getByTestId('display')).toHaveText('7');
    });

    test('percent: 50% = 0.5', async ({ page }) => {
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: '0', exact: true }).click();
      await page.getByRole('button', { name: 'Percent' }).click();
      await expect(page.getByTestId('display')).toHaveText('0.5');
    });
  });

  test.describe('keyboard input', () => {
    test('digit keys', async ({ page }) => {
      const calc = page.getByRole('application');
      await calc.click();
      await page.keyboard.press('4');
      await page.keyboard.press('2');
      await expect(page.getByTestId('display')).toHaveText('42');
    });

    test('operator and Enter keys', async ({ page }) => {
      const calc = page.getByRole('application');
      await calc.click();
      await page.keyboard.press('6');
      await page.keyboard.press('*');
      await page.keyboard.press('7');
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('display')).toHaveText('42');
    });

    test('= key for equals', async ({ page }) => {
      const calc = page.getByRole('application');
      await calc.click();
      await page.keyboard.press('3');
      await page.keyboard.press('+');
      await page.keyboard.press('5');
      await page.keyboard.press('=');
      await expect(page.getByTestId('display')).toHaveText('8');
    });

    test('Escape clears', async ({ page }) => {
      const calc = page.getByRole('application');
      await calc.click();
      await page.keyboard.press('1');
      await page.keyboard.press('2');
      await page.keyboard.press('3');
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('display')).toHaveText('0');
    });

    test('Backspace deletes last digit', async ({ page }) => {
      const calc = page.getByRole('application');
      await calc.click();
      await page.keyboard.press('1');
      await page.keyboard.press('2');
      await page.keyboard.press('3');
      await page.keyboard.press('Backspace');
      await expect(page.getByTestId('display')).toHaveText('12');
    });

    test('decimal key', async ({ page }) => {
      const calc = page.getByRole('application');
      await calc.click();
      await page.keyboard.press('3');
      await page.keyboard.press('.');
      await page.keyboard.press('1');
      await page.keyboard.press('4');
      await expect(page.getByTestId('display')).toHaveText('3.14');
    });

    test('/ for divide', async ({ page }) => {
      const calc = page.getByRole('application');
      await calc.click();
      await page.keyboard.press('8');
      await page.keyboard.press('/');
      await page.keyboard.press('2');
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('display')).toHaveText('4');
    });

    test('- for subtract', async ({ page }) => {
      const calc = page.getByRole('application');
      await calc.click();
      await page.keyboard.press('9');
      await page.keyboard.press('-');
      await page.keyboard.press('4');
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('display')).toHaveText('5');
    });

    test('full keyboard calculation workflow', async ({ page }) => {
      const calc = page.getByRole('application');
      await calc.click();
      // Calculate (10 + 5) via keyboard, then multiply by 2
      await page.keyboard.press('1');
      await page.keyboard.press('0');
      await page.keyboard.press('+');
      await page.keyboard.press('5');
      await page.keyboard.press('*');
      await expect(page.getByTestId('display')).toHaveText('15');
      await page.keyboard.press('2');
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('display')).toHaveText('30');
    });
  });

  test.describe('aria-pressed state management', () => {
    test('operator gets aria-pressed=true when active', async ({ page }) => {
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: 'Add' }).click();
      await expect(page.getByRole('button', { name: 'Add' })).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByRole('button', { name: 'Subtract' })).toHaveAttribute('aria-pressed', 'false');
    });

    test('aria-pressed clears when digit entered', async ({ page }) => {
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: 'Add' }).click();
      await expect(page.getByRole('button', { name: 'Add' })).toHaveAttribute('aria-pressed', 'true');
      await page.getByRole('button', { name: '3', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Add' })).toHaveAttribute('aria-pressed', 'false');
    });

    test('aria-pressed switches when changing operator', async ({ page }) => {
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: 'Add' }).click();
      await expect(page.getByRole('button', { name: 'Add' })).toHaveAttribute('aria-pressed', 'true');
      await page.getByRole('button', { name: 'Multiply' }).click();
      await expect(page.getByRole('button', { name: 'Add' })).toHaveAttribute('aria-pressed', 'false');
      await expect(page.getByRole('button', { name: 'Multiply' })).toHaveAttribute('aria-pressed', 'true');
    });

    test('aria-pressed clears after equals', async ({ page }) => {
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: 'Add' }).click();
      await page.getByRole('button', { name: '3', exact: true }).click();
      await page.getByRole('button', { name: 'Equals' }).click();
      await expect(page.getByRole('button', { name: 'Add' })).toHaveAttribute('aria-pressed', 'false');
    });
  });

  test.describe('live region announcements', () => {
    test('announces digit input', async ({ page }) => {
      await page.getByRole('button', { name: '5', exact: true }).click();
      await expect(page.getByTestId('announcements')).toHaveText('5');
    });

    test('announces operator', async ({ page }) => {
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: 'Add' }).click();
      await expect(page.getByTestId('announcements')).toContainText('plus');
    });

    test('announces full equation result', async ({ page }) => {
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: 'Add' }).click();
      await page.getByRole('button', { name: '3', exact: true }).click();
      await page.getByRole('button', { name: 'Equals' }).click();
      await expect(page.getByTestId('announcements')).toHaveText('5 plus 3 equals 8');
    });

    test('announces All cleared', async ({ page }) => {
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: 'All clear' }).click();
      await expect(page.getByTestId('announcements')).toHaveText('All cleared, 0');
    });

    test('announces division by zero error', async ({ page }) => {
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: 'Divide' }).click();
      await page.getByRole('button', { name: '0', exact: true }).click();
      await page.getByRole('button', { name: 'Equals' }).click();
      await expect(page.getByTestId('announcements')).toHaveText('Error, cannot divide by zero');
    });

    test('announces sign toggle', async ({ page }) => {
      await page.getByRole('button', { name: '7', exact: true }).click();
      await page.getByRole('button', { name: 'Toggle positive negative' }).click();
      await expect(page.getByTestId('announcements')).toHaveText('negative 7');
    });
  });

  test.describe('display aria-label', () => {
    test('shows "Result: 0" initially', async ({ page }) => {
      await expect(page.getByTestId('display')).toHaveAttribute('aria-label', 'Result: 0');
    });

    test('updates with current value', async ({ page }) => {
      await page.getByRole('button', { name: '4', exact: true }).click();
      await page.getByRole('button', { name: '2', exact: true }).click();
      await expect(page.getByTestId('display')).toHaveAttribute('aria-label', 'Result: 42');
    });

    test('shows negative values correctly', async ({ page }) => {
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: 'Toggle positive negative' }).click();
      await expect(page.getByTestId('display')).toHaveAttribute('aria-label', 'Result: negative 5');
    });

    test('shows Error for division by zero', async ({ page }) => {
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: 'Divide' }).click();
      await page.getByRole('button', { name: '0', exact: true }).click();
      await page.getByRole('button', { name: 'Equals' }).click();
      await expect(page.getByTestId('display')).toHaveAttribute('aria-label', 'Result: Error');
    });
  });

  test.describe('focus and interaction', () => {
    test('buttons are focusable via Tab', async ({ page }) => {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      await expect(focused).toHaveRole('button');
    });

    test('buttons activate on click when focused', async ({ page }) => {
      const btn5 = page.getByRole('button', { name: '5', exact: true });
      await btn5.focus();
      await btn5.click();
      await expect(page.getByTestId('display')).toHaveText('5');
    });

    test('buttons activate on Space when focused', async ({ page }) => {
      const btn3 = page.getByRole('button', { name: '3', exact: true });
      await btn3.focus();
      await page.keyboard.press('Space');
      await expect(page.getByTestId('display')).toHaveText('3');
    });

    test('recovery from error state', async ({ page }) => {
      // Trigger error
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: 'Divide' }).click();
      await page.getByRole('button', { name: '0', exact: true }).click();
      await page.getByRole('button', { name: 'Equals' }).click();
      await expect(page.getByTestId('display')).toHaveText('Error');
      // Recover
      await page.getByRole('button', { name: 'All clear' }).click();
      await expect(page.getByTestId('display')).toHaveText('0');
      // Continue working
      await page.getByRole('button', { name: '2', exact: true }).click();
      await page.getByRole('button', { name: 'Add' }).click();
      await page.getByRole('button', { name: '3', exact: true }).click();
      await page.getByRole('button', { name: 'Equals' }).click();
      await expect(page.getByTestId('display')).toHaveText('5');
    });
  });

  test.describe('Scientific mode', () => {
    // Helper: navigate to the app and activate scientific mode
    async function activateScientific(page: Page) {
      const toggle = page.getByTestId('mode-toggle');
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    }

    test('mode toggle button exists and starts in basic mode', async ({ page }) => {
      const toggle = page.getByTestId('mode-toggle');
      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
      await expect(toggle).toHaveText('Scientific');
    });

    test('clicking mode toggle switches to scientific mode', async ({ page }) => {
      await activateScientific(page);
      await expect(page.getByTestId('mode-toggle')).toHaveText('Basic');
    });

    test('scientific buttons appear after mode toggle', async ({ page }) => {
      await activateScientific(page);
      await expect(page.getByRole('button', { name: 'Sine', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Cosine', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Tangent', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Square root' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'x squared' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Factorial' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Natural log' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Pi' })).toBeVisible();
      await expect(page.getByRole('button', { name: "Euler's number e" })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Reciprocal' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Open parenthesis' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Close parenthesis' })).toBeVisible();
    });

    test('scientific buttons are hidden after toggling back to basic mode', async ({ page }) => {
      await activateScientific(page);
      await page.getByTestId('mode-toggle').click();
      await expect(page.getByRole('button', { name: 'Sine', exact: true })).not.toBeVisible();
    });

    test('sqrt: sqrt(9) = 3', async ({ page }) => {
      await activateScientific(page);
      await page.getByRole('button', { name: '9', exact: true }).click();
      await page.getByRole('button', { name: 'Square root' }).click();
      await expect(page.getByTestId('display')).toHaveText('3');
    });

    test('square: 5² = 25', async ({ page }) => {
      await activateScientific(page);
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: 'x squared' }).click();
      await expect(page.getByTestId('display')).toHaveText('25');
    });

    test('factorial: 5! = 120', async ({ page }) => {
      await activateScientific(page);
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: 'Factorial' }).click();
      await expect(page.getByTestId('display')).toHaveText('120');
    });

    test('sin(0) = 0 in radians', async ({ page }) => {
      await activateScientific(page);
      await page.getByRole('button', { name: '0', exact: true }).click();
      await page.getByRole('button', { name: 'Sine', exact: true }).click();
      await expect(page.getByTestId('display')).toHaveText('0');
    });

    test('reciprocal: 1/4 = 0.25', async ({ page }) => {
      await activateScientific(page);
      await page.getByRole('button', { name: '4', exact: true }).click();
      await page.getByRole('button', { name: 'Reciprocal' }).click();
      await expect(page.getByTestId('display')).toHaveText('0.25');
    });

    test('natural log: ln(1) = 0', async ({ page }) => {
      await activateScientific(page);
      await page.getByRole('button', { name: '1', exact: true }).click();
      await page.getByRole('button', { name: 'Natural log' }).click();
      await expect(page.getByTestId('display')).toHaveText('0');
    });

    test('2nd function toggle: Sine label changes to Arc sine', async ({ page }) => {
      await activateScientific(page);
      await expect(page.getByRole('button', { name: 'Sine', exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Second function' }).click();
      await expect(page.getByRole('button', { name: 'Arc sine' })).toBeVisible();
    });

    test('2nd function toggle: sqrt changes to Cube root', async ({ page }) => {
      await activateScientific(page);
      await page.getByRole('button', { name: 'Second function' }).click();
      await expect(page.getByRole('button', { name: 'Cube root' })).toBeVisible();
    });

    test('Rad/Deg toggle: starts as RAD, switches to DEG', async ({ page }) => {
      await activateScientific(page);
      // Default is radians — button says "Currently radians, switch to degrees"
      await expect(page.getByRole('button', { name: 'Currently radians, switch to degrees' })).toBeVisible();
      await page.getByRole('button', { name: 'Currently radians, switch to degrees' }).click();
      await expect(page.getByRole('button', { name: 'Currently degrees, switch to radians' })).toBeVisible();
    });

    test('Rad/Deg toggle: DEG indicator appears in display', async ({ page }) => {
      await activateScientific(page);
      await page.getByRole('button', { name: 'Currently radians, switch to degrees' }).click();
      // The info panel is aria-hidden but the text should be in the DOM
      const infoPanel = page.locator('.calc-display__info');
      await expect(infoPanel).toContainText('DEG');
    });

    test('RAD indicator visible in display in scientific mode', async ({ page }) => {
      await activateScientific(page);
      const infoPanel = page.locator('.calc-display__info');
      await expect(infoPanel).toContainText('RAD');
    });

    test('parentheses: (3+4)*2 = 14', async ({ page }) => {
      await activateScientific(page);
      await page.getByRole('button', { name: 'Open parenthesis' }).click();
      await page.getByRole('button', { name: '3', exact: true }).click();
      await page.getByRole('button', { name: 'Add' }).click();
      await page.getByRole('button', { name: '4', exact: true }).click();
      await page.getByRole('button', { name: 'Close parenthesis' }).click();
      await page.getByRole('button', { name: 'Multiply' }).click();
      await page.getByRole('button', { name: '2', exact: true }).click();
      await page.getByRole('button', { name: 'Equals' }).click();
      await expect(page.getByTestId('display')).toHaveText('14');
    });

    test('paren depth indicator appears after Open parenthesis', async ({ page }) => {
      await activateScientific(page);
      await page.getByRole('button', { name: 'Open parenthesis' }).click();
      const parensIndicator = page.locator('.calc-display__parens');
      await expect(parensIndicator).toBeVisible();
      await expect(parensIndicator).toHaveText('(');
    });

    test('paren depth indicator disappears after Close parenthesis', async ({ page }) => {
      await activateScientific(page);
      await page.getByRole('button', { name: 'Open parenthesis' }).click();
      await page.getByRole('button', { name: 'Close parenthesis' }).click();
      await expect(page.locator('.calc-display__parens')).not.toBeVisible();
    });

    test('Pi constant inserts π ≈ 3.14159', async ({ page }) => {
      await activateScientific(page);
      await page.getByRole('button', { name: 'Pi' }).click();
      const displayText = await page.getByTestId('display').textContent();
      expect(parseFloat(displayText!)).toBeCloseTo(Math.PI, 4);
    });

    test("Euler's number e constant inserts e ≈ 2.71828", async ({ page }) => {
      await activateScientific(page);
      await page.getByRole('button', { name: "Euler's number e" }).click();
      const displayText = await page.getByTestId('display').textContent();
      expect(parseFloat(displayText!)).toBeCloseTo(Math.E, 4);
    });

    test('power operator xⁿ: 2^3 = 8', async ({ page }) => {
      await activateScientific(page);
      await page.getByRole('button', { name: '2', exact: true }).click();
      await page.getByRole('button', { name: 'x to the power of n' }).click();
      await page.getByRole('button', { name: '3', exact: true }).click();
      await page.getByRole('button', { name: 'Equals' }).click();
      await expect(page.getByTestId('display')).toHaveText('8');
    });

    test('keyboard ( opens parenthesis in scientific mode', async ({ page }) => {
      await activateScientific(page);
      const calc = page.getByRole('application');
      await calc.click();
      await page.keyboard.press('(');
      const parensIndicator = page.locator('.calc-display__parens');
      await expect(parensIndicator).toBeVisible();
      await expect(parensIndicator).toHaveText('(');
    });

    test('keyboard ) closes parenthesis in scientific mode', async ({ page }) => {
      await activateScientific(page);
      const calc = page.getByRole('application');
      await calc.click();
      await page.keyboard.press('(');
      await page.keyboard.press('3');
      await page.keyboard.press(')');
      await expect(page.locator('.calc-display__parens')).not.toBeVisible();
    });

    test('keyboard ( and ) compute (3+4) = 7 in scientific mode', async ({ page }) => {
      await activateScientific(page);
      const calc = page.getByRole('application');
      await calc.click();
      await page.keyboard.press('(');
      await page.keyboard.press('3');
      await page.keyboard.press('+');
      await page.keyboard.press('4');
      await page.keyboard.press(')');
      await expect(page.getByTestId('display')).toHaveText('7');
    });

    test('scientific buttons have type="button"', async ({ page }) => {
      await activateScientific(page);
      const scientificBtns = [
        'Sine', 'Cosine', 'Tangent', 'Square root', 'Factorial',
        'Natural log', 'Pi', "Euler's number e", 'Reciprocal',
        'Open parenthesis', 'Close parenthesis',
      ];
      for (const name of scientificBtns) {
        await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute('type', 'button');
      }
    });

    test('announcements for sqrt operation', async ({ page }) => {
      await activateScientific(page);
      await page.getByRole('button', { name: '9', exact: true }).click();
      await page.getByRole('button', { name: 'Square root' }).click();
      await expect(page.getByTestId('announcements')).toContainText('3');
    });

    test('announcements for open parenthesis', async ({ page }) => {
      await activateScientific(page);
      await page.getByRole('button', { name: 'Open parenthesis' }).click();
      await expect(page.getByTestId('announcements')).toHaveText('open parenthesis');
    });

    test('announcements for close parenthesis', async ({ page }) => {
      await activateScientific(page);
      await page.getByRole('button', { name: 'Open parenthesis' }).click();
      await page.getByRole('button', { name: '5', exact: true }).click();
      await page.getByRole('button', { name: 'Close parenthesis' }).click();
      await expect(page.getByTestId('announcements')).toContainText('close parenthesis');
    });

    test('announcements for angle mode change to degrees', async ({ page }) => {
      await activateScientific(page);
      await page.getByRole('button', { name: 'Currently radians, switch to degrees' }).click();
      await expect(page.getByTestId('announcements')).toHaveText('Switched to degrees');
    });

    test('announcements for angle mode change back to radians', async ({ page }) => {
      await activateScientific(page);
      await page.getByRole('button', { name: 'Currently radians, switch to degrees' }).click();
      await page.getByRole('button', { name: 'Currently degrees, switch to radians' }).click();
      await expect(page.getByTestId('announcements')).toHaveText('Switched to radians');
    });
  });

  test.describe('visual structure', () => {
    test('calculator is visible and centered', async ({ page }) => {
      const calc = page.locator('.calculator');
      await expect(calc).toBeVisible();
      const box = await calc.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(200);
    });

    test('calculator buttons meet minimum touch target size (44px)', async ({ page }) => {
      const buttonGroup = page.getByRole('group', { name: /calculator buttons/i });
      const buttons = buttonGroup.getByRole('button');
      const count = await buttons.count();
      for (let i = 0; i < count; i++) {
        const box = await buttons.nth(i).boundingBox();
        expect(box).not.toBeNull();
        expect(box!.height).toBeGreaterThanOrEqual(44);
        expect(box!.width).toBeGreaterThanOrEqual(44);
      }
    });

    test('focus indicators are visible', async ({ page }) => {
      const btn = page.getByRole('button', { name: '5', exact: true });
      await btn.focus();
      // Check that focus-visible styles are applied by verifying outline
      const outline = await btn.evaluate((el) => {
        return window.getComputedStyle(el).outlineStyle;
      });
      // When focused via keyboard/focus(), the outline should not be "none"
      expect(outline).not.toBe('none');
    });
  });
});
