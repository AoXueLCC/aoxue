/**
 * Admin 后台字段配置：四表 CRUD 的 schema 驱动定义
 * type: text / number / select / multiselect / tags / textarea / image / images / video
 */

/** 车型表（字段分组编辑） */
export const TRUCK_SCHEMA = {
  title: '车型',
  primary: 'id',
  searchKeys: ['name', 'brand', 'engine'],
  columns: [
    { key: 'gallery', label: '主图' },
    { key: 'name', label: '车型名称' },
    { key: 'brand', label: '品牌' },
    { key: 'truckType', label: '类型' },
    { key: 'energy', label: '能源' },
    { key: 'price', label: '参考价' }
  ],
  fields: [
    { group: '基本信息', key: 'id', label: 'ID', type: 'text', placeholder: '如 t33（唯一，用于链接地址）', required: true },
    { group: '基本信息', key: 'name', label: '车型名称', type: 'text', placeholder: '如 江铃E路达 100度', required: true },
    { group: '基本信息', key: 'brandId', label: '品牌', type: 'select', options: 'brands', required: true },
    { group: '基本信息', key: 'truckType', label: '车型分类', type: 'select', options: ['微卡', '小卡', '轻卡', '中卡'], required: true },
    { group: '基本信息', key: 'energy', label: '能源类型', type: 'select', options: ['纯电', '柴油', '汽油', '混动'], required: true },
    { group: '基本信息', key: 'price', label: '参考价格（元）', type: 'number', placeholder: '如 150000', required: true },
    { group: '基本信息', key: 'tags', label: '标签（逗号分隔）', type: 'tags', placeholder: '如 冷藏专用,长续航' },
    { group: '动力参数', key: 'engine', label: '发动机/电机', type: 'text', placeholder: '如 永磁同步电机（峰值120kW）' },
    { group: '动力参数', key: 'power', label: '马力', type: 'text', placeholder: '如 163马力' },
    { group: '动力参数', key: 'emission', label: '排放', type: 'text', placeholder: '如 国六B' },
    { group: '动力参数', key: 'gearbox', label: '变速箱', type: 'text', placeholder: '如 6挡手动变速箱' },
    { group: '尺寸参数', key: 'wheelbase', label: '轴距', type: 'text', placeholder: '如 3360mm' },
    { group: '尺寸参数', key: 'tire', label: '轮胎', type: 'text', placeholder: '如 7.00R16LT 钢丝胎' },
    { group: '尺寸参数', key: 'cargoLen', label: '货箱长度', type: 'text', placeholder: '如 4.2米' },
    { group: '尺寸参数', key: 'totalMass', label: '总质量', type: 'text', placeholder: '如 4.5吨' },
    { group: '尺寸参数', key: 'payload', label: '额定载重', type: 'text', placeholder: '如 1.45吨' },
    { group: '能源配置', key: 'battery', label: '电池', type: 'text', placeholder: '如 100kWh 磷酸铁锂电池（纯电车型）' },
    { group: '能源配置', key: 'tankVolume', label: '油箱', type: 'text', placeholder: '如 120L 铁油箱（油车车型）' },
    { group: '能源配置', key: 'defaultAC', label: '标配冷机型号', type: 'text', placeholder: '如 华盛EV600分体（须与冷机表型号一致）' },
    { group: '媒体', key: 'video', label: '宣传视频', type: 'video', hint: 'MP4 格式，建议 50MB 以内' },
    { group: '媒体', key: 'gallery', label: '车辆图片（第一张为主图）', type: 'images', hint: '支持多张，JPG/PNG，自动压缩' }
  ]
}

/** 冷机表 */
export const REFRIGERATOR_SCHEMA = {
  title: '冷机',
  primary: 'id',
  searchKeys: ['model', 'brand'],
  columns: [
    { key: 'image', label: '图片' },
    { key: 'model', label: '型号' },
    { key: 'brand', label: '品牌' },
    { key: 'energy', label: '类型' },
    { key: 'cooling', label: '制冷量' },
    { key: 'price', label: '价格' }
  ],
  fields: [
    { group: '基本信息', key: 'id', label: 'ID', type: 'text', placeholder: '如 r16（唯一）', required: true },
    { group: '基本信息', key: 'brand', label: '品牌', type: 'text', placeholder: '如 华盛', required: true },
    { group: '基本信息', key: 'model', label: '型号', type: 'text', placeholder: '如 华盛EV600分体', required: true },
    { group: '基本信息', key: 'price', label: '价格（元）', type: 'number', required: true },
    { group: '性能参数', key: 'energy', label: '冷机类型', type: 'select', options: ['纯电', '燃油'], required: true, hint: '纯电=电动冷机（配纯电车型）/ 燃油=柴油机冷机（配油车）' },
    { group: '性能参数', key: 'powerSource', label: '动力来源', type: 'text', placeholder: '如 电动（380V）' },
    { group: '性能参数', key: 'tempRange', label: '温度范围', type: 'text', placeholder: '如 -20℃ ~ +20℃' },
    { group: '性能参数', key: 'cooling', label: '制冷量', type: 'text', placeholder: '如 6000W' },
    { group: '性能参数', key: 'fitTypes', label: '适配车型', type: 'multiselect', options: ['微卡', '小卡', '轻卡', '中卡'] },
    { group: '其他', key: 'desc', label: '说明', type: 'textarea', placeholder: '一句话卖点描述' },
    { group: '媒体', key: 'image', label: '冷机图片', type: 'image' }
  ]
}

