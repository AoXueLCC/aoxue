<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchTruckDetail } from '../api'
import { useQuoteStore } from '../stores/quote'
import { fmtPrice } from '../mock/helpers'
import TruckSwiper from '../components/TruckSwiper.vue'
import TruckParameter from '../components/TruckParameter.vue'

/** Page 02 VehicleDetailPage：Gallery → 基本信息 → 参数 → 视频 → 描述 → Bottom Action */
const route = useRoute()
const router = useRouter()
const store = useQuoteStore()

const truck = ref(null)
const loading = ref(true)

const energyTagClass = computed(() => {
  if (!truck.value) return ''
  return { 纯电: 'tag-primary', 混动: 'tag-warning' }[truck.value.energy] || ''
})

onMounted(async () => {
  try {
    truck.value = await fetchTruckDetail(route.params.id)
  } finally {
    loading.value = false
  }
})

function startConfig() {
  if (!truck.value) return
  store.setTruck(truck.value)
  router.push('/config')
}
</script>

<template>
  <div class="page truck-detail page-with-bar">
    <header class="page-header">
      <button class="back-btn" @click="router.replace('/')">
        <van-icon name="arrow-left" size="20" />
      </button>
      <h1 class="page-title">车辆详情</h1>
      <span class="header-space"></span>
    </header>

    <div v-if="loading" class="detail-loading">
      <van-loading size="28" color="var(--primary)" vertical>加载中...</van-loading>
    </div>

    <template v-else-if="truck">
      <div class="detail-main">
        <TruckSwiper :images="truck.gallery" :video="truck.video" :title="truck.name" />

        <div class="info-card">
          <p class="brand-name">{{ truck.brand }}</p>
          <h2 class="truck-name">{{ truck.name }}</h2>
          <div class="tag-row">
            <span class="tag" :class="energyTagClass">{{ truck.energy }}</span>
            <span v-for="tag in truck.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div class="price-row">
            <span v-if="truck.price" class="price num">¥{{ fmtPrice(truck.price) }}</span>
            <span v-else class="price price-na">价格面议</span>
            <span v-if="truck.price" class="price-unit">元起</span>
          </div>
        </div>

        <TruckParameter :truck="truck" />

        <div v-if="truck.description" class="desc-card">
          <h2 class="section-title">车型介绍</h2>
          <p class="desc-text">{{ truck.description }}</p>
        </div>
      </div>

      <div class="bottom-bar">
        <div class="bar-price">
          <span class="bar-label">参考价格</span>
          <div v-if="truck.price" class="bar-amount num">¥{{ fmtPrice(truck.price) }}</div>
          <div v-else class="bar-amount bar-na">价格面议</div>
        </div>
        <button class="bar-btn" @click="startConfig">
          开始配置
          <van-icon name="arrow" size="16" />
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: calc(56px + var(--safe-top));
  padding: var(--safe-top) var(--space-page) 0;
  background: var(--card);
}

.back-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-main);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.back-btn:active {
  transform: scale(0.92);
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
}

.header-space {
  width: 40px;
}

.detail-loading {
  padding: 80px 0;
  display: flex;
  justify-content: center;
}

.detail-main {
  padding: var(--space-page);
  display: flex;
  flex-direction: column;
  gap: var(--space-section);
}

.info-card {
  background: var(--card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-1);
  padding: var(--space-card);
}

.brand-name {
  font-size: var(--fs-desc);
  color: var(--text-secondary);
}

.truck-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.3;
  margin-top: 4px;
}

.tag-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.tag-primary {
  background: rgba(22, 119, 255, 0.1);
  color: var(--primary);
}

.tag-warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 12px;
}

.price {
  font-size: var(--fs-price-lg);
  font-weight: 700;
  color: var(--price);
}

.price-na {
  font-size: var(--fs-price-lg);
  font-weight: 700;
  color: var(--text-secondary);
}

.price-unit {
  font-size: 14px;
  color: var(--text-secondary);
}

.bar-na {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-secondary);
}

.desc-card {
  background: var(--card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-1);
  padding: var(--space-card);
}

.section-title {
  font-size: var(--fs-section);
  font-weight: 600;
  color: var(--text-main);
}

.desc-text {
  font-size: var(--fs-body);
  color: var(--text-secondary);
  line-height: 1.7;
  margin-top: 8px;
}

.bar-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 120px;
  height: 40px;
  border: none;
  border-radius: 20px;
  background: var(--primary);
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.15s ease-out;
}

.bar-btn:active {
  transform: scale(0.98);
}
</style>
