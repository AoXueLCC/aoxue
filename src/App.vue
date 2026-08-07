<script setup>
import { pageDirection } from './router'
</script>

<template>
  <div class="app-shell">
    <router-view v-slot="{ Component, route }">
      <transition :name="pageDirection === 'forward' ? 'page-forward' : 'page-backward'">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<style scoped>
.app-shell {
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f5f7fa;
  box-shadow: 0 0 40px rgba(29, 33, 41, 0.08);
  position: relative;
  /* clip 而非 hidden：hidden 会创建滚动容器，导致页面内 position: sticky 全部失效 */
  overflow-x: clip;
}

/* 前进：新页面从右侧滑入 */
.page-forward-enter-active,
.page-forward-leave-active {
  transition: transform 0.32s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.32s;
}

.page-forward-enter-from {
  transform: translateX(100%);
}

.page-forward-leave-to {
  transform: translateX(-28%);
  opacity: 0.4;
}

/* 后退：新页面从左侧滑入 */
.page-backward-enter-active,
.page-backward-leave-active {
  transition: transform 0.32s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.32s;
}

.page-backward-enter-from {
  transform: translateX(-28%);
  opacity: 0.4;
}

.page-backward-leave-to {
  transform: translateX(100%);
}

/* 切换期间防止双页面横向滚动 */
:deep(.page) {
  width: 100%;
}
</style>
