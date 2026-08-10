<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchRefrigerators } from '../api'
import { useQuoteStore } from '../stores/quote'
import StepBar from '../components/StepBar.vue'
import RefrigeratorCard from '../components/RefrigeratorCard.vue'
import PriceBar from '../components/PriceBar.vue'

/**
 * 第三页 · 选择冷机
 * 按车型能源自动匹配（纯电→电动冷机 / 燃油→柴油机冷机 / 混动→全部），适配车型靠前
 * 车型标配冷机默认选中并标记「标配」
 */
const router = useRouter()
const store = useQuoteStore()

const refrigerators = ref([])
const loading = ref(true)
const initialized = ref(false)

const truck = computed(() => store.truck)
const selectedId = computed(() => (store.refrigerator ? store.refrigerator.id : ''))

/** 车型标配冷机（默认选中 + 推荐标记） */
const defaultModel = computed(() => (truck.value ? truck.value.defaultAC : ''))

onMounted(async () => {
  try {
    refrigerators.value = await fetchRefrigerators({
      energy: truck.value ? truck.value.energy : '',
      truckType: truck.value ? truck.value.truckType : ''
    })
    // 预选车型标配冷机（仅首次进入）
    if (!initialized.value) {
      const def = refrigerators.value.find((r) => r.model === defaultModel.value)
      if (def) store.setRefrigerator(def)
      initialized.value = true
    }
  } finally {
    loading.value = false
  }
})

function selectRefrigerator(item) {
  store.setRefrigerator(item)
}

function goNext() {
  if (!store.refrigerator) return
  router.push('/config/body')
}
</script>

<template>
  <div class="page select-page">
    <!-- 顶部 -->
    <header class="select-header">
      <button class="back-btn" @click="router.back()">
        <van-icon name="arrow-left" size="20" />
      </button>
      <div class="header-center">
        <StepBar :current="1" />
      </div>
      <span class="header-space"></span>
    </header>

    <div class="select-main">
      <div class="select-title">
        <h2>选择冷机</h2>
        <p v-if="truck" class="select-sub">
          {{ truck.name }} · {{ truck.energy }} 车型 {{ truck.energy === '混动' ? '可选全部冷机' : truck.energy === '纯电' ? '匹配电动冷机' : '匹配油车冷机' }}
        </p>
      </div>

      <div v-if="loading" class="list-loading">
        <div v-for="i in 4" :key="i" class="sk-card">
          <div class="sk-img"></div>
          <div class="sk-body">
            <div class="sk-line w50"></div>
            <div class="sk-line w70"></div>
          </div>
        </div>
      </div>

      <div v-else-if="refrigerators.length" class="list-body">
        <RefrigeratorCard
          v-for="r in refrigerators"
          :key="r.id"
          :item="r"
          :selected="selectedId === r.id"
          :recommended="r.model === defaultModel"
          @select="selectRefrigerator"
        />
      </div>

      <div v-else class="empty-box">
        <div class="empty-icon">
          <van-icon name="warning-o" size="40" color="#C9CDD4" />
        </div>
        <p class="empty-title">暂无可配冷机</p>
        <p class="empty-sub">当前车型能源类型暂无匹配冷机，请联系销售顾问</p>
      </div>
    </div>

    <PriceBar next-text="下一步：厢体" :next-disabled="!store.refrigerator" @next="goNext" />
  </div>
</template>

<style scoped>
.select-page {
  padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px));
}

.select-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  padding: calc(10px + env(safe-area-inset-top, 0px)) 12px 0;
  background: rgba(245, 247, 250, 0.9);
  backdrop-filter: blur(10px);
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(29, 33, 41, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #1d2129;
  transition: transform 0.15s;
  flex-shrink: 0;
}

.back-btn:active {
  transform: scale(0.92);
}

.header-center {
  flex: 1;
  min-width: 0;
}

.header-space {
  width: 36px;
  flex-shrink: 0;
}

.select-main {
  padding: 4px 12px 0;
}

.select-title {
  padding: 8px 4px 12px;
}

.select-title h2 {
  font-size: 20px;
  font-weight: 800;
  color: #1d2129;
}

.select-sub {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

.list-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 8px;
}

/* 骨架屏 */
.sk-card {
  display: flex;
  gap: 12px;
  background: #ffffff;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 4px 16px rgba(29, 33, 41, 0.06);
}

.sk-img {
  width: 104px;
  height: 84px;
  border-radius: 12px;
  background: linear-gradient(90deg, #f0f1f4 25%, #e5e6eb 50%, #f0f1f4 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
  flex-shrink: 0;
}

.sk-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
}

.sk-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f0f1f4 25%, #e5e6eb 50%, #f0f1f4 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}

.w50 {
  width: 50%;
}

.w70 {
  width: 70%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
}

.empty-icon {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(29, 33, 41, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 15px;
  font-weight: 700;
  color: #1d2129;
}

.empty-sub {
  font-size: 12px;
  color: #86909c;
  margin-top: 6px;
  text-align: center;
}
</style>
