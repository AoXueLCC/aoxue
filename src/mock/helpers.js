/**
 * Mock 数据工具：生成占位图片（SVG data URI，无需网络）
 * 真实产品照片后续可替换为 images/ 目录路径
 */
export function svgImg({ icon = '🚚', title = '', sub = '', c1 = '#3B82F6', c2 = '#6366F1', w = 800, h = 500 }) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>` +
    `</linearGradient></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#g)"/>` +
    `<circle cx="${w * 0.82}" cy="${h * 0.18}" r="${h * 0.28}" fill="rgba(255,255,255,0.08)"/>` +
    `<circle cx="${w * 0.12}" cy="${h * 0.88}" r="${h * 0.2}" fill="rgba(255,255,255,0.06)"/>` +
    `<text x="${w / 2}" y="${h / 2 - 14}" font-size="${h * 0.34}" text-anchor="middle" dominant-baseline="middle">${icon}</text>` +
    `<rect x="0" y="${h - 96}" width="${w}" height="96" fill="rgba(15,23,42,0.28)"/>` +
    (title
      ? `<text x="${w / 2}" y="${h - 52}" font-size="36" fill="#ffffff" font-family="sans-serif" text-anchor="middle" font-weight="bold">${title}</text>`
      : '') +
    (sub
      ? `<text x="${w / 2}" y="${h - 16}" font-size="22" fill="rgba(255,255,255,0.85)" font-family="sans-serif" text-anchor="middle">${sub}</text>`
      : '') +
    `</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** 根据品牌色生成一组 3 张图（轮播用） */
export function galleryFor(name, colors, icon = '🚚') {
  const [c1, c2] = colors
  return [
    svgImg({ icon, title: name, sub: '冷藏车实拍图 · 1', c1, c2 }),
    svgImg({ icon, title: name, sub: '冷藏车实拍图 · 2', c1: shade(c1, -18), c2: shade(c2, 12) }),
    svgImg({ icon, title: name, sub: '冷藏车实拍图 · 3', c1: shade(c1, 14), c2: shade(c2, -14) })
  ]
}

/** 颜色加深/减淡工具 */
function shade(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = clamp(Math.round(((num >> 16) & 0xff) + (percent / 100) * 255))
  const g = clamp(Math.round(((num >> 8) & 0xff) + (percent / 100) * 255))
  const b = clamp(Math.round((num & 0xff) + (percent / 100) * 255))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function clamp(v) {
  return Math.min(255, Math.max(0, v))
}

/** 格式化金额：150000 -> 150,000 */
export function fmtPrice(n) {
  return Number(n || 0).toLocaleString('zh-CN')
}
