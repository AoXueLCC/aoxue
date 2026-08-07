<script setup>
import { ref, computed } from 'vue'
import { showConfirmDialog, showToast } from 'vant'
import { publishData, getPublishLog } from '../../api/github'

/**
 * 发布面板：变更概览 + 一键发布 + 发布日志
 * 发布 = 提交 data.json + version.json 到 GitHub 仓库（触发 Pages 自动更新）
 */
const props = defineProps({
  data: { type: Object, required: true },
  version: { type: Number, default: 0 }
})

const publishing = ref(false)

const stats = computed(() => [
  { label: '车型', count: (props.data.trucks || []).length },
  { label: '冷机', count: (props.data.refrigerators || []).length },
  { label: '厢体', count: (props.data.bodies || []).length },
  { label: '配装', count: (props.data.accessories || []).length },
  { label: '品牌', count: (props.data.brands || []).length }
])

const log = computed(() => getPublishLog())

function onPublish() {
  showConfirmDialog({
    title: '确认发布？',
    message: `将更新 ${stats.value.map((s) => `${s.label} ${s.count} 条`).join('、')}\n\n发布后约 1~3 分钟全网上线生效`,
    confirmButtonColor: '#1677ff'
  })
    .then(async () => {
      publishing.value = true
      try {
        const nextV = await publishData(props.data, props.version)
        showToast({ type: 'success', message: `发布成功 v${nextV}` })
      } catch (err) {
        showToast(err.message || '发布失败')
      } finally {
        publishing.value = false
      }
    })
    .catch(() => {})
}

function fmtTime(ts) {
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>

<template>
  <div class="publish-panel">
    <div class="publish-hero">
      <div class="hero-title">一键发布</div>
      <div class="hero-sub">当前线上版本 v{{ version }}</div>

      <div class="stats">
        <div v-for="s in stats" :key="s.label" class="stat">
          <span class="stat-count num">{{ s.count }}</span>
          <span class="stat-label">{{ s.label }}</span>
        </div>
      </div>

      <button class="btn-publish" :disabled="publishing" @click="onPublish">
        <van-loading v-if="publishing" size="18" color="#ffffff" />
        <template v-else>
          <van-icon name="upgrade" size="16" />
          {{ publishing ? '发布中...' : '发布上线' }}
        </template>
      </button>

      <div class="publish-tips">
        <p>1. 所有表格的修改（新增/编辑/删除/传图）点此一次性发布</p>
        <p>2. 发布后约 1~3 分钟客户扫码看到的即最新数据</p>
        <p>3. 图片/视频上传后立即在仓库生效，稍候即可访问</p>
      </div>
    </div>

    <div class="log-section">
      <div class="log-title">发布记录</div>
      <div v-if="log.length" class="log-list">
        <div v-for="item in log" :key="item.v" class="log-item">
          <span class="log-badge">v{{ item.v }}</span>
          <span class="log-time">{{ fmtTime(item.at) }}</span>
          <span class="log-detail">车型{{ item.trucks }} · 冷机{{ item.refrigerators }} · 厢体{{ item.bodies }} · 配装{{ item.accessories }}</span>
        </div>
      </div>
      <div v-else class="log-empty">暂无发布记录</div>
    </div>
  </div>
</template>

<style scoped>
.publish-panel {
  padding: 0 12px 20px;
}

.publish-hero {
  background: linear-gradient(160deg, #1677ff, #4b8dff);
  border-radius: 16px;
  padding: 20px 16px;
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(22, 119, 255, 0.3);
}

.hero-title {
  font-size: 18px;
  font-weight: 800;
}

.hero-sub {
  font-size: 12px;
  opacity: 0.85;
  margin-top: 4px;
}

.stats {
  display: flex;
  gap: 8px;
  margin: 16px 0;
}

.stat {
  flex: 1;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 8px 0;
  text-align: center;
}

.stat-count {
  display: block;
  font-size: 18px;
  font-weight: 800;
}

.stat-label {
  display: block;
  font-size: 11px;
  opacity: 0.85;
  margin-top: 2px;
}

.btn-publish {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 23px;
  background: #ffffff;
  color: #1677ff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: transform 0.15s;
}

.btn-publish:active {
  transform: scale(0.97);
}

.btn-publish:disabled {
  opacity: 0.7;
}

.publish-tips {
  margin-top: 14px;
  font-size: 11px;
  opacity: 0.85;
  line-height: 1.7;
}

.log-section {
  margin-top: 14px;
  background: #ffffff;
  border-radius: 16px;
  padding: 14px;
}

.log-title {
  font-size: 14px;
  font-weight: 700;
  color: #1d2129;
  margin-bottom: 10px;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #4e5969;
}

.log-badge {
  background: #e8f1ff;
  color: #1677ff;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 8px;
  flex-shrink: 0;
}

.log-time {
  color: #86909c;
  flex-shrink: 0;
}

.log-detail {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-empty {
  font-size: 12px;
  color: #86909c;
  padding: 12px 0;
  text-align: center;
}
</style>
