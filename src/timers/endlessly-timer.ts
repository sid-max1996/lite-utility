import { LiteAutoBind } from '@/auto-bind';
import { promisifyFn } from '@/utility';

type TimerParams = {
  instantStart: boolean;
  logError?: (...args: any[]) => void;
};

export class LiteEndlesslyTimer extends LiteAutoBind {
  private _tmId: any;
  private _started = false;

  constructor(
    private readonly fun: () => void,
    private readonly timeMs: number,
    private readonly params: TimerParams,
  ) {
    super();
  }

  start(): void {
    this._started = true;
    this.params.instantStart ? this._run() : this._createTimeout();
  }

  stop(): void {
    clearTimeout(this._tmId);
    this._started = false;
  }

  restart(): void {
    this.stop();
    this.start();
  }

  private _createTimeout() {
    this._tmId = setTimeout(this._run, this.timeMs);
  }

  private async _run() {
    if (!this._started) return;
    try {
      await promisifyFn(this.fun)();
    } catch (err) {
      const logError = this.params.logError || console.error;
      logError('Lite endlessly timer error', err);
    } finally {
      this._createTimeout();
    }
  }
}
