import { promisifyFn } from './utility';

type Executed<T> = { type: 'executed'; value: T; prevValue: T | undefined };
type Canceled<T> = { type: 'canceled'; value: undefined; prevValue: T | undefined };
export type Cancelable<T> = Executed<T> | Canceled<T>;

export function throttle<ResT, ArgsT extends any[]>(
  fn: (...args: ArgsT) => ResT,
  time: number,
): [(...args: ArgsT) => Promise<Cancelable<Awaited<ResT>>>, () => void] {
  let lastTime = 0;
  let lastResult: Awaited<ResT> | undefined;

  const throttledFn = async (...args: ArgsT): Promise<Cancelable<Awaited<ResT>>> => {
    const curTime = Date.now();
    if (curTime - lastTime < time) {
      return { type: 'canceled', value: undefined, prevValue: lastResult };
    }

    lastTime = curTime;
    const _fn = promisifyFn(fn);
    const nextResult = await _fn(...args);
    if (lastTime !== curTime) {
      return { type: 'canceled', value: undefined, prevValue: lastResult };
    }
    const prevValue = lastResult;
    lastResult = nextResult;

    return { type: 'executed', value: nextResult, prevValue };
  };

  const teardown = () => {
    lastTime = 0;
  };

  return [throttledFn, teardown];
}

export function debounce<ResT, ArgsT extends any[]>(
  fn: (...args: ArgsT) => ResT,
  delay: number,
): [(...args: ArgsT) => Promise<Cancelable<Awaited<ResT>>>, () => void] {
  let timer: any;
  let lastResult: Awaited<ResT> | undefined;
  let prevResolve: ((res: Cancelable<Awaited<ResT>>) => void) | null = null;

  const teardown = () => {
    clearTimeout(timer);
    if (prevResolve) {
      prevResolve({ type: 'canceled', value: undefined, prevValue: lastResult });
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
          lastResult = nextResult;

          resolve({ type: 'executed', value: nextResult, prevValue });
        } catch (err) {
          reject(err);
        }
      }, delay);
    });
  };

  return [debouncedFn, teardown];
}

export function onceAtATime<ResT, ArgsT extends any[]>(
  fn: (...args: ArgsT) => ResT,
): [(...args: ArgsT) => Promise<Cancelable<Awaited<ResT>>>, () => void] {
  let isExecuting = false;
  let lastResult: Awaited<ResT> | undefined;
  let nextArgs: ArgsT | undefined;
  let lastTime = 0;

  const teardown = () => {
    nextArgs = undefined;
    lastTime = 0;
  };

  const onceAtATimeFn = (async (...args: ArgsT): Promise<Cancelable<Awaited<ResT>>> => {
    if (isExecuting) {
      nextArgs = args;
      return { type: 'canceled', value: undefined, prevValue: lastResult };
    }

    nextArgs = undefined;
    isExecuting = true;
    const curTime = Date.now();
    const prevValue = lastResult;
    try {
      const _fn = promisifyFn(fn);
      lastTime = curTime;
      let nextResult = await _fn(...args);
      while (nextArgs) {
        const curArgs = nextArgs;
        nextArgs = undefined;
        lastTime = curTime;
        nextResult = await _fn(...curArgs);
      }
      // if teardown was called before last nextArgs changing
      if (lastTime !== curTime) {
        return { type: 'canceled', value: undefined, prevValue: lastResult };
      }
      lastResult = nextResult;
    } finally {
      isExecuting = false;
    }

    return { type: 'executed', value: lastResult, prevValue };
  }) as any;

  return [onceAtATimeFn, teardown];
}
