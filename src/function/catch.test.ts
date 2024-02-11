import { describe, expect, it } from 'vitest';
import { tryCatch } from './catch';
import { promisifyFn } from '..';
import { checkThrowError } from '@/test';

const sum5 = (a: number) => {
  return 5 + a;
};

const asyncSum5 = promisifyFn(sum5);

const divide10on = (a: number) => {
  if (a === 0) {
    throw new Error('Divide on zero');
  }
  return 10 / a;
};

const asyncDivide10on = promisifyFn(divide10on);

describe('tryCatch', () => {
  it('sync function works', () => {
    const _sum5 = tryCatch(sum5, (err) => {
      throw err;
    });

    expect(_sum5(10)).toBe(15);
  });

  it('async function works', async () => {
    const _sum5 = tryCatch(asyncSum5, (err) => {
      throw err;
    });

    expect(await _sum5(10)).toBe(15);
  });

  it('sync function default value on throw', async () => {
    const _divide10on = tryCatch(divide10on, () => {
      return -1;
    });

    expect(_divide10on(0)).toBe(-1);
  });

  it('async function default value on throw', async () => {
    const _divide10on = tryCatch(asyncDivide10on, async () => {
      return -1;
    });

    expect(await _divide10on(0)).toBe(-1);
  });

  it('sync rethrow error in catch', () => {
    const _divide10on = tryCatch(divide10on, (err) => {
      throw err;
    });

    expect(checkThrowError(() => _divide10on(0))).toBe(true);
  });

  it('async rethrow error in catch 1', async () => {
    const _divide10on = tryCatch(asyncDivide10on, (err) => {
      throw err;
    });

    expect(await checkThrowError(() => _divide10on(0))).toBe(true);
  });

  it('async rethrow error in catch 2', async () => {
    const _divide10on = tryCatch(asyncDivide10on, async (err) => {
      throw err;
    });

    expect(await checkThrowError(() => _divide10on(0))).toBe(true);
  });
});
