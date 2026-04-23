import { describe, expect, it } from 'vitest';
import { evaluateScientificFunction, scientificFunctionToWord } from '../utils/scientificCalculate';

describe('evaluateScientificFunction', () => {
  describe('trigonometric functions (radians)', () => {
    it('sin(0) = 0', () => {
      expect(evaluateScientificFunction(0, 'sin', 'rad')).toBeCloseTo(0);
    });

    it('sin(π/2) = 1', () => {
      expect(evaluateScientificFunction(Math.PI / 2, 'sin', 'rad')).toBeCloseTo(1);
    });

    it('sin(π) ≈ 0', () => {
      expect(evaluateScientificFunction(Math.PI, 'sin', 'rad')).toBeCloseTo(0);
    });

    it('cos(0) = 1', () => {
      expect(evaluateScientificFunction(0, 'cos', 'rad')).toBeCloseTo(1);
    });

    it('cos(π) = -1', () => {
      expect(evaluateScientificFunction(Math.PI, 'cos', 'rad')).toBeCloseTo(-1);
    });

    it('cos(π/2) ≈ 0', () => {
      expect(evaluateScientificFunction(Math.PI / 2, 'cos', 'rad')).toBeCloseTo(0);
    });

    it('tan(0) = 0', () => {
      expect(evaluateScientificFunction(0, 'tan', 'rad')).toBeCloseTo(0);
    });

    it('tan(π/4) = 1', () => {
      expect(evaluateScientificFunction(Math.PI / 4, 'tan', 'rad')).toBeCloseTo(1);
    });
  });

  describe('trigonometric functions (degrees)', () => {
    it('sin(0°) = 0', () => {
      expect(evaluateScientificFunction(0, 'sin', 'deg')).toBeCloseTo(0);
    });

    it('sin(90°) = 1', () => {
      expect(evaluateScientificFunction(90, 'sin', 'deg')).toBeCloseTo(1);
    });

    it('sin(30°) = 0.5', () => {
      expect(evaluateScientificFunction(30, 'sin', 'deg')).toBeCloseTo(0.5);
    });

    it('sin(180°) ≈ 0', () => {
      expect(evaluateScientificFunction(180, 'sin', 'deg')).toBeCloseTo(0);
    });

    it('cos(0°) = 1', () => {
      expect(evaluateScientificFunction(0, 'cos', 'deg')).toBeCloseTo(1);
    });

    it('cos(60°) = 0.5', () => {
      expect(evaluateScientificFunction(60, 'cos', 'deg')).toBeCloseTo(0.5);
    });

    it('cos(90°) ≈ 0', () => {
      expect(evaluateScientificFunction(90, 'cos', 'deg')).toBeCloseTo(0);
    });

    it('cos(180°) = -1', () => {
      expect(evaluateScientificFunction(180, 'cos', 'deg')).toBeCloseTo(-1);
    });

    it('tan(45°) = 1', () => {
      expect(evaluateScientificFunction(45, 'tan', 'deg')).toBeCloseTo(1);
    });

    it('tan(0°) = 0', () => {
      expect(evaluateScientificFunction(0, 'tan', 'deg')).toBeCloseTo(0);
    });
  });

  describe('inverse trigonometric functions (radians)', () => {
    it('asin(0) = 0', () => {
      expect(evaluateScientificFunction(0, 'asin', 'rad')).toBeCloseTo(0);
    });

    it('asin(1) = π/2', () => {
      expect(evaluateScientificFunction(1, 'asin', 'rad')).toBeCloseTo(Math.PI / 2);
    });

    it('asin(0.5) = π/6', () => {
      expect(evaluateScientificFunction(0.5, 'asin', 'rad')).toBeCloseTo(Math.PI / 6);
    });

    it('acos(1) = 0', () => {
      expect(evaluateScientificFunction(1, 'acos', 'rad')).toBeCloseTo(0);
    });

    it('acos(0) = π/2', () => {
      expect(evaluateScientificFunction(0, 'acos', 'rad')).toBeCloseTo(Math.PI / 2);
    });

    it('atan(0) = 0', () => {
      expect(evaluateScientificFunction(0, 'atan', 'rad')).toBeCloseTo(0);
    });

    it('atan(1) = π/4', () => {
      expect(evaluateScientificFunction(1, 'atan', 'rad')).toBeCloseTo(Math.PI / 4);
    });

    it('asin(2) returns NaN (out of domain)', () => {
      expect(evaluateScientificFunction(2, 'asin', 'rad')).toBeNaN();
    });

    it('acos(2) returns NaN (out of domain)', () => {
      expect(evaluateScientificFunction(2, 'acos', 'rad')).toBeNaN();
    });
  });

  describe('inverse trigonometric functions (degrees)', () => {
    it('asin(1) = 90°', () => {
      expect(evaluateScientificFunction(1, 'asin', 'deg')).toBeCloseTo(90);
    });

    it('asin(0.5) = 30°', () => {
      expect(evaluateScientificFunction(0.5, 'asin', 'deg')).toBeCloseTo(30);
    });

    it('acos(0.5) = 60°', () => {
      expect(evaluateScientificFunction(0.5, 'acos', 'deg')).toBeCloseTo(60);
    });

    it('atan(1) = 45°', () => {
      expect(evaluateScientificFunction(1, 'atan', 'deg')).toBeCloseTo(45);
    });
  });

  describe('hyperbolic functions', () => {
    it('sinh(0) = 0', () => {
      expect(evaluateScientificFunction(0, 'sinh', 'rad')).toBeCloseTo(0);
    });

    it('sinh(1) ≈ 1.1752', () => {
      expect(evaluateScientificFunction(1, 'sinh', 'rad')).toBeCloseTo(1.1752, 3);
    });

    it('cosh(0) = 1', () => {
      expect(evaluateScientificFunction(0, 'cosh', 'rad')).toBeCloseTo(1);
    });

    it('cosh(1) ≈ 1.5431', () => {
      expect(evaluateScientificFunction(1, 'cosh', 'rad')).toBeCloseTo(1.5431, 3);
    });

    it('tanh(0) = 0', () => {
      expect(evaluateScientificFunction(0, 'tanh', 'rad')).toBeCloseTo(0);
    });

    it('tanh(1) ≈ 0.7616', () => {
      expect(evaluateScientificFunction(1, 'tanh', 'rad')).toBeCloseTo(0.7616, 3);
    });
  });

  describe('inverse hyperbolic functions', () => {
    it('asinh(0) = 0', () => {
      expect(evaluateScientificFunction(0, 'asinh', 'rad')).toBeCloseTo(0);
    });

    it('asinh(1) ≈ 0.8814', () => {
      expect(evaluateScientificFunction(1, 'asinh', 'rad')).toBeCloseTo(0.8814, 3);
    });

    it('acosh(1) = 0', () => {
      expect(evaluateScientificFunction(1, 'acosh', 'rad')).toBeCloseTo(0);
    });

    it('acosh(2) ≈ 1.3170', () => {
      expect(evaluateScientificFunction(2, 'acosh', 'rad')).toBeCloseTo(1.317, 3);
    });

    it('acosh(0.5) returns NaN (domain error)', () => {
      expect(evaluateScientificFunction(0.5, 'acosh', 'rad')).toBeNaN();
    });

    it('atanh(0) = 0', () => {
      expect(evaluateScientificFunction(0, 'atanh', 'rad')).toBeCloseTo(0);
    });

    it('atanh(0.5) ≈ 0.5493', () => {
      expect(evaluateScientificFunction(0.5, 'atanh', 'rad')).toBeCloseTo(0.5493, 3);
    });

    it('atanh(1) returns Infinity', () => {
      expect(evaluateScientificFunction(1, 'atanh', 'rad')).toBe(Infinity);
    });
  });

  describe('logarithmic functions', () => {
    it('ln(1) = 0', () => {
      expect(evaluateScientificFunction(1, 'ln', 'rad')).toBeCloseTo(0);
    });

    it('ln(e) = 1', () => {
      expect(evaluateScientificFunction(Math.E, 'ln', 'rad')).toBeCloseTo(1);
    });

    it('ln(e²) = 2', () => {
      expect(evaluateScientificFunction(Math.E ** 2, 'ln', 'rad')).toBeCloseTo(2);
    });

    it('ln(0) = -Infinity', () => {
      expect(evaluateScientificFunction(0, 'ln', 'rad')).toBe(-Infinity);
    });

    it('ln(-1) returns NaN', () => {
      expect(evaluateScientificFunction(-1, 'ln', 'rad')).toBeNaN();
    });

    it('log10(1) = 0', () => {
      expect(evaluateScientificFunction(1, 'log10', 'rad')).toBeCloseTo(0);
    });

    it('log10(10) = 1', () => {
      expect(evaluateScientificFunction(10, 'log10', 'rad')).toBeCloseTo(1);
    });

    it('log10(100) = 2', () => {
      expect(evaluateScientificFunction(100, 'log10', 'rad')).toBeCloseTo(2);
    });

    it('log10(1000) = 3', () => {
      expect(evaluateScientificFunction(1000, 'log10', 'rad')).toBeCloseTo(3);
    });

    it('log10(0) = -Infinity', () => {
      expect(evaluateScientificFunction(0, 'log10', 'rad')).toBe(-Infinity);
    });
  });

  describe('power functions', () => {
    it('square(3) = 9', () => {
      expect(evaluateScientificFunction(3, 'square', 'rad')).toBe(9);
    });

    it('square(0) = 0', () => {
      expect(evaluateScientificFunction(0, 'square', 'rad')).toBe(0);
    });

    it('square(-4) = 16', () => {
      expect(evaluateScientificFunction(-4, 'square', 'rad')).toBe(16);
    });

    it('cube(2) = 8', () => {
      expect(evaluateScientificFunction(2, 'cube', 'rad')).toBe(8);
    });

    it('cube(-3) = -27', () => {
      expect(evaluateScientificFunction(-3, 'cube', 'rad')).toBe(-27);
    });

    it('cube(0) = 0', () => {
      expect(evaluateScientificFunction(0, 'cube', 'rad')).toBe(0);
    });
  });

  describe('exponential functions', () => {
    it('exp(0) = 1', () => {
      expect(evaluateScientificFunction(0, 'exp', 'rad')).toBeCloseTo(1);
    });

    it('exp(1) = e', () => {
      expect(evaluateScientificFunction(1, 'exp', 'rad')).toBeCloseTo(Math.E);
    });

    it('exp(2) = e²', () => {
      expect(evaluateScientificFunction(2, 'exp', 'rad')).toBeCloseTo(Math.E ** 2);
    });

    it('tenPow(0) = 1', () => {
      expect(evaluateScientificFunction(0, 'tenPow', 'rad')).toBe(1);
    });

    it('tenPow(1) = 10', () => {
      expect(evaluateScientificFunction(1, 'tenPow', 'rad')).toBe(10);
    });

    it('tenPow(3) = 1000', () => {
      expect(evaluateScientificFunction(3, 'tenPow', 'rad')).toBe(1000);
    });

    it('tenPow(-1) = 0.1', () => {
      expect(evaluateScientificFunction(-1, 'tenPow', 'rad')).toBeCloseTo(0.1);
    });
  });

  describe('reciprocal', () => {
    it('reciprocal(2) = 0.5', () => {
      expect(evaluateScientificFunction(2, 'reciprocal', 'rad')).toBeCloseTo(0.5);
    });

    it('reciprocal(4) = 0.25', () => {
      expect(evaluateScientificFunction(4, 'reciprocal', 'rad')).toBeCloseTo(0.25);
    });

    it('reciprocal(-2) = -0.5', () => {
      expect(evaluateScientificFunction(-2, 'reciprocal', 'rad')).toBeCloseTo(-0.5);
    });

    it('reciprocal(0) = Infinity', () => {
      expect(evaluateScientificFunction(0, 'reciprocal', 'rad')).toBe(Infinity);
    });

    it('reciprocal(0.1) = 10', () => {
      expect(evaluateScientificFunction(0.1, 'reciprocal', 'rad')).toBeCloseTo(10);
    });
  });

  describe('root functions', () => {
    it('sqrt(4) = 2', () => {
      expect(evaluateScientificFunction(4, 'sqrt', 'rad')).toBeCloseTo(2);
    });

    it('sqrt(9) = 3', () => {
      expect(evaluateScientificFunction(9, 'sqrt', 'rad')).toBeCloseTo(3);
    });

    it('sqrt(2) ≈ 1.4142', () => {
      expect(evaluateScientificFunction(2, 'sqrt', 'rad')).toBeCloseTo(1.4142, 3);
    });

    it('sqrt(0) = 0', () => {
      expect(evaluateScientificFunction(0, 'sqrt', 'rad')).toBeCloseTo(0);
    });

    it('sqrt(-1) returns NaN', () => {
      expect(evaluateScientificFunction(-1, 'sqrt', 'rad')).toBeNaN();
    });

    it('cbrt(8) = 2', () => {
      expect(evaluateScientificFunction(8, 'cbrt', 'rad')).toBeCloseTo(2);
    });

    it('cbrt(27) = 3', () => {
      expect(evaluateScientificFunction(27, 'cbrt', 'rad')).toBeCloseTo(3);
    });

    it('cbrt(-8) = -2', () => {
      expect(evaluateScientificFunction(-8, 'cbrt', 'rad')).toBeCloseTo(-2);
    });

    it('cbrt(0) = 0', () => {
      expect(evaluateScientificFunction(0, 'cbrt', 'rad')).toBeCloseTo(0);
    });
  });

  describe('factorial', () => {
    it('0! = 1', () => {
      expect(evaluateScientificFunction(0, 'factorial', 'rad')).toBe(1);
    });

    it('1! = 1', () => {
      expect(evaluateScientificFunction(1, 'factorial', 'rad')).toBe(1);
    });

    it('5! = 120', () => {
      expect(evaluateScientificFunction(5, 'factorial', 'rad')).toBe(120);
    });

    it('10! = 3628800', () => {
      expect(evaluateScientificFunction(10, 'factorial', 'rad')).toBe(3628800);
    });

    it('20! = 2432902008176640000', () => {
      expect(evaluateScientificFunction(20, 'factorial', 'rad')).toBe(2432902008176640000);
    });

    it('negative factorial returns NaN', () => {
      expect(evaluateScientificFunction(-5, 'factorial', 'rad')).toBeNaN();
    });

    it('non-integer factorial returns NaN', () => {
      expect(evaluateScientificFunction(3.5, 'factorial', 'rad')).toBeNaN();
    });

    it('170! is finite', () => {
      expect(evaluateScientificFunction(170, 'factorial', 'rad')).toBeGreaterThan(0);
      expect(isFinite(evaluateScientificFunction(170, 'factorial', 'rad'))).toBe(true);
    });

    it('171! returns Infinity (overflow)', () => {
      expect(evaluateScientificFunction(171, 'factorial', 'rad')).toBe(Infinity);
    });
  });

  describe('cross-check: trig roundtrips', () => {
    it('asin(sin(0.5)) = 0.5', () => {
      const sinVal = evaluateScientificFunction(0.5, 'sin', 'rad');
      expect(evaluateScientificFunction(sinVal, 'asin', 'rad')).toBeCloseTo(0.5);
    });

    it('acos(cos(0.5)) = 0.5', () => {
      const cosVal = evaluateScientificFunction(0.5, 'cos', 'rad');
      expect(evaluateScientificFunction(cosVal, 'acos', 'rad')).toBeCloseTo(0.5);
    });

    it('atan(tan(0.5)) = 0.5', () => {
      const tanVal = evaluateScientificFunction(0.5, 'tan', 'rad');
      expect(evaluateScientificFunction(tanVal, 'atan', 'rad')).toBeCloseTo(0.5);
    });

    it('asin(sin(30°)) = 30° in degree mode', () => {
      const sinVal = evaluateScientificFunction(30, 'sin', 'deg');
      expect(evaluateScientificFunction(sinVal, 'asin', 'deg')).toBeCloseTo(30);
    });

    it('exp(ln(5)) = 5', () => {
      const lnVal = evaluateScientificFunction(5, 'ln', 'rad');
      expect(evaluateScientificFunction(lnVal, 'exp', 'rad')).toBeCloseTo(5);
    });

    it('tenPow(log10(42)) = 42', () => {
      const logVal = evaluateScientificFunction(42, 'log10', 'rad');
      expect(evaluateScientificFunction(logVal, 'tenPow', 'rad')).toBeCloseTo(42);
    });

    it('sqrt(square(7)) = 7', () => {
      const squared = evaluateScientificFunction(7, 'square', 'rad');
      expect(evaluateScientificFunction(squared, 'sqrt', 'rad')).toBeCloseTo(7);
    });

    it('cbrt(cube(5)) = 5', () => {
      const cubed = evaluateScientificFunction(5, 'cube', 'rad');
      expect(evaluateScientificFunction(cubed, 'cbrt', 'rad')).toBeCloseTo(5);
    });

    it('reciprocal(reciprocal(3)) = 3', () => {
      const recip = evaluateScientificFunction(3, 'reciprocal', 'rad');
      expect(evaluateScientificFunction(recip, 'reciprocal', 'rad')).toBeCloseTo(3);
    });
  });
});

