import type { WebSocketEvent } from '@streaming/backend-shared/types'
import type { Peer } from 'crossws'

export function send(peer: Peer, event: WebSocketEvent) {
  peer.send(JSON.stringify(event))
}
