import { LiteAutoBind } from '../auto-bind';

type UnsubscribeFunction = () => void;
type SubscribeCallback<T> = (newValue: T) => void;

export interface IReadState<T> {
  get(): T;
  subscribe(callback: SubscribeCallback<T>): UnsubscribeFunction;
}

export interface IWriteState<T> {
  set(newValue: T): void;
}

export interface IState<T> extends IReadState<T>, IWriteState<T> {}

export class LiteState<T> extends LiteAutoBind implements IState<T> {
  private value: T;
  private subscribers: SubscribeCallback<T>[] = [];

  constructor(initValue: T) {
    super();
    this.value = initValue;
  }

  get() {
    return this.value;
  }

  set(newValue: T) {
    this.value = newValue;
    for (const callback of this.subscribers) {
      try {
        callback(this.value);
      } catch (err) {
        /* tslint:disable-next-line */
        console.error(err);
      }
    }
  }

  subscribe(callback: SubscribeCallback<T>): UnsubscribeFunction {
    this.subscribers.push(callback);

    return () => {
      this.subscribers = this.subscribers.filter((current) => current !== callback);
    };
  }
}
