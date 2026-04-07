import { useCallback, useReducer } from 'react';
import type { Operator, CalculatorState, ScientificFunction } from '../types/calculator';
import { calculate, formatDisplay, operatorToWord } from '../utils/calculate';
import { evaluateScientificFunction, scientificFunctionToWord } from '../utils/scientificCalculate';

type Action =
  | { type: 'INPUT_DIGIT'; digit: string }
  | { type: 'INPUT_DECIMAL' }
  | { type: 'INPUT_OPERATOR'; operator: Operator }
  | { type: 'CALCULATE' }
  | { type: 'CLEAR' }
  | { type: 'TOGGLE_SIGN' }
  | { type: 'PERCENT' }
  | { type: 'BACKSPACE' }
  | { type: 'APPLY_SCIENTIFIC_FUNCTION'; fn: ScientificFunction }
  | { type: 'TOGGLE_ANGLE_MODE' }
  | { type: 'INPUT_CONSTANT'; constant: 'pi' | 'e' }
  | { type: 'OPEN_PAREN' }
  | { type: 'CLOSE_PAREN' };

const initialState: CalculatorState = {
  displayValue: '0',
  previousValue: null,
  operator: null,
  waitingForOperand: false,
  expression: '',
  announcement: '',
  announcementKey: 0,
  angleMode: 'rad',
  parenDepth: 0,
  parenStack: [],
};

function speakNumber(value: string): string {
  if (value === 'Error') return 'Error';
  const num = parseFloat(value);
  if (num < 0) return `negative ${Math.abs(num)}`;
  return value;
}

function reducer(state: CalculatorState, action: Action): CalculatorState {
  switch (action.type) {
    case 'INPUT_DIGIT': {
      if (state.waitingForOperand) {
        return {
          ...state,
          displayValue: action.digit,
          waitingForOperand: false,
          announcement: action.digit,
        };
      }
      const newValue =
        state.displayValue === '0' ? action.digit : state.displayValue + action.digit;
      if (newValue.replace(/[^0-9]/g, '').length > 12) return state;
      return {
        ...state,
        displayValue: newValue,
        announcement: action.digit,
      };
    }

    case 'INPUT_DECIMAL': {
      if (state.waitingForOperand) {
        return {
          ...state,
          displayValue: '0.',
          waitingForOperand: false,
          announcement: 'point',
        };
      }
      if (state.displayValue.includes('.')) return state;
      return {
        ...state,
        displayValue: state.displayValue + '.',
        announcement: 'point',
      };
    }

    case 'INPUT_OPERATOR': {
      const currentValue = parseFloat(state.displayValue);
      const op = action.operator;

      if (state.operator && !state.waitingForOperand && state.previousValue !== null) {
        const prev = parseFloat(state.previousValue);
        const result = calculate(prev, currentValue, state.operator);
        const display = formatDisplay(result);
        return {
          ...state,
          displayValue: display,
          previousValue: display === 'Error' ? null : display,
          operator: display === 'Error' ? null : op,
          waitingForOperand: true,
          expression: display === 'Error' ? '' : `${display} ${operatorToWord(op)}`,
          announcement:
            display === 'Error'
              ? 'Error'
              : `${speakNumber(display)}, ${operatorToWord(op)}`,
        };
      }

      return {
        ...state,
        previousValue: String(currentValue),
        operator: op,
        waitingForOperand: true,
        expression: `${speakNumber(state.displayValue)} ${operatorToWord(op)}`,
        announcement: operatorToWord(op),
      };
    }

    case 'CALCULATE': {
      if (state.operator === null || state.previousValue === null) return state;

      const prev = parseFloat(state.previousValue);
      const current = parseFloat(state.displayValue);
      const result = calculate(prev, current, state.operator);
      const display = formatDisplay(result);

      const fullExpression = `${speakNumber(state.previousValue)} ${operatorToWord(state.operator)} ${speakNumber(state.displayValue)} equals ${speakNumber(display)}`;

      return {
        ...state,
        displayValue: display,
        previousValue: null,
        operator: null,
        waitingForOperand: true,
        expression: '',
        announcement:
          display === 'Error'
            ? 'Error, cannot divide by zero'
            : fullExpression,
      };
    }

    case 'CLEAR': {
      return {
        ...initialState,
        angleMode: state.angleMode,
        announcement: 'All cleared, 0',
      };
    }

    case 'TOGGLE_SIGN': {
      if (state.displayValue === '0' || state.displayValue === 'Error') return state;
      const toggled = state.displayValue.startsWith('-')
        ? state.displayValue.slice(1)
        : '-' + state.displayValue;
      return {
        ...state,
        displayValue: toggled,
        announcement: speakNumber(toggled),
      };
    }

    case 'PERCENT': {
      const current = parseFloat(state.displayValue);
      if (isNaN(current)) return state;
      const result = current / 100;
      const display = formatDisplay(result);
      return {
        ...state,
        displayValue: display,
        waitingForOperand: true,
        announcement: `${speakNumber(display)}`,
      };
    }

    case 'BACKSPACE': {
      if (state.waitingForOperand || state.displayValue === 'Error') return state;
      const newValue =
        state.displayValue.length === 1 ||
        (state.displayValue.length === 2 && state.displayValue.startsWith('-'))
          ? '0'
          : state.displayValue.slice(0, -1);
      return {
        ...state,
        displayValue: newValue,
        announcement: newValue === '0' ? '0' : `deleted, ${speakNumber(newValue)}`,
      };
    }

    case 'APPLY_SCIENTIFIC_FUNCTION': {
      const value = parseFloat(state.displayValue);
      if (isNaN(value)) return state;
      const result = evaluateScientificFunction(value, action.fn, state.angleMode);
      const display = formatDisplay(result);
      const word = scientificFunctionToWord(action.fn);
      return {
        ...state,
        displayValue: display,
        waitingForOperand: true,
        announcement:
          display === 'Error'
            ? `Error, ${word} ${speakNumber(state.displayValue)}`
            : `${word} ${speakNumber(state.displayValue)} equals ${speakNumber(display)}`,
      };
    }

    case 'TOGGLE_ANGLE_MODE': {
      const newMode = state.angleMode === 'deg' ? 'rad' : 'deg';
      return {
        ...state,
        angleMode: newMode,
        announcement: newMode === 'deg' ? 'Switched to degrees' : 'Switched to radians',
      };
    }

    case 'INPUT_CONSTANT': {
      const value = action.constant === 'pi' ? Math.PI : Math.E;
      const display = formatDisplay(value);
      const name = action.constant === 'pi' ? 'pi' : 'e';
      return {
        ...state,
        displayValue: display,
        waitingForOperand: true,
        announcement: `${name}, ${display}`,
      };
    }

    case 'OPEN_PAREN': {
      const frame = {
        previousValue: state.previousValue,
        operator: state.operator,
        waitingForOperand: state.waitingForOperand,
        expression: state.expression,
      };
      return {
        ...state,
        previousValue: null,
        operator: null,
        waitingForOperand: false,
        expression: '',
        parenDepth: state.parenDepth + 1,
        parenStack: [...state.parenStack, frame],
        announcement: 'open parenthesis',
      };
    }

    case 'CLOSE_PAREN': {
      if (state.parenDepth === 0) return state;

      // First evaluate any pending operation inside the parens
      let resultValue = parseFloat(state.displayValue);
      if (state.operator !== null && state.previousValue !== null) {
        resultValue = calculate(
          parseFloat(state.previousValue),
          resultValue,
          state.operator,
        );
      }
      const display = formatDisplay(resultValue);

      const frame = state.parenStack[state.parenStack.length - 1];
      return {
        ...state,
        displayValue: display,
        previousValue: frame.previousValue,
        operator: frame.operator,
        waitingForOperand: true,
        expression: frame.expression,
        parenDepth: state.parenDepth - 1,
        parenStack: state.parenStack.slice(0, -1),
        announcement: `close parenthesis, ${speakNumber(display)}`,
      };
    }

    default:
      return state;
  }
}

