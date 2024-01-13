export * from './pipe';

export function wrapTryCatch<U, T extends any[]>(
  fn: (...args: T) => U,
  onCatch: (err: unknown) => U,
): (...args: T) => U;
export function wrapTryCatch<T extends any[], U>(
  fn: (...args: T) => U,
  onCatch: (err: unknown) => void | U,
): (...args: T) => U | void {
  return (...args: T) => {
    try {
      return fn(...args);
    } catch (err: unknown) {
      return onCatch(err);
    }
  };
}

export function runFun<U, T extends any[]>(args: T, fn: (...args: T) => U): U {
  return fn(...args);
}

// runFun(
//   [1],
//   wrapTryCatch(
//     createPipeFun((a: number) => {
//       return 5 + a;
//     }),
//     (err) => {
//       console.log(err);
//       throw err;
//     }
//   )
// );
