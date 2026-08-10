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
    return canvas.toDataURL('image/png')
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
