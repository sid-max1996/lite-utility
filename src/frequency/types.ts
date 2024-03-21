type Executed<T> = { type: 'executed'; value: T; prevValue?: T };
type Canceled<T> = { type: 'canceled'; prevValue?: T };
export type Cancelable<T> = Executed<T> | Canceled<T>;

export type CreateParams = {
  memoLastResult?: boolean;
  returnTeardownTuple?: boolean;
};

export type ResultFunction<ResT, ArgsT extends any[]> = (...args: ArgsT) => Promise<Cancelable<Awaited<ResT>>>;
export type TeardownTuple<ResT, ArgsT extends any[]> = [ResultFunction<ResT, ArgsT>, () => void];
