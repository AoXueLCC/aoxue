<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useQuoteStore } from '../stores/quote'
import { fmtPrice } from '../mock/helpers'

/**
 * Page 05 SuccessPage：成功图标 → 报价单号/摘要 → 查看报价/分享客户/返回首页
 */
const router = useRouter()
const store = useQuoteStore()

const quote = computed(() => store.lastQuote || {})

function goHistory() {
  router.replace('/history')
}

function goHome() {
  store.reset()
  router.replace('/')
}

async function share() {
  const q = quote.value
  const who = q.customer?.name ? `${q.customer.name} 的` : ''
  const text = `【冷藏车智能报价】${who}冷藏车配置方案：${q.truck?.name || ''}，总价 ¥${fmtPrice(q.total || 0)}，报价单号 ${q.no || ''}`
  try {
    if (navigator.share) {
      await navigator.share({ title: '冷藏车智能报价', text })
    } else {
      await navigator.clipboard.writeText(text)
      showToast('报价信息已复制')
    }
  } catch (e) {
    /* 用户取消分享，忽略 */
  }
}
</script>

<template>
  <div class="page success-page">
    <div class="success-body">
      <div class="success-icon">
        <van-icon name="checked" size="40" color="#ffffff" />
      </div>
      <h1 class="success-title">报价保存成功</h1>
      <p class="success-sub">已生成专属报价单号，可分享给客户确认</p>

      <div class="card quote-card">
        <div class="qc-row">
          <span class="qc-label">报价单号</span>
          <span class="qc-no num">{{ quote.no }}</span>
        </div>
        <div class="qc-row">
          <span class="qc-label">客户</span>
          <span class="qc-value ellipsis">{{ quote.customer?.name || '—' }}</span>
        </div>
        <div class="qc-row">
          <span class="qc-label">车型</span>
          <span class="qc-value ellipsis">{{ quote.truck?.name || '—' }}</span>
        </div>
        <div class="qc-row qc-total">
          <span class="qc-label">总价</span>
          <span class="qc-amount num">¥{{ fmtPrice(quote.total || 0) }}</span>
        </div>
      </div>
    </div>

    <div class="success-actions">
      <button class="btn-secondary" @click="goHistory">
        <van-icon name="orders-o" size="18" />
        查看报价
      </button>
      <button class="btn-secondary" @click="share">
        <van-icon name="share-o" size="18" />
        分享客户
      </button>
      <button class="btn-primary" @click="goHome">
        <van-icon name="wap-home-o" size="18" />
        返回首页
      </button>
    </div>
  </div>
</template>

<style scoped>
.success-page {
  display: flex;
  flex-direction: column;
  padding: var(--space-page);
  min-height: 100vh;
}

.success-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 48px;
}

.success-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--success);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 32px rgba(34, 197, 94, 0.35);
  animation: pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes pop {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
  margin-top: 20px;
}

.success-sub {
  font-size: var(--fs-desc);
  color: var(--text-secondary);
  margin-top: 8px;
  text-align: center;
}

.quote-card {
  width: 100%;
  margin-top: 32px;
  padding: var(--space-card);
}

.qc-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}

.qc-row:last-child {
  border-bottom: none;
}

.qc-label {
  font-size: var(--fs-desc);
  color: var(--text-secondary);
  flex-shrink: 0;
}

.qc-no {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 1px;
}

.qc-value {
  font-size: var(--fs-body);
  color: var(--text-main);
  font-weight: 500;
  min-width: 0;
  text-align: right;
}

.qc-total .qc-amount {
  font-size: 24px;
  font-weight: 700;
  color: var(--price);
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-gap);
  padding: 16px 0 calc(16px + var(--safe-bottom));
}
</style>
