import type { AuthenticatedPeer, WebSocketEvent } from '@audio-inference/backend-shared/types'
import type { InputLayer } from 'h3'
import { useLogg } from '@guiiai/logg'
import { defineWebSocketHandler } from 'h3'
import { send } from '../../utils/websocket'
import { handle } from './v1/handler'

const peers = new Map<string, AuthenticatedPeer>()
const websocketLogger = useLogg('WebSocket').useGlobalConfig()

export const websocket = {
  route: '/ws',
  handler: defineWebSocketHandler({
    open: (peer) => {
      peers.set(peer.id, { peer, authenticated: false })
      websocketLogger.withFields({ peer: peer.id, activePeers: peers.size }).log('connected')
    },
    message: (peer, message) => {
      const event = message.json() as WebSocketEvent

      // Authenticate
      switch (event.type) {
        case 'module:authenticate':
          if (!event.data.userId) {
            websocketLogger.withFields({ peer: peer.id }).debug('missing userId')
            send(peer, { type: 'error', data: { message: 'missing userId' } })
            return
          }

          send(peer, { type: 'module:authenticated', data: { authenticated: true } })
          peers.set(peer.id, { peer, authenticated: true, userId: event.data.userId })
          return
      }
      // Guard
      if (!peers.get(peer.id)?.authenticated) {
        websocketLogger.withFields({ peer: peer.id }).debug('not authenticated')
        send(peer, { type: 'error', data: { message: 'not authenticated' } })
      }

      try {
        handle(event, peers.get(peer.id)!)
      }
      catch (error) {
        websocketLogger.withFields({ peer: peer.id }).withError(error).error('an error occurred')
        send(peer, { type: 'error', data: { message: 'An error occurred' } })
      }
    },
    error: (peer, error) => {
      websocketLogger.withFields({ peer: peer.id }).withError(error).error('an error occurred')
    },
    close: (peer, details) => {
      websocketLogger.withFields({ peer: peer.id, details, activePeers: peers.size }).log('closed')
      peers.delete(peer.id)
    },
  }),
} satisfies InputLayer
