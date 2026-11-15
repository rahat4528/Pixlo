export interface Rational {
  numerator: number;
  denominator: number;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function simplifyRational(r: Rational): Rational {
  if (r.denominator === 0) {
    throw new Error('Denominator cannot be zero in rational arithmetic');
  }
  if (r.numerator === 0) {
    return { numerator: 0, denominator: 1 };
  }
  const divisor = gcd(r.numerator, r.denominator);
  const sign = r.denominator < 0 ? -1 : 1;
  return {
    numerator: (r.numerator / divisor) * sign,
    denominator: Math.abs(r.denominator / divisor),
  };
}

export function multiplyRational(a: Rational, b: Rational): Rational {
  return simplifyRational({
    numerator: a.numerator * b.numerator,
    denominator: a.denominator * b.denominator,
  });
}

export function addRational(a: Rational, b: Rational): Rational {
  const num = a.numerator * b.denominator + b.numerator * a.denominator;
  const den = a.denominator * b.denominator;
  return simplifyRational({ numerator: num, denominator: den });
}

export function formatNaturalFraction(r: Rational): string {
  const simplified = simplifyRational(r);
  const { numerator, denominator } = simplified;

  if (numerator === 0) return '0';
  if (denominator === 1) return `${numerator}`;

  const whole = Math.floor(numerator / denominator);
  const remainder = numerator % denominator;

  if (whole === 0) {
    return `${remainder}/${denominator}`;
  }
  if (remainder === 0) {
    return `${whole}`;
  }
  return `${whole} ${remainder}/${denominator}`;
}
