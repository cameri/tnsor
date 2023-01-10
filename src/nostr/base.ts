export type EventId = string
export type Pubkey = string
export type TagName = string
export type Signature = string
export type Tag = TagBase & string[]

export interface TagBase {
  0: TagName
  [index: number]: string
}

export type SubscriptionId = string
