import { svgImg } from './helpers.js'

/**
 * 厢体数据：10 种（含产品库真实厢体：中集CIMC K2不锈钢地板等）
 * fitTypes: 适配车型分类，选择厢体时按车型自动过滤
 */
export const BODIES = [
  {
    id: 'b01',
    brand: '中集',
    name: '中集 K2 不锈钢地板厢',
    thickness: '120mm',
    material: '不锈钢地板+铝合金',
    fitTypes: ['轻卡'],
    desc: '不锈钢地板耐腐蚀，肉制品运输首选',
    price: 32000,
    image: svgImg({ icon: '📦', title: '中集K2不锈钢地板厢', sub: '4.2米 · 120mm', c1: '#1677FF', c2: '#0EA5E9' })
  },
  {
    id: 'b02',
    brand: '中集',
    name: '中集 K1 标准冷藏厢',
    thickness: '100mm',
    material: '玻璃钢',
    fitTypes: ['轻卡'],
    desc: '标准配置，性价比高，出货快',
    price: 26000,
    image: svgImg({ icon: '📦', title: '中集K1标准冷藏厢', sub: '4.2米 · 100mm', c1: '#1677FF', c2: '#0EA5E9' })
  },
  {
    id: 'b03',
    brand: '中集',
    name: '中集 M1 微卡冷藏厢',
    thickness: '80mm',
    material: '玻璃钢',
    fitTypes: ['微卡'],
    desc: '轻量设计，微卡专用',
    price: 16000,
    image: svgImg({ icon: '📦', title: '中集M1微卡冷藏厢', sub: '3.2米 · 80mm', c1: '#1677FF', c2: '#0EA5E9' })
  },
  {
    id: 'b04',
    brand: '新飞',
    name: '新飞 XF-42 冷藏厢',
    thickness: '100mm',
    material: '玻璃钢',
    fitTypes: ['轻卡'],
    desc: '老牌制冷企业，保温性能稳定',
    price: 24000,
    image: svgImg({ icon: '📦', title: '新飞XF-42冷藏厢', sub: '4.2米 · 100mm', c1: '#EF4444', c2: '#F97316' })
  },
  {
    id: 'b05',
    brand: '冰熊',
    name: '冰熊 BX-42 冷藏厢',
    thickness: '120mm',
    material: '铝合金',
    fitTypes: ['轻卡'],
    desc: '全铝轻量厢体，载重更多',
    price: 30000,
    image: svgImg({ icon: '📦', title: '冰熊BX-42冷藏厢', sub: '4.2米 · 120mm', c1: '#0EA5E9', c2: '#6366F1' })
  },
  {
    id: 'b06',
    brand: '康飞',
    name: '康飞 KF-42 冷藏厢',
    thickness: '100mm',
    material: '铝合金',
    fitTypes: ['轻卡'],
    desc: '铝合金框架，坚固耐用',
    price: 27000,
    image: svgImg({ icon: '📦', title: '康飞KF-42冷藏厢', sub: '4.2米 · 100mm', c1: '#10B981', c2: '#84CC16' })
  },
  {
    id: 'b07',
    brand: '开元',
    name: '开元 KY-38 冷藏厢',
    thickness: '80mm',
    material: '玻璃钢',
    fitTypes: ['小卡'],
    desc: '小卡专用，轻量化设计',
    price: 19000,
    image: svgImg({ icon: '📦', title: '开元KY-38冷藏厢', sub: '3.8米 · 80mm', c1: '#F59E0B', c2: '#F97316' })
  },
  {
    id: 'b08',
    brand: '华晨',
    name: '华晨 HC-32 冷藏厢',
    thickness: '80mm',
    material: '玻璃钢',
    fitTypes: ['微卡'],
    desc: '微卡经济型厢体',
    price: 15000,
    image: svgImg({ icon: '📦', title: '华晨HC-32冷藏厢', sub: '3.2米 · 80mm', c1: '#EC4899', c2: '#F43F5E' })
  },
  {
    id: 'b09',
    brand: '中集',
    name: '中集 K6 中卡冷藏厢',
    thickness: '120mm',
    material: '铝合金',
    fitTypes: ['中卡'],
    desc: '中卡干线冷藏，大容积大空间',
    price: 46000,
    image: svgImg({ icon: '📦', title: '中集K6中卡冷藏厢', sub: '6.8米 · 120mm', c1: '#1677FF', c2: '#6366F1' })
  },
  {
    id: 'b10',
    brand: '天马',
    name: '天马 TM-68 冷藏厢',
    thickness: '100mm',
    material: '玻璃钢',
    fitTypes: ['中卡'],
    desc: '中卡经济型，性价比之选',
    price: 40000,
    image: svgImg({ icon: '📦', title: '天马TM-68冷藏厢', sub: '6.8米 · 100mm', c1: '#64748B', c2: '#334155' })
  }
]

/** 按厢体适配车型过滤 */
export function getBodiesByTruckType(truckType) {
  if (!truckType || truckType === 'all') return BODIES
  const matched = BODIES.filter((b) => b.fitTypes.includes(truckType))
  return matched.length ? matched : BODIES
}
