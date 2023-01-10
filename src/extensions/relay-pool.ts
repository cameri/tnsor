import { debug as createLogger } from 'debug'
import { EventEmitter } from 'stream'

import { IRelay, IRelayPool } from '../types/relay'
import { InboundMessage } from '../nostr/messages'
import { ISubscription } from '../types/subscription'
import { Relay } from './relay'
import { SubscriptionFilters } from '../nostr/filters'

const debug = createLogger('relay-pool')

export class RelayPool extends EventEmitter implements IRelayPool {
  private initialized = false
  private relays: Map<string, IRelay> = new Map()

  public constructor(addresses: string[]) {
    super()

    debug('new relay pool', addresses)

    for (const address of addresses) {
      if (this.relays.has(address)) {
        continue
      }
      this.relays.set(address, this.createRelay(address))
    }
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      debug('initialization failed: already initialized')
      return
    }

    debug('initializing')

    for (const [, relay] of this.relays) {
      await relay.initialize()
    }

    debug('initialized')

    this.initialized = true
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) {
      debug('shutdown failed: not initialized')
      return
    }

    debug('shutting down')

    for (const relay of this.relays.values()) {
      await relay.shutdown()
    }

    this.removeAllListeners()
  }

  public async subscribe(
    subscriptionId: string,
    filters: SubscriptionFilters,
    address?: string,
  ): Promise<ISubscription[]> {
    if (!this.initialized) {
      debug('subscription failed: not initialized', subscriptionId)
      return []
    }
    if (typeof address === 'string') {
      const relay = this.relays.get(address)
      if (!relay) {
        debug('subscription failed: relay not found', address)
        return []
      }

      debug('subscribing over single relay', address)
      return [await relay.subscribe(subscriptionId, filters)]
    } else {
      debug('subscribing over all relays', this.relays.keys())

      return Promise.all(
        Array.from(this.relays.values())
          .map(async (relay) => relay.subscribe(subscriptionId, filters))
      )
    }
  }

  public async addRelay(address: string): Promise<IRelay> {
    if (this.relays.has(address)) {
      debug('adding relay skipped: already exists', address)
      return this.relays.get(address)
    }

    debug('adding relay', address)

    const relay = this.createRelay(address)
    this.relays.set(address, relay)

    if (this.initialized) {
      await relay.initialize()
    }

    return relay
  }

  public async removeRelay(address: string): Promise<void> {
    if (!this.relays.has(address)) {
      debug('removing relay failed: not found', address)
      return
    }

    debug('removing relay', address)

    return this.relays.get(address).shutdown()
  }

  private onMessage(message: InboundMessage, relay: IRelay) {
    debug('received', message)
    this.emit('message', message, relay)
  }

  private createRelay(address: string) {
    debug('creating relay', address)
    return new Relay(address)
      .on('message', (message, relay) => this.onMessage(message, relay))
  }
}