describe('scientificFunctionToWord', () => {
  it('maps all functions to spoken words', () => {
    expect(scientificFunctionToWord('sin')).toBe('sine of');
    expect(scientificFunctionToWord('cos')).toBe('cosine of');
    expect(scientificFunctionToWord('tan')).toBe('tangent of');
    expect(scientificFunctionToWord('asin')).toBe('arc sine of');
    expect(scientificFunctionToWord('acos')).toBe('arc cosine of');
    expect(scientificFunctionToWord('atan')).toBe('arc tangent of');
    expect(scientificFunctionToWord('sinh')).toBe('hyperbolic sine of');
    expect(scientificFunctionToWord('cosh')).toBe('hyperbolic cosine of');
    expect(scientificFunctionToWord('tanh')).toBe('hyperbolic tangent of');
    expect(scientificFunctionToWord('asinh')).toBe('inverse hyperbolic sine of');
    expect(scientificFunctionToWord('acosh')).toBe('inverse hyperbolic cosine of');
    expect(scientificFunctionToWord('atanh')).toBe('inverse hyperbolic tangent of');
    expect(scientificFunctionToWord('ln')).toBe('natural log of');
    expect(scientificFunctionToWord('log10')).toBe('log base 10 of');
    expect(scientificFunctionToWord('square')).toBe('square of');
    expect(scientificFunctionToWord('cube')).toBe('cube of');
    expect(scientificFunctionToWord('exp')).toBe('e to the power of');
    expect(scientificFunctionToWord('tenPow')).toBe('10 to the power of');
    expect(scientificFunctionToWord('reciprocal')).toBe('1 over');
    expect(scientificFunctionToWord('sqrt')).toBe('square root of');
    expect(scientificFunctionToWord('cbrt')).toBe('cube root of');
    expect(scientificFunctionToWord('factorial')).toBe('factorial of');
  });
});
