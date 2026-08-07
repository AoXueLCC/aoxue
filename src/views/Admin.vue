<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getSettings, saveSettings, clearSettings, testConnection } from '../api/github'
import { ALL_SCHEMAS } from '../admin/schemas'
import DataTable from '../components/admin/DataTable.vue'
import PublishPanel from '../components/admin/PublishPanel.vue'

/**
 * 管理后台（/admin）：数据管理 + 图片视频上传 + 一键发布
 * 独立于报价流程，通过 URL 直接访问（https://<pages域名>/reefer-quote-vue/#/admin）
 */
const router = useRouter()

/* ========== 设置 ========== */
const settings = ref(getSettings())
const settingForm = ref({
  token: '',
  owner: '666prx',
  repo: 'reefer-quote-vue'
})
const testing = ref(false)

/* ========== 数据 ========== */
const data = ref(null)
const loading = ref(true)
const loadError = ref('')
const activeTab = ref(0)

const version = computed(() => (data.value ? data.value.version || 0 : 0))

onMounted(async () => {
  if (settings.value) {
    Object.assign(settingForm.value, settings.value)
    await loadRemoteData()
  } else {
    loading.value = false
  }
})

/** 拉取线上最新数据（编辑副本） */
async function loadRemoteData() {
  loading.value = true
  loadError.value = ''
  try {
    const vRes = await fetch(`data/version.json?t=${Date.now()}`, { cache: 'no-store' })
    const { v = 0 } = await vRes.json()
    const res = await fetch(`data/data.json?v=${v}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`数据加载失败（HTTP ${res.status}）`)
    data.value = await res.json()
  } catch (err) {
    loadError.value = err.message || '数据加载失败'
  } finally {
    loading.value = false
  }
}

function onSaveSettings() {
  const { token, owner, repo } = settingForm.value
  if (!token.trim() || !owner.trim() || !repo.trim()) {
    showToast('请填写 Token / 仓库信息')
    return
  }
  settings.value = { token: token.trim(), owner: owner.trim(), repo: repo.trim() }
  saveSettings(settings.value)
  showToast({ type: 'success', message: '设置已保存' })
  loadRemoteData()
}

function onClearSettings() {
  clearSettings()
  settings.value = null
  data.value = null
  showToast('已清除设置')
}

async function onTestConnection() {
  testing.value = true
  try {
    const info = await testConnection()
    showToast({ type: 'success', message: `连接成功：${info.fullName}` })
  } catch (err) {
    showToast(err.message || '连接失败')
  } finally {
    testing.value = false
  }
}
</script>

<template>
  <div class="page admin-page">
    <!-- 顶部 -->
    <header class="admin-header">
      <button class="back-btn" @click="router.replace('/')">
        <van-icon name="arrow-left" size="20" />
      </button>
      <div class="header-center">
        <span class="header-title">管理后台</span>
        <span v-if="data" class="header-version">线上 v{{ version }}</span>
      </div>
      <button v-if="settings" class="refresh-btn" @click="loadRemoteData">
        <van-icon name="replay" size="16" />
      </button>
    </header>

    <!-- 未配置设置：引导 -->
    <div v-if="!settings" class="admin-main">
      <div class="setup-card">
        <div class="setup-icon">
          <van-icon name="setting-o" size="28" />
        </div>
        <h2 class="setup-title">首次使用配置</h2>
        <p class="setup-desc">配置 GitHub Token 后即可在线管理数据并发布上线</p>

        <div class="setup-form">
          <div class="field">
            <label>GitHub Token（Personal Access Token）</label>
            <input v-model="settingForm.token" class="f-input" type="password" placeholder="ghp_ 开头" />
          </div>
          <div class="field">
            <label>仓库 Owner（GitHub 用户名）</label>
            <input v-model="settingForm.owner" class="f-input" placeholder="666prx" />
          </div>
          <div class="field">
            <label>仓库名</label>
            <input v-model="settingForm.repo" class="f-input" placeholder="reefer-quote-vue" />
          </div>
        </div>

        <button class="btn-setup" @click="onSaveSettings">保存并加载数据</button>

        <div class="token-guide">
          <p class="guide-title">如何获取 Token（一次即可）：</p>
          <ol>
            <li>浏览器打开 github.com 并登录</li>
            <li>点头像 → Settings → Developer settings → Personal access tokens → Tokens (classic)</li>
            <li>点 Generate new token (classic)，勾选 <b>repo</b> 权限</li>
            <li>生成后复制 ghp_ 开头的字符串粘贴到上方</li>
          </ol>
          <p class="guide-warn">Token 仅保存在本浏览器，请勿泄露给他人；若泄露可在 GitHub 上随时删除重新生成</p>
        </div>
      </div>
    </div>

    <!-- 已配置：数据管理 -->
    <div v-else class="admin-main">
      <div v-if="loading" class="admin-loading">
        <van-loading size="28" color="#1677FF" vertical>加载线上数据...</van-loading>
      </div>

      <div v-else-if="loadError" class="admin-error">
        <van-icon name="warning-o" size="36" color="#ff4d4f" />
        <p>{{ loadError }}</p>
        <button class="btn-retry" @click="loadRemoteData">重新加载</button>
      </div>

      <template v-else-if="data">
        <van-tabs
          v-model:active="activeTab"
          class="admin-tabs"
          color="#1677ff"
          title-active-color="#1677ff"
          title-inactive-color="#4e5969"
          sticky
          offset-top="0"
        >
          <van-tab title="车型">
            <DataTable :schema="ALL_SCHEMAS.trucks" :rows="data.trucks" :brands="data.brands" />
          </van-tab>
          <van-tab title="冷机">
            <DataTable :schema="ALL_SCHEMAS.refrigerators" :rows="data.refrigerators" :brands="data.brands" />
          </van-tab>
          <van-tab title="厢体">
            <DataTable :schema="ALL_SCHEMAS.bodies" :rows="data.bodies" :brands="data.brands" />
          </van-tab>
          <van-tab title="配装">
            <DataTable :schema="ALL_SCHEMAS.accessories" :rows="data.accessories" :brands="data.brands" />
          </van-tab>
          <van-tab title="品牌">
            <DataTable :schema="ALL_SCHEMAS.brands" :rows="data.brands" :brands="data.brands" />
          </van-tab>
          <van-tab title="发布">
            <PublishPanel :data="data" :version="version" />
          </van-tab>
        </van-tabs>
      </template>
    </div>

    <!-- 设置入口（已配置时显示在底部） -->
    <div v-if="settings && data" class="settings-bar">
      <span class="settings-repo">{{ settings.owner }}/{{ settings.repo }}</span>
      <div class="settings-actions">
        <button class="mini-btn" @click="onTestConnection">
          {{ testing ? '测试中...' : '测试连接' }}
        </button>
        <button class="mini-btn danger" @click="onClearSettings">清除设置</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
}

.admin-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: calc(10px + env(safe-area-inset-top, 0px)) 12px 0;
  background: #f5f7fa;
  gap: 10px;
}

.back-btn,
.refresh-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(29, 33, 41, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #1d2129;
  flex-shrink: 0;
}

.header-center {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.header-title {
  font-size: 17px;
  font-weight: 800;
  color: #1d2129;
}

.header-version {
  font-size: 11px;
  color: #1677ff;
  background: #e8f1ff;
  padding: 2px 8px;
  border-radius: 8px;
  flex-shrink: 0;
}

.admin-main {
  padding-top: 10px;
}

/* 设置引导 */
.setup-card {
  margin: 12px;
  background: #ffffff;
  border-radius: 16px;
  padding: 24px 16px;
  text-align: center;
}

.setup-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1677ff, #69b1ff);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 8px 20px rgba(22, 119, 255, 0.35);
}

.setup-title {
  font-size: 18px;
  font-weight: 800;
  margin-top: 12px;
}

.setup-desc {
  font-size: 13px;
  color: #86909c;
  margin-top: 6px;
}

.setup-form {
  text-align: left;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field label {
  display: block;
  font-size: 12px;
  color: #4e5969;
  margin-bottom: 6px;
}

.f-input {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border: 1px solid #e5e6eb;
  border-radius: 10px;
  font-size: 14px;
  background: #f8f9fb;
  outline: none;
}

.f-input:focus {
  border-color: #1677ff;
  background: #ffffff;
}

.btn-setup {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 22px;
  background: linear-gradient(135deg, #1677ff, #69b1ff);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  margin-top: 20px;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(22, 119, 255, 0.35);
}

.token-guide {
  text-align: left;
  margin-top: 20px;
  background: #f8f9fb;
  border-radius: 12px;
  padding: 14px;
  font-size: 12px;
  color: #4e5969;
  line-height: 1.8;
}

.guide-title {
  font-weight: 700;
  color: #1d2129;
  margin-bottom: 6px;
}

.token-guide ol {
  padding-left: 18px;
}

.guide-warn {
  margin-top: 8px;
  color: #ff7d00;
}

/* 加载/错误 */
.admin-loading,
.admin-error {
  text-align: center;
  padding: 80px 0;
}

.admin-error p {
  margin-top: 10px;
  color: #4e5969;
  font-size: 13px;
}

.btn-retry {
  margin-top: 14px;
  height: 36px;
  padding: 0 24px;
  border: none;
  border-radius: 18px;
  background: #1677ff;
  color: #ffffff;
  font-size: 13px;
  cursor: pointer;
}

/* 底部设置栏 */
.settings-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px));
  background: rgba(255, 255, 255, 0.95);
  border-top: 1px solid #f0f1f4;
  backdrop-filter: blur(10px);
}

.settings-repo {
  font-size: 12px;
  color: #86909c;
}

.settings-actions {
  display: flex;
  gap: 8px;
}

.mini-btn {
  height: 30px;
  padding: 0 12px;
  border: none;
  border-radius: 15px;
  background: #e8f1ff;
  color: #1677ff;
  font-size: 12px;
  cursor: pointer;
}

.mini-btn.danger {
  background: #fff1f0;
  color: #ff4d4f;
}
</style>
