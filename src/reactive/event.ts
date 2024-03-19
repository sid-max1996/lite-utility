import { LiteAutoBind } from '../auto-bind';
import { ReplaceKeyTypes } from '../types';

export interface ISubscribeEvent<T> {
  on(handler: (data: T) => void): () => void;
  off(handler: (data: T) => void): void;
  once(handler: (data: T) => void): () => void;
}

export interface IEmitEvent<T> {
  emit(data: T): void;
}

export type ReplaceSubscribeEvents<PresenterT> = ReplaceKeyTypes<PresenterT, LiteEvent<any>, ISubscribeEvent<any>>;

export type ReplaceEmitEvents<PresenterT> = ReplaceKeyTypes<PresenterT, LiteEvent<any>, IEmitEvent<any>>;

export interface IEvent<T> extends ISubscribeEvent<T>, IEmitEvent<T> {}

export class LiteEvent<T> extends LiteAutoBind implements IEvent<T> {
  private handlers: ((data: T) => void)[] = [];
  private onceHandlers: ((data: T) => void)[] = [];

  constructor(
    private readonly params = {
      quiet: false,
    },
  ) {
    super();
  }

  public on(handler: (data: T) => void): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  public off(handler: (data: T) => void): void {
    this.handlers = this.handlers.filter((h) => h !== handler);
    this.onceHandlers = this.onceHandlers.filter((h) => h !== handler);
  }

  private execute(data: T, handlers: ((data: T) => void)[]) {
    handlers.forEach((h) => {
      try {
        h(data);
      } catch (err) {
        if (!this.params.quiet) {
          /* tslint:disable-next-line */
          console.error(err);
        }
      }
    });
  }

  public emit(data: T) {
    this.execute(data, this.handlers);
    const curOnceHandlers = this.onceHandlers;
    this.onceHandlers = [];
    this.execute(data, curOnceHandlers);
  }

  public once(handler: (data: T) => void): () => void {
    this.onceHandlers.push(handler);
    return () => {
      this.onceHandlers = this.onceHandlers.filter((h) => h !== handler);
    };
  }

  public unsubscribeAll(): void {
    this.handlers = [];
    this.onceHandlers = [];
  }
}
