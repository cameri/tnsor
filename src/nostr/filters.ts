import { EventId, Pubkey } from './base'
import { EventKinds } from './events'
import { Range } from '../types/base'

export interface BaseSubscriptionFilter {
  ids?: EventId[];
  kinds?: EventKinds[];
  since?: number;
  until?: number;
  authors?: Pubkey[];
  limit?: number;
}

export type SubscriptionFilter = BaseSubscriptionFilter & Partial<{
  [key: `#${string}`]: string[]
}>

export type SubscriptionFilters = Partial<{
  [index in Range<1, 100>]: SubscriptionFilter
}> & [SubscriptionFilter];
