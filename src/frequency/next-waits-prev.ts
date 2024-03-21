import { promisifyFn } from '@/utility';
import { Cancelable, CreateParams, ResultFunction, TeardownTuple } from './types';

export function nextWaitsPrev<ResT, ArgsT extends any[]>(
  fn: (...args: ArgsT) => ResT,
  memoLastResult: boolean = false,
): ResultFunction<ResT, ArgsT> {
  return _createNextWaitsPrev(fn, {
    memoLastResult,
  }) as ResultFunction<ResT, ArgsT>;
}

export function nextWaitsPrevWithTeardown<ResT, ArgsT extends any[]>(
  fn: (...args: ArgsT) => ResT,
  memoLastResult: boolean = false,
): TeardownTuple<ResT, ArgsT> {
  return _createNextWaitsPrev(fn, {
    memoLastResult,
    returnTeardownTuple: true,
  }) as TeardownTuple<ResT, ArgsT>;
}

function _createNextWaitsPrev<ResT, ArgsT extends any[]>(
  fn: (...args: ArgsT) => ResT,
  params?: CreateParams,
): ResultFunction<ResT, ArgsT> | TeardownTuple<ResT, ArgsT> {
  let isExecuting = false;
  let lastResult: Awaited<ResT> | undefined;
  let nextArgs: ArgsT | undefined;
  let lastTime = 0;

  const teardown = () => {
    nextArgs = undefined;
    lastTime = 0;
  };

  const nextWaitsPrevFn = (async (...args: ArgsT): Promise<Cancelable<Awaited<ResT>>> => {
    if (isExecuting) {
      nextArgs = args;
      return { type: 'canceled', prevValue: lastResult };
    }

    nextArgs = undefined;
    isExecuting = true;
    const curTime = Date.now();
    const prevValue = lastResult;

    let nextResult: Awaited<ResT> | undefined;
    try {
      const _fn = promisifyFn(fn);
      lastTime = curTime;
      nextResult = await _fn(...args);
      while (nextArgs) {
        const curArgs = nextArgs;
        nextArgs = undefined;
        lastTime = curTime;
        nextResult = await _fn(...curArgs);
      }
      // if teardown was called before last nextArgs changing
      if (lastTime !== curTime) {
        return { type: 'canceled', prevValue: lastResult };
      }
      if (params?.memoLastResult) {
        lastResult = nextResult;
      }
    } finally {
      isExecuting = false;
    }

    return { type: 'executed', value: nextResult, prevValue };
  }) as any;

  if (params?.returnTeardownTuple) {
    return [nextWaitsPrevFn, teardown];
  }

  return nextWaitsPrevFn;
}
