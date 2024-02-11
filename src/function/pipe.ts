/* eslint-disable */
/**
 * Performs left-to-right function composition. The first argument may have any arity, the remaining arguments must be unary.
 *
 * @example
 * import { pipeFn } from 'lite-utility/function'
 *
 * const len = (s: string): number => s.length
 * const double = (n: number): number => n * 2
 *
 * const f = pipeFn(len, double)
 *
 * assert.strictEqual(f('aaa'), 6)
 *
 */
export function pipeFn<A extends ReadonlyArray<unknown>, B>(ab: (...a: A) => B): (...a: A) => B;
export function pipeFn<A extends ReadonlyArray<unknown>, B, C>(ab: (...a: A) => B, bc: (b: B) => C): (...a: A) => C;
export function pipeFn<A extends ReadonlyArray<unknown>, B, C, D>(
  ab: (...a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
): (...a: A) => D;
export function pipeFn<A extends ReadonlyArray<unknown>, B, C, D, E>(
  ab: (...a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
): (...a: A) => E;
export function pipeFn<A extends ReadonlyArray<unknown>, B, C, D, E, F>(
  ab: (...a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
): (...a: A) => F;
export function pipeFn<A extends ReadonlyArray<unknown>, B, C, D, E, F, G>(
  ab: (...a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G,
): (...a: A) => G;
export function pipeFn<A extends ReadonlyArray<unknown>, B, C, D, E, F, G, H>(
  ab: (...a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G,
  gh: (g: G) => H,
): (...a: A) => H;
export function pipeFn<A extends ReadonlyArray<unknown>, B, C, D, E, F, G, H, I>(
  ab: (...a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G,
  gh: (g: G) => H,
  hi: (h: H) => I,
): (...a: A) => I;
export function pipeFn<A extends ReadonlyArray<unknown>, B, C, D, E, F, G, H, I, J>(
  ab: (...a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G,
  gh: (g: G) => H,
  hi: (h: H) => I,
  ij: (i: I) => J,
): (...a: A) => J;
export function pipeFn(
  ab: Function,
  bc?: Function,
  cd?: Function,
  de?: Function,
  ef?: Function,
  fg?: Function,
  gh?: Function,
  hi?: Function,
  ij?: Function,
): unknown {
  switch (arguments.length) {
    case 1:
      return ab;
    case 2:
      return function (this: unknown) {
        return bc!(ab.apply(this, arguments));
      };
    case 3:
      return function (this: unknown) {
        return cd!(bc!(ab.apply(this, arguments)));
      };
    case 4:
      return function (this: unknown) {
        return de!(cd!(bc!(ab.apply(this, arguments))));
      };
    case 5:
      return function (this: unknown) {
        return ef!(de!(cd!(bc!(ab.apply(this, arguments)))));
      };
    case 6:
      return function (this: unknown) {
        return fg!(ef!(de!(cd!(bc!(ab.apply(this, arguments))))));
      };
    case 7:
      return function (this: unknown) {
        return gh!(fg!(ef!(de!(cd!(bc!(ab.apply(this, arguments)))))));
      };
    case 8:
      return function (this: unknown) {
        return hi!(gh!(fg!(ef!(de!(cd!(bc!(ab.apply(this, arguments))))))));
      };
    case 9:
      return function (this: unknown) {
        return ij!(hi!(gh!(fg!(ef!(de!(cd!(bc!(ab.apply(this, arguments)))))))));
      };
  }
  // If not a typescript, then you can call it with more than 9 parameters
  return _pipeFns(...arguments);
}
/* eslint-enable */

type ArityOneFn = (arg: any) => any;
type PickLastInTuple<T extends any[]> = T extends [...rest: any, argn: infer L] ? L : never;
type FirstFnParameterType<T extends any[]> = Parameters<T[0]>[any];
type ReturnTypeOrNot<T> = T extends (...args: any[]) => any ? ReturnType<T> : never;
type LastFnReturnType<T extends any[]> = ReturnTypeOrNot<PickLastInTuple<T>>;
// For _pipeFns(fn1, fn2, fn3) no type checking for function input parameters fn2, fn3
const _pipeFns =
  <T extends ArityOneFn[]>(...fns: T) =>
  (p: FirstFnParameterType<T>): LastFnReturnType<T> =>
    fns.reduce((acc: any, cur: any) => cur(acc), p);
