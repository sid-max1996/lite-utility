import { LiteAutoBind } from './auto-bind';

type LiteCacheData<T> = {
  value: T;
  savedTime: number;
};

export class LiteCache<T> extends LiteAutoBind {
  constructor(
    private readonly _get: () => Promise<string | null>,
    private readonly _set: (value: string) => Promise<void>,
  ) {
    super();
  }

  async setCache(value: T): Promise<void> {
    const cache: LiteCacheData<T> = {
      value,
      savedTime: Date.now(),
    };
    await this._set(JSON.stringify(cache));
  }

  async getCache(maxDiffMs: number): Promise<T | null> {
    if (maxDiffMs < 0) throw new Error('Get cache negative maxDiffTime');
    const cache = await this._get();
    if (!cache) return null;
    const parsedCache: LiteCacheData<T> | null = JSON.parse(cache);
    if (typeof parsedCache?.savedTime === 'number') {
      const diffTimeMs = Date.now() - parsedCache.savedTime;
      if (diffTimeMs < maxDiffMs) {
        return parsedCache.value;
      }
    }
    return null;
  }

  async getCacheIgnoringMaxDiffMs(): Promise<T | null> {
    const cache = await this._get();
    if (!cache) return null;
    const parsedCache: LiteCacheData<T> | null = JSON.parse(cache);

    return parsedCache?.value || null;
  }
}
