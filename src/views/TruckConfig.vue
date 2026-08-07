<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchRefrigerators, fetchBodies, fetchAccessories } from '../api'
import { useQuoteStore } from '../stores/quote'
import { fmtPrice } from '../mock/helpers'
import StepBar from '../components/StepBar.vue'
import OptionCard from '../components/OptionCard.vue'
import AnimatedNumber from '../components/AnimatedNumber.vue'

/**
 * Page 03 TruckConfigPage：Header → StepBar(56) → Vehicle Summary(100) → 区域标题 → Option List → Price Bar(64)
 * 步骤映射：冷机=0 / 厢体=1 / 配装=2(门体·温控·其他) / 选装=3(安全配置) / 确认=4(/save)
 */
const router = useRouter()
const store = useQuoteStore()

const truck = computed(() => store.truck)
const activeTab = ref('refrigerator')
const loading = ref(true)

const refrigerators = ref([])
const bodies = ref([])
const accessories = ref([])

const TABS = [
  { key: 'refrigerator', label: '冷机' },
  { key: 'body', label: '厢体' },
  { key: 'door', label: '门体' },
  { key: 'temp', label: '温控' },
  { key: 'safety', label: '安全配置' },
  { key: 'other', label: '其他' }
]

/** tab → 步骤索引：冷机0 厢体1 配装(门体/温控/其他)2 选装(安全配置)3 */
const TAB_STEP = { refrigerator: 0, body: 1, door: 2, temp: 2, safety: 3, other: 2 }

const currentStep = computed(() => TAB_STEP[activeTab.value] ?? 0)

/** 当前步骤的子分类 tab：配装=门体/温控/其他，选装=安全配置 */
const subTabs = computed(() => {
  if (currentStep.value === 2) return TABS.filter((t) => ['door', 'temp', 'other'].includes(t.key))
  if (currentStep.value === 3) return TABS.filter((t) => t.key === 'safety')
  return []
})

const coverImg = computed(() =>
  truck.value && truck.value.gallery && truck.value.gallery.length ? truck.value.gallery[0] : ''
)

/** 默认勾选原厂普通厢：只在进入厢体步骤时生效（冷机步骤不加价），每个配置会话仅一次 */
let bodyDefaulted = false
function ensureDefaultBody() {
  if (bodyDefaulted || store.body || !bodies.value.length) return
  const defBody = bodies.value.find((b) => b.name === '原厂普通厢')
  if (defBody) {
    store.setBody(defBody)
    bodyDefaulted = true
  }
}

watch(activeTab, (tab) => {
  if (tab === 'body') ensureDefaultBody()
})

/** 当前 tab 的选项列表（配装按 category 分组） */
const currentItems = computed(() => {
  if (activeTab.value === 'refrigerator') return refrigerators.value
  if (activeTab.value === 'body') return bodies.value
  return accessories.value.filter((a) => a.category === tabLabel(activeTab.value))
})

function tabLabel(key) {
  const t = TABS.find((x) => x.key === key)
  return t ? t.label : ''
}

/** 选项卡片展示属性 */
function cardProps(item) {
  if (activeTab.value === 'refrigerator') {
    return {
      title: item.model,
      subtitle: `${item.tempRange} · ${item.cooling}`,
      icon: '❄️',
      selected: store.refrigerator && store.refrigerator.id === item.id,
      recommended: item.model === truck.value.defaultAC
    }
  }
  if (activeTab.value === 'body') {
    return {
      title: item.name,
      subtitle: `保温 ${item.thickness} · ${item.material}`,
      icon: '📦',
      selected: store.body && store.body.id === item.id,
      recommended: item.name === '原厂普通厢'
    }
  }
  return {
    title: item.name,
    subtitle: item.brand,
    icon: item.icon,
    selected: store.isAccessorySelected(item.id)
  }
}

/** 冷机/厢体单选（再点已选=取消），配装多选切换 */
function selectItem(item) {
  if (activeTab.value === 'refrigerator') {
    store.setRefrigerator(store.refrigerator?.id === item.id ? null : item)
  } else if (activeTab.value === 'body') {
    store.setBody(store.body?.id === item.id ? null : item)
  } else {
    store.toggleAccessory(item)
  }
}

/** 返回：配置步骤内逐层回退（配装→厢体→冷机），到第一步（冷机）后才退出到车型介绍页（退出即清空已选配置） */
function goBack() {
  const prevTab = { body: 'refrigerator', door: 'body', temp: 'body', other: 'body', safety: 'door' }[activeTab.value]
  if (prevTab) {
    activeTab.value = prevTab
    return
  }
  store.clearConfig()
  router.replace(truck.value && truck.value.id ? `/truck/${truck.value.id}` : '/')
}

/** 向导推进：每步选完后点"下一步"进入下一步骤 */
const nextText = computed(() => (currentStep.value >= 3 ? '确认报价' : '下一步'))

function goNext() {
  if (currentStep.value === 0) activeTab.value = 'body'
  else if (currentStep.value === 1) activeTab.value = 'door'
  else if (currentStep.value === 2) activeTab.value = 'safety'
  else {
    store.configTab = activeTab.value
    router.push('/save')
  }
}

