import type { WebSocketEvent } from '@audio-inference/backend-shared/types'
import type { Peer } from 'crossws'

export function send(peer: Peer, event: WebSocketEvent) {
  peer.send(JSON.stringify(event))
}
