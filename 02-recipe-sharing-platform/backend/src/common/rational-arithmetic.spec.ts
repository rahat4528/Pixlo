import { gcd, simplifyRational, multiplyRational, addRational, formatNaturalFraction } from './rational-arithmetic.util';

describe('Exact Rational Arithmetic Engine', () => {
  it('computes greatest common divisor (gcd) correctly', () => {
    expect(gcd(12, 18)).toBe(6);
    expect(gcd(7, 13)).toBe(1);
    expect(gcd(100, 25)).toBe(25);
  });

  it('simplifies rational fractions to reduced lowest terms', () => {
    expect(simplifyRational({ numerator: 4, denominator: 8 })).toEqual({ numerator: 1, denominator: 2 });
    expect(simplifyRational({ numerator: 6, denominator: 4 })).toEqual({ numerator: 3, denominator: 2 });
    expect(simplifyRational({ numerator: 15, denominator: 5 })).toEqual({ numerator: 3, denominator: 1 });
  });

  it('multiplies fractions with exact precision without floating point drift', () => {
    // 1/3 * 3/4 = 3/12 = 1/4
    const a = { numerator: 1, denominator: 3 };
    const b = { numerator: 3, denominator: 4 };
    expect(multiplyRational(a, b)).toEqual({ numerator: 1, denominator: 4 });
  });

  it('adds fractions with common denominator calculation', () => {
    // 1/2 + 1/4 = 3/4
    const a = { numerator: 1, denominator: 2 };
    const b = { numerator: 1, denominator: 4 };
    expect(addRational(a, b)).toEqual({ numerator: 3, denominator: 4 });

    // 1/3 + 2/3 = 1
    const c = { numerator: 1, denominator: 3 };
    const d = { numerator: 2, denominator: 3 };
    expect(addRational(c, d)).toEqual({ numerator: 1, denominator: 1 });
  });

  it('formats natural fractions into readable culinary strings', () => {
    expect(formatNaturalFraction({ numerator: 1, denominator: 2 })).toBe('1/2');
    expect(formatNaturalFraction({ numerator: 3, denominator: 4 })).toBe('3/4');
    expect(formatNaturalFraction({ numerator: 5, denominator: 2 })).toBe('2 1/2');
    expect(formatNaturalFraction({ numerator: 7, denominator: 4 })).toBe('1 3/4');
    expect(formatNaturalFraction({ numerator: 4, denominator: 2 })).toBe('2');
    expect(formatNaturalFraction({ numerator: 0, denominator: 1 })).toBe('0');
  });
});
