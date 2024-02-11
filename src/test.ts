export function checkThrowError<T>(fn: () => T): T extends Promise<any> ? Promise<boolean> : boolean;
export function checkThrowError(fn: () => void): boolean | Promise<boolean> {
  try {
    const res: any = fn();
    if (res instanceof Promise) {
      return new Promise((resolve) => {
        res.then(() => resolve(false)).catch(() => resolve(true));
      }) as any;
    }
  } catch (err) {
    return true;
  }

  return false;
}
