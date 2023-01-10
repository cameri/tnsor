import { InboundMessage, IRelay, MessageType, Relay } from 'nostr-ts-bot'

const me = '00000000827ffaa94bfea288c3dfce4422c794fbb96625b6b31e9049f729d700'
const address = 'wss://nostr-relay-dev.wlvs.space'

const relay: IRelay = new Relay(address)

const run = async () => {
  console.log('* connecting to', address)
  await relay.initialize()
  console.log('* connected to', address)

  console.log('* subscribing to metadata from', me)
  relay.subscribe('metadata', [{ kinds: [0], authors: [me] }])

  console.log('* subscribing to text notes from', me)
  relay.subscribe('notes', [{ kinds: [1], authors: [me], limit: 5 }])

  relay.on('message', async (message: InboundMessage) => {

    if (message[0] === MessageType.EVENT) {
      console.log(message[1], '>', message[2].pubkey, message[2].content)
    } else if (message[0] === MessageType.EOSE) {
      console.log('* closing', message[1], 'subscription')

      relay.unsubscribe(message[1])

      if (message[1] === 'notes') {
        console.log('* disconnecting from relay')
        await relay.shutdown()
      }
    }
  })
}

run().catch(console.error.bind(console))
