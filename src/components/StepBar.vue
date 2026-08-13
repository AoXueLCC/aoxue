<script setup>
/**
 * 步骤指示器（设计规格 4.4）：底盘 → 冷机 → 厢体 → 配装 → 配件 → 确认
 * 56px 高白底 / 节点 24×24 圆 / 连接线 2px / 节点文字 11px
 * current: 当前步骤 0-5（纯进度展示，跳转由底部"下一步"控制）
 */
defineProps({
  current: { type: Number, default: 0 }
})

const STEPS = ['底盘', '冷机', '厢体', '配装', '配件', '确认']
</script>

<template>
  <div class="step-bar">
    <div
      v-for="(s, i) in STEPS"
      :key="s"
      class="step"
      :class="{ done: i < current, active: i === current }"
    >
      <span class="step-dot">
        <van-icon v-if="i < current" name="success" size="12" />
        <span v-else class="step-num">{{ i + 1 }}</span>
      </span>
      <span class="step-name">{{ s }}</span>
      <span v-if="i < STEPS.length - 1" class="step-line" :class="{ done: i < current }"></span>
    </div>
  </div>
</template>

<style scoped>
.step-bar {
  position: sticky;
  top: calc(56px + var(--safe-top));
  z-index: 19;
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 var(--space-page);
  background: var(--card);
}

.step {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.step-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--tag-bg);
  color: var(--text-placeholder);
  display: flex;
  align-items: center;
  justify-content: center;
}

.step.done .step-dot,
.step.active .step-dot {
  background: var(--primary);
  color: #ffffff;
}

.step-num {
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.step-name {
  font-size: 11px;
  color: var(--text-placeholder);
  line-height: 16px;
}

.step.done .step-name,
.step.active .step-name {
  color: var(--text-main);
}

.step.active .step-name {
  font-weight: 600;
}

.step-line {
  position: absolute;
  top: 17px;
  left: calc(50% + 13px);
  width: calc(100% - 26px);
  height: 2px;
  background: var(--border);
  pointer-events: none;
}

.step-line.done {
  background: var(--primary);
}
</style>
