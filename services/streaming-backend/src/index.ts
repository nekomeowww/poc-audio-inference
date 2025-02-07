import type { AuthenticatedPeer, WebSocketEvent } from '@streaming/backend-shared/types'
import type { Peer } from 'crossws'
import { Format, LogLevel, setGlobalFormat, setGlobalLogLevel, useLogg } from '@guiiai/logg'
import { createApp, createRouter, defineWebSocketHandler } from 'h3'

setGlobalFormat(Format.Pretty)
setGlobalLogLevel(LogLevel.Log)

function send(peer: Peer, event: WebSocketEvent) {
  peer.send(JSON.stringify(event))
}

function main() {
  const appLogger = useLogg('App').useGlobalConfig()
  const websocketLogger = useLogg('WebSocket').useGlobalConfig()

  const app = createApp({
    onError: error => appLogger.withError(error).error('an error occurred'),
  })

  const router = createRouter()
  app.use(router)

  const peers = new Map<string, AuthenticatedPeer>()

  router.get('/ws', defineWebSocketHandler({
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

      // TODO: implement
    },
    error: (peer, error) => {
      websocketLogger.withFields({ peer: peer.id }).withError(error).error('an error occurred')
    },
    close: (peer, details) => {
      websocketLogger.withFields({ peer: peer.id, details, activePeers: peers.size }).log('closed')
      peers.delete(peer.id)
    },
  }))

  return app
}

export const app = main()
