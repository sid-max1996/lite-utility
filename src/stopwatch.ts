import { LiteAutoBind } from './auto-bind';
import { tryCatch } from './function';

export interface IStopwatchPerformance {
  now(): number;
}

export class LiteStopwatch extends LiteAutoBind {
  private performance: IStopwatchPerformance;
  private pausedTime = 0;
  private startTime = 0;
  private _elapsedTime = 0;
  private stoped = true;
  private paused = false;

  constructor(performance?: IStopwatchPerformance) {
    super();
    this.performance = performance || { now: Date.now };
  }

  public get elapsedTime(): number {
    if (this.stoped || this.paused) {
      return this._elapsedTime;
    }
    return this._calcElapsedTime();
  }

  public start(): void {
    this.stoped = false;
    this.paused = false;
    this.startTime = this.performance.now();
  }

  public clear(): void {
    this._elapsedTime = 0;
    this.pausedTime = 0;
    this.startTime = 0;
    this.stoped = true;
    this.paused = false;
  }

  public restart(): void {
    this.clear();
    this.start();
  }

  public pause(): number {
    if (this.stoped) {
      this._elapsedTime = 0;
      return this._elapsedTime;
    }
    this.paused = true;
    this.pausedTime = this._calcElapsedTime();
    this.startTime = 0;
    this._elapsedTime = this.pausedTime;
    return this._elapsedTime;
  }

  private _calcElapsedTime() {
    const nowTime = this.performance.now();
    return nowTime - this.startTime + this.pausedTime;
  }

  public stop(): number {
    if (this.stoped) {
      this._elapsedTime = 0;
      return this._elapsedTime;
    }
    this._elapsedTime = this._calcElapsedTime();
    this.startTime = 0;
    this.pausedTime = 0;
    this.stoped = true;
    return this._elapsedTime;
  }
}

export function withStopwatch<U, T extends any[]>(
  fn: (...args: T) => U,
  onElapsedTime: (elapsedTime: number) => void,
): (...args: T) => U | void {
  return (...args: T) => {
    const stopwatch = new LiteStopwatch();
    stopwatch.start();
    const calcElapsedTime = () => onElapsedTime(stopwatch.stop());
    const safeFn = tryCatch(fn, (err) => {
      calcElapsedTime();
      throw err;
    });
    const result = safeFn(...args);
    if (result instanceof Promise) {
      result.then(calcElapsedTime);
    } else {
      calcElapsedTime();
    }
    return result;
  };
}
