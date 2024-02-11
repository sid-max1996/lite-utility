import { describe, expect, it } from 'vitest';
import { pipeFn } from './pipe';
import { runFn } from './other';

describe('function', () => {
  it('pipeFn', () => {
    const len = (s: string): number => s.length;
    const double = (n: number): number => n * 2;
    const increment = (n: number): number => n + 1;
    const numToStr = (n: number): string => n.toString();

    const f = pipeFn(len, double, increment, double, numToStr);

    expect(f('aaa')).toBe('14');
  });

  it('runFn', () => {
    const sum = (...args: number[]): number => args.reduce((acc, cur) => cur + acc, 0);

    expect(runFn([1, 2, 3], sum)).toBe(6);
  });
});
