<script setup>
import { computed, ref } from 'vue'
import { useQuoteStore } from '../stores/quote'
import { fmtPrice } from '../mock/helpers'

/**
 * 配置汇总（QuoteConfirmPage）：报价单风格，沿用线上旧版报价单设计
 * 车型图(时间戳角标/编号) + 配置明细 + 费用明细表格 + 成交价
 * 同时也是"保存图片"长图的截图源，样式即长图效果
 */
const store = useQuoteStore()

const accessoryNames = computed(() => store.accessories.map((a) => a.name).join('、'))

/** 车型图（底盘无独立图，按用户要求也用车型图） */
const truckImg = computed(() => store.truck?.gallery?.[0] || store.truck?.image || '')

/** 报价单号 + 时间戳（进入页面时生成一次，长图/页面一致） */
const now = new Date()
const pad = (n) => String(n).padStart(2, '0')
const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
const quoteNo = store.genQuoteNo()

const sections = computed(() => [
  { icon: '🚛', img: truckImg.value, title: '车辆', tag: store.truck ? `${store.truck.truckType} · ${store.truck.energy}` : '', label: store.truck ? store.truck.name : '未选择', price: store.vehiclePrice },
  { icon: '🔧', img: '', title: '底盘', tag: '', label: store.chassis ? store.chassis.name : '未选择', price: store.chassisPrice },
  { icon: '❄️', img: store.refrigerator?.image || '', title: '冷机', tag: store.refrigerator ? store.refrigerator.cooling : '', label: store.refrigerator ? store.refrigerator.model : '未选择', price: store.refrigeratorPrice },
  { icon: '📦', img: store.body?.image || '', title: '厢体', tag: store.body ? `${store.body.thickness}保温` : '', label: store.body ? store.body.name : '未选择', price: store.bodyPrice },
  { icon: '🧩', img: '', title: '配装', tag: store.accessoryCount ? `${store.accessoryCount}项` : '', label: accessoryNames.value, price: store.accessoryTotal }
])

/** 配装明细弹层：点配装模块查看具体已选项 */
const showDetail = ref(false)
const detailItems = computed(() =>
  store.accessories.map((a) => ({ icon: a.icon || '📎', name: a.name, price: store.accessoryPrice(a) }))
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
    <!-- 车型图 + 时间戳角标 + 编号 -->
    <div class="card media-card">
      <div class="media">
        <div
          v-if="truckImg"
          class="media-img"
          :style="{ backgroundImage: `url(${truckImg})` }"
        ></div>
        <div v-else class="media-img media-empty">🚛</div>
        <div class="stamp">
          <span class="stamp-label">报价生成时间</span>
          <span class="stamp-time">{{ timeStr }}</span>
        </div>
      </div>
      <div class="media-body">
        <p class="quote-no">报价编号：{{ quoteNo }}</p>
        <p class="media-name">{{ store.truck ? store.truck.name : '未选择车型' }}</p>
      </div>
    </div>

    <!-- 配置明细 -->
    <div class="card">
      <h3 class="card-title">配置明细</h3>
      <div
        v-for="s in sections"
        :key="s.title"
        class="cfg-row"
        :class="{ tappable: s.title === '配装' && store.accessoryCount }"
        @click="onSectionClick(s)"
      >
        <span v-if="!s.img" class="cfg-icon">{{ s.icon }}</span>
        <div v-else class="cfg-thumb" :style="{ backgroundImage: `url(${s.img})` }"></div>
        <div class="cfg-main">
          <div class="cfg-head">
            <span class="cfg-title">{{ s.title }}</span>
            <span v-if="s.tag" class="cfg-tag">{{ s.tag }}</span>
          </div>
          <div class="cfg-row2">
            <span class="cfg-label ellipsis">{{ s.label }}</span>
            <span v-if="s.price" class="cfg-price num">¥{{ fmtPrice(s.price) }}</span>
            <span v-else class="cfg-price na">面议</span>
          </div>
        </div>
        <van-icon v-if="s.title === '配装' && store.accessoryCount" name="arrow" class="cfg-arrow" />
      </div>
    </div>

    <!-- 费用明细（旧版同款表格） -->
    <div class="card">
      <h3 class="card-title">费用明细</h3>
      <div class="fee-table">
        <div class="fee-head">
          <span>项目</span>
          <span>金额</span>
        </div>
        <div v-for="line in store.priceLines" :key="line.label" class="fee-item">
          <span>{{ line.label }}</span>
          <span v-if="line.value" class="right num">¥{{ fmtPrice(line.value) }}</span>
          <span v-else class="right na">面议</span>
        </div>
        <div v-if="store.discountValue > 0" class="fee-item">
          <span>原价</span>
          <span class="right origin num">¥{{ fmtPrice(store.grossTotal) }}</span>
        </div>
        <div class="fee-item discount-row" @click="openDiscount">
          <span>优惠</span>
          <span v-if="store.discountValue > 0" class="right discount num">-¥{{ fmtPrice(store.discountValue) }}</span>
          <span v-else class="right cta">点击设置优惠 <van-icon name="arrow" /></span>
        </div>
        <div class="fee-total">
          <span class="total-label">{{ store.discountValue > 0 ? '成交价' : '合计总价' }}</span>
          <span class="total-amount num"><AnimatedNumber :value="store.finalTotal" /></span>
        </div>
      </div>
      <p class="fee-note">以上价格含购置税；保险、上户费用需另行咨询销售</p>
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

/* ============ 通用卡片 ============ */
.card {
  background: var(--card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-1);
  padding: var(--space-card);
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--primary);
  display: inline-block;
}

