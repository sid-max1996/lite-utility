import { LiteAutoBind } from '../auto-bind';
import { LiteEvent } from './event';

type EmitterHandler<PayloadT> = (payload: PayloadT) => void;

export class LiteEventEmitter<EventsT extends Record<string, any>> extends LiteAutoBind {
  constructor(
    private readonly params = {
      quiet: false,
    },
  ) {
    super();
  }

  readonly onEmit = new LiteEvent<{ eventName: string; payload: any }>();

  private readonly _handlersMap = new Map<string, EmitterHandler<any>[]>();
  private readonly _onceHandlersMap = new Map<string, EmitterHandler<any>[]>();

  on<E extends keyof EventsT>(eventName: E, handler: EmitterHandler<EventsT[E]>): () => void {
    return this._subscribe(this._handlersMap, eventName, handler);
  }

  once<E extends keyof EventsT>(eventName: E, handler: EmitterHandler<EventsT[E]>): () => void {
    return this._subscribe(this._onceHandlersMap, eventName, handler);
  }

  off<E extends keyof EventsT>(eventName: E, handler: (payload: EventsT[E]) => void): void {
    this._unsubscribe(this._handlersMap, eventName, handler);
    this._unsubscribe(this._onceHandlersMap, eventName, handler);
  }

  emit<E extends keyof EventsT>(eventName: E, event: EventsT[E]): void;
  emit<E extends keyof EventsT>(eventName: undefined extends EventsT[E] ? E : never): void;
  emit<E extends keyof EventsT>(eventName: E, payload?: EventsT[E]) {
    this.onEmit.emit({ eventName: String(eventName), payload });
    this._execute(this._handlersMap, eventName, payload!);
    this._execute(this._onceHandlersMap, eventName, payload!);

    this._onceHandlersMap.set(String(eventName), []);
  }

  unsubscribeAll(): void {
    this._handlersMap.clear();
    this._onceHandlersMap.clear();
  }

  private _unsubscribe<E extends keyof EventsT>(
    dictionary: Map<string, EmitterHandler<any>[]>,
    eventName: E,
    handler: EmitterHandler<EventsT[E]>,
  ) {
    let handlers = dictionary.get(String(eventName)) || [];
    handlers = handlers.filter((h) => h !== handler);
    dictionary.set(String(eventName), handlers);
  }

  private _subscribe<E extends keyof EventsT>(
    dictionary: Map<string, EmitterHandler<any>[]>,
    eventName: E,
    handler: EmitterHandler<EventsT[E]>,
  ) {
    if (!dictionary.has(String(eventName))) {
      dictionary.set(String(eventName), [handler]);
    } else {
      const handlers = dictionary.get(String(eventName));
      handlers!.push(handler);
    }
    return () => {
      this._unsubscribe(dictionary, eventName, handler);
    };
  }

  private _execute<E extends keyof EventsT>(
    dictionary: Map<string, EmitterHandler<any>[]>,
    eventName: E,
    payload: EventsT[E],
  ) {
    const handlers = dictionary.get(String(eventName)) || [];
    handlers.forEach((h) => {
      try {
        h(payload);
      } catch (err) {
        if (!this.params.quiet) {
          /* tslint:disable-next-line */
          console.error(err);
        }
      }
    });
  }
}
