export function promisifyFn<R, T extends any[]>(fn: (...args: T) => R | Promise<R>): (...args: T) => Promise<R> {
  return (...args: T) => {
    const valueOrPromise = fn(...args);
    if (valueOrPromise instanceof Promise) return valueOrPromise;
    return Promise.resolve(valueOrPromise);
  };
}

export async function wait(delay: number) {
  await new Promise((resolve) => setTimeout(resolve, delay));
}

export function getterAndSetter<T>(initValue: T) {
  let value = initValue;

  function getValue() {
    return value;
  }

  function setValue(newValue: T) {
    value = newValue;
  }

  return [getValue, setValue];
}
