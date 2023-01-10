import { EventId, Pubkey, Tag } from './base'

export type UnsignedEvent = Omit<Event, 'sig'>;

export type UnidentifiedEvent = Omit<UnsignedEvent, 'id'>;

export interface Event {
  id: EventId
  pubkey: Pubkey
  created_at: number
  kind: EventKinds | number
  tags: Tag[]
  sig: string
  content: string
}

export enum EventKinds {
  SET_METADATA = 0,
  TEXT_NOTE = 1,
  RECOMMEND_SERVER = 2,
  CONTACT_LIST = 3,
  ENCRYPTED_DIRECT_MESSAGE = 4,
  DELETE = 5,
  REPOST = 6,
  REACTION = 7,
  // Channels
  CHANNEL_CREATION = 40,
  CHANNEL_METADATA = 41,
  CHANNEL_MESSAGE = 42,
  CHANNEL_HIDE_MESSAGE = 43,
  CHANNEL_MUTE_USER = 44,
  CHANNEL_RESERVED_FIRST = 45,
  CHANNEL_RESERVED_LAST = 49,
  // Replaceable events
  REPLACEABLE_FIRST = 10000,
  REPLACEABLE_LAST = 19999,
  // Ephemeral events
  EPHEMERAL_FIRST = 20000,
  EPHEMERAL_LAST = 29999,
  // Parameterized replaceable events
  PARAMETERIZED_REPLACEABLE_FIRST = 30000,
  PARAMETERIZED_REPLACEABLE_LAST = 39999,
}
