<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchBrands } from '../api'
import { BRAND_WHITELIST } from '../mock'

/**
 * 品牌筛选（参考图：金刚区 Grid，6 列 icon 网格）
 * modelValue: 当前选中的品牌 id（'all' 为全部）
 */
const props = defineProps({
  modelValue: { type: String, default: 'all' }
})
const emit = defineEmits(['update:modelValue', 'change'])

const brands = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    brands.value = await fetchBrands()
  } finally {
    loading.value = false
  }
})

function select(id) {
  if (props.modelValue === id) return
  emit('update:modelValue', id)
  emit('change', id)
}

const displayBrands = computed(() =>
  brands.value.filter((b) => b.id !== 'all' && BRAND_WHITELIST.includes(b.id))
)
</script>

<template>
  <div class="brand-grid">
    <div v-if="loading" class="grid-body">
      <div v-for="i in 6" :key="i" class="grid-item">
        <div class="skeleton g-icon"></div>
      </div>
    </div>
    <div v-else class="grid-body">
      <button class="grid-item" :class="{ on: modelValue === 'all' }" @click="select('all')">
        <span class="g-icon g-icon-all">
          <van-icon name="apps-o" size="18" />
        </span>
        <span class="g-name">全部</span>
      </button>
      <button
        v-for="b in displayBrands"
        :key="b.id"
        class="grid-item"
        :class="{ on: modelValue === b.id }"
        @click="select(b.id)"
      >
        <span class="g-icon">
          <img v-if="b.logo" :src="b.logo" :alt="b.name" class="g-img" />
          <span v-else class="g-short">{{ b.short }}</span>
        </span>
        <span class="g-name">{{ b.name }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.brand-grid {
  padding: 0 var(--space-page);
}

.grid-body {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px 8px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px 0;
  transition: transform 0.15s ease-out;
}

.grid-item:active {
  transform: scale(0.94);
}

.g-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-main);
  overflow: hidden;
  box-shadow: var(--shadow-1);
}

.g-icon-all {
  background: var(--tag-bg);
  color: var(--text-secondary);
  box-shadow: none;
}

.grid-item.on .g-icon-all {
  background: var(--primary);
  color: #ffffff;
}

.grid-item.on .g-name {
  color: var(--primary);
  font-weight: 600;
}

.g-short {
  font-size: 14px;
  font-weight: 700;
}

.g-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 5px;
}

.g-name {
  font-size: 11px;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 52px;
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #f7f7f7 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}

.g-icon.skeleton {
  border-radius: 8px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
