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
 * 步骤映射：底盘=0 / 冷机=1 / 厢体=2 / 配装=3(底盘配装·厢体配装·温控配装) / 配件=4 / 确认=5(/save)
 */
const router = useRouter()
const store = useQuoteStore()

const truck = computed(() => store.truck)
const activeTab = ref('chassis')
const loading = ref(true)

const refrigerators = ref([])
const bodies = ref([])
const accessories = ref([])

const TABS = [
  { key: 'chassis', label: '底盘' },
  { key: 'refrigerator', label: '冷机' },
  { key: 'body', label: '厢体' },
  { key: 'accessory', label: '配装' },
  { key: 'parts', label: '配件' }
]

/** tab → 步骤索引：底盘0 冷机1 厢体2 配装3 配件4 */
const TAB_STEP = { chassis: 0, refrigerator: 1, body: 2, accessory: 3, parts: 4 }

const currentStep = computed(() => TAB_STEP[activeTab.value] ?? 0)

/** 子分类 tab 状态：厢体=原厂厢/山东中集厢，配装=底盘配装/厢体配装/温控配装 */
const bodyGroup = ref('fac')
const accCategory = ref('底盘配装')

const subTabs = computed(() => {
  if (activeTab.value === 'body') {
    return [
      { key: 'fac', label: '原厂厢' },
      { key: 'cimc', label: '山东中集厢' }
    ]
  }
  if (activeTab.value === 'accessory') {
    return [
      { key: '底盘配装', label: '底盘配装' },
      { key: '厢体配装', label: '厢体配装' },
      { key: '温控配装', label: '温控配装' }
    ]
  }
  return []
})

function subTabOn(t) {
  if (activeTab.value === 'body') return bodyGroup.value === t.key
  if (activeTab.value === 'accessory') return accCategory.value === t.key
  return false
}

function selectSubTab(t) {
  if (activeTab.value === 'body') bodyGroup.value = t.key
  else if (activeTab.value === 'accessory') accCategory.value = t.key
}

const coverImg = computed(() =>
  truck.value && truck.value.gallery && truck.value.gallery.length ? truck.value.gallery[0] : ''
)

/** 默认勾选原厂厢下的原厂标准厢：只在进入厢体步骤时生效（冷机步骤不加价），每个配置会话仅一次 */
let bodyDefaulted = false
function ensureDefaultBody() {
  if (bodyDefaulted || store.body || !bodies.value.length) return
  const defBody = bodies.value.find((b) => b.group === '原厂厢' && b.name === '原厂标准厢')
  if (defBody) {
    store.setBody(defBody)
    bodyDefaulted = true
  }
}

/** 预选车型标配冷机：只在进入冷机步骤时生效（此前步骤不显示冷机、不加价），每个配置会话仅一次 */
let refrigeratorDefaulted = false
function ensureDefaultRefrigerator() {
  if (refrigeratorDefaulted || store.refrigerator || !refrigerators.value.length) return
  const def = refrigerators.value.find((r) => r.model === truck.value.defaultAC)
  if (def) {
    store.setRefrigerator(def)
    refrigeratorDefaulted = true
  }
}

watch(activeTab, (tab) => {
  if (tab === 'refrigerator') ensureDefaultRefrigerator()
  if (tab === 'body') {
    ensureDefaultBody()
    if (store.body) {
      bodyGroup.value = store.body.group === '山东中集厢' ? 'cimc' : 'fac'
    }
  }
})

/** 底盘选项：车有 chassisOptions 用数据档位（兼容 admin 存的 JSON 字符串），否则自动生成标配项；图片统一用当前冷藏车主图 */
const chassisOptions = computed(() => {
  let opts = truck.value?.chassisOptions
  if (typeof opts === 'string') {
    try {
      opts = JSON.parse(opts)
    } catch {
      opts = null
    }
  }
  const withImg = (list) => list.map((o) => ({ ...o, image: coverImg.value }))
  if (opts && opts.length) return withImg(opts)
  return truck.value
    ? withImg([
        { id: 'default', name: `${truck.value.name}-标配`, battery: truck.value.battery || '', price: truck.value.price || null, default: true }
      ])
    : []
})

