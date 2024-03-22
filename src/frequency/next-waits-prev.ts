import { promisifyFn, wait } from '@/utility';
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
  let lastTime = 0;
  let nextTime = 0;

  const teardown = () => {
    lastTime = 0;
    nextTime = 0;
  };

  let counter = 0;

  const nextWaitsPrevFn = (async (...args: ArgsT): Promise<Cancelable<Awaited<ResT>>> => {
    const curTime = ++counter;

    if (isExecuting) {
      nextTime = curTime;
      const isNextWasCanceled = () => {
        return nextTime !== curTime;
      };

      while (isExecuting) {
        await wait(0);
        // if teardown was called or next fn call
        if (isNextWasCanceled()) {
          return { type: 'canceled', prevValue: lastResult };
        }
      }
    }

    isExecuting = true;
    const prevValue = lastResult;

    let nextResult: Awaited<ResT> | undefined;
    try {
      const _fn = promisifyFn(fn);
      lastTime = curTime;
      nextResult = await _fn(...args);

      const isTeardownWasCalled = () => lastTime !== curTime;
      if (isTeardownWasCalled()) {
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
