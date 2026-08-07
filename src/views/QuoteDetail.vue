<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { HISTORY_KEY } from '../stores/quote'
import { fmtPrice } from '../mock/helpers'

/**
 * Page C 报价单详情页（设计规格 页面C）：
 * Header(单号+有效) → 客户信息卡 → 车型信息卡 → 配置明细卡(虚线分隔) → 合计总价(22px)
 * 底部动作组：导出PDF / 发送 / 保存
 */
const route = useRoute()
const router = useRouter()

const quote = ref(null)
const notFound = ref(false)

const validUntil = computed(() => {
  if (!quote.value?.createdAt) return ''
  const d = new Date(quote.value.createdAt)
  d.setDate(d.getDate() + 30)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
})

/** 配置明细行（车辆/冷机/厢体/配装各项/运输及其他） */
const detailLines = computed(() => {
  const q = quote.value
  if (!q) return []
  const lines = [
    { label: '车辆价格', value: q.truck?.price || 0 },
    { label: '冷机价格', value: q.refrigerator?.price || 0 },
    { label: '厢体价格', value: q.body?.price || 0 }
  ]
  if (q.accessories?.length) {
    for (const a of q.accessories) lines.push({ label: a.name, value: a.price })
  }
  if (q.purchaseTax !== undefined && q.purchaseTax !== null) {
    lines.push({ label: '购置税', value: q.purchaseTax })
  }
  const fee = Number(q.transportFee || 0) + Number(q.otherFees || 0)
  if (fee > 0) lines.push({ label: '运输及其他', value: fee })
  return lines
})

function loadQuote() {
  try {
    const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    if (!Array.isArray(list)) throw new Error('bad data')
    quote.value = list.find((q) => q.no === route.params.no) || null
    notFound.value = !quote.value
  } catch (e) {
    notFound.value = true
  }
}

onMounted(loadQuote)

function exportPdf() {
  window.print()
}

async function share() {
  const q = quote.value
  const text = `【冷藏车报价单 ${q.no}】${q.customer?.name || ''} · ${q.truck?.name || ''} · 合计 ¥${fmtPrice(q.total || 0)}`
  try {
    if (navigator.share) {
      await navigator.share({ title: `冷藏车报价单 ${q.no}`, text })
    } else {
      await navigator.clipboard.writeText(text)
      showToast('报价信息已复制')
    }
  } catch (e) {
    /* 用户取消分享，忽略 */
  }
}

function save() {
  showToast('已保存到报价历史')
}
</script>