/** 当前 tab 的选项列表（厢体按 group 分组，配装/配件按 category + 车型匹配过滤，肉钩配件仅肉钩厢显示） */
const currentItems = computed(() => {
  if (activeTab.value === 'chassis') return chassisOptions.value
  if (activeTab.value === 'refrigerator') return refrigerators.value
  if (activeTab.value === 'body') return bodies.value.filter((b) => b.group === (bodyGroup.value === 'cimc' ? '山东中集厢' : '原厂厢'))
  if (activeTab.value === 'parts') {
    return accessories.value.filter(
      (a) =>
        a.category === '配件' &&
        (a.fitTypes || []).includes(truck.value?.truckType) &&
        (!a.hookOnly || !!store.body?.hook)
    )
  }
  return accessories.value.filter(
    (a) => a.category === accCategory.value && (a.fitTypes || []).includes(truck.value?.truckType)
  )
})

/** 厢体配装 tab：通用区（所有厢体）+ 特殊区（仅山东中集厢体，按 type 匹配），区内按 group 分组 */
const isBodyAccTab = computed(() => activeTab.value === 'accessory' && accCategory.value === '厢体配装')

const bodyAccGroups = computed(() => {
  const list = accessories.value.filter(
    (a) => a.category === '厢体配装' && (a.fitTypes || []).includes(truck.value?.truckType)
  )
  const groupBy = (items) => {
    const names = [...new Set(items.map((a) => a.group))]
    return names.map((n) => ({ title: n, items: items.filter((a) => a.group === n) }))
  }
  return {
    general: groupBy(list.filter((a) => !(a.bodyTypes || []).length)),
    special: groupBy(list.filter((a) => (a.bodyTypes || []).length && (a.bodyTypes || []).includes(store.body?.type)))
  }
})

/** 厢体配装联动：厢体切换时清理不适用特殊项 + 补默认勾选（M系列外蒙皮玻璃钢固定，G/国道内蒙皮标配） */
function syncBodyAccessories() {
  const b = store.body
  const isCimc = b?.group === '山东中集厢'
  const specials = accessories.value.filter((a) => a.category === '厢体配装' && (a.bodyTypes || []).length)
  for (const s of specials) {
    const idx = store.accessories.findIndex((a) => a.id === s.id)
    if (idx >= 0 && (!isCimc || !(s.bodyTypes || []).includes(b.type))) {
      store.accessories.splice(idx, 1)
    }
  }
  if (isCimc) {
    const def =
      b.type === 'M系列'
        ? specials.find((s) => s.group === '外蒙皮' && s.name === '外蒙皮-玻璃钢')
        : specials.find((s) => s.group === '内蒙皮' && s.default)
    if (def && !store.isAccessorySelected(def.id)) store.accessories.push(def)
  }
  // 肉钩配件（hookOnly）：非肉钩厢时移除
  const hookIdx = store.accessories.findIndex((a) => a.hookOnly)
  if (hookIdx >= 0 && !b?.hook) store.accessories.splice(hookIdx, 1)
}

watch(() => store.body, syncBodyAccessories)
watch(accCategory, (c) => {
  if (c === '厢体配装') syncBodyAccessories()
})

/** 底部弹出明细：点击报价栏查看所有已选产品（逐项列出，解决汇总行展示不全） */
const showDetail = ref(false)
const detailItems = computed(() => {
  const truckImg = store.truck?.gallery?.[0] || store.truck?.image || ''
  const items = []
  if (store.chassis) items.push({ icon: '🔧', img: truckImg, name: store.chassis.name, price: store.chassis.price })
  if (store.refrigerator) items.push({ icon: '❄️', img: store.refrigerator.image || '', name: store.refrigerator.model, price: store.refrigerator.price })
  if (store.body) items.push({ icon: '📦', img: store.body.image || '', name: store.body.name, price: store.body.price })
  for (const a of store.accessories) items.push({ icon: a.icon || '📎', img: '', name: a.name, price: a.price })
  return items
})

