<script setup>
import AccessoryCard from './AccessoryCard.vue'
import { fmtPrice } from '../mock/helpers'

/**
 * 配装列表：多选管理 + 已选汇总
 * items: 全部配装  selectedIds: 已选 id 数组
 */
const props = defineProps({
  items: { type: Array, default: () => [] },
  selectedIds: { type: Array, default: () => [] }
})

const emit = defineEmits(['toggle'])

const selectedTotal = () => {
  const total = props.items
    .filter((a) => props.selectedIds.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0)
  return total
}
</script>

<template>
  <div class="accessory-list">
    <div class="list-head">
      <span class="head-title">
        选装配件
        <span class="head-hint">可多选</span>
      </span>
      <span class="head-count">
        已选 {{ selectedIds.length }} 项
        <span v-if="selectedIds.length" class="head-total">¥{{ fmtPrice(selectedTotal()) }}</span>
      </span>
    </div>

    <div class="list-body">
      <AccessoryCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        :selected="selectedIds.includes(item.id)"
        @toggle="emit('toggle', item)"
      />
    </div>
  </div>
</template>

<style scoped>
.accessory-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.head-title {
  font-size: 15px;
  font-weight: 700;
  color: #1d2129;
}

.head-hint {
  font-size: 11px;
  color: #86909c;
  font-weight: 400;
  margin-left: 6px;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 8px;
}

.head-count {
  font-size: 12px;
  color: #4e5969;
}

.head-total {
  color: #ff4d4f;
  font-weight: 700;
  margin-left: 4px;
}

.list-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
