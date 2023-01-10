export interface IApplication {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}