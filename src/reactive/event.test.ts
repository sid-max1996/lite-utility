import { afterEach, describe, expect, it, vi } from 'vitest';
import { LiteEvent } from '.';

const event = new LiteEvent<number>({
  quiet: true,
});

describe('lite-event', () => {
  afterEach(() => {
    event.unsubscribeAll();
  });

  it('subscribe, unsubscribe', () => {
    const mockFun = vi.fn();
    const unsubscribe = event.on(mockFun);
    event.emit(123);
    expect(mockFun).toHaveBeenCalledTimes(1);
    expect(mockFun).toBeCalledWith(123);
    event.emit(256);
    expect(mockFun).toHaveBeenCalledTimes(2);
    expect(mockFun).toBeCalledWith(256);

    unsubscribe();
    event.emit(666);
    expect(mockFun).toHaveBeenCalledTimes(2);

    event.on(mockFun);
    event.emit(777);
    expect(mockFun).toHaveBeenCalledTimes(3);
    expect(mockFun).toBeCalledWith(777);

    event.off(mockFun);
    event.emit(666);
    expect(mockFun).toHaveBeenCalledTimes(3);
  });

  it('once subscribe, unsubscribe', () => {
    const mockFun = vi.fn();
    event.once(mockFun);
    event.emit(123);
    expect(mockFun).toHaveBeenCalledTimes(1);
    expect(mockFun).toBeCalledWith(123);
    event.emit(256);
    expect(mockFun).toHaveBeenCalledTimes(1);

    event.once(mockFun);
    event.off(mockFun);
    event.emit(666);
    expect(mockFun).toHaveBeenCalledTimes(1);

    const unsubscribe = event.once(mockFun);
    unsubscribe();
    event.emit(666);
    expect(mockFun).toHaveBeenCalledTimes(1);
  });

  it('error in handler', () => {
    const mockFun1 = vi.fn(() => {
      throw new Error('Test');
    });
    const mockFun2 = vi.fn();

    event.on(mockFun1);
    event.on(mockFun2);

    event.emit(123);

    expect(mockFun1).toThrowError(Error);
    expect(mockFun2).toHaveBeenCalledTimes(1);
  });
});
