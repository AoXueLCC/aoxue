<script setup>
import { computed } from 'vue'
import { showImagePreview } from 'vant'
import { fmtPrice, svgImg } from '../mock/helpers'

/**
 * 冷机卡片：品牌/型号/适配温度/制冷量/适配车型/价格，点击选中
 * selected: 是否选中（蓝色描边 + 右上角√）  recommended: 车型标配推荐
 */
const props = defineProps({
  item: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  recommended: { type: Boolean, default: false }
})

const emit = defineEmits(['select'])

/** 无图时回退到渐变占位图 */
const imgSrc = computed(() =>
  props.item.image
    ? props.item.image
    : svgImg({ icon: '❄️', title: props.item.model, sub: '冷机实拍图 · 待上传', c1: '#0EA5E9', c2: '#6366F1' })
)

/** 点击小图弹出大图预览（仅实机图可预览，占位图不弹） */
function preview() {
  if (!props.item.image) return
  showImagePreview({ images: [props.item.image], closeable: true })
}
</script>

<template>
  <div
    class="refrigerator-card"
    :class="{ selected }"
    @click="emit('select', item)"
  >
    <div class="img-wrap" @click.stop="preview">
      <img :src="imgSrc" :alt="item.model" class="card-img" />
      <span v-if="item.image" class="zoom-badge">
        <van-icon name="photograph" size="12" />
      </span>
    </div>

    <div class="card-main">
      <div class="card-head">
        <span class="model">{{ item.model }}</span>
        <span v-if="recommended" class="rec-badge">标配</span>
        <span v-if="selected" class="check-badge">
          <van-icon name="success" size="11" />
        </span>
      </div>

      <div class="spec-row">
        <span class="spec">
          <van-icon name="fire-o" size="13" color="#1677FF" />
          {{ item.tempRange }}
        </span>
        <span class="spec">
          <van-icon name="lightning" size="13" color="#1677FF" />
          {{ item.cooling }}
        </span>
      </div>

      <div class="spec-row fit-row">
        <span class="fit-label">适配</span>
        <span class="fit-value">{{ item.fitTypes.join(' / ') }}</span>
      </div>

      <div class="price-row">
        <span class="price">¥{{ fmtPrice(item.price) }}</span>
        <span class="power-source">{{ item.powerSource }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.refrigerator-card {
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

.refrigerator-card:active {
  transform: scale(0.98);
}

.refrigerator-card.selected {
  border-color: #1677ff;
  box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.12), 0 6px 20px rgba(22, 119, 255, 0.12);
}

.img-wrap {
  position: relative;
  width: 104px;
  height: 84px;
  flex-shrink: 0;
}

.card-img {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  object-fit: cover;
}

.zoom-badge {
  position: absolute;
  right: 4px;
  bottom: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
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

.model {
  font-size: 15px;
  font-weight: 700;
  color: #1d2129;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rec-badge {
  flex-shrink: 0;
  font-size: 10px;
  color: #1677ff;
  background: #e8f1ff;
  padding: 1px 6px;
  border-radius: 6px;
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

.power-source {
  font-size: 11px;
  color: #86909c;
}
</style>
