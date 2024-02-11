import { afterEach, describe, expect, it, vi } from 'vitest';
import { Cancelable, debounce, onceAtATime, throttle } from './frequency';
import { wait } from './utility';

const createSumAndIncrementFn = () => {
  let curNum = 1;
  const sum = (...args: number[]): number => args.reduce((acc, cur) => cur + acc, 0);
  return (...args: number[]) => {
    return sum(...args) + curNum++;
  };
};
describe('frequency', async () => {
  let mockFn = vi.fn(createSumAndIncrementFn());
  vi.useFakeTimers({ shouldAdvanceTime: true });

  afterEach(() => {
    mockFn = vi.fn(createSumAndIncrementFn());
  });

  it('throttle', async () => {
    const [throttleFn, teardown] = throttle(mockFn, 1000);
    expect(mockFn).toHaveBeenCalledTimes(0);
    expect(await throttleFn(10, 4)).toEqual({ type: 'executed', value: 15 }); // 10 + 4 + 1
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(await throttleFn(666)).toEqual({ type: 'canceled', prevValue: 15 }); // prev value
    expect(mockFn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1000);
    expect(await throttleFn(10, 5)).toEqual({ type: 'executed', value: 17, prevValue: 15 }); // 10 + 5 + 2
    expect(mockFn).toHaveBeenCalledTimes(2);
    teardown(); // can call again
    expect(await throttleFn(10, 6)).toEqual({ type: 'executed', value: 19, prevValue: 17 }); // 10 + 6 + 3
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('debounce', async () => {
    const [debounceFn, teardown] = debounce(mockFn, 1000);
    // normal operation
    expect(mockFn).toHaveBeenCalledTimes(0);
    let res1: Cancelable<number> | undefined;
    debounceFn(10, 4).then((res) => {
      res1 = res;
    });
    vi.advanceTimersByTime(1000);
    await wait(0);
    expect(res1).toEqual({ type: 'executed', value: 15 }); // 10 + 4 + 1
    expect(mockFn).toHaveBeenCalledTimes(1);

    // cancel execution halfway through
    let res2: Cancelable<number> | undefined;
    debounceFn(10, 5).then((res) => {
      res2 = res;
    });
    vi.advanceTimersByTime(500);
    teardown();
    await wait(0);
    expect(res2).toEqual({ type: 'canceled', prevValue: 15 });
    expect(mockFn).toHaveBeenCalledTimes(1);

    // canceling after full time will not work
    let res3: Cancelable<number> | undefined;
    debounceFn(10, 5).then((res) => {
      res3 = res;
    });
    vi.advanceTimersByTime(1000);
    await wait(0);
    teardown();
    await wait(0);
    expect(res3).toEqual({ type: 'executed', value: 17, prevValue: 15 }); // 10 + 5 + 2
    expect(mockFn).toHaveBeenCalledTimes(2);

    // cancel with next call
    let res4: Cancelable<number> | undefined;
    debounceFn(10, 6).then((res) => {
      res4 = res;
    });
    vi.advanceTimersByTime(500);
    let res5: Cancelable<number> | undefined;
    debounceFn(10, 7).then((res) => {
      res5 = res;
    });
    await wait(0);
    expect(res4).toEqual({ type: 'canceled', prevValue: 17 });
    expect(mockFn).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(1000);
    await wait(0);
    expect(res5).toEqual({ type: 'executed', value: 20, prevValue: 17 }); // 10 + 7 + 3
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('onceAtATimeFn', async () => {
    const [onceAtATimeFn, teardown] = onceAtATime(mockFn);
    expect(mockFn).toHaveBeenCalledTimes(0);
    // simple call
    let res1: Cancelable<number> | undefined;
    onceAtATimeFn(10, 4).then((res) => {
      res1 = res;
    });
    await wait(0);
    expect(res1).toEqual({ type: 'executed', value: 15 }); // 10 + 4 + 1
    expect(mockFn).toHaveBeenCalledTimes(1);

    // teardown
    let res2: Cancelable<number> | undefined;
    onceAtATimeFn(10, 5).then((res) => {
      res2 = res;
    });
    teardown();
    await wait(0);
    expect(res2).toEqual({ type: 'canceled', prevValue: 15 });
    expect(mockFn).toHaveBeenCalledTimes(2);

    // many calls
    let res3: Cancelable<number> | undefined;
    onceAtATimeFn(10, 6).then((res) => {
      res3 = res;
    });
    let res4: Cancelable<number> | undefined;
    onceAtATimeFn(10, 7).then((res) => {
      res4 = res;
    });
    let res5: Cancelable<number> | undefined;
    onceAtATimeFn(10, 8).then((res) => {
      res5 = res;
    });
    await wait(0);
    expect(res5).toEqual({ type: 'canceled', prevValue: 15 });
    expect(res4).toEqual({ type: 'canceled', prevValue: 15 });
    expect(res3).toEqual({ type: 'executed', value: 22, prevValue: 15 }); // 10 + 8 + 4
    expect(mockFn).toHaveBeenCalledTimes(4);
  });
});
