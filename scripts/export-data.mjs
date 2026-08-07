/**
 * 数据导出脚本：Mock 种子数据 → public/data/*.json
 * 前端运行时加载 public/data/data.json，改数据无需重新构建
 * 运行：node scripts/export-data.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { BRANDS } from '../src/mock/brands.js'
import { TRUCKS } from '../src/mock/trucks.js'
import { REFRIGERATORS } from '../src/mock/refrigerators.js'
import { BODIES } from '../src/mock/bodies.js'
import { ACCESSORIES } from '../src/mock/accessories.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../public/data')

/** 图片字段清空：占位 SVG 由前端兜底生成，真实图片 URL 由 admin 后台维护 */
const trucks = TRUCKS.map(({ gallery, ...t }) => ({ ...t, gallery: [] }))
const refrigerators = REFRIGERATORS.map(({ image, ...r }) => ({ ...r, image: '' }))
const bodies = BODIES.map(({ image, ...b }) => ({ ...b, image: '' }))

const data = {
  version: 1,
  updatedAt: new Date().toISOString(),
  brands: BRANDS,
  trucks,
  refrigerators,
  bodies,
  accessories: ACCESSORIES
}

mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'data.json'), JSON.stringify(data, null, 2), 'utf-8')
writeFileSync(join(outDir, 'version.json'), JSON.stringify({ v: 2026080601 }), 'utf-8')

console.log(`✅ 已生成 ${outDir}/data.json（${data.trucks.length} 车型 / ${data.refrigerators.length} 冷机 / ${data.bodies.length} 厢体 / ${data.accessories.length} 配装）`)
console.log('✅ 已生成 version.json v=2026080601')
