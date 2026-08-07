<script setup>
import { ref, watch, onMounted } from 'vue'
import { fmtPrice } from '../mock/helpers'

/**
 * 金额数字滚动动画：目标值变化时从当前显示值平滑过渡
 * 规范：金额变化禁止瞬间跳变，数字滚动 300ms ease-out
 */
const props = defineProps({
  value: { type: Number, default: 0 },
  prefix: { type: String, default: '¥' }
})

const shown = ref(props.value)
let raf = null

function animateTo(target) {
  if (raf) cancelAnimationFrame(raf)
  const from = shown.value
  const diff = target - from
  if (Math.abs(diff) < 0.5) {
    shown.value = target
    return
  }
  const start = performance.now()
  const dur = 300
  const step = (now) => {
    const t = Math.min(1, (now - start) / dur)
    const ease = 1 - Math.pow(1 - t, 3) // ease-out cubic
    shown.value = from + diff * ease
    if (t < 1) raf = requestAnimationFrame(step)
    else shown.value = target
  }
  raf = requestAnimationFrame(step)
}

watch(() => props.value, animateTo)
onMounted(() => {
  shown.value = props.value
})
</script>

<template>
  <span class="num animated-price">{{ prefix }}{{ fmtPrice(Math.round(shown)) }}</span>
</template>

<style scoped>
.animated-price {
  font-variant-numeric: tabular-nums;
}
</style>
