<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchTrucks, fetchBrands } from '../api'
import { TRUCK_TYPES, ENERGY_TYPES, BRAND_WHITELIST } from '../mock'
import { useQuoteStore } from '../stores/quote'
import BrandFilter from '../components/BrandFilter.vue'
import TruckCard from '../components/TruckCard.vue'
import AnimatedNumber from '../components/AnimatedNumber.vue'

/** Page 01 QuotePage：Header(56px) → 筛选区 → 车辆列表 → Bottom Price Bar(82px) */
const router = useRouter()
const store = useQuoteStore()

const keyword = ref('')
const brand = ref('all')
const truckType = ref('all')
const energy = ref('all')
const trucks = ref([])
const loading = ref(true)
const showSearch = ref(false)
const showFilter = ref(true)

/** 筛选区吸顶位置：搜索栏展开时整体下移（header 56px + 搜索栏 52px） */
const filterTop = computed(() =>
  showSearch.value ? 'calc(108px + var(--safe-top))' : 'calc(56px + var(--safe-top))'
)
const brandMap = ref({})

let timer = null

const hasTruck = computed(() => !!store.truck)
/** 已选车辆且已有冷机配置=继续上次配置；否则=全新开始（退出配置页时会清空配置） */
const btnText = computed(() => (hasTruck.value && store.refrigerator ? '继续配置' : '开始配置'))

function truckBrand(truck) {
  return brandMap.value[truck.brandId] || null
}

function loadTrucks() {
  loading.value = true
  fetchTrucks({
    brand: brand.value,
    truckType: truckType.value,
    energy: energy.value,
    keyword: keyword.value
  })
    .then((list) => (trucks.value = list.filter((t) => BRAND_WHITELIST.includes(t.brandId))))
    .finally(() => (loading.value = false))
}

onMounted(async () => {
  loadTrucks()
  try {
    const brands = await fetchBrands()
    const m = {}
    for (const b of brands) m[b.id] = b
    brandMap.value = m
  } catch (e) {
    /* 品牌数据缺失时卡片使用默认渐变 */
  }
})

function onKeywordInput() {
  clearTimeout(timer)
  timer = setTimeout(loadTrucks, 300)
}

function onBrandChange() {
  truckType.value = 'all'
  energy.value = 'all'
  loadTrucks()
}

function onTruckTypeChange(key) {
  energy.value = 'all'
  truckType.value = key
  loadTrucks()
}

function onEnergyChange(key) {
  energy.value = key
  loadTrucks()
}

function toggleSearch() {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    keyword.value = ''
    onKeywordInput()
  }
}

function resetFilters() {
  brand.value = 'all'
  truckType.value = 'all'
  energy.value = 'all'
  keyword.value = ''
  loadTrucks()
}

function goConfig() {
  if (hasTruck.value) router.push('/config')
}
</script>

