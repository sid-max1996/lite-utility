export function tryCatch<U, T extends any[]>(fn: (...args: T) => U, onCatch: (err: unknown) => U): (...args: T) => U;
export function tryCatch<U, T extends any[]>(
  fn: (...args: T) => U,
  onCatch: (err: unknown) => void | U,
): (...args: T) => U | void {
  return (...args: T) => {
    try {
      const res = fn(...args);
      if (res instanceof Promise) {
        return new Promise((resolve, reject) => {
          res.then(resolve).catch((err) => {
            try {
              (onCatch(err) as Promise<any>).then(resolve).catch(reject);
            } catch (err) {
              reject(err);
            }
          });
        }) as any;
      }
      return res;
    } catch (err: unknown) {
      return onCatch(err);
    }
  };
}

/*
const onCanceledSafe = noThrow(() => {
  onCanceled && onCanceled();
});
*/
export function noThrow<T extends any[]>(fn: (...args: T) => void): (...args: T) => void {
  return tryCatch(fn, () => {});
}

export function runNoThrow(fn: () => void): void {
  return noThrow(fn)();
}
