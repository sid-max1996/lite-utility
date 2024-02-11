import { LiteEvent } from '@/reactive/event';
import { LiteCanceledError } from './canceled-error';

export class LiteCancellationToken {
  private canceled = false;
  public readonly onCanceled = new LiteEvent<void>();

  public get isCanceled(): boolean {
    return this.canceled;
  }

  public cancel(): void {
    this.canceled = true;
    this.onCanceled.emit();
  }

  public throwIfCanceled(): void {
    if (this.canceled) {
      throw new LiteCanceledError();
    }
  }
}
