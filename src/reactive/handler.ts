import { LiteAutoBind } from '../auto-bind';
import { LiteEvent } from './event';
import { promisifyFn } from '../utility';

type EventId = {
  eventId: number;
};

type RequestParams<T> = EventId & {
  params: T;
};

type ReceiveError = EventId & {
  type: 'error';
  name: string | null;
  message: string;
  payload: any | null;
};

type ReceiveResult<T> = EventId & {
  type: 'result';
  result: T;
};

type ResponseParams<T> = ReceiveError | ReceiveResult<T>;

export interface IRegiterHandler<ParamsT, ResT> {
  regiter(handler: (params: ParamsT) => ResT | Promise<ResT>): () => void;
}

export interface IExecuteHandler<ParamsT, ResT> {
  execute(params: ParamsT): Promise<ResT>;
}

export interface IHandler<ParamsT, ResT> extends IRegiterHandler<ParamsT, ResT>, IExecuteHandler<ParamsT, ResT> {}

export default class LiteHandler<ParamsT, ResT> extends LiteAutoBind implements IHandler<ParamsT, ResT> {
  // Идентификатор события, чтобы различать разные вызовы execute
  private eventId: number = 0;

  // В классе наследнике можно переопределить события
  // Событие для выполнения метода обработчика
  protected readonly requestEvent = new LiteEvent<RequestParams<ParamsT>>();
  // Событие для получения результата от метода обработчика
  protected readonly responseEvent = new LiteEvent<ResponseParams<ResT>>();

  public regiter(handler: (params: ParamsT) => ResT | Promise<ResT>): () => void {
    this.requestEvent.unsubscribeAll();
    const unsubscribe = this.requestEvent.on(async ({ params, eventId }) => {
      try {
        const result = await promisifyFn(handler)(params);
        this.responseEvent.emit({
          type: 'result',
          result,
          eventId,
        });
      } catch (err: any) {
        this.responseEvent.emit({
          type: 'error',
          name: err?.constructor.name ?? null,
          message: err?.message ?? 'Unknown Error',
          payload: err?.payload ?? null,
          eventId,
        });
      }
    });

    return unsubscribe;
  }

  public execute(params: ParamsT): Promise<ResT> {
    return new Promise((resolve, reject) => {
      const curEventId = this.eventId++;

      const onError = ({ name, message, payload, eventId }: ReceiveError) => {
        if (eventId !== curEventId) return;
        const err = new Error(message);
        err.name = name || '';
        (err as any).payload = payload;
        reject(err);
      };

      const onResult = ({ result, eventId }: ReceiveResult<ResT>) => {
        if (eventId !== curEventId) return;
        resolve(result);
      };

      const onResponse = (e: ResponseParams<ResT>) => {
        switch (e.type) {
          case 'result': {
            onResult(e);
            break;
          }
          case 'error': {
            onError(e);
            break;
          }
          default: {
            throw new Error('Lite handler unsupported response type');
          }
        }
      };

      this.responseEvent.on(onResponse);

      this.requestEvent.emit({
        params,
        eventId: curEventId,
      });
    });
  }
}
