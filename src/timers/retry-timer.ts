import { LiteAutoBind } from '@/auto-bind';
import { promisifyFn } from '@/utility';
import { RangeTimes, getMsTimeFromRangeTimes } from './range-times';

type TimerParams = {
  instantStart: boolean;
  maxTryCount: number;
  logError?: (...args: any[]) => void;
};

export class LiteRetryTimer extends LiteAutoBind {
  private _tmId: any;
  private _runCount = 0;
  private _started = false;

  get runCount() {
    return this._runCount;
  }

  constructor(
    private readonly fun: () => void,
    private readonly timeMs: number | RangeTimes,
    private readonly params: TimerParams,
  ) {
    super();
  }

  start(): void {
    this._started = true;
    this.params.instantStart ? this._run() : this._createTimeout(1);
  }

  stop(): void {
    clearTimeout(this._tmId);
    this._runCount = 0;
    this._started = false;
  }

  restart(): void {
    this.stop();
    this.start();
  }

  private _createTimeout(nextTryCount: number) {
    const timeout = getMsTimeFromRangeTimes(this.timeMs, nextTryCount);
    this._tmId = setTimeout(this._run, timeout);
  }

  private async _run() {
    if (!this._started) return;
    let success = false;
    this._runCount += 1;
    /* tslint:disable-next-line */
    const logError = this.params.logError || console.error;
    try {
      await promisifyFn(this.fun)();
      success = true;
    } catch (err) {
      logError('Lite retry timer error', err);
    } finally {
      const canContinueByMaxTryCount = this._runCount < this.params.maxTryCount;
      const createNextTimeout = () => this._createTimeout(this._runCount + 1);
      if (!success) {
        if (canContinueByMaxTryCount) {
          createNextTimeout();
        } else {
          logError('Lite retry timer attempt limit reached', this.params.maxTryCount);
        }
      }
    }
  }
}
