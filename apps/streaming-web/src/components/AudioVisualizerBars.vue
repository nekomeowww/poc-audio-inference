<script setup lang="ts">
const props = defineProps<{
  frequencies: number[]
  barsClass?: string
}>()

const AMPLIFICATION = 5

const getReductionFactor = (index: number, totalBars: number) => {
  const minFactor = 0.1  // More reduction for bass frequencies
  const maxFactor = 1.0  // Less reduction for higher frequencies
  return minFactor + (maxFactor - minFactor) * (index / totalBars)
}

const getBarHeight = (frequency: number, index: number) => {
  const reductionFactor = getReductionFactor(index, props.frequencies.length)
  return Math.min(100, Math.max(10, frequency * 100 * AMPLIFICATION * reductionFactor))
}
</script>

<template>
  <div flex items-center gap-1>
    <div v-for="(frequency, index) in frequencies" :key="index" h-full flex items-center>
      <div transition="all 100 ease-in-out" rounded-full w="[8px]" mx-auto my-0 :class="barsClass"
        :style="{ height: `${getBarHeight(frequency, index)}%` }" />
    </div>
  </div>
</template>
