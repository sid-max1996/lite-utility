export type RangeTimes = Record<number, number>;

export function getMsTimeFromRangeTimes(timeMs: number | RangeTimes, nextRunCount: number): number {
  let timeout = null;
  if (typeof timeMs === 'number') {
    timeout = timeMs;
  }
  if (typeof timeMs === 'object') {
    const keys = Object.keys(timeMs)
      .map((key) => Number(key))
      .sort();
    for (const maxRunCount of keys) {
      if (typeof maxRunCount !== 'number') {
        throw new Error('Lite timer bad timeout object key ' + maxRunCount);
      }
      if (nextRunCount <= maxRunCount) {
        const nextTimeout = timeMs[maxRunCount];
        if (typeof nextTimeout !== 'number') {
          throw new Error('Lite timer bad next timeout ' + nextTimeout);
        }
        timeout = nextTimeout;
        break;
      }
    }
  }
  if (typeof timeout !== 'number') {
    throw new Error('Lite timer timeout not a number ' + timeout);
  }
  return timeout;
}
