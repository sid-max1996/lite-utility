import { LiteAutoBind } from '@/auto-bind';
import { wait } from '@/utility';
import { LiteCanceledError } from './canceled-error';
import { LiteCancellationToken } from './cancellation-token';

export class LiteCancellationOperation<ParamsT, ResultT> extends LiteAutoBind {
  private cancelToken: LiteCancellationToken | null = null;

  private executeCount = 0;
  private working = false;

  get executing(): boolean {
    return this.working;
  }

  constructor(
    private readonly name: string,
    private readonly operation: (
      params: ParamsT,
      cancelToken: LiteCancellationToken,
      executeCount: number,
    ) => Promise<ResultT>,
    private readonly writeLog: (text: string) => void = () => {},
  ) {
    super();
  }

  async doOperation(params: ParamsT): Promise<ResultT> {
    this.executeCount += 1;
    const curExecuteCount = this.executeCount;

    if (this.cancelToken) {
      this.writeLog(`${this.name} cancel prev playback [${curExecuteCount}]`);
      this.cancelToken.cancel();
    }

    this.cancelToken = new LiteCancellationToken();
    const curCancelToken = this.cancelToken;

    let waitS = 0;
    while (this.working) {
      this.writeLog(`${this.name} wait previous stop (${waitS++}s). [${curExecuteCount}]`);
      await wait(1000);
      if (curCancelToken.isCanceled) {
        throw new LiteCanceledError(`${this.name} previous stop canceled (${waitS}s). [${curExecuteCount}]`);
      }
    }

    this.working = true;
    this.writeLog(`${this.name} start [${curExecuteCount}]`);

    try {
      const result = await this.operation(params, curCancelToken, curExecuteCount);
      curCancelToken.throwIfCanceled();
      return result;
    } finally {
      this.working = false;
      this.writeLog(`${this.name} stop [${curExecuteCount}]`);
    }
  }
}
