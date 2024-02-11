import { LiteCanceledError } from './canceled-error';

type Resolve = () => void;
type Reject = (error: LiteCanceledError) => void;

export class LiteCancelableWaiting {
  private resolve: Resolve | null = null;
  private reject: Reject | null = null;
  private promise: Promise<void>;
  private timer: any;

  constructor() {
    this.promise = new Promise<void>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  async wait(delay: number) {
    if (this.timer) {
      throw new Error('WaitPromise wait already used');
    }
    if (!this.resolve) {
      throw new Error('WaitPromise wait resolve not exits');
    }
    this.timer = setTimeout(this.resolve.bind(this), delay);
    await this.promise;
  }

  cancel() {
    if (!this.reject) {
      throw new Error('WaitPromise cancel reject not exits');
    }
    clearTimeout(this.timer);
    this.reject(new LiteCanceledError());
  }
}
