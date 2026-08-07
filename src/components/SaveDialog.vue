<script setup>
import { fmtPrice } from '../mock/helpers'

/**
 * 保存确认弹窗：报价单号 + 配置摘要 + 取消/确认保存
 * 确认后进入 success 状态（对勾动画），由父组件处理跳转
 */
defineProps({
  show: { type: Boolean, default: false },
  quoteNo: { type: String, default: '' },
  total: { type: Number, default: 0 },
  saving: { type: Boolean, default: false },
  success: { type: Boolean, default: false }
})

const emit = defineEmits(['update:show', 'confirm'])
</script>

<template>
  <transition name="dialog">
    <div v-if="show" class="dialog-mask" @click.self="emit('update:show', false)">
      <div class="dialog-card">
        <!-- 保存成功状态 -->
        <div v-if="success" class="success-box">
          <div class="success-icon">
            <van-icon name="success" size="34" />
          </div>
          <h3 class="success-title">报价已保存</h3>
          <p class="success-sub">报价单号：{{ quoteNo }}</p>
        </div>

        <!-- 确认保存状态 -->
        <template v-else>
          <div class="dialog-head">
            <div class="head-icon">
              <van-icon name="balance-list-o" size="22" color="#1677FF" />
            </div>
            <h3 class="head-title">确认保存报价</h3>
            <p class="head-sub">保存后将生成专属报价单号</p>
          </div>

          <div class="quote-no">
            <span class="no-label">报价单号</span>
            <span class="no-value">{{ quoteNo }}</span>
          </div>

          <div class="total-box">
            <span class="total-label">最终价格</span>
            <span class="total-value">¥{{ fmtPrice(total) }}</span>
          </div>

          <div class="dialog-btns">
            <button class="btn-cancel" :disabled="saving" @click="emit('update:show', false)">
              取消
            </button>
            <button class="btn-confirm" :disabled="saving" @click="emit('confirm')">
              <van-loading v-if="saving" size="16" color="#FFFFFF" />
              <span v-else>确认保存</span>
            </button>
          </div>
        </template>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.dialog-card {
  width: 100%;
  max-width: 430px;
  background: #ffffff;
  border-radius: 20px 20px 0 0;
  padding: 24px 20px calc(24px + env(safe-area-inset-bottom, 0px));
  animation: card-up 0.3s ease;
}

@keyframes card-up {
  from {
    transform: translateY(60px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.dialog-head {
  text-align: center;
  margin-bottom: 16px;
}

.head-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e8f1ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
}

.head-title {
  font-size: 17px;
  font-weight: 700;
  color: #1d2129;
}

.head-sub {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
}

.quote-no {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fb;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 12px;
}

.no-label {
  font-size: 13px;
  color: #4e5969;
}

.no-value {
  font-size: 14px;
  font-weight: 700;
  color: #1677ff;
  letter-spacing: 1px;
  font-variant-numeric: tabular-nums;
}

.total-box {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  background: linear-gradient(135deg, #fff1f0, #fff8f0);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 20px;
}

.total-label {
  font-size: 13px;
  color: #4e5969;
}

.total-value {
  font-size: 22px;
  font-weight: 800;
  color: #ff4d4f;
  font-variant-numeric: tabular-nums;
}

.dialog-btns {
  display: flex;
  gap: 12px;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.2s;
}

.btn-cancel {
  border: 1.5px solid #e5e6eb;
  background: #ffffff;
  color: #4e5969;
}

.btn-confirm {
  border: none;
  background: linear-gradient(135deg, #1677ff, #69b1ff);
  color: #ffffff;
  box-shadow: 0 6px 16px rgba(22, 119, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel:active,
.btn-confirm:active {
  transform: scale(0.96);
}

.btn-cancel:disabled,
.btn-confirm:disabled {
  opacity: 0.6;
}

/* 成功状态 */
.success-box {
  text-align: center;
  padding: 14px 0 6px;
}

.success-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00b96b, #34d399);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  animation: pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 10px 24px rgba(0, 185, 107, 0.35);
}

@keyframes pop {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-title {
  font-size: 18px;
  font-weight: 700;
  color: #1d2129;
}

.success-sub {
  font-size: 13px;
  color: #86909c;
  margin-top: 8px;
  letter-spacing: 0.5px;
}

.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.25s;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
</style>