<template>
  <div class="page quote-detail-page">
    <header class="page-header">
      <button class="back-btn" @click="router.replace('/history')">
        <van-icon name="arrow-left" size="20" />
      </button>
      <h1 class="page-title">冷藏车报价单</h1>
      <span class="header-space"></span>
    </header>

    <div v-if="notFound" class="empty-box">
      <div class="empty-icon">
        <van-icon name="warning-o" size="40" color="var(--text-placeholder)" />
      </div>
      <p class="empty-title">未找到该报价单</p>
      <p class="empty-sub">报价单可能已被删除，请从历史记录进入</p>
      <button class="btn-primary empty-btn" @click="router.replace('/history')">返回报价历史</button>
    </div>

    <div v-else-if="quote" class="quote-main">
      <div class="q-head">
        <span class="q-no num">{{ quote.no }}</span>
        <span class="q-status">有效</span>
      </div>

      <div class="card q-card">
        <h2 class="q-title">客户信息</h2>
        <div class="kv-row">
          <span class="kv-label">客户名称</span>
          <span class="kv-value">{{ quote.customer?.name || '—' }}</span>
        </div>
        <div class="kv-row">
          <span class="kv-label">联系人</span>
          <span class="kv-value">{{ quote.customer?.name || '—' }}</span>
        </div>
        <div class="kv-row">
          <span class="kv-label">联系电话</span>
          <span class="kv-value num">{{ quote.customer?.phone || '—' }}</span>
        </div>
        <div class="kv-row">
          <span class="kv-label">有效期至</span>
          <span class="kv-value num">{{ validUntil }}</span>
        </div>
      </div>

      <div class="card q-card">
        <h2 class="q-title">车型信息</h2>
        <div class="truck-row">
          <div class="truck-thumb">
            <img
              v-if="quote.truck?.image"
              :src="quote.truck.image"
              :alt="quote.truck.name"
              class="tt-img"
            />
            <span v-else class="tt-icon">🚚</span>
          </div>
          <div class="truck-info">
            <span class="truck-name ellipsis">{{ quote.truck?.name || '—' }}</span>
            <span class="truck-sub">{{ quote.truck?.truckType || '' }}{{ quote.truck?.truckType && quote.truck?.energy ? ' · ' : '' }}{{ quote.truck?.energy || '' }}</span>
          </div>
          <span v-if="quote.truck?.price" class="truck-price num">¥{{ fmtPrice(quote.truck.price) }}</span>
          <span v-else class="truck-price truck-na">面议</span>
        </div>
      </div>

      <div class="card q-card">
        <h2 class="q-title">配置明细</h2>
        <div v-for="line in detailLines" :key="line.label" class="line-row">
          <span class="line-name ellipsis">{{ line.label }}</span>
          <span v-if="line.value" class="line-value num">¥{{ fmtPrice(line.value) }}</span>
          <span v-else class="line-value line-na">面议</span>
        </div>
        <div class="line-row">
          <span class="line-name ellipsis">保险费用</span>
          <span class="line-value line-na">询具体金额请联系销售</span>
        </div>
        <div class="line-row">
          <span class="line-name ellipsis">上户费用</span>
          <span class="line-value line-na">询具体金额请联系销售</span>
        </div>
        <div class="q-divider"></div>
        <div class="total-row">
          <span class="total-label">合计总价</span>
          <span class="total-value num">¥{{ fmtPrice(quote.total || 0) }}</span>
        </div>
      </div>
    </div>

    <div v-if="quote" class="action-bar">
      <button class="action-item" @click="exportPdf">
        <van-icon name="printer-o" size="20" />
        <span>导出PDF</span>
      </button>
      <button class="action-item" @click="share">
        <van-icon name="share-o" size="20" />
        <span>发送</span>
      </button>
      <button class="action-item" @click="save">
        <van-icon name="orders-o" size="20" />
        <span>保存</span>
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

.quote-main {
  padding: var(--space-page);
  display: flex;
  flex-direction: column;
  gap: var(--space-gap);
  padding-bottom: calc(76px + var(--safe-bottom) + 16px);
}

.q-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.q-no {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  letter-spacing: 0.5px;
}

.q-status {
  height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  background: var(--success-light);
  color: var(--success);
  font-size: 11px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.q-card {
  padding: var(--space-card);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.q-title {
  font-size: var(--fs-section);
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 6px;
}

.kv-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 28px;
}

.kv-label {
  font-size: 13px;
  color: var(--text-placeholder);
  flex-shrink: 0;
}

.kv-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main);
  min-width: 0;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.truck-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 4px;
}

.truck-thumb {
  width: 100px;
  height: 75px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--tag-bg);
  flex-shrink: 0;
}

.tt-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.tt-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.truck-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.truck-name {
  font-size: var(--fs-vehicle);
  font-weight: 500;
  color: var(--text-main);
}

.truck-sub {
  font-size: var(--fs-desc);
  color: var(--text-secondary);
}

.truck-price {
  font-size: var(--fs-vehicle);
  font-weight: 600;
  color: var(--price);
  flex-shrink: 0;
}

.truck-na,
.line-na {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 13px;
}

.line-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 28px;
}

.line-name {
  font-size: 13px;
  color: var(--text-main);
  min-width: 0;
}

.line-value {
  font-size: 13px;
  color: var(--text-main);
  font-weight: 500;
  flex-shrink: 0;
}

.q-divider {
  border-top: 1px dashed var(--border);
  margin: 8px 0;
}

.total-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.total-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

.total-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--price);
  line-height: 1.2;
}

.action-bar {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  z-index: 100;
  width: 100%;
  max-width: 430px;
  min-height: 64px;
  padding: 8px var(--space-page) calc(8px + var(--safe-bottom));
  background: var(--card);
  border-top: 1px solid var(--border-light);
  box-shadow: var(--shadow-2);
  display: flex;
  align-items: center;
}

.action-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
  padding: 4px 0;
}

.action-item:active {
  transform: scale(0.94);
}

.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px var(--space-page) 32px;
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
  width: 160px;
  margin-top: 24px;
}

@media print {
  .page-header,
  .action-bar {
    display: none !important;
  }

  .quote-main {
    padding: 0;
  }

  .q-card {
    box-shadow: none;
    border: 1px solid var(--border-light);
    break-inside: avoid;
  }
}
</style>
