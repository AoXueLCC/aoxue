<script setup>
import { computed } from 'vue'
import { useQuoteStore } from '../stores/quote'
import { fmtPrice } from '../mock/helpers'

/**
 * 配置汇总（QuoteConfirmPage）：车辆/冷机/厢体/配装 + 费用/备注 + 明细 + 总价 40px
 */
const store = useQuoteStore()

const accessoryNames = computed(() => store.accessories.map((a) => a.name).join('、'))

const sections = computed(() => [
  { icon: '🚛', title: '车辆', tag: store.truck ? `${store.truck.truckType} · ${store.truck.energy}` : '', label: store.truck ? store.truck.name : '未选择', price: store.vehiclePrice },
  { icon: '❄️', title: '冷机', tag: store.refrigerator ? store.refrigerator.cooling : '', label: store.refrigerator ? store.refrigerator.model : '未选择', price: store.refrigeratorPrice },
  { icon: '📦', title: '厢体', tag: store.body ? `${store.body.thickness}保温` : '', label: store.body ? store.body.name : '未选择', price: store.bodyPrice },
  { icon: '🧩', title: '配装', tag: store.accessoryCount ? `${store.accessoryCount}项` : '', label: accessoryNames.value, price: store.accessoryTotal }
])
</script>

<template>
  <div class="config-summary">
    <div v-for="s in sections" :key="s.title" class="summary-section">
      <div class="sec-head">
        <span class="sec-icon">{{ s.icon }}</span>
        <span class="sec-title">{{ s.title }}</span>
        <span v-if="s.tag" class="sec-tag">{{ s.tag }}</span>
      </div>
      <div v-if="s.label" class="sec-row">
        <span class="row-label ellipsis">{{ s.label }}</span>
        <span v-if="s.price" class="row-price num">¥{{ fmtPrice(s.price) }}</span>
        <span v-else class="row-price row-na">面议</span>
      </div>
      <div v-else class="sec-empty">未选择</div>
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
      <div class="final-total">
        <span class="total-label">合计总价</span>
        <span class="total-value num"><AnimatedNumber :value="store.finalTotal" /></span>
      </div>
    </div>
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
</style>
