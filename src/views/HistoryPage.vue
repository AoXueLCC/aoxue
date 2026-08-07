<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { HISTORY_KEY } from '../stores/quote'
import { fmtPrice } from '../mock/helpers'

/**
 * Page 06 HistoryPage：localStorage 报价记录列表（客户名/车型/金额/日期 卡片）
 */
const router = useRouter()
const list = ref([])

function fmtDate(ts) {
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    list.value = Array.isArray(saved) ? saved.slice().reverse() : []
  } catch (e) {
    list.value = []
  }
})
</script>

<template>
  <div class="page history-page">
    <header class="page-header">
      <button class="back-btn" @click="router.replace('/')">
        <van-icon name="arrow-left" size="20" />
      </button>
      <h1 class="page-title">报价历史</h1>
      <span class="header-space"></span>
    </header>

    <div v-if="list.length" class="history-main">
      <div
        v-for="q in list"
        :key="q.no"
        class="card history-card"
        @click="router.push(`/quote/${q.no}`)"
      >
        <div class="hc-head">
          <span class="hc-name ellipsis">{{ q.customer?.name || '未填写客户' }}</span>
          <span class="hc-amount num">¥{{ fmtPrice(q.total || 0) }}</span>
        </div>
        <div class="hc-sub ellipsis">{{ q.truck?.name || '未选择车型' }}</div>
        <div class="hc-foot">
          <span class="hc-no num">{{ q.no }}</span>
          <span class="hc-date num">{{ fmtDate(q.createdAt) }}</span>
        </div>
      </div>
    </div>

    <div v-else class="empty-box">
      <div class="empty-icon">
        <van-icon name="orders-o" size="40" color="var(--text-placeholder)" />
      </div>
      <p class="empty-title">暂无报价记录</p>
      <p class="empty-sub">保存报价后，历史记录将显示在这里</p>
      <button class="btn-primary empty-btn" @click="router.replace('/')">去选车型</button>
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

.history-main {
  padding: var(--space-page);
  display: flex;
  flex-direction: column;
  gap: var(--space-gap);
}

.history-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  min-height: 100px;
  padding: var(--space-card);
  cursor: pointer;
  transition: transform 0.15s ease-out;
}

.history-card:active {
  transform: scale(0.99);
}

.hc-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.hc-name {
  font-size: var(--fs-body);
  font-weight: 600;
  color: var(--text-main);
  min-width: 0;
}

.hc-amount {
  font-size: var(--fs-vehicle);
  font-weight: 700;
  color: var(--price);
  flex-shrink: 0;
}

.hc-sub {
  font-size: var(--fs-desc);
  color: var(--text-secondary);
}

.hc-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: var(--fs-caption);
  color: var(--text-placeholder);
}

.hc-no {
  letter-spacing: 0.5px;
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
  font-size: var(--fs-desc);
  color: var(--text-secondary);
  margin-top: 4px;
}

.empty-btn {
  width: 160px;
  margin-top: 24px;
}
</style>
