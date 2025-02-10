import type { AuthenticatedPeer, WebSocketEvents } from '@streaming/backend-shared/types'
import { env } from 'node:process'
import { ofetch } from 'ofetch'
import { send } from '../../../utils/websocket'

export async function handleInputModelPreload(data: WebSocketEvents['input:model-preload'], peer: AuthenticatedPeer) {
  const baseUrl = env.VOICE_CHANGE_API_BASEURL ?? 'http://localhost:8081/api/v1'
  const res = await ofetch<{ message: string }>('/voice-change/model', { method: 'POST', baseURL: baseUrl, body: {} })
  if (res.message !== 'Ok') {
    throw new Error('Failed to preload model')
  }

  send(peer.peer, { type: 'output:model-loaded', data: { model: data.model } })
}