<template>
  <div class="page quote-page">
    <header class="page-header">
      <h1 class="page-title">选择车型</h1>
      <div class="header-actions">
        <button class="icon-btn" @click="router.push('/history')">
          <van-icon name="orders-o" size="24" />
        </button>
        <button class="icon-btn" :class="{ on: showSearch }" @click="toggleSearch">
          <van-icon name="search" size="24" />
        </button>
        <button class="icon-btn" :class="{ on: showFilter }" @click="showFilter = !showFilter">
          <van-icon name="filter-o" size="24" />
        </button>
      </div>
    </header>

    <transition name="search-in">
      <div v-if="showSearch" class="search-bar">
        <div class="search-box">
          <van-icon name="search" size="16" color="var(--text-placeholder)" />
          <input
            v-model="keyword"
            class="search-input"
            type="search"
            placeholder="搜索车型 / 品牌"
            @input="onKeywordInput"
          />
          <van-icon
            v-if="keyword"
            name="clear"
            size="16"
            color="var(--text-placeholder)"
            class="search-clear"
            @click="keyword = ''; onKeywordInput()"
          />
        </div>
        <button class="search-cancel" @click="toggleSearch">取消</button>
      </div>
    </transition>

    <main class="page-main">
      <section v-show="showFilter" class="filter-area" :style="{ top: filterTop }">
        <div class="filter-group">
          <h2 class="filter-title">品牌</h2>
          <BrandFilter v-model="brand" @change="onBrandChange" />
        </div>
        <div class="filter-group">
          <h2 class="filter-title">车型类型</h2>
          <div class="h-scroll h-scroll-pad">
            <button
              v-for="t in TRUCK_TYPES"
              :key="t.key"
              class="chip"
              :class="{ on: truckType === t.key }"
              @click="onTruckTypeChange(t.key)"
            >{{ t.label }}</button>
          </div>
        </div>
        <div class="filter-group">
          <h2 class="filter-title">能源</h2>
          <div class="h-scroll h-scroll-pad">
            <button
              v-for="e in ENERGY_TYPES"
              :key="e.key"
              class="chip"
              :class="{ on: energy === e.key }"
              @click="onEnergyChange(e.key)"
            >{{ e.label }}</button>
          </div>
        </div>
      </section>

      <section class="list-area">
        <div v-if="loading" class="list-body">
          <div v-for="i in 5" :key="i" class="skeleton-card">
            <div class="skeleton sk-img"></div>
            <div class="sk-body">
              <div class="skeleton sk-line w60"></div>
              <div class="skeleton sk-line w40"></div>
            </div>
          </div>
        </div>
        <div v-else-if="trucks.length" class="list-body">
          <TruckCard v-for="t in trucks" :key="t.id" :truck="t" :brand="truckBrand(t)" />
        </div>
        <div v-else class="empty-box">
          <div class="empty-icon">
            <van-icon name="search" size="40" color="var(--text-placeholder)" />
          </div>
          <p class="empty-title">暂无匹配车型</p>
          <p class="empty-sub">试试更换品牌或清除筛选条件</p>
          <button class="empty-btn" @click="resetFilters">重新筛选</button>
        </div>
      </section>
    </main>

    <div class="bottom-bar">
      <div class="bar-price">
        <span class="bar-label">当前报价</span>
        <div class="bar-amount">
          <AnimatedNumber :value="store.totalPrice" />
        </div>
        <span v-if="store.selectionSummary" class="bar-summary">{{ store.selectionSummary }}</span>
      </div>
      <button
        class="bar-btn"
        :class="{ disabled: !hasTruck }"
        :disabled="!hasTruck"
        @click="goConfig"
      >
        {{ btnText }}
        <van-icon name="arrow" size="16" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.quote-page {
  padding-bottom: calc(82px + var(--safe-bottom) + 16px);
}

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

.page-title {
  font-size: var(--fs-page-title);
  font-weight: 600;
  color: var(--text-main);
}

.header-actions {
  display: flex;
  align-items: center;
}

.icon-btn {
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

.icon-btn.on {
  color: var(--primary);
  background: var(--selected-bg);
}

.search-bar {
  position: sticky;
  top: calc(56px + var(--safe-top));
  z-index: 19;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px var(--space-page);
  background: var(--card);
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 14px;
  border-radius: 18px;
  background: var(--tag-bg);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: var(--text-main);
}

.search-input::placeholder {
  color: var(--text-placeholder);
}

.search-cancel {
  border: none;
  background: transparent;
  color: var(--primary);
  font-size: 14px;
  padding: 8px;
  cursor: pointer;
}

.filter-area {
  position: sticky;
  z-index: 18;
  background: var(--card);
  padding-top: 8px;
}

.filter-group {
  margin-bottom: 16px;
}

.filter-title {
  font-size: var(--fs-section);
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
  padding: 0 var(--space-page);
}

.list-area {
  padding: 8px var(--space-page) 0;
}

.list-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-1);
  padding: var(--space-card);
}

.sk-img {
  width: 100px;
  height: 75px;
  border-radius: 6px;
  flex-shrink: 0;
}

.sk-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sk-line {
  height: 12px;
}

.w60 { width: 60%; }
.w40 { width: 40%; }
.w80 { width: 80%; }

.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0 32px;
}

.empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--card);
  box-shadow: var(--shadow-1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}

.empty-sub {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.empty-btn {
  margin-top: 20px;
  height: 40px;
  padding: 0 24px;
  border: none;
  border-radius: var(--radius-chip);
  background: var(--primary);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.empty-btn:active {
  transform: scale(0.96);
}

.bar-summary {
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 2px;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  transition: transform 0.15s ease-out, opacity 0.15s ease-out;
}

.bar-btn:active {
  transform: scale(0.98);
}

.bar-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.search-in-enter-active,
.search-in-leave-active {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.search-in-enter-from,
.search-in-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
