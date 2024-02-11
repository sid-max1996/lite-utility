import { LiteAutoBind } from '@/auto-bind';

export abstract class LiteService<DepsT> extends LiteAutoBind {
  constructor(protected readonly deps: DepsT) {
    super();
  }
}
