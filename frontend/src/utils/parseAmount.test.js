import { describe, it, expect } from 'vitest';
import { parseAmount } from './parseAmount.js';

describe('parseAmount', () => {
  it('parses dot decimals', () => {
    expect(parseAmount('12.50')).toBe(12.5);
  });

  it('parses comma decimals', () => {
    expect(parseAmount('12,50')).toBe(12.5);
  });

  it('parses integers', () => {
    expect(parseAmount('1200')).toBe(1200);
  });

  it('trims whitespace', () => {
    expect(parseAmount(' 7,25 ')).toBe(7.25);
  });

  it('passes numbers through', () => {
    expect(parseAmount(42.1)).toBe(42.1);
  });

  it('returns NaN for empty or non-string', () => {
    expect(parseAmount('')).toBeNaN();
    expect(parseAmount('   ')).toBeNaN();
    expect(parseAmount(null)).toBeNaN();
    expect(parseAmount(undefined)).toBeNaN();
  });

  it('returns NaN for multiple separators', () => {
    expect(parseAmount('12,50,3')).toBeNaN();
    expect(parseAmount('12.5.3')).toBeNaN();
    expect(parseAmount('12.5,3')).toBeNaN();
  });

  it('returns NaN for non-numeric strings', () => {
    expect(parseAmount('abc')).toBeNaN();
    expect(parseAmount('12a')).toBeNaN();
    expect(parseAmount('-5')).toBeNaN();
  });
});
