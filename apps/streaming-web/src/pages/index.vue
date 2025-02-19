<script setup lang="ts">
import { nanoid } from 'nanoid'
import { useUserMedia, useWebSocket } from '@vueuse/core'
import { ref, computed, watch, toRef, onUnmounted } from 'vue'
import type { WebSocketEvent } from '@audio-inference/backend-shared/types'

import { blobToArrayBuffer, blobToDataURL, arrayBufferToBase64 } from '../utils/binary'
import AudioAnalyser from '../components/AudioAnalyser.vue'
import AudioVisualizerBars from '../components/AudioVisualizerBars.vue'

const ready = ref(false)
const toggle = ref(false)
const selectedAudioInput = ref<ConstrainDOMString>()
const windowLocation = toRef(() => window.location)

// Recording
const mediaRecorder = ref<MediaRecorder | null>(null)
const audioChunks = ref<BlobPart[]>([])
// Playing
const audioContext = ref<AudioContext | null>(null)
const audioQueue = ref<AudioBuffer[]>([])
const isPlaying = ref(false)

// TODO: debugging purposes only, remove in production
const previewAudioFiles = ref<string[]>([])

const constraints = computed(() => ({ audio: { deviceId: selectedAudioInput.value } }))
const backend = computed(() => new URL('/ws', windowLocation.value.href.replace('http', 'ws')).href)
const { stream, stop, start } = useUserMedia({ constraints, autoSwitch: true })
const { status, send } = useWebSocket(
  backend,
  {
    autoConnect: true,
    autoReconnect: true,
    immediate: true,
    onConnected: (ws) => {
      ws.send(JSON.stringify({ type: 'module:authenticate', data: { userId: nanoid() } } satisfies WebSocketEvent))
    },
    onMessage: (_ws, event) => {
      if (event.data instanceof Blob) {
        handleBlobMessage(event.data)
        return
      }
      if (typeof event.data === 'string') {
        // try with JSON
        try {
          const data = JSON.parse(event.data)
          handleJSONMessage(data as WebSocketEvent)
          return
        } catch (error) {
          handleTextMessage(event.data)
          return
        }
      }

      console.error('Unknown WebSocket message:', event.data)
    }
  },
)

/**
 * Handle incoming Blob messages from the WebSocket
 *
 * @param data Blob
 */
async function handleBlobMessage(data: Blob) {
  try {
    const arrayBuffer = await data.arrayBuffer()
    const audio = await audioContext.value?.decodeAudioData(arrayBuffer)

    if (audio) {
      audioQueue.value.push(audio)
      if (!isPlaying.value) {
        playNextInQueue()
      }
    }
  } catch (error) {
    console.error('Error processing audio:', error)
  }
}

async function handleJSONMessage(data: WebSocketEvent) {
  switch (data.type) {
    case 'module:authenticated':
      // TODO: Model: test is test model, remove in production
      send(JSON.stringify({ type: 'input:model-preload', data: { model: 'test' } } satisfies WebSocketEvent))
      break
    case 'output:model-loaded':
      ready.value = true
      break
  }
}

async function handleTextMessage(data: string) {
  console.log('WebSocket message:', data)
}

/**
 * Start recording audio from the MediaStream
 *
 * @param mediaStream MediaStream
 */
function startRecording(mediaStream: MediaStream) {
  audioChunks.value = []
  mediaRecorder.value = new MediaRecorder(mediaStream)

  mediaRecorder.value.ondataavailable = (event) => {
    if (event.data.size > 0) {
      audioChunks.value.push(event.data)
    }
  }

  mediaRecorder.value.start()
}

/**
 * Stop recording audio and return the Blob
 *
 * @returns Promise<Blob>
 */
function stopRecording(): Promise<Blob> {
  return new Promise((resolve) => {
    if (!mediaRecorder.value) return

    mediaRecorder.value.onstop = () => { resolve(new Blob(audioChunks.value, { type: 'audio/wav' })) }
    mediaRecorder.value.stop()
  })
}

/**
 * Play the next audio buffer in the queue
 */
async function playNextInQueue() {
  if (!audioContext.value || audioQueue.value.length === 0) {
    isPlaying.value = false
    return
  }

  isPlaying.value = true
  const audioBuffer = audioQueue.value.shift()

  if (!audioBuffer) return

  const source = audioContext.value.createBufferSource()
  source.buffer = audioBuffer
  source.connect(audioContext.value.destination)

  source.onended = () => {
    playNextInQueue()
  }

  source.start(0)
}

function handleToggle() {
  if (!toggle.value && !ready.value) return
  toggle.value = !toggle.value
}

watch(toggle, async (value) => {
  if (value) {
    if (!audioContext.value) {
      audioContext.value = new AudioContext()
    }

    await start()
    if (stream.value) {
      startRecording(stream.value)
    }
  } else {
    if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
      const audioBlob = await stopRecording()
      const arrayBuffer = await blobToArrayBuffer(audioBlob)
      console.log('Recording stopped, ArrayBuffer:',)

      // TODO: debugging purposes only, remove in production
      previewAudioFiles.value.push(await blobToDataURL(audioBlob))
      send(JSON.stringify({ type: 'input:voice', data: { audio: arrayBufferToBase64(arrayBuffer) } } satisfies WebSocketEvent))
    }

    stop()
  }
})

watch(status, (value) => {
  console.log('WebSocket status:', value)
})

onUnmounted(() => {
  audioContext.value?.close()
})
</script>

<template>
  <div p-4 h-full max-h="[calc(100vh-24px-16px)]">
    <h1 flex justify-center>Audio Streaming</h1>
    <div v-if="!ready" flex items-center justify-center h-full flex-col gap-4>
      <div i-svg-spinners:pulse-3 text="[60px]" />
      <div>
        <span>Loading models...</span>
      </div>
    </div>
    <div v-else flex h-full flex-col gap-6>
      <div h-full w-full items-center justify-end flex flex-col>
        <div flex-1 h-full flex items-center justify-center>
          <AudioAnalyser :stream="stream" :bars="24" v-slot="{ frequencies }">
            <AudioVisualizerBars :frequencies="frequencies" h-20 :bars-class="'bg-black dark:bg-white'" opacity-50 />
          </AudioAnalyser>
        </div>
        <button rounded-full p-4
          bg="gray/10 dark:white/20 hover:gray/20 dark:hover:white/30 active:gray/30 dark:active:white/20"
          transition="all 500 ease-in-out" outline="3 solid offset-4" @click="handleToggle" :class="[
            toggle ? 'outline-green-600 dark:outline-green-400' : 'outline-red-500/50 dark:outline-red-500/50',
          ]">
          <div i-solar:microphone-large-bold-duotone text="[40px]" />
        </button>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: default
</route>
