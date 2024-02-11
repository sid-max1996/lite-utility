import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LiteRetryTimer } from './retry-timer';

class TestError extends Error {}

const TIMER_TIME = 3000;
const HALF_TIMER_TIME = TIMER_TIME / 2;
const TWO_TIMER_TIME = TIMER_TIME * 2;

const MAX_TRY_COUNT = 3;

let throwError = false;
let successCalled = false;
const createTestRepeatingTimer = (instantStart: boolean) => {
  const mockFun = vi.fn(() => {
    if (throwError) throw new TestError();
    successCalled = true;
  });
  const timer = new LiteRetryTimer(mockFun, TIMER_TIME, {
    instantStart,
    maxTryCount: MAX_TRY_COUNT,
    logError: () => {},
  });

  return { timer, mockFun };
};

describe('retry-timer', () => {
  let { timer, mockFun } = createTestRepeatingTimer(false);

  beforeEach(() => {
    // tell vitest we use mocked time
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { timer: _timer, mockFun: _mockFun } = createTestRepeatingTimer(false);
    timer = _timer;
    mockFun = _mockFun;
    timer.restart();
  });

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers();
    timer.stop();
    throwError = false;
    successCalled = false;
  });

  it('timer stop on first success', async () => {
    vi.advanceTimersByTime(HALF_TIMER_TIME);
    expect(mockFun).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(TIMER_TIME);
    expect(mockFun).toHaveBeenCalledTimes(1);
    expect(successCalled).toBe(true);
    vi.advanceTimersByTime(TIMER_TIME);
    expect(mockFun).toHaveBeenCalledTimes(1);
  });

  it('timer max try', () => {
    throwError = true;

    vi.advanceTimersByTime(HALF_TIMER_TIME);
    expect(mockFun).toHaveBeenCalledTimes(0);
    for (let i = 1; i <= 3; i++) {
      vi.advanceTimersByTime(TIMER_TIME);
      expect(mockFun).toHaveBeenCalledTimes(i);
    }
    vi.advanceTimersByTime(TIMER_TIME);
    expect(mockFun).toHaveBeenCalledTimes(3);
  });

  it('timer stop on last success', async () => {
    throwError = true;

    vi.advanceTimersByTime(HALF_TIMER_TIME);
    expect(mockFun).toHaveBeenCalledTimes(0);
    for (let i = 1; i <= 2; i++) {
      vi.advanceTimersByTime(TIMER_TIME);
      expect(mockFun).toHaveBeenCalledTimes(i);
      expect(successCalled).toBe(false);
    }
    throwError = false;
    vi.advanceTimersByTime(TIMER_TIME);
    expect(mockFun).toHaveBeenCalledTimes(3);

    expect(successCalled).toBe(true);
  });

  it('timer stop', () => {
    vi.advanceTimersByTime(HALF_TIMER_TIME);
    expect(mockFun).toHaveBeenCalledTimes(0);
    timer.stop();
    vi.advanceTimersByTime(TWO_TIMER_TIME);
    expect(mockFun).toHaveBeenCalledTimes(0);
  });

  it('range times works', async () => {
    const mockFun = vi.fn(() => {
      throw new TestError();
    });
    const timer = new LiteRetryTimer(
      mockFun,
      {
        2: 10000,
        6: 20000,
        7: 30000,
      },
      {
        instantStart: false,
        maxTryCount: 7,
        logError: () => {},
      },
    );
    timer.restart();

    const addTimeAndCheckCalledTimes = async (timeMs: number, needCalledTimes: number) => {
      const EPS = 100;
      vi.advanceTimersByTime(timeMs - EPS);
      expect(mockFun).toHaveBeenCalledTimes(needCalledTimes - 1);
      vi.advanceTimersByTime(EPS);
      expect(mockFun).toHaveBeenCalledTimes(needCalledTimes);
    };

    await addTimeAndCheckCalledTimes(10000, 1);
    await addTimeAndCheckCalledTimes(10000, 2);
    for (let num = 3; num <= 6; num++) {
      await addTimeAndCheckCalledTimes(20000, num);
    }
    await addTimeAndCheckCalledTimes(30000, 7);
  });
});
