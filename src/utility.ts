export function promisifyFun<R, T extends any[]>(fn: (...args: T) => R | Promise<R>): (...args: T) => Promise<R> {
  return (...args: T) => {
    const valueOrPromise = fn(...args);
    if (valueOrPromise instanceof Promise) return valueOrPromise;
    return Promise.resolve(valueOrPromise);
  };
}

export async function wait(delay: number) {
  await new Promise((resolve) => setTimeout(resolve, delay));
}
