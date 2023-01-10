import { EventId, SubscriptionId } from './base'
import { Event } from './events'
import { Range } from '../types/base'
import { SubscriptionFilter } from './filters'

export enum MessageType {
  REQ = 'REQ',
  EVENT = 'EVENT',
  CLOSE = 'CLOSE',
  NOTICE = 'NOTICE',
  EOSE = 'EOSE',
  OK = 'OK'
}

/**
 * Outbound Messages
 */
export type OutboundMessage =
  | SubscribeMessage
  | OutboundEventMessage
  | UnsubscribeMessage

export type SubscribeMessage = Partial<{
  [index in Range<2, 100>]: SubscriptionFilter
}> & {
  0: MessageType.REQ,
  1: SubscriptionId
}
export type OutboundEventMessage = [MessageType.EVENT, Event]
export type UnsubscribeMessage = [MessageType.CLOSE, SubscriptionId]

/**
 * Inbound Messages
 */
export type InboundMessage =
  | EventMessage
  | EndOfStoredEventsNoticeMessage
  | NoticeMessage
  | CommandResultMessage

export type EventMessage = [MessageType.EVENT, SubscriptionId, Event]
export type EndOfStoredEventsNoticeMessage = [MessageType.EOSE, SubscriptionId]
export type NoticeMessage = [MessageType.NOTICE, string]
export type CommandResultMessage = [MessageType.OK, EventId, boolean, string]
