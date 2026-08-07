<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchAccessories } from '../api'
import { useQuoteStore } from '../stores/quote'
import StepBar from '../components/StepBar.vue'
import AccessoryList from '../components/AccessoryList.vue'
import PriceBar from '../components/PriceBar.vue'

/**
 * 第五页 · 选择配装
 * 配装列表支持多选，底部价格栏实时联动，可展开明细
 */
const router = useRouter()
const store = useQuoteStore()

const accessories = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    accessories.value = await fetchAccessories()
  } finally {
    loading.value = false
  }
})

function toggleAccessory(item) {
  store.toggleAccessory(item)
}

function goNext() {
  router.push('/save')
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
        <StepBar :current="3" />
      </div>
      <span class="header-space"></span>
    </header>

    <div class="select-main">
      <div class="select-title">
        <h2>选择配装</h2>
        <p class="select-sub">按需选装，支持多选，价格实时计入总价</p>
      </div>

      <div v-if="loading" class="list-loading">
        <div v-for="i in 5" :key="i" class="sk-row">
          <div class="sk-icon"></div>
          <div class="sk-line w40"></div>
          <div class="sk-line w20"></div>
        </div>
      </div>

      <div v-else class="list-body">
        <AccessoryList
          :items="accessories"
          :selected-ids="store.accessories.map((a) => a.id)"
          @toggle="toggleAccessory"
        />
      </div>
    </div>

    <PriceBar next-text="下一步：确认" @next="goNext" />
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
  padding-bottom: 8px;
}

/* 骨架屏 */
.sk-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: 0 2px 10px rgba(29, 33, 41, 0.05);
  margin-bottom: 10px;
}

.sk-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(90deg, #f0f1f4 25%, #e5e6eb 50%, #f0f1f4 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
  flex-shrink: 0;
}

.sk-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f0f1f4 25%, #e5e6eb 50%, #f0f1f4 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}

.w40 {
  width: 40%;
}

.w20 {
  width: 20%;
  margin-left: auto;
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
