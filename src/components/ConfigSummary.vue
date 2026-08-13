<script setup>
import { computed, ref } from 'vue'
import { useQuoteStore } from '../stores/quote'
import { fmtPrice } from '../mock/helpers'

/**
 * 配置汇总（QuoteConfirmPage）：车辆/底盘/冷机/厢体/配装 + 费用/备注 + 明细 + 总价 40px
 */
const store = useQuoteStore()

const accessoryNames = computed(() => store.accessories.map((a) => a.name).join('、'))

/** 车型图（底盘无独立图，按用户要求也用车型图） */
const truckImg = computed(() => store.truck?.gallery?.[0] || store.truck?.image || '')

const sections = computed(() => [
  { icon: '🚛', img: truckImg.value, title: '车辆', tag: store.truck ? `${store.truck.truckType} · ${store.truck.energy}` : '', label: store.truck ? store.truck.name : '未选择', price: store.vehiclePrice },
  { icon: '🔧', img: truckImg.value, title: '底盘', tag: '', label: store.chassis ? store.chassis.name : '未选择', price: store.chassisPrice },
  { icon: '❄️', img: store.refrigerator?.image || '', title: '冷机', tag: store.refrigerator ? store.refrigerator.cooling : '', label: store.refrigerator ? store.refrigerator.model : '未选择', price: store.refrigeratorPrice },
  { icon: '📦', img: store.body?.image || '', title: '厢体', tag: store.body ? `${store.body.thickness}保温` : '', label: store.body ? store.body.name : '未选择', price: store.bodyPrice },
  { icon: '🧩', img: '', title: '配装', tag: store.accessoryCount ? `${store.accessoryCount}项` : '', label: accessoryNames.value, price: store.accessoryTotal }
])

/** 配装明细弹层：点配装模块查看具体已选项 */
const showDetail = ref(false)
const detailItems = computed(() =>
  store.accessories.map((a) => ({ icon: a.icon || '📎', name: a.name, price: a.price }))
)

function onSectionClick(s) {
  if (s.title === '配装' && detailItems.value.length) showDetail.value = true
}

/** 优惠弹层：按折扣（折数）或按金额（元）两种方式，实时预览成交价 */
const showDiscount = ref(false)
const discountMode = ref('rate')
const rateInput = ref('')
const amountInput = ref('')

function openDiscount() {
  discountMode.value = store.discountType === 'amount' ? 'amount' : 'rate'
  rateInput.value = store.discountRate ? String(store.discountRate) : ''
  amountInput.value = store.discountAmount ? String(store.discountAmount) : ''
  showDiscount.value = true
}

const previewDiscount = computed(() => {
  if (discountMode.value === 'rate') {
    const rate = Number(rateInput.value)
    if (!rate || rate <= 0 || rate >= 10) return 0
    return Math.min(Math.round((store.grossTotal * (10 - rate)) / 10), store.grossTotal)
  }
  const amt = Number(amountInput.value)
  if (!amt || amt <= 0) return 0
  return Math.min(amt, store.grossTotal)
})

const previewFinal = computed(() => store.grossTotal - previewDiscount.value)

function applyDiscount() {
  if (previewDiscount.value > 0) {
    store.discountType = discountMode.value
    if (discountMode.value === 'rate') {
      store.discountRate = Number(rateInput.value)
      store.discountAmount = 0
    } else {
      store.discountAmount = Number(amountInput.value)
      store.discountRate = 0
    }
  } else {
    store.discountType = 'none'
    store.discountRate = 0
    store.discountAmount = 0
  }
  showDiscount.value = false
}

function clearDiscount() {
  store.discountType = 'none'
  store.discountRate = 0
  store.discountAmount = 0
  showDiscount.value = false
}
</script>

