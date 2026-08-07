import { svgImg } from './helpers.js'

/**
 * 冷机数据：15 款，全部基于产品库真实数据（品牌/型号/价格）
 * energy: 纯电=电动冷机 / 燃油=柴油机冷机（按车型能源自动匹配）
 * fitTypes: 适配车型分类（微卡/小卡/轻卡/中卡），显示在卡片上
 */
export const REFRIGERATORS = [
  {
    id: 'r01',
    brand: '华盛',
    model: '华盛EV600分体',
    energy: '纯电',
    powerSource: '电动（380V）',
    tempRange: '-20℃ ~ +20℃',
    cooling: '6000W',
    fitTypes: ['轻卡', '中卡'],
    desc: '分体式结构，适合4.2米及以上冷藏厢',
    price: 16000,
    image: svgImg({ icon: '❄️', title: '华盛EV600分体', sub: '6000W · 电动冷机', c1: '#0EA5E9', c2: '#6366F1' })
  },
  {
    id: 'r02',
    brand: '华盛',
    model: '华盛EV600MB一体',
    energy: '纯电',
    powerSource: '电动（380V）',
    tempRange: '-20℃ ~ +20℃',
    cooling: '6000W',
    fitTypes: ['轻卡', '中卡'],
    desc: '一体式结构，安装更紧凑，噪音更低',
    price: 19000,
    image: svgImg({ icon: '❄️', title: '华盛EV600MB一体', sub: '6000W · 一体式', c1: '#0EA5E9', c2: '#6366F1' })
  },
  {
    id: 'r03',
    brand: '华盛',
    model: '华盛EV400',
    energy: '纯电',
    powerSource: '电动（380V）',
    tempRange: '-18℃ ~ +20℃',
    cooling: '4000W',
    fitTypes: ['小卡', '轻卡'],
    desc: '性价比之选，适合城配冷藏运输',
    price: 10000,
    image: svgImg({ icon: '❄️', title: '华盛EV400', sub: '4000W · 电动冷机', c1: '#0EA5E9', c2: '#6366F1' })
  },
  {
    id: 'r04',
    brand: '华盛',
    model: '华盛EV300',
    energy: '纯电',
    powerSource: '电动（380V）',
    tempRange: '-18℃ ~ +20℃',
    cooling: '3000W',
    fitTypes: ['微卡', '小卡'],
    desc: '小厢专用，微卡/小卡标配之选',
    price: 9500,
    image: svgImg({ icon: '❄️', title: '华盛EV300', sub: '3000W · 小厢专用', c1: '#0EA5E9', c2: '#6366F1' })
  },
  {
    id: 'r05',
    brand: '开利',
    model: '开利PULSOR',
    energy: '纯电',
    powerSource: '电动（380V）',
    tempRange: '-25℃ ~ +20℃',
    cooling: '5000W',
    fitTypes: ['中卡'],
    desc: '进口技术，深冷保鲜，干线冷链旗舰',
    price: 25000,
    image: svgImg({ icon: '❄️', title: '开利PULSOR', sub: '5000W · 深冷旗舰', c1: '#F59E0B', c2: '#EF4444' })
  },
  {
    id: 'r06',
    brand: '松芝',
    model: '松芝SE380',
    energy: '纯电',
    powerSource: '电动（380V）',
    tempRange: '-18℃ ~ +20℃',
    cooling: '3800W',
    fitTypes: ['轻卡', '中卡'],
    desc: '高效节能，制冷速度快',
    price: 14500,
    image: svgImg({ icon: '❄️', title: '松芝SE380', sub: '3800W · 电动冷机', c1: '#10B981', c2: '#0EA5E9' })
  },
  {
    id: 'r07',
    brand: '松芝',
    model: '松芝SE330',
    energy: '纯电',
    powerSource: '电动（380V）',
    tempRange: '-18℃ ~ +20℃',
    cooling: '3300W',
    fitTypes: ['轻卡', '中卡'],
    desc: '轻卡经典配置，稳定耐用',
    price: 13000,
    image: svgImg({ icon: '❄️', title: '松芝SE330', sub: '3300W · 经典款', c1: '#10B981', c2: '#0EA5E9' })
  },
  {
    id: 'r08',
    brand: '松芝',
    model: '松芝EX580',
    energy: '纯电',
    powerSource: '电动（380V）',
    tempRange: '-20℃ ~ +20℃',
    cooling: '5800W',
    fitTypes: ['中卡'],
    desc: '大制冷量，适合大容积冷藏厢',
    price: 18000,
    image: svgImg({ icon: '❄️', title: '松芝EX580', sub: '5800W · 大功率', c1: '#10B981', c2: '#0EA5E9' })
  },
  {
    id: 'r09',
    brand: '松芝',
    model: '松芝X5-S',
    energy: '纯电',
    powerSource: '电动（380V）',
    tempRange: '-18℃ ~ +20℃',
    cooling: '5000W',
    fitTypes: ['轻卡', '中卡'],
    desc: '智能温控，一键除霜',
    price: 13000,
    image: svgImg({ icon: '❄️', title: '松芝X5-S', sub: '5000W · 智能温控', c1: '#10B981', c2: '#0EA5E9' })
  },
  {
    id: 'r10',
    brand: '松芝',
    model: '松芝X3油车',
    energy: '燃油',
    powerSource: '柴油机驱动',
    tempRange: '-18℃ ~ +20℃',
    cooling: '3000W',
    fitTypes: ['小卡', '轻卡'],
    desc: '柴油机直驱，油车标配',
    price: 9000,
    image: svgImg({ icon: '❄️', title: '松芝X3油车', sub: '3000W · 柴油机', c1: '#F97316', c2: '#F59E0B' })
  },
  {
    id: 'r11',
    brand: '松芝',
    model: '松芝X1油车',
    energy: '燃油',
    powerSource: '柴油机驱动',
    tempRange: '-15℃ ~ +20℃',
    cooling: '2600W',
    fitTypes: ['微卡', '小卡'],
    desc: '小厢经济型，微卡油车标配',
    price: 8500,
    image: svgImg({ icon: '❄️', title: '松芝X1油车', sub: '2600W · 经济型', c1: '#F97316', c2: '#F59E0B' })
  },
  {
    id: 'r12',
    brand: '黑盾',
    model: '黑盾HE600F',
    energy: '纯电',
    powerSource: '电动（380V）',
    tempRange: '-20℃ ~ +20℃',
    cooling: '6000W',
    fitTypes: ['中卡'],
    desc: '超低温冷库级，疫苗冷链首选',
    price: 25000,
    image: svgImg({ icon: '❄️', title: '黑盾HE600F', sub: '6000W · 超低温', c1: '#6366F1', c2: '#8B5CF6' })
  },
  {
    id: 'r13',
    brand: '黑盾',
    model: '黑盾460Y',
    energy: '燃油',
    powerSource: '柴油机驱动',
    tempRange: '-20℃ ~ +20℃',
    cooling: '4600W',
    fitTypes: ['中卡'],
    desc: '大功率柴油机冷机，中卡干线标配',
    price: 15000,
    image: svgImg({ icon: '❄️', title: '黑盾460Y', sub: '4600W · 柴油机', c1: '#6366F1', c2: '#8B5CF6' })
  },
  {
    id: 'r14',
    brand: '黑盾',
    model: '黑盾380Y',
    energy: '燃油',
    powerSource: '柴油机驱动',
    tempRange: '-18℃ ~ +20℃',
    cooling: '3800W',
    fitTypes: ['轻卡', '中卡'],
    desc: '动力充沛，适合重载冷藏运输',
    price: 9000,
    image: svgImg({ icon: '❄️', title: '黑盾380Y', sub: '3800W · 柴油机', c1: '#6366F1', c2: '#8B5CF6' })
  },
  {
    id: 'r15',
    brand: '三丰',
    model: '三丰550',
    energy: '燃油',
    powerSource: '柴油机驱动',
    tempRange: '-18℃ ~ +20℃',
    cooling: '5500W',
    fitTypes: ['轻卡'],
    desc: '国产品牌销量王，售后网点多',
    price: 9000,
    image: svgImg({ icon: '❄️', title: '三丰550', sub: '5500W · 销量王', c1: '#22C55E', c2: '#84CC16' })
  }
]

/** 按型号取冷机（用于匹配车型标配） */
export function getRefrigeratorByModel(model) {
  return REFRIGERATORS.find((r) => r.model === model) || null
}
