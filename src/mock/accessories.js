/**
 * 配装（选装件）数据：20 种，支持多选，按 category 分组展示
 * category: 门体 / 温控 / 安全配置 / 其他（配置页 tab 分类）
 * 前 5 款为产品库真实配件（畅友力尾板 / GPS监控 / 铝花纹裙边 / 不锈钢裙边 / 隔温板）
 */
export const ACCESSORIES = [
  { id: 'a01', icon: '🛗', name: '液压尾板', brand: '畅友力', price: 8500, category: '门体' },
  { id: 'a02', icon: '🔗', name: '铝合金导轨', brand: '中集', price: 2200, category: '其他' },
  { id: 'a03', icon: '🥩', name: '不锈钢肉钩', brand: '定制', price: 1800, category: '其他' },
  { id: 'a04', icon: '📡', name: 'GPS定位监控', brand: '中交兴路', price: 4000, category: '安全配置' },
  { id: 'a05', icon: '🌡️', name: '温度记录仪', brand: '松芝', price: 1500, category: '温控' },
  { id: 'a06', icon: '🔲', name: '铝花纹地板', brand: '中集', price: 2500, category: '其他' },
  { id: 'a07', icon: '🌬️', name: '通风槽', brand: '中集', price: 1200, category: '温控' },
  { id: 'a08', icon: '🚪', name: '侧开门', brand: '中集', price: 3000, category: '门体' },
  { id: 'a09', icon: '🧊', name: '双温区隔板', brand: '中集', price: 3500, category: '温控' },
  { id: 'a10', icon: '❄️', name: '蓄冷板', brand: '黑盾', price: 2800, category: '温控' },
  { id: 'a11', icon: '🧱', name: '隔温板', brand: '定制', price: 1000, category: '温控' },
  { id: 'a12', icon: '🛡️', name: '铝花纹裙边', brand: '中集', price: 1500, category: '其他' },
  { id: 'a13', icon: '✨', name: '不锈钢裙边', brand: '中集', price: 2000, category: '其他' },
  { id: 'a14', icon: '🧰', name: '工具箱', brand: '定制', price: 600, category: '其他' },
  { id: 'a15', icon: '📹', name: '倒车影像', brand: '定制', price: 1200, category: '安全配置' },
  { id: 'a16', icon: '📷', name: '行车记录仪', brand: '定制', price: 800, category: '安全配置' },
  { id: 'a17', icon: '💡', name: '紫外线消毒灯', brand: '定制', price: 500, category: '温控' },
  { id: 'a18', icon: '🧯', name: '车载灭火器', brand: '定制', price: 200, category: '安全配置' },
  { id: 'a19', icon: '⚙️', name: '备胎架', brand: '定制', price: 900, category: '其他' },
  { id: 'a20', icon: '🛢️', name: '底盘装甲', brand: '定制', price: 1300, category: '安全配置' }
]

/** 按 id 列表取配装 */
export function getAccessoriesByIds(ids = []) {
  return ACCESSORIES.filter((a) => ids.includes(a.id))
}
