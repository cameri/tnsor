import { IInitializable } from './base'
import { InboundMessage } from '../nostr/messages'
import { ISubscription } from './subscription'
import { SubscriptionFilters } from '../nostr/filters'
import { SubscriptionId } from '../nostr/base'

export interface IRelayPool extends IInitializable {
  subscribe(subscriptionId: SubscriptionId, filters: SubscriptionFilters, relay?: string): Promise<ISubscription[]>;
  addRelay(address: string): Promise<IRelay>;

  on(event: 'message', listener: (message: InboundMessage, relay: IRelay) => void): IRelayPool;
}

export interface IRelay extends IInitializable {
  get address(): string;
  subscribe(subscriptionId: SubscriptionId, filters: SubscriptionFilters): Promise<ISubscription>;
  unsubscribe(subscriptionId: SubscriptionId): Promise<void>;

  on(event: 'message', listener: (message: InboundMessage, relay: IRelay) => void): IRelay;
}
