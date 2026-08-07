<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuoteStore } from '../stores/quote'
import ConfigSummary from '../components/ConfigSummary.vue'

/**
 * Page 04 QuoteConfirmPage：配置明细(报价单风格) → 底部总价 + 保存报价
 */
const router = useRouter()
const store = useQuoteStore()

const saving = ref(false)

function onSave() {
  saving.value = true
  setTimeout(() => {
    store.lastQuote = store.saveQuote()
    saving.value = false
    router.push('/success')
  }, 500)
}

function onRestart() {
  store.reset()
  router.replace('/')
}
</script>

<template>
  <div class="page save-page page-with-bar">
    <header class="page-header">
      <button class="back-btn" @click="router.replace('/config')">
        <van-icon name="arrow-left" size="20" />
      </button>
      <h1 class="page-title">确认报价</h1>
      <span class="header-space"></span>
    </header>

    <div class="save-main">
      <ConfigSummary />
    </div>

    <div class="bottom-bar">
      <div class="bar-price">
        <span class="bar-label">总价</span>
        <div class="bar-amount">
          <AnimatedNumber :value="store.finalTotal" />
        </div>
        <span v-if="store.selectionSummary" class="bar-summary">{{ store.selectionSummary }}</span>
      </div>
      <button class="bar-btn" :disabled="saving" @click="onSave">
        <van-loading v-if="saving" size="18" color="#ffffff" />
        <template v-else>保存报价</template>
      </button>
      <button class="bar-btn ghost" @click="onRestart">
        <van-icon name="replay" size="16" />
        重来
      </button>
    </div>
  </div>
</template>

<script>
import AnimatedNumber from '../components/AnimatedNumber.vue'
export default { components: { AnimatedNumber } }
</script>

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

.save-main {
  padding: var(--space-page);
  display: flex;
  flex-direction: column;
  gap: var(--space-gap);
}

.bar-amount :deep(.animated-price) {
  font-size: 18px;
  font-weight: 700;
  color: var(--price);
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
  transition: transform 0.15s ease-out, opacity 0.15s;
}

.bar-btn:active {
  transform: scale(0.98);
}

.bar-btn:disabled {
  opacity: 0.6;
}

.bar-btn.ghost {
  width: 80px;
  background: var(--tag-bg);
  color: var(--text-secondary);
  font-size: 14px;
}
</style>
