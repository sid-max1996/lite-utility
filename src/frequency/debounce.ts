import { promisifyFn } from '@/utility';
import { Cancelable, CreateParams, ResultFunction, TeardownTuple } from './types';

export function debounce<ResT, ArgsT extends any[]>(
  fn: (...args: ArgsT) => ResT,
  time: number,
  memoLastResult: boolean = false,
): ResultFunction<ResT, ArgsT> {
  return _createDebounce(fn, time, {
    memoLastResult,
  }) as ResultFunction<ResT, ArgsT>;
}

export function debounceWithTeardown<ResT, ArgsT extends any[]>(
  fn: (...args: ArgsT) => ResT,
  time: number,
  memoLastResult: boolean = false,
): TeardownTuple<ResT, ArgsT> {
  return _createDebounce(fn, time, {
    memoLastResult,
    returnTeardownTuple: true,
  }) as TeardownTuple<ResT, ArgsT>;
}

function _createDebounce<ResT, ArgsT extends any[]>(
  fn: (...args: ArgsT) => ResT,
  delay: number,
  params?: CreateParams,
): ResultFunction<ResT, ArgsT> | TeardownTuple<ResT, ArgsT> {
  let timer: any;
  let lastResult: Awaited<ResT> | undefined;
  let prevResolve: ((res: Cancelable<Awaited<ResT>>) => void) | null = null;

  const teardown = () => {
    clearTimeout(timer);
    if (prevResolve) {
      prevResolve({ type: 'canceled', prevValue: lastResult });
      prevResolve = null;
    }
  };

  const debouncedFn = (...args: ArgsT): any => {
    return new Promise<Cancelable<Awaited<ResT>>>((resolve, reject) => {
      teardown();
      prevResolve = resolve;

      timer = setTimeout(async () => {
        try {
          prevResolve = null;
          const _fn = promisifyFn(fn);
          const nextResult = await _fn(...args);

          const prevValue = lastResult;
          if (params?.memoLastResult) {
            lastResult = nextResult;
          }

          resolve({ type: 'executed', value: nextResult, prevValue });
        } catch (err) {
          reject(err);
        }
      }, delay);
    });
  };

  if (params?.returnTeardownTuple) {
    return [debouncedFn, teardown];
  }

  return debouncedFn;
}
