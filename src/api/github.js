/**
 * GitHub 管理 API：数据发布 / 图片视频上传（admin 后台专用）
 * 通过 GitHub Contents API 直接提交到仓库，触发 Pages 自动更新
 */

const SETTINGS_KEY = 'reefer-admin-v1'
const LOG_KEY = 'reefer-admin-log-v1'

/** ============ 设置（token / 仓库）============ */

export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null')
  } catch {
    return null
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function clearSettings() {
  localStorage.removeItem(SETTINGS_KEY)
}

/** ============ 发布日志 ============ */

export function getPublishLog() {
  try {
    const list = JSON.parse(localStorage.getItem(LOG_KEY) || '[]')
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function addPublishLog(entry) {
  const list = getPublishLog()
  list.unshift(entry)
  localStorage.setItem(LOG_KEY, JSON.stringify(list.slice(0, 20)))
}

/** ============ GitHub API ============ */

function apiUrl(path) {
  const s = getSettings()
  return `https://api.github.com/repos/${s.owner}/${s.repo}${path}`
}

function authHeaders() {
  const s = getSettings()
  if (!s || !s.token) throw new Error('请先在「设置」中配置 GitHub Token')
  if (!s.owner || !s.repo) throw new Error('请先配置仓库信息（owner / repo）')
  return { Authorization: `token ${s.token}`, Accept: 'application/vnd.github+json' }
}

async function gh(path, { method = 'GET', body } = {}) {
  const res = await fetch(apiUrl(path), {
    method,
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  })
  if (res.status === 401 || res.status === 403) {
    throw new Error('Token 无效或无权限（生成 Token 时请勾选 repo 权限）')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.message || `请求失败（HTTP ${res.status}）`)
  }
  return res.status === 204 ? null : res.json()
}

/** 测试连接：返回仓库信息 */
export async function testConnection() {
  const info = await gh('')
  return { fullName: info.full_name, private: info.private, htmlUrl: info.html_url }
}

/** 读取仓库文件（Contents API，UTF-8 内容） */
export async function getRepoFile(path, branch = 'main') {
  const json = await gh(`/contents/${path}${branch ? `?ref=${branch}` : ''}`)
  return { sha: json.sha, content: atob(json.content.replace(/\s+/g, '')) }
}

/** UTF-8 字符串 → base64（btoa 不支持中文，必须手动编码） */
function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

/** 更新仓库文本文件（存在则带 sha 覆盖，不存在则新建） */
export async function putRepoFile(path, content, message, branch = 'main') {
  const body = { message, content: utf8ToBase64(content), branch }
  try {
    body.sha = (await getRepoFile(path, branch)).sha
  } catch {
    /* 新文件无需 sha */
  }
  await gh(`/contents/${path}`, { method: 'PUT', body })
}

/** 上传二进制文件（图片/视频，base64 内容），返回 Pages 访问 URL */
export async function uploadBinary(path, base64, message) {
  const body = { message, content: base64, branch: 'gh-pages' }
  try {
    body.sha = (await getRepoFile(path, 'gh-pages')).sha
  } catch {
    /* 新文件无需 sha */
  }
  await gh(`/contents/${path}`, { method: 'PUT', body })
  const s = getSettings()
  return `https://${s.owner}.github.io/${s.repo}/${path}`
}

/** 发布数据：更新 data.json + version.json（版本号 +1，前端自动拉取最新）
 * 部署走 gh-pages 分支（静态部署，不依赖 Actions），线上路径即分支根目录的 data/ */
export async function publishData(dataObj, currentVersion) {
  const nextV = Number(currentVersion || 0) + 1
  const payload = {
    ...dataObj,
    version: nextV,
    updatedAt: new Date().toISOString()
  }
  const message = `发布数据 v${nextV}`
  await putRepoFile('data/data.json', JSON.stringify(payload, null, 2), message, 'gh-pages')
  await putRepoFile('data/version.json', JSON.stringify({ v: nextV }, null, 2), message, 'gh-pages')
  addPublishLog({
    v: nextV,
    at: Date.now(),
    trucks: (payload.trucks || []).length,
    refrigerators: (payload.refrigerators || []).length,
    bodies: (payload.bodies || []).length,
    accessories: (payload.accessories || []).length
  })
  return nextV
}
