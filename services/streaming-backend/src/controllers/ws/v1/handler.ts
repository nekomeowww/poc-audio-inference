import type { AuthenticatedPeer, WebSocketEvent } from '@audio-inference/backend-shared/types'
import { handleInputModelPreload } from './event-input-model-preload'
import { handleInputVoice } from './event-input-voice'

export async function handle(event: WebSocketEvent, peer: AuthenticatedPeer) {
  switch (event.type) {
    case 'input:voice':
      return await handleInputVoice(event.data, peer)
    case 'input:model-preload':
      return await handleInputModelPreload(event.data, peer)
  }
}
