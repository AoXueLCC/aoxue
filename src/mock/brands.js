/**
 * 品牌数据：文档要求的 10 大品牌 + 吉利远程/奇瑞开瑞（产品库真实品牌）
 * colors 用于生成圆形 Logo 渐变占位图（真实商标图后续可替换 logo 字段）
 */
export const BRANDS = [
  {
    id: 'all',
    name: '全部',
    short: '全',
    colors: ['#94A3B8', '#64748B'],
    logo: ''
  },
  {
    id: 'dongfeng',
    name: '东风',
    short: '东',
    colors: ['#3B82F6', '#6366F1'],
    logo: ''
  },
  {
    id: 'foton',
    name: '福田',
    short: '福',
    colors: ['#1677FF', '#00C2FF'],
    logo: ''
  },
  {
    id: 'jac',
    name: '江淮',
    short: '淮',
    colors: ['#F59E0B', '#F97316'],
    logo: ''
  },
  {
    id: 'jmc',
    name: '江铃',
    short: '江',
    colors: ['#10B981', '#059669'],
    logo: ''
  },
  {
    id: 'jiefang',
    name: '解放',
    short: '解',
    colors: ['#EF4444', '#DC2626'],
    logo: ''
  },
  {
    id: 'qingling',
    name: '庆铃',
    short: '庆',
    colors: ['#8B5CF6', '#A855F7'],
    logo: ''
  },
  {
    id: 'sinotruk',
    name: '重汽',
    short: '重',
    colors: ['#334155', '#64748B'],
    logo: ''
  },
  {
    id: 'feidie',
    name: '飞碟',
    short: '碟',
    colors: ['#06B6D4', '#0284C7'],
    logo: ''
  },
  {
    id: 'changan',
    name: '长安',
    short: '安',
    colors: ['#F43F5E', '#EC4899'],
    logo: ''
  },
  {
    id: 'yuanzheng',
    name: '吉利远程',
    short: '远',
    colors: ['#84CC16', '#22C55E'],
    logo: ''
  },
  {
    id: 'karry',
    name: '奇瑞开瑞',
    short: '奇',
    colors: ['#FB923C', '#F43F5E'],
    logo: ''
  }
]

/** 按品牌 id 取品牌对象 */
export function getBrandById(id) {
  return BRANDS.find((b) => b.id === id) || BRANDS[0]
}

/** 产品线品牌白名单（前端筛选与列表共用，仅展示这 4 个品牌） */
export const BRAND_WHITELIST = ['foton', 'jmc', 'yuanzheng', 'karry']

/** 车型分类（胶囊筛选） */
export const TRUCK_TYPES = [
  { key: 'all', label: '全部' },
  { key: '微卡', label: '微卡', range: '2.8~3.2米' },
  { key: '小卡', label: '小卡', range: '3.5~3.8米' },
  { key: '轻卡', label: '轻卡', range: '4.2米' },
  { key: '中卡', label: '中卡', range: '6.8~9.6米' }
]

/** 能源分类（胶囊筛选） */
export const ENERGY_TYPES = [
  { key: 'all', label: '全部' },
  { key: '油车', label: '油车' },
  { key: '混动', label: '混动' },
  { key: '纯电', label: '纯电' }
]

/** 从车名提取米数，用于自动归类车型 */
export function extractLen(name) {
  const m = (name || '').match(/(\d+\.?\d*)\s*米/)
  if (m) return parseFloat(m[1])
  const mm = (name || '').match(/货箱[^0-9]*(\d{4})\s*mm/i)
  if (mm) return parseInt(mm[1], 10) / 1000
  return 0
}

/** 自动判定车型分类：≤3.2 微卡 / ≤3.8 小卡 / ≤4.2 轻卡 / 其余 中卡 */
export function detectTruckType(name, truckType) {
  if (truckType) return truckType
  const len = extractLen(name)
  if (len > 0 && len <= 3.2) return '微卡'
  if (len > 3.2 && len <= 3.8) return '小卡'
  if (len > 3.8 && len <= 4.2) return '轻卡'
  if (len > 4.2) return '中卡'
  return '轻卡'
}
