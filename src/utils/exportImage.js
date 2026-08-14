import html2canvas from 'html2canvas'
import { showImagePreview, showToast } from 'vant'
import { fmtPrice } from '../mock/helpers'

/**
 * 报价单保存为图片工具
 * 注意：报价单内车型缩略图为阿里云 OSS 跨域图，直接画 canvas 会污染导致图片空白，
 * 必须先 fetch 转 dataURL 再截图（公共读图片可正常 fetch）
 */

/** fetch 图片转 dataURL；失败返回原 src */
async function imgToDataURL(src) {
  try {
    const res = await fetch(src)
    if (!res.ok) return src
    const blob = await res.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => resolve(src)
      reader.readAsDataURL(blob)
    })
  } catch {
    return src
  }
}

/** dataURL/URL 加载为 Image；失败返回 null */
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

const SCALE = 2
const DESIGN_W = 750 // 长图设计稿宽度（CSS px）：375 手机布局 ×2，输出 1500px 高清长图
const QR_SIZE = 192 // 二维码边长（750 设计稿下 CSS px，源图 592px 放大不糊）
const FOOTER_H = 336 // 页脚高度（750 设计稿下 CSS px），容纳二维码 + 提示文字

/** 截图时把 375 布局放大为 750 设计稿：覆盖 CSS 变量（字体/间距/圆角 ×2） */
const QUOTE_VARS = {
  '--fs-page-title': '36px',
  '--fs-section': '32px',
  '--fs-vehicle': '28px',
  '--fs-body': '26px',
  '--fs-desc': '24px',
  '--fs-caption': '22px',
  '--fs-price': '32px',
  '--fs-price-lg': '40px',
  '--fs-price-xl': '44px',
  '--space-page': '32px',
  '--space-section': '40px',
  '--space-card': '24px',
  '--space-gap': '20px',
  '--radius-card': '20px',
  '--shadow-1': '0 4px 16px rgba(0, 0, 0, 0.04)',
  '--quote-img-h': '320px',
  '--quote-name': '32px',
  '--quote-no': '22px',
  '--quote-tag-h': '40px',
  '--quote-tag-fs': '22px',
  '--quote-tag-pad': '16px',
  '--quote-tag-gap': '12px',
  '--quote-body-pad': '24px 28px 28px',
  '--quote-title-border': '4px',
  '--quote-thumb': '80px',
  '--quote-icon': '32px',
  '--quote-cfg-title': '26px',
  '--quote-cfg-tag': '20px',
  '--quote-cfg-tag-h': '36px',
  '--quote-label': '28px',
  '--quote-price': '30px',
  '--quote-price-na': '26px',
  '--quote-spec-py': '16px',
  '--quote-row-h': '60px',
  '--quote-fs': '26px',
  '--quote-divider-m': '16px',
  '--quote-note': '22px',
  '--quote-fee-head-fs': '20px',
  '--quote-fee-py': '18px',
  '--quote-fee-fs': '26px',
  '--quote-fee-total-py': '24px',
  '--quote-fee-total-label': '28px',
  '--quote-total': '44px',
  '--quote-stamp-top': '24px',
  '--quote-stamp-right': '24px',
  '--quote-stamp-pad': '12px 28px',
  '--quote-stamp-label': '20px',
  '--quote-stamp-time': '24px'
}

/**
 * 在截图底部追加二维码页脚（白底 + 居中二维码 + 提示文字），客户扫码回到报价链接
 */
async function composeQrFooter(canvas) {
  const out = document.createElement('canvas')
  out.width = canvas.width
  out.height = canvas.height + FOOTER_H * SCALE
  const ctx = out.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, out.width, out.height)
  ctx.drawImage(canvas, 0, 0)

  const qr = await loadImage(await imgToDataURL('data/images/qr-link.png'))
  if (qr) {
    const qrPx = QR_SIZE * SCALE
    const x = (out.width - qrPx) / 2
    const y = canvas.height + 40 * SCALE
    ctx.drawImage(qr, x, y, qrPx, qrPx)
  }

  ctx.fillStyle = '#999999'
  ctx.font = `${26 * SCALE}px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('扫码查看报价', out.width / 2, canvas.height + (40 + QR_SIZE + 24) * SCALE)

  return out
}

/**
 * 截图指定 DOM 区域为 PNG dataURL
 * @param {HTMLElement} el 截图目标元素
 * @param {Object} opts { finalTotal } 传入则把动画金额写死为最终值（避免截到动画中间帧）
 */
export async function captureDomAsImage(el, opts = {}) {
  if (!el) throw new Error('截图区域不存在')

  // 深克隆到视口外的隐藏容器：固定 750 设计稿宽度，覆盖 CSS 变量放大内容（375 → 750 ×2）
  const clone = el.cloneNode(true)
  const wrap = document.createElement('div')
  wrap.style.cssText = `position:fixed;left:-10000px;top:0;z-index:-1;pointer-events:none;width:${DESIGN_W}px;`
  for (const [k, v] of Object.entries(QUOTE_VARS)) wrap.style.setProperty(k, v)
  wrap.appendChild(clone)
  document.body.appendChild(wrap)

  try {
    // 跨域图片转 dataURL（img 标签 + 内联背景图），避免污染 canvas
    const jobs = []
    clone.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src')
      if (src && src.startsWith('http')) {
        jobs.push(imgToDataURL(src).then((d) => img.setAttribute('src', d)))
      }
    })
    clone.querySelectorAll('[style*="background-image"]').forEach((el) => {
      const bg = el.style.backgroundImage || ''
      const m = bg.match(/url\(["']?(.+?)["']?\)/)
      if (m && m[1] && m[1].startsWith('http')) {
        jobs.push(imgToDataURL(m[1]).then((d) => el.style.setProperty('background-image', `url("${d}")`)))
      }
    })
    await Promise.all(jobs)

    // 动画金额写死为最终值
    if (opts.finalTotal != null) {
      const animated = clone.querySelector('.animated-price')
      if (animated) animated.textContent = `¥${fmtPrice(Math.round(opts.finalTotal))}`
    }

    const canvas = await html2canvas(clone, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false
    })
    const withQr = await composeQrFooter(canvas)
    return withQr.toDataURL('image/png')
  } finally {
    wrap.remove()
  }
}

/** 全屏预览生成图，提示长按保存 */
export function previewImage(dataUrl) {
  showToast({ message: '长按图片保存到相册', position: 'bottom' })
  showImagePreview({
    images: [dataUrl],
    closeable: true,
    closeIconPosition: 'top-right'
  })
}
