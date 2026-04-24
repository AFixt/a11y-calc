import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useCalculator } from '../hooks/useCalculator';

describe('useCalculator hook', () => {
  it('starts with display value 0', () => {
    const { result } = renderHook(() => useCalculator());
    expect(result.current.displayValue).toBe('0');
  });

  it('starts with no operator', () => {
    const { result } = renderHook(() => useCalculator());
    expect(result.current.operator).toBeNull();
  });

  it('starts with empty expression', () => {
    const { result } = renderHook(() => useCalculator());
    expect(result.current.expression).toBe('');
  });

  describe('inputDigit', () => {
    it('replaces initial 0', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      expect(result.current.displayValue).toBe('5');
    });

    it('appends digits', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('1'));
      act(() => result.current.inputDigit('2'));
      act(() => result.current.inputDigit('3'));
      expect(result.current.displayValue).toBe('123');
    });

    it('sets announcement to the digit', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('7'));
      expect(result.current.announcement).toBe('7');
    });

    it('starts new number after operator', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.inputOperator('+'));
      act(() => result.current.inputDigit('3'));
      expect(result.current.displayValue).toBe('3');
    });

    it('limits digit count to 12', () => {
      const { result } = renderHook(() => useCalculator());
      for (let i = 0; i < 15; i++) {
        act(() => result.current.inputDigit('1'));
      }
      expect(result.current.displayValue).toBe('111111111111');
      expect(result.current.displayValue.length).toBe(12);
    });
  });

  describe('inputDecimal', () => {
    it('adds decimal to display', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('3'));
      act(() => result.current.inputDecimal());
      expect(result.current.displayValue).toBe('3.');
    });

    it('prevents double decimal', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('3'));
      act(() => result.current.inputDecimal());
      act(() => result.current.inputDecimal());
      expect(result.current.displayValue).toBe('3.');
    });

    it('starts with 0. after operator', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.inputOperator('+'));
      act(() => result.current.inputDecimal());
      expect(result.current.displayValue).toBe('0.');
    });

    it('announces "point"', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDecimal());
      expect(result.current.announcement).toBe('point');
    });
  });

  describe('inputOperator', () => {
    it('stores the operator', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.inputOperator('+'));
      expect(result.current.operator).toBe('+');
    });

    it('sets waitingForOperand', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.inputOperator('+'));
      expect(result.current.waitingForOperand).toBe(true);
    });

    it('chains operations', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.inputOperator('+'));
      act(() => result.current.inputDigit('3'));
      act(() => result.current.inputOperator('-'));
      expect(result.current.displayValue).toBe('8');
      expect(result.current.operator).toBe('-');
    });

    it('announces the operator word', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.inputOperator('+'));
      expect(result.current.announcement).toBe('plus');
    });

    it('sets expression', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.inputOperator('+'));
      expect(result.current.expression).toBe('5 plus');
    });
  });

  describe('performCalculation', () => {
    it('computes the result', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('6'));
      act(() => result.current.inputOperator('*'));
      act(() => result.current.inputDigit('7'));
      act(() => result.current.performCalculation());
      expect(result.current.displayValue).toBe('42');
    });

    it('clears operator after calculation', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('6'));
      act(() => result.current.inputOperator('*'));
      act(() => result.current.inputDigit('7'));
      act(() => result.current.performCalculation());
      expect(result.current.operator).toBeNull();
    });

    it('does nothing without operator', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.performCalculation());
      expect(result.current.displayValue).toBe('5');
    });

    it('announces full equation', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.inputOperator('+'));
      act(() => result.current.inputDigit('3'));
      act(() => result.current.performCalculation());
      expect(result.current.announcement).toBe('5 plus 3 equals 8');
    });

    it('announces error for division by zero', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.inputOperator('/'));
      act(() => result.current.inputDigit('0'));
      act(() => result.current.performCalculation());
      expect(result.current.announcement).toBe('Error, cannot divide by zero');
    });

    it('clears expression after calculation', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.inputOperator('+'));
      act(() => result.current.inputDigit('3'));
      act(() => result.current.performCalculation());
      expect(result.current.expression).toBe('');
    });
  });

  describe('clearAll', () => {
    it('resets display to 0', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.clearAll());
      expect(result.current.displayValue).toBe('0');
    });

    it('clears operator', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.inputOperator('+'));
      act(() => result.current.clearAll());
      expect(result.current.operator).toBeNull();
    });

    it('announces "All cleared, 0"', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.clearAll());
      expect(result.current.announcement).toBe('All cleared, 0');
    });
  });

  describe('toggleSign', () => {
    it('negates positive number', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.toggleSign());
      expect(result.current.displayValue).toBe('-5');
    });

    it('makes negative positive', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.toggleSign());
      act(() => result.current.toggleSign());
      expect(result.current.displayValue).toBe('5');
    });

    it('does nothing on zero', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.toggleSign());
      expect(result.current.displayValue).toBe('0');
    });

    it('announces the toggled value', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.toggleSign());
      expect(result.current.announcement).toBe('negative 5');
    });
  });

  describe('inputPercent', () => {
    it('divides by 100', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.inputDigit('0'));
      act(() => result.current.inputPercent());
      expect(result.current.displayValue).toBe('0.5');
    });

    it('sets waitingForOperand after percent', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.inputPercent());
      expect(result.current.waitingForOperand).toBe(true);
    });
  });

  describe('backspace', () => {
    it('removes last digit', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('1'));
      act(() => result.current.inputDigit('2'));
      act(() => result.current.inputDigit('3'));
      act(() => result.current.backspace());
      expect(result.current.displayValue).toBe('12');
    });

    it('returns to 0 on single digit', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.backspace());
      expect(result.current.displayValue).toBe('0');
    });

    it('returns to 0 on negative single digit', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.toggleSign());
      act(() => result.current.backspace());
      expect(result.current.displayValue).toBe('0');
    });

    it('does nothing when waiting for operand', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.inputOperator('+'));
      act(() => result.current.backspace());
      expect(result.current.displayValue).toBe('5');
    });

    it('does nothing on Error', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.inputOperator('/'));
      act(() => result.current.inputDigit('0'));
      act(() => result.current.performCalculation());
      act(() => result.current.backspace());
      expect(result.current.displayValue).toBe('Error');
    });
  });

  describe('applyScientificFunction', () => {
    it('applies sin', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('0'));
      act(() => result.current.applyScientificFunction('sin'));
      expect(result.current.displayValue).toBe('0');
    });

    it('applies sqrt', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('9'));
      act(() => result.current.applyScientificFunction('sqrt'));
      expect(result.current.displayValue).toBe('3');
    });

    it('applies square', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.applyScientificFunction('square'));
      expect(result.current.displayValue).toBe('25');
    });

    it('applies factorial', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.applyScientificFunction('factorial'));
      expect(result.current.displayValue).toBe('120');
    });

    it('sets waitingForOperand after applying', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('4'));
      act(() => result.current.applyScientificFunction('sqrt'));
      expect(result.current.waitingForOperand).toBe(true);
    });

    it('announces the function application', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('9'));
      act(() => result.current.applyScientificFunction('sqrt'));
      expect(result.current.announcement).toContain('square root of');
      expect(result.current.announcement).toContain('equals 3');
    });

    it('handles Error results', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.toggleSign());
      act(() => result.current.applyScientificFunction('sqrt'));
      expect(result.current.displayValue).toBe('Error');
    });
  });

  describe('toggleAngleMode', () => {
    it('starts in radians', () => {
      const { result } = renderHook(() => useCalculator());
      expect(result.current.angleMode).toBe('rad');
    });

    it('toggles to degrees', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.toggleAngleMode());
      expect(result.current.angleMode).toBe('deg');
    });

    it('toggles back to radians', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.toggleAngleMode());
      act(() => result.current.toggleAngleMode());
      expect(result.current.angleMode).toBe('rad');
    });

    it('announces the mode switch', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.toggleAngleMode());
      expect(result.current.announcement).toBe('Switched to degrees');
    });

    it('preserves angle mode after clear', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.toggleAngleMode());
      act(() => result.current.clearAll());
      expect(result.current.angleMode).toBe('deg');
    });
  });

  describe('inputConstant', () => {
    it('inputs pi', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputConstant('pi'));
      expect(parseFloat(result.current.displayValue)).toBeCloseTo(Math.PI);
    });

    it('inputs e', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputConstant('e'));
      expect(parseFloat(result.current.displayValue)).toBeCloseTo(Math.E);
    });

    it('announces pi', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputConstant('pi'));
      expect(result.current.announcement).toContain('pi');
    });

    it('sets waitingForOperand', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputConstant('pi'));
      expect(result.current.waitingForOperand).toBe(true);
    });
  });

  describe('parentheses', () => {
    it('openParen increases parenDepth', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.openParen());
      expect(result.current.parenDepth).toBe(1);
    });

    it('closeParen when no open parens does nothing', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.closeParen());
      expect(result.current.parenDepth).toBe(0);
    });

    it('evaluates expression inside parentheses', () => {
      const { result } = renderHook(() => useCalculator());
      // Calculate (3 + 4) * 2
      act(() => result.current.openParen());
      act(() => result.current.inputDigit('3'));
      act(() => result.current.inputOperator('+'));
      act(() => result.current.inputDigit('4'));
      act(() => result.current.closeParen());
      expect(result.current.displayValue).toBe('7');
      act(() => result.current.inputOperator('*'));
      act(() => result.current.inputDigit('2'));
      act(() => result.current.performCalculation());
      expect(result.current.displayValue).toBe('14');
    });

    it('handles nested parentheses', () => {
      const { result } = renderHook(() => useCalculator());
      // Calculate ((2 + 3)) = 5
      act(() => result.current.openParen());
      act(() => result.current.openParen());
      expect(result.current.parenDepth).toBe(2);
      act(() => result.current.inputDigit('2'));
      act(() => result.current.inputOperator('+'));
      act(() => result.current.inputDigit('3'));
      act(() => result.current.closeParen());
      expect(result.current.parenDepth).toBe(1);
      expect(result.current.displayValue).toBe('5');
      act(() => result.current.closeParen());
      expect(result.current.parenDepth).toBe(0);
    });

    it('announces open and close paren', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.openParen());
      expect(result.current.announcement).toBe('open parenthesis');
      act(() => result.current.inputDigit('5'));
      act(() => result.current.closeParen());
      expect(result.current.announcement).toContain('close parenthesis');
    });
  });

  describe('power operator (^)', () => {
    it('computes 2^3 = 8', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('2'));
      act(() => result.current.inputOperator('^'));
      act(() => result.current.inputDigit('3'));
      act(() => result.current.performCalculation());
      expect(result.current.displayValue).toBe('8');
    });

    it('computes 5^0 = 1', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('5'));
      act(() => result.current.inputOperator('^'));
      act(() => result.current.inputDigit('0'));
      act(() => result.current.performCalculation());
      expect(result.current.displayValue).toBe('1');
    });

    it('announces correctly', () => {
      const { result } = renderHook(() => useCalculator());
      act(() => result.current.inputDigit('2'));
      act(() => result.current.inputOperator('^'));
      expect(result.current.announcement).toBe('to the power of');
    });
  });
});
