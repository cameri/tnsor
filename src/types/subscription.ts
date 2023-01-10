import { IRelay } from './relay'

export interface ISubscription {
  unsubscribe(): Promise<void>;
  getRelay(): IRelay | undefined;
}
