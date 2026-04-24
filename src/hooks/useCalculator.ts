import { useCallback, useReducer } from 'react';

import { calculate, formatDisplay, operatorToWord } from '../utils/calculate';
import { evaluateScientificFunction, scientificFunctionToWord } from '../utils/scientificCalculate';

import type { CalculatorState, Operator, ScientificFunction } from '../types/calculator';

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

type ActionOf<T extends Action['type']> = Extract<Action, { type: T }>;
type Handler<T extends Action['type']> = (
  state: CalculatorState,
  action: ActionOf<T>,
) => CalculatorState;

const MAX_DIGITS = 12;

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

const handleInputDigit: Handler<'INPUT_DIGIT'> = (state, action) => {
  if (state.waitingForOperand) {
    return {
      ...state,
      displayValue: action.digit,
      waitingForOperand: false,
      announcement: action.digit,
    };
  }
  const newValue = state.displayValue === '0' ? action.digit : state.displayValue + action.digit;
  if (newValue.replace(/[^0-9]/g, '').length > MAX_DIGITS) return state;
  return { ...state, displayValue: newValue, announcement: action.digit };
};

const handleInputDecimal: Handler<'INPUT_DECIMAL'> = (state) => {
  if (state.waitingForOperand) {
    return { ...state, displayValue: '0.', waitingForOperand: false, announcement: 'point' };
  }
  if (state.displayValue.includes('.')) return state;
  return { ...state, displayValue: state.displayValue + '.', announcement: 'point' };
};

const handleInputOperator: Handler<'INPUT_OPERATOR'> = (state, action) => {
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
        display === 'Error' ? 'Error' : `${speakNumber(display)}, ${operatorToWord(op)}`,
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
};

const handleCalculate: Handler<'CALCULATE'> = (state) => {
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
    announcement: display === 'Error' ? 'Error, cannot divide by zero' : fullExpression,
  };
};

const handleClear: Handler<'CLEAR'> = (state) => ({
  ...initialState,
  angleMode: state.angleMode,
  announcement: 'All cleared, 0',
});

const handleToggleSign: Handler<'TOGGLE_SIGN'> = (state) => {
  if (state.displayValue === '0' || state.displayValue === 'Error') return state;
  const toggled = state.displayValue.startsWith('-')
    ? state.displayValue.slice(1)
    : '-' + state.displayValue;
  return { ...state, displayValue: toggled, announcement: speakNumber(toggled) };
};

const handlePercent: Handler<'PERCENT'> = (state) => {
  const current = parseFloat(state.displayValue);
  if (isNaN(current)) return state;
  const display = formatDisplay(current / 100);
  return {
    ...state,
    displayValue: display,
    waitingForOperand: true,
    announcement: speakNumber(display),
  };
};

const handleBackspace: Handler<'BACKSPACE'> = (state) => {
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
};

const handleApplyScientific: Handler<'APPLY_SCIENTIFIC_FUNCTION'> = (state, action) => {
  const value = parseFloat(state.displayValue);
  if (isNaN(value)) return state;
  const display = formatDisplay(evaluateScientificFunction(value, action.fn, state.angleMode));
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
};

const handleToggleAngleMode: Handler<'TOGGLE_ANGLE_MODE'> = (state) => {
  const newMode = state.angleMode === 'deg' ? 'rad' : 'deg';
  return {
    ...state,
    angleMode: newMode,
    announcement: newMode === 'deg' ? 'Switched to degrees' : 'Switched to radians',
  };
};

const handleInputConstant: Handler<'INPUT_CONSTANT'> = (state, action) => {
  const value = action.constant === 'pi' ? Math.PI : Math.E;
  const display = formatDisplay(value);
  const name = action.constant === 'pi' ? 'pi' : 'e';
  return {
    ...state,
    displayValue: display,
    waitingForOperand: true,
    announcement: `${name}, ${display}`,
  };
};

const handleOpenParen: Handler<'OPEN_PAREN'> = (state) => ({
  ...state,
  previousValue: null,
  operator: null,
  waitingForOperand: false,
  expression: '',
  parenDepth: state.parenDepth + 1,
  parenStack: [
    ...state.parenStack,
    {
      previousValue: state.previousValue,
      operator: state.operator,
      waitingForOperand: state.waitingForOperand,
      expression: state.expression,
    },
  ],
  announcement: 'open parenthesis',
});

const handleCloseParen: Handler<'CLOSE_PAREN'> = (state) => {
  if (state.parenDepth === 0) return state;
  let resultValue = parseFloat(state.displayValue);
  if (state.operator !== null && state.previousValue !== null) {
    resultValue = calculate(parseFloat(state.previousValue), resultValue, state.operator);
  }
  const display = formatDisplay(resultValue);
  const frame = state.parenStack[state.parenStack.length - 1];
  if (!frame) return state;
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
};

type HandlerMap = { [K in Action['type']]: Handler<K> };

const handlers: HandlerMap = {
  INPUT_DIGIT: handleInputDigit,
  INPUT_DECIMAL: handleInputDecimal,
  INPUT_OPERATOR: handleInputOperator,
  CALCULATE: handleCalculate,
  CLEAR: handleClear,
  TOGGLE_SIGN: handleToggleSign,
  PERCENT: handlePercent,
  BACKSPACE: handleBackspace,
  APPLY_SCIENTIFIC_FUNCTION: handleApplyScientific,
  TOGGLE_ANGLE_MODE: handleToggleAngleMode,
  INPUT_CONSTANT: handleInputConstant,
  OPEN_PAREN: handleOpenParen,
  CLOSE_PAREN: handleCloseParen,
};

function reducer(state: CalculatorState, action: Action): CalculatorState {
  const handler = handlers[action.type] as Handler<typeof action.type>;
  return handler(state, action);
}

function announcingReducer(state: CalculatorState, action: Action): CalculatorState {
  const next = reducer(state, action);
  if (next.announcement && next !== state) {
    return { ...next, announcementKey: state.announcementKey + 1 };
  }
  return next;
}

/**
 * Calculator state hook. Wraps a `useReducer` exposing the full calculator
 * state plus action dispatchers for every user-facing interaction (digits,
 * operators, scientific functions, parentheses, angle-mode toggle, etc.).
 * The returned object is a single immutable snapshot; consumers re-render
 * whenever any state field changes.
 */
export function useCalculator(): CalculatorState & {
  inputDigit: (digit: string) => void;
  inputDecimal: () => void;
  inputOperator: (operator: Operator) => void;
  performCalculation: () => void;
  clearAll: () => void;
  toggleSign: () => void;
  inputPercent: () => void;
  backspace: () => void;
  applyScientificFunction: (fn: ScientificFunction) => void;
  toggleAngleMode: () => void;
  inputConstant: (constant: 'pi' | 'e') => void;
  openParen: () => void;
  closeParen: () => void;
} {
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
