import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LiteTimer } from './simple-timer';

const TIMER_TIME = 3000;
const HALF_TIMER_TIME = TIMER_TIME / 2;
const TWO_TIMER_TIME = TIMER_TIME * 2;
const createTestTimer = () => {
  const mockFun = vi.fn();
  const timer = new LiteTimer(mockFun, TIMER_TIME);

  return { timer, mockFun };
};

describe('simple-timer', () => {
  let { timer, mockFun } = createTestTimer();

  beforeEach(() => {
    // tell vitest we use mocked time
    vi.useFakeTimers();
    const { timer: _timer, mockFun: _mockFun } = createTestTimer();
    timer = _timer;
    mockFun = _mockFun;
    timer.restart();
  });

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers();
    timer.stop();
  });

  it('timer restart', () => {
    vi.advanceTimersByTime(HALF_TIMER_TIME);
    expect(mockFun).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(TIMER_TIME);
    expect(mockFun).toHaveBeenCalledTimes(1);
    timer.restart();
    vi.advanceTimersByTime(TWO_TIMER_TIME);
    expect(mockFun).toHaveBeenCalledTimes(2);
  });

  it('timer stop', () => {
    vi.advanceTimersByTime(HALF_TIMER_TIME);
    expect(mockFun).toHaveBeenCalledTimes(0);
    timer.stop();
    vi.advanceTimersByTime(TWO_TIMER_TIME);
    expect(mockFun).toHaveBeenCalledTimes(0);
  });
});
