import { LiteAutoBind } from '@/auto-bind';
import { ExcludeMatchingProperties } from '@/types';
import { LiteService } from './service';

export class LiteServiceContainer<PartialDepsT> extends LiteAutoBind {
  private readonly services: LiteService<PartialDepsT>[] = [];

  getService<DepsT extends PartialDepsT, ServiceT extends LiteService<DepsT>>(
    creator: new (props: ExcludeMatchingProperties<DepsT, typeof creator>) => ServiceT,
    deps: DepsT,
  ): ServiceT {
    let service = this.services.find((s) => s instanceof creator);
    if (!service) {
      service = new creator(deps);
      this.services.push(service);
    }
    return service as ServiceT;
  }
}
