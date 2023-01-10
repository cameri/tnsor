import { IRelay } from '../types/relay'
import { ISubscription } from '../types/subscription'
import { SubscriptionFilters } from '../nostr/filters'

export class Subscription implements ISubscription {
  private relayRef: WeakRef<IRelay>

  public constructor(
    relay: IRelay,
    public readonly subscriptionId: string,
    public readonly filters: SubscriptionFilters
  ) {
    this.relayRef = new WeakRef(relay)
  }

  public getRelay(): IRelay | undefined {
    return this.relayRef.deref()
  }

  public async unsubscribe(): Promise<void> {
    await this.getRelay()?.unsubscribe(this.subscriptionId)
  }
}