<template>
  <div class="config-summary">
    <div
      v-for="s in sections"
      :key="s.title"
      class="summary-section"
      :class="{ tappable: s.title === '配装' && store.accessoryCount }"
      @click="onSectionClick(s)"
    >
      <img v-if="s.img" :src="s.img" :alt="s.title" class="sec-thumb" />
      <div class="sec-main">
        <div class="sec-head">
          <span v-if="!s.img" class="sec-icon">{{ s.icon }}</span>
          <span class="sec-title">{{ s.title }}</span>
          <span v-if="s.tag" class="sec-tag">{{ s.tag }}</span>
          <van-icon v-if="s.title === '配装' && store.accessoryCount" name="arrow" class="sec-arrow" />
        </div>
        <div v-if="s.label" class="sec-row">
          <span class="row-label ellipsis">{{ s.label }}</span>
          <span v-if="s.price" class="row-price num">¥{{ fmtPrice(s.price) }}</span>
          <span v-else class="row-price row-na">面议</span>
        </div>
        <div v-else class="sec-empty">未选择</div>
      </div>
    </div>

    <div class="final-card">
      <div v-for="line in store.priceLines" :key="line.label" class="final-row">
        <span class="row-name">{{ line.label }}</span>
        <span v-if="line.value" class="row-value num">¥{{ fmtPrice(line.value) }}</span>
        <span v-else class="row-value row-na">面议</span>
      </div>
      <div class="final-row">
        <span class="row-name">保险费用</span>
        <span class="row-value row-na">询具体金额请联系销售</span>
      </div>
      <div class="final-row">
        <span class="row-name">上户费用</span>
        <span class="row-value row-na">询具体金额请联系销售</span>
      </div>
      <div class="final-divider"></div>
      <div v-if="store.discountValue > 0" class="final-row">
        <span class="row-name">原价</span>
        <span class="row-value origin num">¥{{ fmtPrice(store.grossTotal) }}</span>
      </div>
      <div class="final-row discount-row" @click="openDiscount">
        <span class="row-name">优惠</span>
        <span v-if="store.discountValue > 0" class="row-value discount num">-¥{{ fmtPrice(store.discountValue) }}</span>
        <span v-else class="row-value discount-cta">点击设置优惠 <van-icon name="arrow" /></span>
      </div>
      <div class="final-total">
        <span class="total-label">{{ store.discountValue > 0 ? '成交价' : '合计总价' }}</span>
        <span class="total-value num"><AnimatedNumber :value="store.finalTotal" /></span>
      </div>
    </div>

    <van-popup v-model:show="showDetail" position="bottom" round class="detail-popup">
      <div class="sheet-head">
        <span class="sheet-title">已选配装明细</span>
        <button class="sheet-close" @click="showDetail = false">
          <van-icon name="cross" size="18" />
        </button>
      </div>
      <div v-if="detailItems.length" class="sheet-list">
        <div v-for="(it, i) in detailItems" :key="i" class="sheet-item">
          <span class="si-icon">{{ it.icon }}</span>
          <span class="si-name ellipsis">{{ it.name }}</span>
          <span class="si-price" :class="{ na: it.price == null }">
            {{ it.price != null ? '¥' + fmtPrice(it.price) : '面议' }}
          </span>
        </div>
      </div>
      <div v-else class="sheet-empty">暂未选择配装</div>
    </van-popup>

    <van-popup v-model:show="showDiscount" position="bottom" round class="discount-popup">
      <div class="sheet-head">
        <span class="sheet-title">设置优惠</span>
        <button class="sheet-close" @click="showDiscount = false">
          <van-icon name="cross" size="18" />
        </button>
      </div>
      <div class="discount-body">
        <div class="mode-toggle">
          <button
            class="mode-btn"
            :class="{ active: discountMode === 'rate' }"
            @click="discountMode = 'rate'"
          >按折扣</button>
          <button
            class="mode-btn"
            :class="{ active: discountMode === 'amount' }"
            @click="discountMode = 'amount'"
          >按金额</button>
        </div>

        <van-field
          v-if="discountMode === 'rate'"
          v-model="rateInput"
          type="number"
          label="折扣"
          placeholder="如 9.5 表示 95 折"
        >
          <template #right-icon><span class="field-unit">折</span></template>
        </van-field>
        <van-field
          v-else
          v-model="amountInput"
          type="number"
          label="优惠"
          placeholder="输入优惠金额"
        >
          <template #right-icon><span class="field-unit">元</span></template>
        </van-field>

        <div class="discount-preview">
          <div class="dp-row">
            <span class="dp-label">原价</span>
            <span class="dp-value num">¥{{ fmtPrice(store.grossTotal) }}</span>
          </div>
          <div class="dp-row">
            <span class="dp-label">优惠</span>
            <span class="dp-value discount num">-¥{{ fmtPrice(previewDiscount) }}</span>
          </div>
          <div class="dp-row dp-total">
            <span class="dp-label">成交价</span>
            <span class="dp-value total num">¥{{ fmtPrice(previewFinal) }}</span>
          </div>
        </div>

        <div class="discount-actions">
          <button
            v-if="store.discountValue > 0"
            class="dp-btn ghost"
            @click="clearDiscount"
          >清除优惠</button>
          <button class="dp-btn" @click="applyDiscount">确定</button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import AnimatedNumber from './AnimatedNumber.vue'