function announcingReducer(state: CalculatorState, action: Action): CalculatorState {
  const next = reducer(state, action);
  if (next.announcement && next !== state) {
    return { ...next, announcementKey: state.announcementKey + 1 };
  }
  return next;
}

export function useCalculator() {
  const [state, dispatch] = useReducer(announcingReducer, initialState);

  const inputDigit = useCallback((digit: string) => {
    dispatch({ type: 'INPUT_DIGIT', digit });
  }, []);

  const inputDecimal = useCallback(() => {
    dispatch({ type: 'INPUT_DECIMAL' });
  }, []);

  const inputOperator = useCallback((operator: Operator) => {
    dispatch({ type: 'INPUT_OPERATOR', operator });
  }, []);

  const performCalculation = useCallback(() => {
    dispatch({ type: 'CALCULATE' });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const toggleSign = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIGN' });
  }, []);

  const inputPercent = useCallback(() => {
    dispatch({ type: 'PERCENT' });
  }, []);

  const backspace = useCallback(() => {
    dispatch({ type: 'BACKSPACE' });
  }, []);

  const applyScientificFunction = useCallback((fn: ScientificFunction) => {
    dispatch({ type: 'APPLY_SCIENTIFIC_FUNCTION', fn });
  }, []);

  const toggleAngleMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_ANGLE_MODE' });
  }, []);

  const inputConstant = useCallback((constant: 'pi' | 'e') => {
    dispatch({ type: 'INPUT_CONSTANT', constant });
  }, []);

  const openParen = useCallback(() => {
    dispatch({ type: 'OPEN_PAREN' });
  }, []);

  const closeParen = useCallback(() => {
    dispatch({ type: 'CLOSE_PAREN' });
  }, []);

  return {
    ...state,
    inputDigit,
    inputDecimal,
    inputOperator,
    performCalculation,
    clearAll,
    toggleSign,
    inputPercent,
    backspace,
    applyScientificFunction,
    toggleAngleMode,
    inputConstant,
    openParen,
    closeParen,
  };
}
