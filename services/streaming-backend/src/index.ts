import type { AuthenticatedPeer, WebSocketEvent } from '@streaming/backend-shared/types'
import { Format, LogLevel, setGlobalFormat, setGlobalLogLevel, useLogg } from '@guiiai/logg'
import { appendResponseHeader, createApp, createRouter, defineEventHandler, defineWebSocketHandler } from 'h3'

import { handle } from './controllers/ws/v1/handler'
import { send } from './utils/websocket'

setGlobalFormat(Format.Pretty)
setGlobalLogLevel(LogLevel.Log)

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
  }))

  router.get('/health', defineEventHandler(async (event) => {
    appendResponseHeader(event, 'Connection', 'close')
    return { status: 'healthy' }
  }))

  return app
}

export const app = main()
