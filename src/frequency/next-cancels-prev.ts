import { promisifyFn, wait } from '@/utility';
import { Cancelable, CreateParams, ResultFunction, TeardownTuple } from './types';

type Context = { checkCanceled: () => boolean; executeCount: number };
export function nextCancelsPrev<ResT, ArgsT extends any[]>(
  fn: (ctx: Context, ...args: ArgsT) => ResT,
  memoLastResult: boolean = false,
): ResultFunction<ResT, ArgsT> {
  return _createNextCancelsPrev(fn, {
    memoLastResult,
  }) as ResultFunction<ResT, ArgsT>;
}

export function nextCancelsPrevWithTeardown<ResT, ArgsT extends any[]>(
  fn: (ctx: Context, ...args: ArgsT) => ResT,
  memoLastResult: boolean = false,
): TeardownTuple<ResT, ArgsT> {
  return _createNextCancelsPrev(fn, {
    memoLastResult,
    returnTeardownTuple: true,
  }) as TeardownTuple<ResT, ArgsT>;
}

function _createNextCancelsPrev<ResT, ArgsT extends any[]>(
  fn: (ctx: Context, ...args: ArgsT) => ResT,
  params?: CreateParams,
): ResultFunction<ResT, ArgsT> | TeardownTuple<ResT, ArgsT> {
  let isExecuting = false;
  let lastResult: Awaited<ResT> | undefined;
  let lastTime = 0;
  let nextTime = 0;
  let executeCount = 0;

  const teardown = () => {
    lastTime = 0;
    nextTime = 0;
  };

  const nextCancelsPrevFn = (async (...args: ArgsT): Promise<Cancelable<Awaited<ResT>>> => {
    if (isExecuting) {
      teardown();
      const curNextTime = Date.now();
      nextTime = curNextTime;
      const checkNextCanceled = () => {
        return nextTime !== curNextTime;
      };

      while (isExecuting) {
        await wait(0);
        // if teardown was called or next fn call
        if (checkNextCanceled()) {
          return { type: 'canceled', prevValue: lastResult };
        }
      }
    }

    isExecuting = true;
    const curTime = Date.now();
    const prevValue = lastResult;
    let nextResult: Awaited<ResT> | undefined;

    try {
      executeCount += 1;
      const _fn = promisifyFn(fn);
      lastTime = curTime;
      const checkCurCanceled = () => {
        return lastTime !== curTime;
      };
      nextResult = await _fn({ checkCanceled: checkCurCanceled, executeCount }, ...args);
      // if teardown was called
      if (checkCurCanceled()) {
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
    return [nextCancelsPrevFn, teardown];
  }

  return nextCancelsPrevFn;
}
