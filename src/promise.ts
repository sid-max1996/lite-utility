import { LiteAutoBind } from './auto-bind';

type Resolve<T> = (value: T | PromiseLike<T>) => void;
type Reject = (reason?: any) => void;

export class LitePromise<T> extends LiteAutoBind {
  private _resolve: Resolve<T> | null = null;
  private _reject: Reject | null = null;
  public readonly instance: Promise<T>;

  get resolve(): Resolve<T> {
    return this._resolve!;
  }

  get reject(): Reject {
    return this._reject!;
  }

  constructor() {
    super();
    this.instance = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }
}