onMounted(async () => {
  // 从确认页返回：恢复到进入确认页前的步骤 tab
  if (store.configTab) {
    activeTab.value = store.configTab
    store.configTab = ''
  }
  try {
    const [rs, bs, as] = await Promise.all([
      fetchRefrigerators({ energy: truck.value.energy, truckType: truck.value.truckType }),
      fetchBodies(truck.value.truckType),
      fetchAccessories()
    ])
    refrigerators.value = rs
    bodies.value = bs
    accessories.value = as
    // 首次进入：预选车型标配冷机（厢体默认勾选由 ensureDefaultBody 在进入厢体步骤时处理）
    if (!store.refrigerator) {
      const def = rs.find((r) => r.model === truck.value.defaultAC)
      if (def) store.setRefrigerator(def)
    }
    // 数据加载完成时若已在厢体步骤（如用户快速切换），补上默认勾选
    if (activeTab.value === 'body') ensureDefaultBody()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page config-page page-with-bar">
    <header class="page-header">
      <button class="back-btn" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </button>
      <h1 class="page-title">配置车辆</h1>
      <span class="header-space"></span>
    </header>

    <StepBar :current="currentStep" />

    <div v-if="truck" class="vehicle-summary">
      <img v-if="coverImg" :src="coverImg" alt="车辆图片" class="vs-img" />
      <div v-else class="vs-img vs-icon">🚚</div>
      <div class="vs-main">
        <span class="vs-name ellipsis">{{ truck.name }}</span>
        <span class="vs-sub">{{ truck.truckType }} · {{ truck.energy }}</span>
      </div>
      <div class="vs-price">
        <span class="vs-label">当前价</span>
        <span v-if="truck.price" class="vs-amount num">¥{{ fmtPrice(truck.price) }}</span>
        <span v-else class="vs-amount vs-na">面议</span>
      </div>
    </div>

    <div class="config-main">
      <div class="section-head">
        <h2 class="section-title">选择{{ tabLabel(activeTab) }}</h2>
        <p class="section-sub">根据车型匹配可选{{ tabLabel(activeTab) }}</p>
      </div>

      <div v-if="subTabs.length" class="tab-bar h-scroll h-scroll-pad">
        <button
          v-for="t in subTabs"
          :key="t.key"
          class="tab"
          :class="{ on: activeTab === t.key }"
          @click="activeTab = t.key"
        >{{ t.label }}</button>
      </div>

      <div v-if="loading" class="list-body">
        <div v-for="i in 4" :key="i" class="skeleton opt-skeleton"></div>
      </div>

      <div v-else-if="currentItems.length" class="list-body">
        <OptionCard
          v-for="item in currentItems"
          :key="item.id"
          :item="item"
          v-bind="cardProps(item)"
          @select="selectItem"
        />
      </div>

      <div v-else class="empty-box">
        <div class="empty-icon">
          <van-icon name="warning-o" size="40" color="var(--text-placeholder)" />
        </div>
        <p class="empty-title">暂无匹配选项</p>
        <p class="empty-sub">当前车型暂无{{ tabLabel(activeTab) }}可选，请联系销售顾问</p>
      </div>
    </div>

    <div class="bottom-bar">
      <div class="bar-price">
        <span class="bar-label">当前报价</span>
        <div class="bar-amount">
          <AnimatedNumber :value="store.totalPrice" />
        </div>
        <span v-if="store.selectionSummary" class="bar-summary">{{ store.selectionSummary }}</span>
      </div>
      <button class="bar-btn" @click="goNext">
        {{ nextText }}
        <van-icon name="arrow" size="16" />
      </button>
    </div>
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

.vehicle-summary {
  display: flex;
  align-items: center;
  gap: var(--space-gap);
  height: 100px;
  margin: var(--space-page) var(--space-page) 0;
  padding: 0 var(--space-card);
  background: var(--card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-1);
}

.vs-img {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.vs-icon {
  background: var(--tag-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.vs-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vs-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
}

.vs-sub {
  font-size: var(--fs-caption);
  color: var(--text-secondary);
}

.vs-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}

.vs-label {
  font-size: var(--fs-caption);
  color: var(--text-secondary);
}

.vs-amount {
  font-size: 20px;
  font-weight: 700;
  color: var(--price);
  line-height: 1.3;
}

.vs-na {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1.6;
}

.config-main {
  padding-top: 8px;
}

.section-head {
  margin: 8px var(--space-page) 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}

.section-sub {
  font-size: 12px;
  color: var(--text-placeholder);
  margin-top: 2px;
}

.tab-bar {
  padding-top: 4px;
  padding-bottom: 4px;
}

.tab {
  flex-shrink: 0;
  height: 44px;
  padding: 0 20px;
  border: none;
  border-radius: var(--radius-chip);
  background: transparent;
  color: var(--text-secondary);
  font-size: 15px;
  cursor: pointer;
  transition: color 0.2s ease-out, background 0.2s ease-out;
}

.tab.on {
  background: var(--selected-bg);
  color: var(--primary);
  font-weight: 600;
}

.list-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-gap);
  padding: var(--space-gap) var(--space-page);
}

.opt-skeleton {
  height: 72px;
  border-radius: 8px;
}

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
  transition: transform 0.15s ease-out;
}

.bar-btn:active {
  transform: scale(0.98);
}
</style>
