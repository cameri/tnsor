import { IBot } from '../types/bot'
import { IInitializable } from '../types/base'


export class Application implements IInitializable {
  public constructor(
    private readonly bot: IBot & IInitializable
  ) {}

  public async initialize(): Promise<void> {
    await this.bot.initialize()
  }

  public async shutdown(): Promise<void> {
    this.bot.shutdown()
  }
}