export interface ISetMetadataRequest {
  name?: string;
  about?: string;
  picture?: string;
}

export interface TextNote {
  content: string;
}

export type TagName = string

export type TagValue = string

interface BaseTag {
  0: TagName
  1: TagValue
}

export type Tag = BaseTag & { [index: number]: string }

export interface IOptions {
  minLeadingZeroes?: number
}

export interface ICommandResult {
  succesful: boolean;
  reason: string;
}

export interface PartialEvent {
  kind: number
  created_at?: number
  tags?: Tag[]
  content: string
}

export interface IBotConfig {
  privateKey: string
  relays: string[]
}

export interface IBot {
  // sendSignedEvent(event: Event): Promise<ICommandResult>;
  sendUnsignedEvent(event: Omit<Event, 'sig'>): Promise<ICommandResult>;
  // sendEvent(event: PartialEvent): Promise<ICommandResult>;
  // sendPost(input: TextNote, options?: IOptions): Promise<ICommandResult>;
  // setMetadata(metadata: ISetMetadataRequest, options?: IOptions): Promise<ICommandResult>;
}
