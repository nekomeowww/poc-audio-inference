<script setup lang="ts">
import { nanoid } from 'nanoid'
import { useUserMedia, useWebSocket } from '@vueuse/core'
import { ref, computed, watch, toRef } from 'vue'
import type { WebSocketEvent } from '@streaming/backend-shared/types'

import AudioAnalyser from '../components/AudioAnalyser.vue'
import AudioVisualizerBars from '../components/AudioVisualizerBars.vue'

const selectedAudioInput = ref<ConstrainDOMString>()
const constraints = computed(() => ({ audio: { deviceId: selectedAudioInput.value } }))
const { stream, stop, start } = useUserMedia({ constraints, autoSwitch: true })
const toggle = ref(false)
const windowLocation = toRef(() => window.location)
const backend = computed(() => {
  const newHref = windowLocation.value.href.replace('http', 'ws')
  return new URL('/ws', newHref).href
})
const { status } = useWebSocket(
  backend,
  {
    autoConnect: true,
    autoReconnect: true,
    immediate: true,
    onConnected: (ws) => {
      ws.send(JSON.stringify({ type: 'module:authenticate', data: { userId: nanoid() } } satisfies WebSocketEvent))
    },
    onMessage: (_ws, event) => {
      console.log('WebSocket message:', JSON.parse(event.data))
    }
  },
)

watch(toggle, (value) => {
  if (value) {
    start()
  } else {
    stop()
  }
})

watch(status, (value) => {
  console.log('WebSocket status:', value)
})
</script>

<template>
  <div p-4 h-full>
    <h1 flex justify-center>Audio Streaming</h1>
    <div flex items-center justify-center h-full flex-col gap-6>
      <button rounded-full p-4
        bg="gray/10 dark:white/20 hover:gray/20 dark:hover:white/30 active:gray/30 dark:active:white/20"
        transition="all 500 ease-in-out" outline="2 solid offset-4" @click="toggle = !toggle" :class="[
          toggle ? 'outline-green-500 dark:outline-green-500' : 'outline-red-500/50 dark:outline-red-500/50',
        ]">
        <div i-solar:microphone-large-bold-duotone text="[60px]" />
      </button>
      <AudioAnalyser :stream="stream" :bars="32" v-slot="{ frequencies }">
        <AudioVisualizerBars :frequencies="frequencies" h-20 :bars-class="'bg-black dark:bg-white'" opacity-50 />
      </AudioAnalyser>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: default
</route>
