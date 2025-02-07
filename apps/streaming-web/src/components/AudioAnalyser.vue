<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  stream?: MediaStream
  bars?: number
}>(), {
  bars: 32
})

const analyzing = ref(false)
const frequencies = ref<number[]>([])

onMounted(() => {
  handleAnalyze()
})

watch(() => props.stream, () => {
  handleAnalyze()
})

function handleAnalyze() {
  if (analyzing.value) return
  if (!props.stream) return

  analyzing.value = true

  const audioContext = new (window.AudioContext || (window as unknown as any).webkitAudioContext)()
  const source = audioContext.createMediaStreamSource(props.stream)
  const analyser = audioContext.createAnalyser()

  // Adjust FFT size based on desired bar count
  analyser.fftSize = 2048
  source.connect(analyser)

  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  // Calculate how many frequency bins to combine per bar
  const binsPerBar = Math.floor(bufferLength / props.bars)

  const analyze = () => {
    try {
      requestAnimationFrame(analyze)
      analyser.getByteFrequencyData(dataArray)

      // Process frequency data into bars
      const bars = new Array(props.bars).fill(0)

      for (let i = 0; i < props.bars; i++) {
        let sum = 0
        for (let j = 0; j < binsPerBar; j++) {
          sum += dataArray[i * binsPerBar + j]
        }
        // Average value for this bar
        bars[i] = sum / binsPerBar / 255 // Normalize to 0-1
      }

      frequencies.value = bars
    }
    catch (err) {
      console.error(err)
    }
  }

  analyze()
}
</script>

<template>
  <slot :frequencies="frequencies" />
</template>
