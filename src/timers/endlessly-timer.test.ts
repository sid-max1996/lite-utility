import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LiteEndlesslyTimer } from './endlessly-timer';
import { wait } from '@/utility';

class TestError extends Error {}

const TIMER_TIME = 3000;
const HALF_TIMER_TIME = TIMER_TIME / 2;
const TWO_TIMER_TIME = TIMER_TIME * 2;

let throwError = false;
let lastCalledTime = 0;
const createTestEndlesslyTimer = (instantStart: boolean) => {
  const mockFun = vi.fn(() => {
    lastCalledTime = Date.now();
    if (throwError) throw new TestError();
  });
  const timer = new LiteEndlesslyTimer(mockFun, TIMER_TIME, { instantStart, logError: () => {} });

  return { timer, mockFun };
};

describe('endlessly-timer', () => {
  let { timer, mockFun } = createTestEndlesslyTimer(false);

  beforeEach(() => {
    // tell vitest we use mocked time
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { timer: _timer, mockFun: _mockFun } = createTestEndlesslyTimer(false);
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

  it('timer restart', async () => {
    vi.advanceTimersByTime(HALF_TIMER_TIME);
    expect(mockFun).toHaveBeenCalledTimes(0);
    for (let i = 1; i <= 3; i++) {
      vi.advanceTimersByTime(TIMER_TIME * i);
      await wait(0);
      expect(mockFun).toHaveBeenCalledTimes(i);
    }
    throwError = true;
    let prevLastCalledTime = lastCalledTime;
    for (let i = 1; i <= 3; i++) {
      vi.advanceTimersByTime(TIMER_TIME * i);
      await wait(0);
      expect(mockFun).toThrowError(TestError);
      expect(lastCalledTime).not.equal(prevLastCalledTime);
      prevLastCalledTime = lastCalledTime;
    }
    throwError = false;
  });

  it('timer stop', () => {
    vi.advanceTimersByTime(HALF_TIMER_TIME);
    expect(mockFun).toHaveBeenCalledTimes(0);
    timer.stop();
    vi.advanceTimersByTime(TWO_TIMER_TIME);
    expect(mockFun).toHaveBeenCalledTimes(0);
  });
});