export default { components: { AnimatedNumber } }
</script>

<style scoped>
.config-summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-gap);
}

.summary-section,
.final-card {
  background: var(--card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-1);
  padding: var(--space-card);
}

.summary-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-section.tappable {
  cursor: pointer;
}

.summary-section.tappable:active {
  background: var(--tag-bg);
}

.sec-thumb {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.sec-main {
  flex: 1;
  min-width: 0;
}

.sec-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.sec-icon {
  font-size: 14px;
}

.sec-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

.sec-tag {
  margin-left: auto;
  height: 22px;
  padding: 0 10px;
  border-radius: var(--radius-chip);
  background: var(--tag-bg);
  color: var(--text-secondary);
  font-size: var(--fs-caption);
  display: inline-flex;
  align-items: center;
}

.sec-arrow {
  margin-left: 4px;
  color: var(--text-secondary);
}

.sec-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.row-label {
  font-size: var(--fs-body);
  color: var(--text-main);
  font-weight: 500;
  min-width: 0;
}

.row-price {
  font-size: 15px;
  font-weight: 700;
  color: var(--price);
  flex-shrink: 0;
}

.sec-empty {
  font-size: var(--fs-desc);
  color: var(--text-placeholder);
}

.final-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  height: 28px;
  font-size: var(--fs-body);
  color: var(--text-main);
}

.row-value {
  font-weight: 500;
  color: var(--text-main);
  flex-shrink: 0;
}

.row-na {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 13px;
}

.final-divider {
  border-top: 1px dashed var(--border);
  margin: 8px 0;
}

.final-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding-top: 2px;
}

.total-label {
  font-size: var(--fs-section);
  font-weight: 600;
  color: var(--text-main);
}

.total-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--price);
  line-height: 1.2;
}

.total-value :deep(.animated-price) {
  font-size: 22px;
  font-weight: 700;
  color: var(--price);
}

/* 配装明细弹层 */
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

/* 优惠入口 + 原价/成交价 */
.discount-row {
  cursor: pointer;
}

.discount-row:active {
  background: var(--tag-bg);
}

.origin {
  color: var(--text-secondary);
  text-decoration: line-through;
  font-weight: 500;
}

.discount {
  color: var(--price);
}

.discount-cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
}

/* 优惠弹层 */
.discount-popup {
  max-height: 80vh;
}

.discount-body {
  padding: 8px var(--space-page) calc(16px + var(--safe-bottom));
}

.mode-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.mode-btn {
  flex: 1;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--tag-bg);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
}

.mode-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #ffffff;
}

.field-unit {
  font-size: 14px;
  color: var(--text-secondary);
}

.discount-preview {
  margin-top: 12px;
  padding: 12px var(--space-card);
  border-radius: 10px;
  background: var(--tag-bg);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dp-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.dp-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.dp-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

.dp-value.discount {
  color: var(--price);
}

.dp-row.dp-total {
  padding-top: 8px;
  border-top: 1px dashed var(--border);
}

.dp-value.total {
  font-size: 18px;
  color: var(--price);
}

.discount-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.dp-btn {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 22px;
  background: var(--primary);
  color: #ffffff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.dp-btn:active {
  transform: scale(0.98);
}

.dp-btn.ghost {
  background: var(--tag-bg);
  color: var(--text-secondary);
}
</style>
