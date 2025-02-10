import type { AuthenticatedPeer, WebSocketEvents } from '@streaming/backend-shared/types'
import { Buffer } from 'node:buffer'
import { env } from 'node:process'
import { ofetch } from 'ofetch'

export async function handleInputVoice(eventData: WebSocketEvents['input:voice'], peer: AuthenticatedPeer) {
  const baseUrl = env.VOICE_CHANGE_API_BASEURL ?? 'http://localhost:8081/api/v1'

  const audioFile = new File([new Blob([Buffer.from(eventData.audio, 'base64')], { type: 'audio/wav' })], 'audio.wav')
  const form = new FormData()
  form.append('audio', audioFile)
  form.append('userId', peer.userId)

  const res = await ofetch('/voice-change', { method: 'POST', baseURL: baseUrl, body: form, responseType: 'stream' })
  const reader = res.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done)
      break

    const buffer = Buffer.from(value)
    peer.peer.send(buffer)
  }
}
