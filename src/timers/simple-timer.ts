import { LiteAutoBind } from '@/auto-bind';
import { promisifyFn } from '@/utility';

type TimerParams = {
  logError?: (...args: any[]) => void;
};

export class LiteTimer extends LiteAutoBind {
  private _tmId: any;

  constructor(
    private readonly fun: () => void,
    private readonly timeMs: number,
    private readonly params?: TimerParams,
  ) {
    super();
  }

  start(): void {
    this._tmId = setTimeout(this._run, this.timeMs);
  }

  stop(): void {
    clearTimeout(this._tmId);
  }

  restart(): void {
    this.stop();
    this.start();
  }

  private async _run() {
    try {
      await promisifyFn(this.fun)();
    } catch (err) {
      const logError = this.params?.logError || console.error;
      logError('Lite timer error', err);
    }
  }
}