/** 分步计价：只累计当前及之前步骤的选择，未配置的后续步骤不计入（底盘页只体现底盘价） */
const stepTotal = computed(() => {
  const s = currentStep.value
  // 底盘页金额只由底盘档位决定：选中=档位价（null 即 0），取消=0，不回退车型价
  if (s === 0) return store.chassis ? store.chassis.price ?? 0 : 0
  if (s === 1) return store.vehiclePrice + store.refrigeratorPrice
  if (s === 2) return store.vehiclePrice + store.refrigeratorPrice + store.bodyPrice
  if (s === 3) return store.vehiclePrice + store.refrigeratorPrice + store.bodyPrice + store.accessoryTotal
  return store.totalPrice
})

function tabLabel(key) {
  const t = TABS.find((x) => x.key === key)
  return t ? t.label : ''
}

/** 选项卡片展示属性 */
function cardProps(item) {
  if (activeTab.value === 'chassis') {
    return {
      title: item.name,
      subtitle: item.battery || item.engine || '',
      icon: '🔧',
      selected: store.chassis && store.chassis.id === item.id,
      recommended: !!item.default
    }
  }
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
      subtitle: item.thickness && item.thickness !== '—' ? `保温 ${item.thickness} · ${item.material}` : '',
      icon: '📦',
      selected: store.body && store.body.id === item.id,
      recommended: item.name === '原厂标准厢'
    }
  }
  return {
    title: item.name,
    subtitle: item.desc || item.brand,
    icon: item.icon,
    selected: store.isAccessorySelected(item.id),
    recommended: !!item.default
  }
}

/** 底盘/冷机/厢体单选（再点已选=取消），配装多选切换 */
function selectItem(item) {
  if (activeTab.value === 'chassis') {
    store.setChassis(store.chassis?.id === item.id ? null : item)
  } else if (activeTab.value === 'refrigerator') {
    store.setRefrigerator(store.refrigerator?.id === item.id ? null : item)
  } else if (activeTab.value === 'body') {
    store.setBody(store.body?.id === item.id ? null : item)
  } else {
    store.toggleAccessory(item)
  }
}

/** 返回：配置步骤内逐层回退（配件→配装→厢体→冷机→底盘），到第一步（底盘）后才退出到车型介绍页（退出即清空已选配置） */
function goBack() {
  const prevTab = { refrigerator: 'chassis', body: 'refrigerator', accessory: 'body', parts: 'accessory' }[activeTab.value]
  if (prevTab) {
    activeTab.value = prevTab
    return
  }
  store.clearConfig()
  router.replace(truck.value && truck.value.id ? `/truck/${truck.value.id}` : '/')
}

/** 向导推进：每步选完后点"下一步"进入下一步骤 */
const nextText = computed(() => (currentStep.value >= 4 ? '确认报价' : '下一步'))

function goNext() {
  if (currentStep.value === 0) activeTab.value = 'refrigerator'
  else if (currentStep.value === 1) activeTab.value = 'body'
  else if (currentStep.value === 2) activeTab.value = 'accessory'
  else if (currentStep.value === 3) activeTab.value = 'parts'
  else {
    store.configTab = activeTab.value
    router.push('/save')
  }
}

