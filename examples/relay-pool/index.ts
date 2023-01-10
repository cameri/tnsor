import { InboundMessage, IRelay, IRelayPool, MessageType, RelayPool } from 'nostr-ts-bot'

const me = '00000000827ffaa94bfea288c3dfce4422c794fbb96625b6b31e9049f729d700'
const addresses = [
  'wss://relay.damus.io',
  'wss://nostr-relay-dev.wlvs.space',
]

const relayPool: IRelayPool = new RelayPool(addresses)

const run = async () => {
  console.log('* connecting to', addresses)
  await relayPool.initialize()

  console.log('* subscribing to metadata from', me)
  relayPool.subscribe('metadata', [{ kinds: [0], authors: [me] }])

  console.log('* subscribing to text notes from', me)
  relayPool.subscribe('notes', [{ kinds: [1], authors: [me], limit: 5 }])

  relayPool.on('message', async (message: InboundMessage, relay: IRelay) => {
    if (message[0] === MessageType.EVENT) {
      console.log(message[1], '>', message[2].pubkey, message[2].content)
    } else if (message[0] === MessageType.EOSE) {
      console.log('* closing', message[1], 'subscription')
      relay.unsubscribe(message[1])

      if (message[1] === 'notes') {
        console.log('* disconnecting from relay', relay.address)
        await relay.shutdown()
      }
    }
  })
}

run().catch(console.error.bind(console))
