import { ClientOptions, OPEN, RawData, WebSocket } from 'ws'
import { debug as createLogger } from 'debug'
import { EventEmitter } from 'stream'

import { InboundMessage, MessageType, OutboundMessage, SubscribeMessage, UnsubscribeMessage } from '../nostr/messages'
import { IRelay } from '../types/relay'
import { OneShotTimer } from '../utils/timer'
import { promisifyEvents } from '../utils/promisify-events'
import { Subscription } from './subscription'
import { SubscriptionFilters } from '../nostr/filters'
import { SubscriptionId } from '../nostr/base'

const debug = createLogger('relay')

const MAX_CONNECTION_ATTEMPTS = 120
const RETRY_BACKOFF_BASE_MS = 1000
const RETRY_MAX_BACKOFF_DELAY_MS = 30000
const CONNECTION_TIMEOUT_MS = 5000
const SESSION_TIMEOUT = 30000

export class Relay extends EventEmitter implements IRelay {
  private _address: string
  private websocket: WebSocket | undefined
  private initialized = false
  private timer: OneShotTimer


  public constructor(
    address: string
  ) {
    super()

    this._address = address

    this.onMessage = this.onMessage.bind(this)
    this.onPing = this.onPing.bind(this)
    this.onClose = this.onClose.bind(this)
    this.onSessionTimeout = this.onSessionTimeout.bind(this)

    this.timer = new OneShotTimer(this.onSessionTimeout, () => SESSION_TIMEOUT)
  }

  public get address(): string {
    return this._address
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      debug('initialization failed: already initialized', this.address)

      return
    }

    debug('initializing', this.address)

    try {
      await this.connect(MAX_CONNECTION_ATTEMPTS)

      debug('initialized', this.address)

      this.initialized = true
    } catch (error) {
      debug('initialization failed', error)

      throw error
    }
  }

  private async connect(retries: number): Promise<void> {
    if (this.websocket) {
      debug('terminating existing connection', this.address)
      this.websocket.terminate()
    }

    debug('connection attempt', retries, this.address)

    try {
      const handshakeTimeout = (process.env.CONNECTION_TIMEOUT)
        ? Number(process.env.CONNECTION_TIMEOUT)
        : 5000

      const options: ClientOptions = { handshakeTimeout }

      this.websocket = new WebSocket(this.address, options)

      await this.waitUntilConnected()

      this.websocket
        .on('message', (data: RawData) => this.onMessage(data))
        .on('close', (code: number, reason: Buffer) => this.onClose(code, reason))
        .on('ping', (data: Buffer) => this.onPing(data))

    } catch (error) {
      if (retries > 0) {
        const delay = Math.min(
          RETRY_MAX_BACKOFF_DELAY_MS,
          2 ** (MAX_CONNECTION_ATTEMPTS - retries) * RETRY_BACKOFF_BASE_MS,
        )

        debug(`connection attempt failed: retrying in ${delay} milliseconds`, this.address, error)

        return new Promise<void>((resolve, reject) => {
          setTimeout(async () => {
            this.connect(retries -  1).then(resolve).catch(reject)
          }, delay)
        })
      } else {
        debug('connection attempt failed: exceeded max number of attempts', this.address)
        throw error
      }
    }
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) {
      debug('shutdown failed: not initialized', this.address)
      return
    }

    debug('shutting down', this.address)

    this.websocket.close()
  }

  public async subscribe(subscriptionId: SubscriptionId, filters: SubscriptionFilters): Promise<Subscription> {
    if (!this.initialized) {
      debug('subscription failed: not initialized', this.address)
      return
    }

    debug('subscribing', this.address, subscriptionId, filters)

    await this.send(Relay.createSubscribeMessage(subscriptionId, filters))

    return new Subscription(this, subscriptionId, filters)
  }

  public async unsubscribe(subscriptionId: string): Promise<void> {
    debug('unsubscribing', this.address, subscriptionId)
    return this.send(Relay.createUnsubscribeMessage(subscriptionId))
  }

  private async send(message: OutboundMessage): Promise<void> {
    if (this.websocket.readyState !== OPEN) {
      debug('sending failed: connection not open', this.address)
      return
    }

    debug('send', this.address, message)

    return new Promise<void>((resolve, reject) => {
      this.websocket.send(JSON.stringify(message), (err) => {
        if (err) {
          reject(err)
          return
        }

        resolve()
      })
    })
  }

  private async waitUntilConnected() {
    return promisifyEvents(['open'], ['error'], CONNECTION_TIMEOUT_MS)(this.websocket)
  }

  private static createSubscribeMessage(
    subscriptionId: SubscriptionId,
    filters: SubscriptionFilters,
  ): SubscribeMessage {
    return [MessageType.REQ, subscriptionId, ...filters]
  }

  private static createUnsubscribeMessage(subscriptionId: SubscriptionId): UnsubscribeMessage {
    return [MessageType.CLOSE, subscriptionId]
  }

  private onMessage(raw: RawData) {
    this.timer.restart()

    try {
      const message: InboundMessage = JSON.parse(raw.toString('utf8'))
      debug('received from', this.address, message)

      this.emit('message', message, this)
    } catch (error) {
      this.emit('error', error, this)
    }
  }

  private onClose(code: number, reason: Buffer) {
    debug('disconnected', this.address, code, reason.toString('utf8'))

    this.timer.stop()
  }

  private onSessionTimeout() {
    debug.extend('heartbeat')('ping timed out', this.address)
    this.websocket.terminate()
  }

  private onPing(data: Buffer) {
    debug.extend('heartbeat')('ping', data.toString('utf8'), this.address)

    this.timer.restart()
  }
}
