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
const QR_SIZE = 96 // 二维码边长（CSS px）
const FOOTER_H = 168 // 页脚高度（CSS px），容纳二维码 + 提示文字

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
    const y = canvas.height + 20 * SCALE
    ctx.drawImage(qr, x, y, qrPx, qrPx)
  }

  ctx.fillStyle = '#999999'
  ctx.font = `${13 * SCALE}px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('扫码查看报价', out.width / 2, canvas.height + (20 + QR_SIZE + 12) * SCALE)

  return out
}

/**
 * 截图指定 DOM 区域为 PNG dataURL
 * @param {HTMLElement} el 截图目标元素
 * @param {Object} opts { finalTotal } 传入则把动画金额写死为最终值（避免截到动画中间帧）
 */
export async function captureDomAsImage(el, opts = {}) {
  if (!el) throw new Error('截图区域不存在')

  // 深克隆到视口外的隐藏容器，保证 getComputedStyle 正常计算
  const clone = el.cloneNode(true)
  const wrap = document.createElement('div')
  wrap.style.cssText = 'position:fixed;left:-10000px;top:0;z-index:-1;pointer-events:none;'
  wrap.appendChild(clone)
  document.body.appendChild(wrap)

  try {
    // 跨域图片转 dataURL
    const imgs = clone.querySelectorAll('img')
    await Promise.all(
      Array.from(imgs).map(async (img) => {
        const src = img.getAttribute('src')
        if (src && src.startsWith('http')) {
          img.setAttribute('src', await imgToDataURL(src))
        }
      })
    )

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
