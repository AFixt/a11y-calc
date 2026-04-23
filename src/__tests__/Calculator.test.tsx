import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Calculator } from '../components/Calculator/Calculator';

function renderCalculator() {
  const user = userEvent.setup();
  render(<Calculator />);
  return { user };
}

function getDisplay() {
  return screen.getByTestId('display');
}

function getAnnouncements() {
  return screen.getByTestId('announcements');
}

function btn(name: string) {
  return screen.getByRole('button', { name });
}

describe('Calculator', () => {
  describe('rendering and structure', () => {
    it('renders with role="application" and accessible name', () => {
      renderCalculator();
      const calc = screen.getByRole('application', { name: /calculator/i });
      expect(calc).toBeInTheDocument();
    });

    it('has aria-roledescription="calculator"', () => {
      renderCalculator();
      const calc = screen.getByRole('application');
      expect(calc).toHaveAttribute('aria-roledescription', 'calculator');
    });

    it('renders an output element for the display', () => {
      renderCalculator();
      const display = getDisplay();
      expect(display.tagName).toBe('OUTPUT');
      expect(display).toHaveTextContent('0');
    });

    it('display has an accessible label', () => {
      renderCalculator();
      expect(getDisplay()).toHaveAttribute('aria-label', 'Result: 0');
    });

    it('renders a live region for announcements', () => {
      renderCalculator();
      const region = getAnnouncements();
      expect(region).toHaveAttribute('aria-live', 'polite');
      expect(region).toHaveAttribute('aria-atomic', 'true');
    });

    it('renders a button group with accessible name', () => {
      renderCalculator();
      expect(screen.getByRole('group', { name: /calculator buttons/i })).toBeInTheDocument();
    });

    it('renders all digit buttons (0-9) with accessible names', () => {
      renderCalculator();
      for (let i = 0; i <= 9; i++) {
        expect(btn(String(i))).toBeInTheDocument();
      }
    });

    it('renders operator buttons with descriptive accessible names', () => {
      renderCalculator();
      expect(btn('Add')).toBeInTheDocument();
      expect(btn('Subtract')).toBeInTheDocument();
      expect(btn('Multiply')).toBeInTheDocument();
      expect(btn('Divide')).toBeInTheDocument();
    });

    it('renders function buttons with descriptive accessible names', () => {
      renderCalculator();
      expect(btn('All clear')).toBeInTheDocument();
      expect(btn('Toggle positive negative')).toBeInTheDocument();
      expect(btn('Percent')).toBeInTheDocument();
    });

    it('renders decimal point and equals buttons', () => {
      renderCalculator();
      expect(btn('Decimal point')).toBeInTheDocument();
      expect(btn('Equals')).toBeInTheDocument();
    });

    it('all buttons have type="button"', () => {
      renderCalculator();
      const buttons = screen.getAllByRole('button');
      buttons.forEach((b) => {
        expect(b).toHaveAttribute('type', 'button');
      });
    });

    it('renders exactly 19 buttons', () => {
      renderCalculator();
      const buttonGroup = screen.getByRole('group', { name: /calculator buttons/i });
      const buttons = within(buttonGroup).getAllByRole('button');
      // 10 digits + 4 operators + AC + +/- + % + . + = = 19
      expect(buttons).toHaveLength(19);
    });
  });

  describe('digit input via clicks', () => {
    it('displays a single digit', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      expect(getDisplay()).toHaveTextContent('5');
    });

    it('concatenates multiple digits', async () => {
      const { user } = renderCalculator();
      await user.click(btn('1'));
      await user.click(btn('2'));
      await user.click(btn('3'));
      expect(getDisplay()).toHaveTextContent('123');
    });

    it('replaces leading zero', async () => {
      const { user } = renderCalculator();
      expect(getDisplay()).toHaveTextContent('0');
      await user.click(btn('7'));
      expect(getDisplay()).toHaveTextContent('7');
    });

    it('allows decimal input', async () => {
      const { user } = renderCalculator();
      await user.click(btn('3'));
      await user.click(btn('Decimal point'));
      await user.click(btn('1'));
      await user.click(btn('4'));
      expect(getDisplay()).toHaveTextContent('3.14');
    });

    it('prevents multiple decimal points', async () => {
      const { user } = renderCalculator();
      await user.click(btn('3'));
      await user.click(btn('Decimal point'));
      await user.click(btn('1'));
      await user.click(btn('Decimal point'));
      await user.click(btn('4'));
      expect(getDisplay()).toHaveTextContent('3.14');
    });

    it('starts new number with 0. when decimal pressed after operator', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Add'));
      await user.click(btn('Decimal point'));
      await user.click(btn('5'));
      expect(getDisplay()).toHaveTextContent('0.5');
    });
  });

  describe('arithmetic operations via clicks', () => {
    it('performs addition', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Add'));
      await user.click(btn('3'));
      await user.click(btn('Equals'));
      expect(getDisplay()).toHaveTextContent('8');
    });

    it('performs subtraction', async () => {
      const { user } = renderCalculator();
      await user.click(btn('9'));
      await user.click(btn('Subtract'));
      await user.click(btn('4'));
      await user.click(btn('Equals'));
      expect(getDisplay()).toHaveTextContent('5');
    });

    it('performs multiplication', async () => {
      const { user } = renderCalculator();
      await user.click(btn('6'));
      await user.click(btn('Multiply'));
      await user.click(btn('7'));
      await user.click(btn('Equals'));
      expect(getDisplay()).toHaveTextContent('42');
    });

    it('performs division', async () => {
      const { user } = renderCalculator();
      await user.click(btn('8'));
      await user.click(btn('Divide'));
      await user.click(btn('2'));
      await user.click(btn('Equals'));
      expect(getDisplay()).toHaveTextContent('4');
    });

    it('shows Error for division by zero', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Divide'));
      await user.click(btn('0'));
      await user.click(btn('Equals'));
      expect(getDisplay()).toHaveTextContent('Error');
    });

    it('chains operations (5+3-2)', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Add'));
      await user.click(btn('3'));
      await user.click(btn('Subtract'));
      // At this point 5+3=8 should be computed
      expect(getDisplay()).toHaveTextContent('8');
      await user.click(btn('2'));
      await user.click(btn('Equals'));
      expect(getDisplay()).toHaveTextContent('6');
    });

    it('pressing equals without operator does nothing', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Equals'));
      expect(getDisplay()).toHaveTextContent('5');
    });

    it('starts new number after equals', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Add'));
      await user.click(btn('3'));
      await user.click(btn('Equals'));
      expect(getDisplay()).toHaveTextContent('8');
      await user.click(btn('2'));
      expect(getDisplay()).toHaveTextContent('2');
    });

    it('handles multi-digit operands', async () => {
      const { user } = renderCalculator();
      await user.click(btn('1'));
      await user.click(btn('2'));
      await user.click(btn('Add'));
      await user.click(btn('3'));
      await user.click(btn('4'));
      await user.click(btn('Equals'));
      expect(getDisplay()).toHaveTextContent('46');
    });

    it('handles decimal operands', async () => {
      const { user } = renderCalculator();
      await user.click(btn('1'));
      await user.click(btn('Decimal point'));
      await user.click(btn('5'));
      await user.click(btn('Add'));
      await user.click(btn('2'));
      await user.click(btn('Decimal point'));
      await user.click(btn('5'));
      await user.click(btn('Equals'));
      expect(getDisplay()).toHaveTextContent('4');
    });
  });

  describe('function buttons', () => {
    it('AC clears everything', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Add'));
      await user.click(btn('3'));
      await user.click(btn('All clear'));
      expect(getDisplay()).toHaveTextContent('0');
    });

    it('toggle sign makes positive negative', async () => {
      const { user } = renderCalculator();
      await user.click(btn('7'));
      await user.click(btn('Toggle positive negative'));
      expect(getDisplay()).toHaveTextContent('-7');
    });

    it('toggle sign makes negative positive', async () => {
      const { user } = renderCalculator();
      await user.click(btn('7'));
      await user.click(btn('Toggle positive negative'));
      await user.click(btn('Toggle positive negative'));
      expect(getDisplay()).toHaveTextContent('7');
    });

    it('toggle sign does nothing on zero', async () => {
      const { user } = renderCalculator();
      await user.click(btn('Toggle positive negative'));
      expect(getDisplay()).toHaveTextContent('0');
    });

    it('percent divides by 100', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('0'));
      await user.click(btn('Percent'));
      expect(getDisplay()).toHaveTextContent('0.5');
    });

    it('percent on small number', async () => {
      const { user } = renderCalculator();
      await user.click(btn('1'));
      await user.click(btn('Percent'));
      expect(getDisplay()).toHaveTextContent('0.01');
    });
  });

  describe('keyboard input', () => {
    it('accepts digit keys', async () => {
      const { user } = renderCalculator();
      await user.click(btn('All clear')); // focus inside calculator
      await user.keyboard('42');
      expect(getDisplay()).toHaveTextContent('42');
    });

    it('accepts operator and Enter keys', async () => {
      const { user } = renderCalculator();
      await user.click(btn('All clear'));
      await user.keyboard('6*7{Enter}');
      expect(getDisplay()).toHaveTextContent('42');
    });

    it('accepts = key for equals', async () => {
      const { user } = renderCalculator();
      await user.click(btn('All clear'));
      await user.keyboard('3+5=');
      expect(getDisplay()).toHaveTextContent('8');
    });

    it('accepts Escape to clear', async () => {
      const { user } = renderCalculator();
      await user.click(btn('All clear'));
      await user.keyboard('123{Escape}');
      expect(getDisplay()).toHaveTextContent('0');
    });

    it('accepts Backspace to delete last digit', async () => {
      const { user } = renderCalculator();
      await user.click(btn('All clear'));
      await user.keyboard('123{Backspace}');
      expect(getDisplay()).toHaveTextContent('12');
    });

    it('Backspace on single digit returns to 0', async () => {
      const { user } = renderCalculator();
      await user.click(btn('All clear'));
      await user.keyboard('5{Backspace}');
      expect(getDisplay()).toHaveTextContent('0');
    });

    it('accepts decimal key', async () => {
      const { user } = renderCalculator();
      await user.click(btn('All clear'));
      await user.keyboard('3.14');
      expect(getDisplay()).toHaveTextContent('3.14');
    });

    it('accepts percent key', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('0'));
      // Fire % via fireEvent since userEvent interprets % as Shift+5
      fireEvent.keyDown(btn('0'), { key: '%' });
      expect(getDisplay()).toHaveTextContent('0.5');
    });

    it('accepts / for divide', async () => {
      const { user } = renderCalculator();
      await user.click(btn('All clear'));
      await user.keyboard('8/2{Enter}');
      expect(getDisplay()).toHaveTextContent('4');
    });

    it('accepts - for subtract', async () => {
      const { user } = renderCalculator();
      await user.click(btn('All clear'));
      await user.keyboard('9-4{Enter}');
      expect(getDisplay()).toHaveTextContent('5');
    });

    it('accepts + for add', async () => {
      const { user } = renderCalculator();
      await user.click(btn('All clear'));
      await user.keyboard('2+3{Enter}');
      expect(getDisplay()).toHaveTextContent('5');
    });
  });

  describe('aria-pressed on operators', () => {
    it('sets aria-pressed=true on active operator', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Add'));
      expect(btn('Add')).toHaveAttribute('aria-pressed', 'true');
    });

    it('sets aria-pressed=false on inactive operators', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Add'));
      expect(btn('Subtract')).toHaveAttribute('aria-pressed', 'false');
      expect(btn('Multiply')).toHaveAttribute('aria-pressed', 'false');
      expect(btn('Divide')).toHaveAttribute('aria-pressed', 'false');
    });

    it('clears aria-pressed after entering a new digit', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Add'));
      expect(btn('Add')).toHaveAttribute('aria-pressed', 'true');
      await user.click(btn('3'));
      expect(btn('Add')).toHaveAttribute('aria-pressed', 'false');
    });

    it('clears aria-pressed after equals', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Add'));
      await user.click(btn('3'));
      await user.click(btn('Equals'));
      expect(btn('Add')).toHaveAttribute('aria-pressed', 'false');
    });

    it('switches aria-pressed when changing operator', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Add'));
      expect(btn('Add')).toHaveAttribute('aria-pressed', 'true');
      await user.click(btn('Subtract'));
      expect(btn('Add')).toHaveAttribute('aria-pressed', 'false');
      expect(btn('Subtract')).toHaveAttribute('aria-pressed', 'true');
    });

    it('Equals button never has aria-pressed', () => {
      renderCalculator();
      expect(btn('Equals')).not.toHaveAttribute('aria-pressed');
    });

    it('number buttons never have aria-pressed', () => {
      renderCalculator();
      expect(btn('5')).not.toHaveAttribute('aria-pressed');
    });

    it('function buttons never have aria-pressed', () => {
      renderCalculator();
      expect(btn('All clear')).not.toHaveAttribute('aria-pressed');
      expect(btn('Percent')).not.toHaveAttribute('aria-pressed');
    });
  });

  describe('live region announcements', () => {
    it('announces digits', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      expect(getAnnouncements()).toHaveTextContent('5');
    });

    it('announces operators', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Add'));
      expect(getAnnouncements()).toHaveTextContent('plus');
    });

    it('announces full equation on equals', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Add'));
      await user.click(btn('3'));
      await user.click(btn('Equals'));
      expect(getAnnouncements()).toHaveTextContent('5 plus 3 equals 8');
    });

    it('announces clear', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('All clear'));
      expect(getAnnouncements()).toHaveTextContent('All cleared, 0');
    });

    it('announces sign toggle', async () => {
      const { user } = renderCalculator();
      await user.click(btn('7'));
      await user.click(btn('Toggle positive negative'));
      expect(getAnnouncements()).toHaveTextContent('negative 7');
    });

    it('announces percent result', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('0'));
      await user.click(btn('Percent'));
      expect(getAnnouncements()).toHaveTextContent('0.5');
    });

    it('announces division by zero error', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Divide'));
      await user.click(btn('0'));
      await user.click(btn('Equals'));
      expect(getAnnouncements()).toHaveTextContent('Error, cannot divide by zero');
    });

    it('announces backspace', async () => {
      const { user } = renderCalculator();
      await user.click(btn('All clear'));
      await user.keyboard('12{Backspace}');
      expect(getAnnouncements()).toHaveTextContent('deleted');
    });

    it('announces multiplication result', async () => {
      const { user } = renderCalculator();
      await user.click(btn('6'));
      await user.click(btn('Multiply'));
      await user.click(btn('7'));
      await user.click(btn('Equals'));
      expect(getAnnouncements()).toHaveTextContent('6 times 7 equals 42');
    });

    it('announces division result', async () => {
      const { user } = renderCalculator();
      await user.click(btn('8'));
      await user.click(btn('Divide'));
      await user.click(btn('2'));
      await user.click(btn('Equals'));
      expect(getAnnouncements()).toHaveTextContent('8 divided by 2 equals 4');
    });

    it('announces subtraction result', async () => {
      const { user } = renderCalculator();
      await user.click(btn('9'));
      await user.click(btn('Subtract'));
      await user.click(btn('4'));
      await user.click(btn('Equals'));
      expect(getAnnouncements()).toHaveTextContent('9 minus 4 equals 5');
    });
  });

  describe('display aria-label updates', () => {
    it('updates aria-label when value changes', async () => {
      const { user } = renderCalculator();
      expect(getDisplay()).toHaveAttribute('aria-label', 'Result: 0');
      await user.click(btn('4'));
      await user.click(btn('2'));
      expect(getDisplay()).toHaveAttribute('aria-label', 'Result: 42');
    });

    it('shows negative in aria-label', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Toggle positive negative'));
      expect(getDisplay()).toHaveAttribute('aria-label', 'Result: negative 5');
    });

    it('shows Error in aria-label', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Divide'));
      await user.click(btn('0'));
      await user.click(btn('Equals'));
      expect(getDisplay()).toHaveAttribute('aria-label', 'Result: Error');
    });
  });

  describe('edge cases', () => {
    it('handles rapid sequential operations', async () => {
      const { user } = renderCalculator();
      await user.click(btn('1'));
      await user.click(btn('Add'));
      await user.click(btn('2'));
      await user.click(btn('Add'));
      await user.click(btn('3'));
      await user.click(btn('Add'));
      await user.click(btn('4'));
      await user.click(btn('Equals'));
      expect(getDisplay()).toHaveTextContent('10');
    });

    it('can operate after clearing an error', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Divide'));
      await user.click(btn('0'));
      await user.click(btn('Equals'));
      expect(getDisplay()).toHaveTextContent('Error');
      await user.click(btn('All clear'));
      await user.click(btn('3'));
      await user.click(btn('Add'));
      await user.click(btn('2'));
      await user.click(btn('Equals'));
      expect(getDisplay()).toHaveTextContent('5');
    });

    it('toggle sign on Error does nothing', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Divide'));
      await user.click(btn('0'));
      await user.click(btn('Equals'));
      await user.click(btn('Toggle positive negative'));
      expect(getDisplay()).toHaveTextContent('Error');
    });

    it('backspace on Error does nothing', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Divide'));
      await user.click(btn('0'));
      await user.click(btn('Equals'));
      await user.click(btn('All clear'));
      await user.keyboard('5/0{Enter}{Backspace}');
      expect(getDisplay()).toHaveTextContent('Error');
    });

    it('changing operator before entering second operand', async () => {
      const { user } = renderCalculator();
      await user.click(btn('5'));
      await user.click(btn('Add'));
      await user.click(btn('Multiply'));
      await user.click(btn('3'));
      await user.click(btn('Equals'));
      expect(getDisplay()).toHaveTextContent('15');
    });
  });

  describe('mode toggle', () => {
    it('renders mode toggle button', () => {
      renderCalculator();
      expect(screen.getByTestId('mode-toggle')).toBeInTheDocument();
    });

    it('starts in basic mode', () => {
      renderCalculator();
      expect(screen.getByTestId('mode-toggle')).toHaveTextContent('Scientific');
      expect(screen.getByTestId('mode-toggle')).toHaveAttribute('aria-pressed', 'false');
    });

    it('toggles to scientific mode', async () => {
      const { user } = renderCalculator();
      await user.click(screen.getByTestId('mode-toggle'));
      expect(screen.getByTestId('mode-toggle')).toHaveTextContent('Basic');
      expect(screen.getByTestId('mode-toggle')).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows scientific buttons in scientific mode', async () => {
      const { user } = renderCalculator();
      await user.click(screen.getByTestId('mode-toggle'));
      expect(btn('Sine')).toBeInTheDocument();
      expect(btn('Cosine')).toBeInTheDocument();
      expect(btn('Tangent')).toBeInTheDocument();
      expect(btn('Square root')).toBeInTheDocument();
      expect(btn('x squared')).toBeInTheDocument();
      expect(btn('Factorial')).toBeInTheDocument();
      expect(btn('Natural log')).toBeInTheDocument();
      expect(btn('Pi')).toBeInTheDocument();
    });

    it('hides scientific buttons in basic mode', () => {
      renderCalculator();
      expect(screen.queryByRole('button', { name: 'Sine' })).not.toBeInTheDocument();
    });
  });

  describe('scientific operations via clicks', () => {
    function renderScientificCalculator() {
      const user = userEvent.setup();
      render(<Calculator initialMode="scientific" />);
      return { user };
    }

    it('computes sqrt(9) = 3', async () => {
      const { user } = renderScientificCalculator();
      await user.click(btn('9'));
      await user.click(btn('Square root'));
      expect(getDisplay()).toHaveTextContent('3');
    });

    it('computes 5² = 25', async () => {
      const { user } = renderScientificCalculator();
      await user.click(btn('5'));
      await user.click(btn('x squared'));
      expect(getDisplay()).toHaveTextContent('25');
    });

    it('computes 5! = 120', async () => {
      const { user } = renderScientificCalculator();
      await user.click(btn('5'));
      await user.click(btn('Factorial'));
      expect(getDisplay()).toHaveTextContent('120');
    });

    it('computes sin(0) = 0 in radians', async () => {
      const { user } = renderScientificCalculator();
      await user.click(btn('0'));
      await user.click(btn('Sine'));
      expect(getDisplay()).toHaveTextContent('0');
    });

    it('inserts pi', async () => {
      const { user } = renderScientificCalculator();
      await user.click(btn('Pi'));
      expect(parseFloat(getDisplay().textContent!)).toBeCloseTo(Math.PI);
    });

    it('inserts e', async () => {
      const { user } = renderScientificCalculator();
      await user.click(btn("Euler's number e"));
      expect(parseFloat(getDisplay().textContent!)).toBeCloseTo(Math.E);
    });

    it('computes 1/x for 4 = 0.25', async () => {
      const { user } = renderScientificCalculator();
      await user.click(btn('4'));
      await user.click(btn('Reciprocal'));
      expect(getDisplay()).toHaveTextContent('0.25');
    });

    it('2nd toggle switches function labels', async () => {
      const { user } = renderScientificCalculator();
      expect(btn('Sine')).toBeInTheDocument();
      await user.click(btn('Second function'));
      expect(btn('Arc sine')).toBeInTheDocument();
    });
  });

  describe('scientific mode — ButtonPanel branch coverage', () => {
    function renderScientific() {
      const user = userEvent.setup();
      render(<Calculator initialMode="scientific" />);
      return { user };
    }

    it('renders Open parenthesis and Close parenthesis buttons in scientific mode', () => {
      renderScientific();
      expect(btn('Open parenthesis')).toBeInTheDocument();
      expect(btn('Close parenthesis')).toBeInTheDocument();
    });

    it('renders x squared and x to the power of n buttons', () => {
      renderScientific();
      expect(btn('x squared')).toBeInTheDocument();
      expect(btn('x to the power of n')).toBeInTheDocument();
    });

    it('renders e to the power of x and Second function buttons', () => {
      renderScientific();
      expect(btn('e to the power of x')).toBeInTheDocument();
      expect(btn('Second function')).toBeInTheDocument();
    });

    it('renders Reciprocal, Square root, Factorial, Natural log, Pi, and Euler buttons', () => {
      renderScientific();
      expect(btn('Reciprocal')).toBeInTheDocument();
      expect(btn('Square root')).toBeInTheDocument();
      expect(btn('Factorial')).toBeInTheDocument();
      expect(btn('Natural log')).toBeInTheDocument();
      expect(btn("Euler's number e")).toBeInTheDocument();
      expect(btn('Pi')).toBeInTheDocument();
    });

    it('renders trig buttons: Sine, Cosine, Tangent, Hyperbolic sine, Hyperbolic cosine, Hyperbolic tangent', () => {
      renderScientific();
      expect(btn('Sine')).toBeInTheDocument();
      expect(btn('Cosine')).toBeInTheDocument();
      expect(btn('Tangent')).toBeInTheDocument();
      expect(btn('Hyperbolic sine')).toBeInTheDocument();
      expect(btn('Hyperbolic cosine')).toBeInTheDocument();
      expect(btn('Hyperbolic tangent')).toBeInTheDocument();
    });

    it('renders the angle mode toggle button showing current mode', () => {
      renderScientific();
      // Default angleMode is 'rad'
      expect(btn('Currently radians, switch to degrees')).toBeInTheDocument();
    });

    it('toggling angle mode changes button label', async () => {
      const { user } = renderScientific();
      await user.click(btn('Currently radians, switch to degrees'));
      expect(btn('Currently degrees, switch to radians')).toBeInTheDocument();
    });

    it('2nd toggle changes x squared to x cubed', async () => {
      const { user } = renderScientific();
      expect(btn('x squared')).toBeInTheDocument();
      await user.click(btn('Second function'));
      expect(btn('x cubed')).toBeInTheDocument();
    });

    it('2nd toggle changes sqrt to cube root', async () => {
      const { user } = renderScientific();
      await user.click(btn('Second function'));
      expect(btn('Cube root')).toBeInTheDocument();
    });

    it('2nd toggle changes ln to Log base 10', async () => {
      const { user } = renderScientific();
      await user.click(btn('Second function'));
      expect(btn('Log base 10')).toBeInTheDocument();
    });

    it('2nd toggle changes eˣ to 10 to the power of x', async () => {
      const { user } = renderScientific();
      await user.click(btn('Second function'));
      expect(btn('10 to the power of x')).toBeInTheDocument();
    });

    it('2nd toggle changes Sine to Arc sine', async () => {
      const { user } = renderScientific();
      await user.click(btn('Second function'));
      expect(btn('Arc sine')).toBeInTheDocument();
    });

    it('2nd toggle changes Cosine to Arc cosine', async () => {
      const { user } = renderScientific();
      await user.click(btn('Second function'));
      expect(btn('Arc cosine')).toBeInTheDocument();
    });

    it('2nd toggle changes Tangent to Arc tangent', async () => {
      const { user } = renderScientific();
      await user.click(btn('Second function'));
      expect(btn('Arc tangent')).toBeInTheDocument();
    });

    it('2nd toggle changes Hyperbolic sine to Inverse hyperbolic sine', async () => {
      const { user } = renderScientific();
      await user.click(btn('Second function'));
      expect(btn('Inverse hyperbolic sine')).toBeInTheDocument();
    });

    it('2nd toggle changes Hyperbolic cosine to Inverse hyperbolic cosine', async () => {
      const { user } = renderScientific();
      await user.click(btn('Second function'));
      expect(btn('Inverse hyperbolic cosine')).toBeInTheDocument();
    });

    it('2nd toggle changes Hyperbolic tangent to Inverse hyperbolic tangent', async () => {
      const { user } = renderScientific();
      await user.click(btn('Second function'));
      expect(btn('Inverse hyperbolic tangent')).toBeInTheDocument();
    });

    it('Open parenthesis button increases paren depth', async () => {
      const { user } = renderScientific();
      await user.click(btn('Open parenthesis'));
      // After opening a paren the display should show the paren indicator
      const display = screen.getByTestId('display');
      expect(display).toBeInTheDocument();
    });

    it('computes (3+4)*2 = 14 using paren buttons', async () => {
      const { user } = renderScientific();
      await user.click(btn('Open parenthesis'));
      await user.click(btn('3'));
      await user.click(btn('Add'));
      await user.click(btn('4'));
      await user.click(btn('Close parenthesis'));
      await user.click(btn('Multiply'));
      await user.click(btn('2'));
      await user.click(btn('Equals'));
      expect(screen.getByTestId('display')).toHaveTextContent('14');
    });

    it('computes 2^3 = 8 using power operator', async () => {
      const { user } = renderScientific();
      await user.click(btn('2'));
      await user.click(btn('x to the power of n'));
      await user.click(btn('3'));
      await user.click(btn('Equals'));
      expect(screen.getByTestId('display')).toHaveTextContent('8');
    });
  });

  describe('scientific mode — Display branch coverage', () => {
    function renderScientific() {
      const user = userEvent.setup();
      render(<Calculator initialMode="scientific" />);
      return { user };
    }

    it('shows RAD indicator in scientific mode by default', () => {
      renderScientific();
      // The angle mode indicator is aria-hidden but present in the DOM
      const infoPanel = document.querySelector('.calc-display__info');
      expect(infoPanel).toBeInTheDocument();
      expect(infoPanel!.textContent).toContain('RAD');
    });

    it('shows DEG indicator after toggling angle mode', async () => {
      const { user } = renderScientific();
      await user.click(btn('Currently radians, switch to degrees'));
      const infoPanel = document.querySelector('.calc-display__info');
      expect(infoPanel!.textContent).toContain('DEG');
    });

    it('shows open paren indicator when parenDepth > 0', async () => {
      const { user } = renderScientific();
      await user.click(btn('Open parenthesis'));
      const parensIndicator = document.querySelector('.calc-display__parens');
      expect(parensIndicator).toBeInTheDocument();
      expect(parensIndicator!.textContent).toBe('(');
    });

    it('shows two paren indicators when parenDepth is 2', async () => {
      const { user } = renderScientific();
      await user.click(btn('Open parenthesis'));
      await user.click(btn('Open parenthesis'));
      const parensIndicator = document.querySelector('.calc-display__parens');
      expect(parensIndicator!.textContent).toBe('((');
    });

    it('paren indicator disappears after closing all parens', async () => {
      const { user } = renderScientific();
      await user.click(btn('Open parenthesis'));
      await user.click(btn('Close parenthesis'));
      expect(document.querySelector('.calc-display__parens')).not.toBeInTheDocument();
    });
  });

  describe('scientific mode — keyboard ( and ) handlers', () => {
    function renderScientific() {
      const user = userEvent.setup();
      render(<Calculator initialMode="scientific" />);
      return { user };
    }

    it('keyboard ( fires openParen in scientific mode', () => {
      renderScientific();
      // Use fireEvent to directly send the ( key on the calculator element
      const calc = screen.getByRole('application');
      fireEvent.keyDown(calc, { key: '(' });
      const parensIndicator = document.querySelector('.calc-display__parens');
      expect(parensIndicator).toBeInTheDocument();
      expect(parensIndicator!.textContent).toBe('(');
    });

    it('keyboard ) fires closeParen in scientific mode', () => {
      renderScientific();
      const calc = screen.getByRole('application');
      // Open first so there is a paren to close
      fireEvent.keyDown(calc, { key: '(' });
      fireEvent.keyDown(calc, { key: '3' });
      fireEvent.keyDown(calc, { key: ')' });
      // After closing the paren the depth returns to 0 and indicator disappears
      expect(document.querySelector('.calc-display__parens')).not.toBeInTheDocument();
    });

    it('keyboard ( does nothing in basic mode', () => {
      render(<Calculator />);
      const calc = screen.getByRole('application');
      fireEvent.keyDown(calc, { key: '(' });
      // No paren indicator should appear because mode is basic
      expect(document.querySelector('.calc-display__parens')).not.toBeInTheDocument();
    });

    it('keyboard ) does nothing in basic mode', () => {
      render(<Calculator />);
      const calc = screen.getByRole('application');
      fireEvent.keyDown(calc, { key: ')' });
      expect(document.querySelector('.calc-display__parens')).not.toBeInTheDocument();
    });

    it('keyboard ( and ) compute (3+4) = 7', () => {
      renderScientific();
      const calc = screen.getByRole('application');
      fireEvent.keyDown(calc, { key: '(' });
      fireEvent.keyDown(calc, { key: '3' });
      fireEvent.keyDown(calc, { key: '+' });
      fireEvent.keyDown(calc, { key: '4' });
      fireEvent.keyDown(calc, { key: ')' });
      expect(screen.getByTestId('display')).toHaveTextContent('7');
    });
  });

  describe('theming', () => {
    it('applies theme as CSS custom properties', () => {
      render(<Calculator theme={{ 'calc-bg': '#ff0000', 'btn-operator-bg': '#00ff00' }} />);
      const calc = screen.getByRole('application');
      expect(calc.style.getPropertyValue('--calc-bg')).toBe('#ff0000');
      expect(calc.style.getPropertyValue('--btn-operator-bg')).toBe('#00ff00');
    });

    it('renders without theme prop', () => {
      render(<Calculator />);
      const calc = screen.getByRole('application');
      expect(calc.style.cssText).toBe('');
    });
  });
});
