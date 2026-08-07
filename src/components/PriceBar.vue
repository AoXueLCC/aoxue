<script setup>
import { ref } from 'vue'
import { useQuoteStore } from '../stores/quote'
import { fmtPrice } from '../mock/helpers'

/**
 * 底部固定价格栏：实时总价 + 可展开价格明细 + 下一步按钮
 * nextText: 按钮文案  nextDisabled: 是否禁用下一步
 */
defineProps({
  nextText: { type: String, default: '下一步' },
  nextDisabled: { type: Boolean, default: false }
})

const emit = defineEmits(['next'])
const store = useQuoteStore()
const expanded = ref(false)
</script>

<template>
  <div class="price-bar-wrap">
    <!-- 展开的价格明细 -->
    <transition name="detail">
      <div v-if="expanded" class="price-detail card-base">
        <div class="detail-title">
          <span>价格明细</span>
          <span class="detail-sub">实时计算</span>
        </div>
        <div class="detail-row">
          <span>车辆价格</span>
          <span>¥{{ fmtPrice(store.vehiclePrice) }}</span>
        </div>
        <div class="detail-row">
          <span>冷机价格</span>
          <span>¥{{ fmtPrice(store.refrigeratorPrice) }}</span>
        </div>
        <div class="detail-row">
          <span>厢体价格</span>
          <span>¥{{ fmtPrice(store.bodyPrice) }}</span>
        </div>
        <div class="detail-row">
          <span>配装价格<span v-if="store.accessoryCount" class="detail-count">（{{ store.accessoryCount }}项）</span></span>
          <span>¥{{ fmtPrice(store.accessoryTotal) }}</span>
        </div>
        <div class="detail-row detail-total">
          <span>总价</span>
          <span class="detail-total-price">¥{{ fmtPrice(store.totalPrice) }}</span>
        </div>
      </div>
    </transition>

    <!-- 底部固定栏 -->
    <div class="price-bar">
      <div class="price-left" @click="expanded = !expanded">
        <span class="price-label">总价格</span>
        <div class="price-main">
          <span class="price-symbol">¥</span>
          <span class="price-value" :key="store.totalPrice">{{ fmtPrice(store.totalPrice) }}</span>
          <van-icon
            :name="expanded ? 'arrow-down' : 'arrow-up'"
            class="price-arrow"
            color="#86909C"
          />
        </div>
      </div>
      <button
        class="btn-next"
        :class="{ disabled: nextDisabled }"
        :disabled="nextDisabled"
        @click="emit('next')"
      >
        {{ nextText }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.price-bar-wrap {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
}

.price-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-top: 1px solid #f0f1f4;
  box-shadow: 0 -4px 20px rgba(29, 33, 41, 0.06);
}

.price-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  user-select: none;
}

.price-label {
  font-size: 12px;
  color: #86909c;
}

.price-main {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price-symbol {
  font-size: 14px;
  font-weight: 700;
  color: #ff4d4f;
}

.price-value {
  font-size: 26px;
  font-weight: 800;
  color: #ff4d4f;
  font-variant-numeric: tabular-nums;
  animation: price-flash 0.4s ease;
}

@keyframes price-flash {
  0% {
    transform: scale(1.15);
    opacity: 0.6;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.price-arrow {
  margin-left: 6px;
  font-size: 14px;
}

.btn-next {
  min-width: 108px;
  height: 44px;
  border: none;
  border-radius: 22px;
  background: linear-gradient(135deg, #1677ff, #69b1ff);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.2s;
  box-shadow: 0 6px 16px rgba(22, 119, 255, 0.35);
}

.btn-next:active {
  transform: scale(0.96);
}

.btn-next.disabled {
  opacity: 0.45;
  box-shadow: none;
}

/* 明细展开面板 */
.price-detail {
  margin: 0 12px 10px;
  padding: 14px 16px;
  animation: detail-in 0.28s ease;
}

@keyframes detail-in {
  from {
    transform: translateY(12px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.detail-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 10px;
}

.detail-sub {
  font-size: 11px;
  color: #86909c;
  font-weight: 400;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 0;
  font-size: 13px;
  color: #4e5969;
  border-bottom: 1px dashed #f0f1f4;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-count {
  color: #86909c;
}

.detail-total {
  padding-top: 10px;
  font-weight: 700;
  color: #1d2129;
}

.detail-total-price {
  font-size: 18px;
  color: #ff4d4f;
  font-weight: 800;
}
</style>
