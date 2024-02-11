export function runFn<U, T extends any[]>(args: T, fn: (...args: T) => U): U {
  return fn(...args);
}
