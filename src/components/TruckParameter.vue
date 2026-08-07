<script setup>
import { computed } from 'vue'

/**
 * 车辆参数：白卡网格，从车型数据组装 参数名/参数值
 */
const props = defineProps({
  truck: { type: Object, required: true }
})

const rows = computed(() => {
  const t = props.truck
  const list = [
    { label: '发动机', value: t.engine },
    { label: '马力', value: t.power },
    { label: '变速箱', value: t.gearbox },
    { label: '轴距', value: t.wheelbase },
    { label: '轮胎', value: t.tire },
    { label: '排放标准', value: t.emission },
    { label: '货箱长度', value: t.cargoLen },
    { label: '总质量', value: t.totalMass },
    { label: '额定载重', value: t.payload }
  ]
  if (t.battery && t.battery !== '—') {
    list.push({ label: '电池容量', value: t.battery })
  }
  if (t.tankVolume && t.tankVolume !== '—') {
    list.push({ label: '油箱容积', value: t.tankVolume })
  }
  return list
})
</script>

<template>
  <div class="truck-parameter">
    <h2 class="section-title">车辆参数</h2>
    <div class="param-grid">
      <div v-for="row in rows" :key="row.label" class="param-cell">
        <span class="cell-label">{{ row.label }}</span>
        <span class="cell-value">{{ row.value }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.truck-parameter {
  background: var(--card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-1);
  padding: var(--space-card);
}

.section-title {
  font-size: var(--fs-section);
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: var(--space-gap);
}

.param-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid var(--border);
  border-left: 1px solid var(--border);
}

.param-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--space-gap);
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.cell-label {
  font-size: var(--fs-caption);
  color: var(--text-secondary);
}

.cell-value {
  font-size: var(--fs-desc);
  color: var(--text-main);
  font-weight: 600;
  word-break: break-all;
}
</style>
