import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LiteRepeatTimer } from './repeat-timer';
import { wait } from '@/utility';

class TestError extends Error {}

const TIMER_TIME = 3000;
const HALF_TIMER_TIME = TIMER_TIME / 2;
const TWO_TIMER_TIME = TIMER_TIME * 2;

const MAX_RUN_COUNT = 3;

let throwError = false;
const createTestRepeatingTimer = (instantStart: boolean) => {
  const mockFun = vi.fn(() => {
    if (throwError) throw new TestError();
  });
  const timer = new LiteRepeatTimer(mockFun, TIMER_TIME, {
    instantStart,
    runCount: MAX_RUN_COUNT,
    logError: () => {},
  });

  return { timer, mockFun };
};

describe('repeat-timer', () => {
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
  });

  const checkWorks3Times = async () => {
    vi.advanceTimersByTime(HALF_TIMER_TIME);
    expect(mockFun).toHaveBeenCalledTimes(0);
    for (let i = 1; i <= 3; i++) {
      vi.advanceTimersByTime(TIMER_TIME);
      await wait(0);
      expect(mockFun).toHaveBeenCalledTimes(i);
    }
    vi.advanceTimersByTime(TIMER_TIME);
    await wait(0);
    expect(mockFun).toHaveBeenCalledTimes(3);
  };

  it('repeat timer works 3 times', async () => {
    await checkWorks3Times();
  });

  it('repeat timer works 3 times with an error throw', async () => {
    throwError = true;
    await checkWorks3Times();
  });

  it('repeat timer stop', async () => {
    vi.advanceTimersByTime(TIMER_TIME);
    await wait(0);
    expect(mockFun).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(HALF_TIMER_TIME);
    timer.stop();
    vi.advanceTimersByTime(TWO_TIMER_TIME);
    await wait(0);
    expect(mockFun).toHaveBeenCalledTimes(1);
  });

  it('repeats works', async () => {
    const mockFun = vi.fn();
    const timer = new LiteRepeatTimer(mockFun, 10000, {
      instantStart: false,
      runCount: 3,
      logError: () => {},
    });
    timer.restart();
    const nextTimeAndCheck = async (needCalledTimes: number) => {
      vi.advanceTimersByTime(10000);
      expect(mockFun).toHaveBeenCalledTimes(needCalledTimes);
    };

    expect(mockFun).toHaveBeenCalledTimes(0);
    await nextTimeAndCheck(1);
    await nextTimeAndCheck(2);
    await nextTimeAndCheck(3);
    await nextTimeAndCheck(3);
  });

  it('range times works', async () => {
    const mockFun = vi.fn(() => {
      throw new TestError();
    });
    const timer = new LiteRepeatTimer(
      mockFun,
      {
        2: 10000,
        6: 20000,
        7: 30000,
      },
      {
        instantStart: false,
        runCount: 7,
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
