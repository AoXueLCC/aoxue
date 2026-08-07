<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { fmtPrice, svgImg } from '../mock/helpers'

/**
 * 车辆卡片（参考图：横向紧凑）左图100×75 → 标题/参数标签 → 参考价
 */
const props = defineProps({
  truck: { type: Object, required: true },
  brand: { type: Object, default: null }
})

const router = useRouter()

const coverImg = computed(() => {
  if (props.truck.gallery && props.truck.gallery.length) return props.truck.gallery[0]
  const c = props.brand?.colors || ['#3B82F6', '#6366F1']
  return svgImg({ icon: '🚚', title: props.truck.name, sub: '冷藏车', c1: c[0], c2: c[1] })
})

const tags = computed(() => {
  const list = [props.truck.truckType, props.truck.energy]
  if (props.truck.tags && props.truck.tags.length) list.push(props.truck.tags[0])
  return list.slice(0, 3)
})

function goDetail() {
  router.push(`/truck/${props.truck.id}`)
}
</script>

<template>
  <div class="truck-card" @click="goDetail">
    <div class="img-wrap">
      <img :src="coverImg" :alt="truck.name" class="truck-img" loading="lazy" />
      <span v-if="truck.video" class="video-badge">
        <van-icon name="play" size="14" />
      </span>
    </div>

    <div class="card-body">
      <h3 class="vehicle-name ellipsis">{{ truck.name }}</h3>
      <div class="tag-row">
        <span v-for="t in tags" :key="t" class="tag">{{ t }}</span>
      </div>
      <div class="price-row">
        <span class="price-label">参考价</span>
        <span v-if="truck.price" class="price num">¥{{ fmtPrice(truck.price) }}</span>
        <span v-else class="price price-na">价格面议</span>
        <span v-if="truck.price" class="price-unit">起</span>
      </div>
    </div>

    <van-icon name="arrow" size="14" color="var(--text-disabled)" class="card-arrow" />
  </div>
</template>

<style scoped>
.truck-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-1);
  padding: var(--space-card);
  cursor: pointer;
  transition: transform 0.15s ease-out;
  animation: card-in 0.3s ease-out;
}

.truck-card:active {
  transform: scale(0.99);
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.img-wrap {
  position: relative;
  width: 100px;
  height: 75px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--tag-bg);
  flex-shrink: 0;
}

.truck-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.video-badge {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(17, 24, 39, 0.55);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vehicle-name {
  font-size: var(--fs-vehicle);
  font-weight: 600;
  color: var(--text-main);
}

.tag-row {
  display: flex;
  gap: 6px;
}

.tag {
  height: 18px;
  padding: 0 6px;
  border-radius: var(--radius-tag);
  background: var(--tag-bg);
  color: var(--text-secondary);
  font-size: 10px;
  display: inline-flex;
  align-items: center;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.price {
  font-size: var(--fs-vehicle);
  font-weight: 600;
  color: var(--price);
}

.price-na {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.price-unit {
  font-size: 11px;
  color: var(--text-placeholder);
}

.card-arrow {
  flex-shrink: 0;
}
</style>
