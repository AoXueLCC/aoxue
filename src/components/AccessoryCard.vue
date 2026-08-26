<script setup>
import { computed } from 'vue'
import { fmtPrice } from '../mock/helpers'
import { useQuoteStore } from '../stores/quote'

/**
 * 配装（选装件）卡片：图标/名称/品牌/价格 + 勾选状态
 * 价格由 store 计算（地板等按厢长取价），0→免费，null→面议
 */
const props = defineProps({
  item: { type: Object, required: true },
  selected: { type: Boolean, default: false }
})

const emit = defineEmits(['toggle'])

const store = useQuoteStore()

const priceText = computed(() => {
  const p = store.accessoryPrice(props.item)
  if (p == null) return '面议'
  if (p === 0) return '免费'
  return `¥${fmtPrice(p)}`
})
</script>

<template>
  <div class="accessory-card" :class="{ selected }" @click="emit('toggle', item)">
    <div class="icon-box">{{ item.icon }}</div>
    <div class="info">
      <span class="name">{{ item.name }}</span>
      <span class="brand">{{ item.brand }}</span>
    </div>
    <div class="right">
      <span class="price">{{ priceText }}</span>
      <span class="check" :class="{ checked: selected }">
        <van-icon v-if="selected" name="success" size="12" />
      </span>
    </div>
  </div>
</template>

<style scoped>
.accessory-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: 0 2px 10px rgba(29, 33, 41, 0.05);
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.2s, background 0.2s;
}

.accessory-card:active {
  transform: scale(0.98);
}

.accessory-card.selected {
  border-color: #1677ff;
  background: #f7fbff;
}

.icon-box {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #eef5ff, #e0eeff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.brand {
  font-size: 11px;
  color: #86909c;
}

.right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price {
  font-size: 15px;
  font-weight: 700;
  color: #ff4d4f;
  font-variant-numeric: tabular-nums;
}

.check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #d4d8de;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.check.checked {
  background: #1677ff;
  border-color: #1677ff;
  color: #ffffff;
}
</style>
