/**
 * Mock 数据统一出口
 * 车型/冷机/厢体/配装的筛选逻辑集中在 api 层，页面不直接依赖本文件
 */
/**
 * 常量出口（页面筛选配置）
 * 业务数据已迁移至 public/data/data.json（运行时加载，见 src/api/index.js）
 */
export { BRANDS, TRUCK_TYPES, ENERGY_TYPES, BRAND_WHITELIST } from './brands.js'

/** 车型筛选（品牌 + 车型 + 能源 + 关键字） */
export function filterTrucks({ brand = 'all', truckType = 'all', energy = 'all', keyword = '' } = {}) {
  let list = [...TRUCKS]
  if (brand && brand !== 'all') {
    const b = BRANDS.find((x) => x.id === brand)
    if (b) list = list.filter((t) => t.brandId === brand)
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
        t.name.toLowerCase().includes(kw) ||
        t.brand.toLowerCase().includes(kw) ||
        t.engine.toLowerCase().includes(kw)
    )
  }
  return list
}

/** 冷机筛选：按车型能源（纯电→电动冷机 / 油车→油车冷机 / 混动→全部） */
export function filterRefrigerators({ energy = '', truckType = '' } = {}) {
  let list = [...REFRIGERATORS]
  if (energy === '纯电') {
    list = list.filter((r) => r.energy === '纯电')
  } else if (energy === '油车') {
    list = list.filter((r) => r.energy === '油车')
  }
  if (truckType && truckType !== 'all') {
    const matched = list.filter((r) => r.fitTypes.includes(truckType))
    if (matched.length) {
      const matchedIds = new Set(matched.map((r) => r.id))
      list.sort((a, b) => Number(matchedIds.has(b.id)) - Number(matchedIds.has(a.id)))
    }
  }
  return list
}
