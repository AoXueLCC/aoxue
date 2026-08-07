/**
 * API 层：运行时加载 public/data/data.json（业务数据）
 * 数据由 admin 后台维护（发布到 GitHub 后前端自动拉取最新版），
 * 改数据无需重新构建部署。页面代码只依赖本文件的 fetchXxx 函数。
 */

let cache = null
let loading = null

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 加载数据（内存缓存一次，刷新页面重新拉取）
 * 版本号防缓存：version.json 更新后 data.json?v=N 保证拿到最新
 */
async function loadData() {
  if (cache) return cache
  if (!loading) {
    loading = (async () => {
      try {
        const vRes = await fetch(`data/version.json?t=${Date.now()}`, { cache: 'no-store' })
        const { v = 0 } = await vRes.json()
        const res = await fetch(`data/data.json?v=${v}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`数据加载失败（HTTP ${res.status}）`)
        const data = await res.json()
        if (!data || !Array.isArray(data.trucks)) throw new Error('数据格式异常')
        if (import.meta.env.DEV) await sleep(150 + Math.random() * 200)
        cache = data
        return data
      } finally {
        loading = null
      }
    })()
  }
  return loading
}

/** 强制重新拉取（admin 发布数据后前端刷新用） */
export function reloadData() {
  cache = null
  return loadData()
}

/** ============ 筛选逻辑 ============ */

/** 车型筛选（品牌 + 车型 + 能源 + 关键字） */
export function filterTrucks(data, { brand = 'all', truckType = 'all', energy = 'all', keyword = '' } = {}) {
  let list = [...data.trucks]
  if (brand && brand !== 'all') {
    list = list.filter((t) => t.brandId === brand)
  }
  if (truckType && truckType !== 'all') {
    list = list.filter((t) => t.truckType === truckType)
  }
  if (energy && energy !== 'all') {
    list = list.filter((t) => t.energy === energy)
  }
  if (keyword && keyword.trim()) {
    const kw = keyword.trim().toLowerCase()
    list = list.filter(
      (t) =>
        (t.name || '').toLowerCase().includes(kw) ||
        (t.brand || '').toLowerCase().includes(kw) ||
        (t.engine || '').toLowerCase().includes(kw)
    )
  }
  return list
}

/** 冷机筛选：按车型能源（纯电→电动冷机 / 燃油→柴油机冷机 / 混动→全部） */
export function filterRefrigerators(data, { energy = '', truckType = '' } = {}) {
  let list = [...data.refrigerators]
  if (energy === '纯电' || energy === '柴油' || energy === '汽油') {
    const want = energy === '纯电' ? '纯电' : '燃油'
    list = list.filter((r) => r.energy === want)
  }
  if (truckType && truckType !== 'all') {
    list = list.filter((r) => (r.fitTypes || []).includes(truckType))
  }
  return list
}

/** ============ 业务 API（签名与旧 Mock 版一致，页面无需改动） ============ */

/** 品牌列表 */
export async function fetchBrands() {
  const data = await loadData()
  return data.brands
}

/** 车型列表（支持品牌/车型/能源/关键字筛选） */
export async function fetchTrucks(params) {
  const data = await loadData()
  return filterTrucks(data, params)
}

/** 车型详情 */
export async function fetchTruckDetail(id) {
  const data = await loadData()
  return data.trucks.find((t) => t.id === id) || null
}

/** 冷机列表（按车型能源 + 车型分类自动匹配排序） */
export async function fetchRefrigerators(params) {
  const data = await loadData()
  return filterRefrigerators(data, params)
}

/** 厢体列表（按车型分类过滤） */
export async function fetchBodies(truckType) {
  const data = await loadData()
  if (!truckType || truckType === 'all') return data.bodies
  const matched = data.bodies.filter((b) => (b.fitTypes || []).includes(truckType))
  return matched.length ? matched : data.bodies
}

/** 配装列表 */
export async function fetchAccessories() {
  const data = await loadData()
  return data.accessories
}

export default { loadData, reloadData }
