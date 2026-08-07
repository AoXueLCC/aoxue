<script setup>
import { computed } from 'vue'
import { fmtPrice, svgImg } from '../mock/helpers'

/**
 * 厢体卡片：保温厚度/材质/品牌/适配车型/价格，点击选中（布局与冷机保持一致）
 */
const props = defineProps({
  item: { type: Object, required: true },
  selected: { type: Boolean, default: false }
})

const emit = defineEmits(['select'])

/** 无图时回退到渐变占位图 */
const imgSrc = computed(() =>
  props.item.image
    ? props.item.image
    : svgImg({ icon: '📦', title: props.item.name, sub: '厢体实拍图 · 待上传', c1: '#1677FF', c2: '#0EA5E9' })
)
</script>

<template>
  <div class="body-card" :class="{ selected }" @click="emit('select', item)">
    <img :src="imgSrc" :alt="item.name" class="card-img" />

    <div class="card-main">
      <div class="card-head">
        <span class="name">{{ item.name }}</span>
        <span v-if="selected" class="check-badge">
          <van-icon name="success" size="11" />
        </span>
      </div>

      <div class="spec-row">
        <span class="spec">
          <van-icon name="shield-o" size="13" color="#1677FF" />
          保温 {{ item.thickness }}
        </span>
        <span class="spec">
          <van-icon name="gift-o" size="13" color="#1677FF" />
          {{ item.material }}
        </span>
      </div>

      <div class="spec-row fit-row">
        <span class="fit-label">适配</span>
        <span class="fit-value">{{ item.fitTypes.join(' / ') }}</span>
      </div>

      <div class="price-row">
        <span class="price">¥{{ fmtPrice(item.price) }}</span>
        <span class="brand">{{ item.brand }}制造</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.body-card {
  display: flex;
  gap: 12px;
  background: #ffffff;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 4px 16px rgba(29, 33, 41, 0.06);
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.2s, box-shadow 0.2s;
}

.body-card:active {
  transform: scale(0.98);
}

.body-card.selected {
  border-color: #1677ff;
  box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.12), 0 6px 20px rgba(22, 119, 255, 0.12);
}

.card-img {
  width: 104px;
  height: 84px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.card-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 6px;
}

.name {
  font-size: 15px;
  font-weight: 700;
  color: #1d2129;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.check-badge {
  flex-shrink: 0;
  margin-left: auto;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #1677ff;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spec-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.spec {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #4e5969;
}

.fit-row {
  gap: 6px;
}

.fit-label {
  font-size: 11px;
  color: #86909c;
}

.fit-value {
  font-size: 11px;
  color: #86909c;
  background: #f5f7fa;
  padding: 1px 8px;
  border-radius: 6px;
}

.price-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: auto;
}

.price {
  font-size: 17px;
  font-weight: 800;
  color: #ff4d4f;
  font-variant-numeric: tabular-nums;
}

.brand {
  font-size: 11px;
  color: #86909c;
}
</style>
