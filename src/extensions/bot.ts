import { IBot, IBotConfig, ICommandResult, IOptions, ISetMetadataRequest, PartialEvent, TextNote } from '../types/bot'
import { IInitializable } from '../types/base'
import { IRelayPool } from '../types'
import { RelayPool } from './relay-pool'

export class Bot implements IBot, IInitializable {
  private relayPool: IRelayPool
  private initialized = false

  public constructor(
    private readonly config: IBotConfig
  ) {
    this.relayPool = new RelayPool(this.config.relays)
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    this.initialized = true
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) {
      return
    }

    await this.relayPool.shutdown()

    this.initialized = false
  }

  public async sendSignedEvent(_event: Event): Promise<ICommandResult> {
    throw new Error('Method not implemented.')
  }

  public async sendUnsignedEvent(_event: Omit<Event, 'sig'>): Promise<ICommandResult> {
    throw new Error('Method not implemented.')
  }

  public async sendEvent(_event: PartialEvent): Promise<ICommandResult> {
    throw new Error('Method not implemented.')
  }

  public async sendPost(_input: TextNote, _options?: IOptions): Promise<ICommandResult> {
    throw new Error('Method not implemented.')
  }

  public async setMetadata(_metadata: ISetMetadataRequest, _options?: IOptions): Promise<ICommandResult> {
    throw new Error('Method not implemented.')
  }
}