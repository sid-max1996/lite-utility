import { afterEach, describe, expect, it, vi } from 'vitest';
import { LiteEventEmitter } from './emitter';

const eventEmitter = new LiteEventEmitter<{
  a: number;
}>({ quiet: true });

describe('lite-event-emitter', () => {
  afterEach(() => {
    eventEmitter.unsubscribeAll();
  });

  it('subscribe, unsubscribe', () => {
    const mockFun = vi.fn();
    const unsubscribe = eventEmitter.on('a', mockFun);
    eventEmitter.emit('a', 123);
    expect(mockFun).toHaveBeenCalledTimes(1);
    expect(mockFun).toBeCalledWith(123);
    eventEmitter.emit('a', 256);
    expect(mockFun).toHaveBeenCalledTimes(2);
    expect(mockFun).toBeCalledWith(256);

    unsubscribe();
    eventEmitter.emit('a', 666);
    expect(mockFun).toHaveBeenCalledTimes(2);

    eventEmitter.on('a', mockFun);
    eventEmitter.emit('a', 777);
    expect(mockFun).toHaveBeenCalledTimes(3);
    expect(mockFun).toBeCalledWith(777);

    eventEmitter.off('a', mockFun);
    eventEmitter.emit('a', 666);
    expect(mockFun).toHaveBeenCalledTimes(3);
  });

  it('once subscribe, unsubscribe', () => {
    const mockFun = vi.fn();
    eventEmitter.once('a', mockFun);
    eventEmitter.emit('a', 123);
    expect(mockFun).toHaveBeenCalledTimes(1);
    expect(mockFun).toBeCalledWith(123);
    eventEmitter.emit('a', 256);
    expect(mockFun).toHaveBeenCalledTimes(1);

    eventEmitter.once('a', mockFun);
    eventEmitter.off('a', mockFun);
    eventEmitter.emit('a', 666);
    expect(mockFun).toHaveBeenCalledTimes(1);

    const unsubscribe = eventEmitter.once('a', mockFun);
    unsubscribe();
    eventEmitter.emit('a', 666);
    expect(mockFun).toHaveBeenCalledTimes(1);
  });

  it('error in handler', () => {
    const mockFun1 = vi.fn(() => {
      throw new Error('Test');
    });
    const mockFun2 = vi.fn();

    eventEmitter.on('a', mockFun1);
    eventEmitter.on('a', mockFun2);

    eventEmitter.emit('a', 123);

    expect(mockFun1).toThrowError(Error);
    expect(mockFun2).toHaveBeenCalledTimes(1);
  });
});