/* ============ 车型图卡（时间戳角标 + 编号） ============ */
.media-card {
  padding: 0;
  overflow: hidden;
}

.media {
  position: relative;
}

/* 背景图 cover：html2canvas 对 object-fit 渲染有缺陷会拉伸变形，background-size: cover 稳定 */
.media-img {
  width: 100%;
  height: var(--quote-img-h, 160px);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #e9edf2;
  display: block;
}

.media-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52px;
  color: #b8bfc9;
}

.stamp {
  position: absolute;
  top: var(--quote-stamp-top, 12px);
  right: var(--quote-stamp-right, 12px);
  background: var(--primary);
  color: #fff;
  border-radius: 999px;
  padding: var(--quote-stamp-pad, 6px 12px);
  text-align: center;
  line-height: 1.4;
  box-shadow: 0 2px 8px rgba(0, 102, 255, 0.35);
}

.stamp-label {
  font-size: var(--quote-stamp-label, 9px);
  opacity: 0.9;
  display: block;
}

.stamp-time {
  font-size: var(--quote-stamp-time, 11px);
  font-weight: 600;
  display: block;
}

.media-body {
  padding: var(--quote-body-pad, 10px 12px 12px);
}

.quote-no {
  font-size: var(--quote-no, 11px);
  color: var(--text-secondary);
}

.media-name {
  margin-top: 2px;
  font-size: var(--quote-name, 14px);
  font-weight: 600;
  color: var(--text-main);
}

/* ============ 配置明细 ============ */
.cfg-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: var(--quote-spec-py, 8px) 0;
  border-bottom: 1px solid #f2f3f5;
}

.cfg-row:last-child {
  border-bottom: none;
}

.cfg-row.tappable {
  cursor: pointer;
}

.cfg-row.tappable:active {
  background: var(--tag-bg);
}

.cfg-icon {
  font-size: var(--quote-icon, 15px);
  flex-shrink: 0;
}

.cfg-thumb {
  width: var(--quote-thumb, 36px);
  height: var(--quote-thumb, 36px);
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--tag-bg);
  flex-shrink: 0;
}

.cfg-main {
  flex: 1;
  min-width: 0;
}

.cfg-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.cfg-title {
  font-size: var(--quote-cfg-title, 11px);
  font-weight: 500;
  color: var(--text-secondary);
}

.cfg-tag {
  height: var(--quote-cfg-tag-h, 16px);
  padding: 0 6px;
  border-radius: 8px;
  background: var(--tag-bg);
  color: var(--text-secondary);
  font-size: var(--quote-cfg-tag, 9px);
  display: inline-flex;
  align-items: center;
}

.cfg-row2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.cfg-label {
  font-size: var(--quote-label, 13px);
  font-weight: 500;
  color: var(--text-main);
  min-width: 0;
}

.cfg-price {
  font-size: var(--quote-price, 14px);
  font-weight: 700;
  color: var(--price);
  flex-shrink: 0;
}

.cfg-price.na {
  font-size: var(--quote-price-na, 12px);
  font-weight: 500;
  color: var(--text-secondary);
}

.cfg-arrow {
  color: var(--text-secondary);
  flex-shrink: 0;
}

/* ============ 费用明细（旧版表格） ============ */
.fee-table {
  margin-top: 4px;
}

.fee-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 2px solid #f2f3f5;
  font-size: var(--quote-fee-head-fs, 10px);
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.fee-head span:last-child {
  text-align: right;
}

.fee-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: var(--quote-fee-py, 9px) 0;
  border-bottom: 1px solid #f2f3f5;
  font-size: var(--quote-fee-fs, 13px);
  color: var(--text-main);
}

.fee-item .right {
  font-weight: 500;
  flex-shrink: 0;
}

.fee-item .right.na {
  font-weight: 400;
  color: var(--text-secondary);
}

.origin {
  color: var(--text-secondary);
  text-decoration: line-through;
  font-weight: 400 !important;
}

.discount-row {
  cursor: pointer;
}

.discount-row:active {
  background: var(--tag-bg);
}

.discount {
  color: var(--price);
  font-weight: 600 !important;
}

.cta {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 400;
}

.fee-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  background: #f9fafb;
  margin-top: 8px;
  padding: var(--quote-fee-total-py, 12px) 10px;
  border-radius: 6px;
}

.total-label {
  font-size: var(--quote-fee-total-label, 14px);
  font-weight: 700;
  color: var(--text-main);
}

.total-amount {
  font-size: var(--quote-total, 18px);
  font-weight: 700;
  color: var(--price);
  line-height: 1.2;
}

.total-amount :deep(.animated-price) {
  font-size: var(--quote-total, 18px);
  font-weight: 700;
  color: var(--price);
}

.fee-note {
  margin-top: 8px;
  font-size: var(--quote-note, 10px);
  color: var(--text-secondary);
}

/* ============ 配装明细弹层 ============ */
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

/* ============ 优惠弹层 ============ */
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
