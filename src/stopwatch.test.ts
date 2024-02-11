import { afterEach, describe, expect, it } from 'vitest';
import { IStopwatchPerformance, LiteStopwatch } from './stopwatch';

class MockPerformance implements IStopwatchPerformance {
  private time = 0;

  now() {
    return this.time;
  }

  add(time: number) {
    this.time += time;
  }

  clear() {
    this.time = 0;
  }
}

const performance = new MockPerformance();
const stopwatch = new LiteStopwatch(performance);

const sleep = (time: number) => {
  performance.add(time);
};

describe('lite-stopwatch', () => {
  afterEach(() => {
    stopwatch.clear();
    performance.clear();
  });

  it('stop', async () => {
    stopwatch.start();
    sleep(10);
    const elapsedTime = stopwatch.stop();
    expect(elapsedTime).toBeGreaterThan(5);
    expect(elapsedTime).toBeLessThan(15);
    expect(elapsedTime).toEqual(stopwatch.elapsedTime);
  });

  it('clear 0', async () => {
    expect(stopwatch.elapsedTime).toBe(0);
  });

  it('pause 0', async () => {
    const elapsedTime = stopwatch.pause();
    expect(elapsedTime).toBe(0);
    expect(elapsedTime).toEqual(stopwatch.elapsedTime);
  });

  it('stop 0', async () => {
    const elapsedTime = stopwatch.stop();
    expect(elapsedTime).toBe(0);
    expect(elapsedTime).toEqual(stopwatch.elapsedTime);
  });

  it('pause', async () => {
    stopwatch.start();
    sleep(10);
    let elapsedTime = stopwatch.pause();
    expect(elapsedTime).toBeGreaterThan(5);
    expect(elapsedTime).toBeLessThan(15);
    expect(elapsedTime).toEqual(stopwatch.elapsedTime);
    stopwatch.start();
    sleep(10);
    elapsedTime = stopwatch.pause();
    expect(elapsedTime).toBeGreaterThan(15);
    expect(elapsedTime).toBeLessThan(25);
    expect(elapsedTime).toEqual(stopwatch.elapsedTime);
    stopwatch.start();
    sleep(10);
    elapsedTime = stopwatch.stop();
    expect(elapsedTime).toBeGreaterThan(25);
    expect(elapsedTime).toBeLessThan(35);
    expect(elapsedTime).toEqual(stopwatch.elapsedTime);
    elapsedTime = stopwatch.pause();
    expect(elapsedTime).toBe(0);
    expect(elapsedTime).toEqual(stopwatch.elapsedTime);
    elapsedTime = stopwatch.stop();
    expect(elapsedTime).toBe(0);
    expect(elapsedTime).toEqual(stopwatch.elapsedTime);
  });

  it('restart', async () => {
    stopwatch.start();
    sleep(10);
    let elapsedTime = stopwatch.pause();
    expect(elapsedTime).toBeGreaterThan(5);
    expect(elapsedTime).toBeLessThan(15);
    expect(elapsedTime).toEqual(stopwatch.elapsedTime);
    stopwatch.restart();
    sleep(15);
    elapsedTime = stopwatch.pause();
    expect(elapsedTime).toBeGreaterThan(10);
    expect(elapsedTime).toBeLessThan(20);
    expect(elapsedTime).toEqual(stopwatch.elapsedTime);
    stopwatch.restart();
    sleep(10);
    elapsedTime = stopwatch.stop();
    expect(elapsedTime).toBeGreaterThan(5);
    expect(elapsedTime).toBeLessThan(15);
    expect(elapsedTime).toEqual(stopwatch.elapsedTime);
  });

  it('elapsed time', () => {
    stopwatch.start();
    sleep(10);
    expect(stopwatch.elapsedTime).toBe(10);
    sleep(10);
    expect(stopwatch.elapsedTime).toBe(20);
    sleep(5);
    const elapsedTime = stopwatch.stop();
    expect(elapsedTime).toBe(25);
    expect(elapsedTime).toEqual(stopwatch.elapsedTime);
  });
});
