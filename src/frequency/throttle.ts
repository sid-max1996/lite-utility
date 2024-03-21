import { promisifyFn } from '@/utility';
import { Cancelable, CreateParams, ResultFunction, TeardownTuple } from './types';

export function throttle<ResT, ArgsT extends any[]>(
  fn: (...args: ArgsT) => ResT,
  time: number,
  memoLastResult: boolean = false,
): ResultFunction<ResT, ArgsT> {
  return _createThrottle(fn, time, {
    memoLastResult,
  }) as ResultFunction<ResT, ArgsT>;
}

export function throttleWithTeardown<ResT, ArgsT extends any[]>(
  fn: (...args: ArgsT) => ResT,
  time: number,
  memoLastResult: boolean = false,
): TeardownTuple<ResT, ArgsT> {
  return _createThrottle(fn, time, {
    memoLastResult,
    returnTeardownTuple: true,
  }) as TeardownTuple<ResT, ArgsT>;
}

function _createThrottle<ResT, ArgsT extends any[]>(
  fn: (...args: ArgsT) => ResT,
  time: number,
  params?: CreateParams,
): ResultFunction<ResT, ArgsT> | TeardownTuple<ResT, ArgsT> {
  let lastTime = 0;
  let lastResult: Awaited<ResT> | undefined;

  const throttledFn = async (...args: ArgsT): Promise<Cancelable<Awaited<ResT>>> => {
    const curTime = Date.now();
    if (curTime - lastTime < time) {
      return { type: 'canceled', prevValue: lastResult };
    }

    lastTime = curTime;
    const _fn = promisifyFn(fn);
    const nextResult = await _fn(...args);
    if (lastTime !== curTime) {
      return { type: 'canceled', prevValue: lastResult };
    }

    const prevValue = lastResult;
    if (params?.memoLastResult) {
      lastResult = nextResult;
    }

    return { type: 'executed', value: nextResult, prevValue };
  };

  const teardown = () => {
    lastTime = 0;
  };

  if (params?.returnTeardownTuple) {
    return [throttledFn, teardown];
  }

  return throttledFn;
}