onMounted(async () => {
  // 首次进入：默认勾选底盘标配档（车有档位取 default 项/首项，无档位自动生成标配项）
  if (!store.chassis) {
    const opts = truck.value?.chassisOptions
    const def = (opts && opts.length ? opts : chassisOptions.value)[0]
    if (def) store.setChassis(def)
  }
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
    // 数据加载完成时若已在该步骤（如用户快速切换），补上默认勾选
    if (activeTab.value === 'refrigerator') ensureDefaultRefrigerator()
    if (activeTab.value === 'body') {
      ensureDefaultBody()
      if (store.body) bodyGroup.value = store.body.group === '山东中集厢' ? 'cimc' : 'fac'
    }
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
          :class="{ on: subTabOn(t) }"
          @click="selectSubTab(t)"
        >{{ t.label }}</button>
      </div>

      <div v-if="loading" class="list-body">
        <div v-for="i in 4" :key="i" class="skeleton opt-skeleton"></div>
      </div>

      <div v-else-if="isBodyAccTab" class="list-body">
        <template v-for="grp in bodyAccGroups.general" :key="grp.title">
          <h3 class="group-title">{{ grp.title }}</h3>
          <OptionCard
            v-for="item in grp.items"
            :key="item.id"
            :item="item"
            v-bind="cardProps(item)"
            @select="selectItem"
          />
        </template>
        <template v-if="store.body?.group === '山东中集厢' && bodyAccGroups.special.length">
          <h3 class="group-title special-title">特殊配装（山东中集厢体专属）</h3>
          <template v-for="grp in bodyAccGroups.special" :key="grp.title">
            <h4 class="group-sub">{{ grp.title }}</h4>
            <OptionCard
              v-for="item in grp.items"
              :key="item.id"
              :item="item"
              v-bind="cardProps(item)"
              @select="selectItem"
            />
          </template>
        </template>
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
      <div class="bar-price" @click="showDetail = true">
        <span class="bar-label">当前报价 <span class="bar-hint"><van-icon name="arrow-up" size="10" /> 明细</span></span>
        <div class="bar-amount">
          <AnimatedNumber :value="stepTotal" />
        </div>
        <span v-if="store.selectionSummary" class="bar-summary ellipsis">{{ store.selectionSummary }}</span>
      </div>
      <button class="bar-btn" @click="goNext">
        {{ nextText }}
        <van-icon name="arrow" size="16" />
      </button>
    </div>

    <van-popup v-model:show="showDetail" position="bottom" round class="detail-popup">
      <div class="sheet-head">
        <span class="sheet-title">已选产品明细</span>
        <button class="sheet-close" @click="showDetail = false">
          <van-icon name="cross" size="18" />
        </button>
      </div>
      <div v-if="detailItems.length" class="sheet-list">
        <div v-for="(it, i) in detailItems" :key="i" class="sheet-item">
          <img v-if="it.img" :src="it.img" :alt="it.name" class="si-thumb" />
          <span v-else class="si-icon">{{ it.icon }}</span>
          <span class="si-name ellipsis">{{ it.name }}</span>
          <span class="si-price" :class="{ na: it.price == null }">
            {{ it.price != null ? '¥' + fmtPrice(it.price) : '面议' }}
          </span>
        </div>
      </div>
      <div v-else class="sheet-empty">暂未选择产品</div>
      <div class="sheet-foot">
        <div v-if="store.purchaseTax > 0" class="sf-line">
          <span>购置税</span>
          <span class="num">¥{{ fmtPrice(store.purchaseTax) }}</span>
        </div>
        <div v-if="store.feeTotal > 0" class="sf-line">
          <span>运输及其他</span>
          <span class="num">¥{{ fmtPrice(store.feeTotal) }}</span>
        </div>
        <div class="sf-total">
          <span>总计</span>
          <span class="num">¥{{ fmtPrice(store.finalTotal) }}</span>
        </div>
      </div>
    </van-popup>
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

.group-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin-top: 4px;
}

.group-title:first-child {
  margin-top: 0;
}

.special-title {
  color: var(--primary);
  margin-top: 16px;
}

.group-sub {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 10px;
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

.bar-price {
  cursor: pointer;
  user-select: none;
}

.bar-hint {
  font-size: 10px;
  color: var(--text-placeholder);
  font-weight: 400;
  margin-left: 2px;
}

.bar-summary {
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 2px;
  max-width: 100%;
}

/* 底部弹出：已选产品明细 */
.detail-popup {
  max-height: 72vh;
}

.sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px var(--space-page) 8px;
}

.sheet-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}

.sheet-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: var(--tag-bg);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.sheet-list {
  max-height: 42vh;
  overflow-y: auto;
  padding: 4px var(--space-page);
}

.sheet-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}

.sheet-item:last-child {
  border-bottom: none;
}

.si-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--tag-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.si-thumb {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.si-name {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  color: var(--text-main);
}

.si-price {
  font-size: 14px;
  font-weight: 600;
  color: var(--price);
  flex-shrink: 0;
}

.si-price.na {
  color: var(--text-secondary);
  font-weight: 400;
}

.sheet-empty {
  padding: 32px 0;
  text-align: center;
  font-size: 13px;
  color: var(--text-placeholder);
}

.sheet-foot {
  padding: 12px var(--space-page) calc(16px + var(--safe-bottom));
  border-top: 1px solid var(--border);
}

.sf-line {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
  padding: 3px 0;
}

.sf-line .num {
  color: var(--text-main);
}

.sf-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  margin-top: 8px;
}

.sf-total .num {
  color: var(--price);
  font-size: 20px;
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