/** 厢体表 */
export const BODY_SCHEMA = {
  title: '厢体',
  primary: 'id',
  searchKeys: ['name', 'brand'],
  columns: [
    { key: 'image', label: '图片' },
    { key: 'name', label: '厢体名称' },
    { key: 'brand', label: '品牌' },
    { key: 'thickness', label: '保温' },
    { key: 'material', label: '材质' },
    { key: 'price', label: '价格' }
  ],
  fields: [
    { group: '基本信息', key: 'id', label: 'ID', type: 'text', placeholder: '如 b11（唯一）', required: true },
    { group: '基本信息', key: 'brand', label: '品牌', type: 'text', placeholder: '如 中集', required: true },
    { group: '基本信息', key: 'name', label: '厢体名称', type: 'text', placeholder: '如 中集 K2 不锈钢地板厢', required: true },
    { group: '基本信息', key: 'price', label: '价格（元）', type: 'number', required: true },
    { group: '规格', key: 'thickness', label: '保温厚度', type: 'text', placeholder: '如 120mm' },
    { group: '规格', key: 'material', label: '材质', type: 'text', placeholder: '如 不锈钢地板+铝合金' },
    { group: '规格', key: 'fitTypes', label: '适配车型', type: 'multiselect', options: ['微卡', '小卡', '轻卡', '中卡'] },
    { group: '其他', key: 'desc', label: '说明', type: 'textarea', placeholder: '一句话卖点描述' },
    { group: '媒体', key: 'image', label: '厢体图片', type: 'image' }
  ]
}

/** 配装表 */
export const ACCESSORY_SCHEMA = {
  title: '配装',
  primary: 'id',
  searchKeys: ['name', 'brand'],
  columns: [
    { key: 'icon', label: '图标' },
    { key: 'name', label: '配装名称' },
    { key: 'brand', label: '品牌' },
    { key: 'category', label: '分类' },
    { key: 'price', label: '价格' }
  ],
  fields: [
    { group: '基本信息', key: 'id', label: 'ID', type: 'text', placeholder: '如 a21（唯一）', required: true },
    { group: '基本信息', key: 'icon', label: '图标（emoji）', type: 'text', placeholder: '如 🛗', required: true },
    { group: '基本信息', key: 'name', label: '配装名称', type: 'text', placeholder: '如 液压尾板', required: true },
    { group: '基本信息', key: 'brand', label: '品牌/厂商', type: 'text', placeholder: '如 畅友力' },
    { group: '基本信息', key: 'category', label: '分类（配置页 tab）', type: 'select', options: ['门体', '温控', '安全配置', '其他'], required: true },
    { group: '基本信息', key: 'price', label: '价格（元）', type: 'number', required: true }
  ]
}

/** 品牌表 */
export const BRAND_SCHEMA = {
  title: '品牌',
  primary: 'id',
  searchKeys: ['name'],
  columns: [
    { key: 'logo', label: 'Logo' },
    { key: 'name', label: '品牌名称' },
    { key: 'short', label: '简称' },
    { key: 'colors', label: '主题色' }
  ],
  fields: [
    { group: '基本信息', key: 'id', label: 'ID', type: 'text', placeholder: '如 dongfeng（唯一，与车型 brandId 对应）', required: true },
    { group: '基本信息', key: 'name', label: '品牌名称', type: 'text', placeholder: '如 东风', required: true },
    { group: '基本信息', key: 'short', label: '简称（圆形Logo首字）', type: 'text', placeholder: '如 东' },
    { group: '基本信息', key: 'colors', label: '主题色（两个十六进制色，逗号分隔）', type: 'tags', placeholder: '如 #3B82F6,#6366F1' },
    { group: '媒体', key: 'logo', label: '品牌 Logo 图片（留空显示渐变首字）', type: 'image' }
  ]
}

export const ALL_SCHEMAS = {
  trucks: TRUCK_SCHEMA,
  refrigerators: REFRIGERATOR_SCHEMA,
  bodies: BODY_SCHEMA,
  accessories: ACCESSORY_SCHEMA,
  brands: BRAND_SCHEMA
}

/** 新建记录默认值（按 schema 生成空字段，数组类给空数组） */
export function defaultRow(schema) {
  const row = {}
  for (const f of schema.fields) {
    if (f.type === 'multiselect' || f.type === 'tags' || f.type === 'images' || f.type === 'gallery') {
      row[f.key] = []
    } else {
      row[f.key] = ''
    }
  }
  return row
}

/** 保存前清理：删除 schema 外的多余字段、空字符串补默认值 */
export function normalizeRow(schema, row) {
  const keys = new Set(schema.fields.map((f) => f.key))
  const clean = {}
  for (const f of schema.fields) {
    const v = row[f.key]
    if (f.type === 'multiselect' || f.type === 'tags' || f.type === 'images' || f.type === 'gallery') {
      clean[f.key] = Array.isArray(v) ? v : []
    } else {
      clean[f.key] = v == null ? '' : v
    }
  }
  return clean
}

/** 价格等数字字段：字符串 → 数字（发布前转换） */
export function toNumbers(schema, row) {
  const out = { ...row }
  for (const f of schema.fields) {
    if (f.type === 'number') {
      const n = Number(out[f.key])
      out[f.key] = Number.isFinite(n) ? n : 0
    }
  }
  return out
}
