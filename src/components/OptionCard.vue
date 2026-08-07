<script setup>
import { fmtPrice } from '../mock/helpers'

/**
 * 配置选项卡片（设计规格 页面B）：宽 358 × 高 72 / 圆角 8 / 内边距 12
 * Flex Row：Radio 18×18 → 缩略图 50×40 圆角4 → 标题13px → 价格 14px Bold #E60012
 * 选中态：边框 1.5px #0066FF / 背景 #F9FCFF / Radio 蓝勾
 */
defineProps({
  item: { type: Object, required: true },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '🧊' },
  selected: { type: Boolean, default: false },
  recommended: { type: Boolean, default: false }
})

const emit = defineEmits(['select'])
</script>

<template>
  <div class="option-card" :class="{ selected }" @click="emit('select', item)">
    <span class="opt-radio" :class="{ checked: selected }">
      <van-icon v-if="selected" name="success" size="11" />
    </span>

    <img v-if="item.image" :src="item.image" :alt="title" class="opt-img" />
    <span v-else class="opt-icon">{{ icon }}</span>

    <div class="opt-main">
      <div class="opt-head">
        <span class="opt-name ellipsis">{{ title }}</span>
        <span v-if="recommended" class="opt-tag">标配</span>
      </div>
      <span v-if="subtitle" class="opt-sub ellipsis">{{ subtitle }}</span>
    </div>

    <span class="opt-price num">¥{{ fmtPrice(item.price) }}</span>
  </div>
</template>

<style scoped>
.option-card {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 72px;
  padding: 0 var(--space-card);
  background: var(--card);
  border-radius: 8px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: transform 0.15s ease-out, border-color 0.2s ease-out, background 0.2s ease-out;
}

.option-card:active {
  transform: scale(0.98);
}

.option-card.selected {
  border: 1.5px solid var(--primary);
  background: #f9fcff;
}

.opt-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid var(--text-disabled);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s ease-out, border-color 0.2s ease-out;
}

.opt-radio.checked {
  background: var(--primary);
  border-color: var(--primary);
  color: #ffffff;
}

.opt-img {
  width: 50px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  background: var(--bg);
  flex-shrink: 0;
}

.opt-icon {
  width: 50px;
  height: 40px;
  border-radius: 4px;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.opt-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.opt-head {
  display: flex;
  align-items: center;
  gap: 6px;
}

.opt-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main);
}

.opt-tag {
  flex-shrink: 0;
  height: 18px;
  padding: 0 6px;
  border-radius: 4px;
  background: var(--primary-light);
  color: var(--primary);
  font-size: 11px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.opt-sub {
  font-size: 12px;
  color: var(--text-placeholder);
}

.opt-price {
  font-size: 14px;
  font-weight: 600;
  color: var(--price);
  flex-shrink: 0;
}
</style>
