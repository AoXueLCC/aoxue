<script setup>
import { ref, watch } from 'vue'
import { showToast } from 'vant'
import { uploadBinary, getSettings } from '../../api/github'

/**
 * 图片/视频上传组件（admin 后台）
 * kind: image（单图）/ images（多图）/ video（单视频）
 * 上传到仓库 public/uploads/ 目录，返回 Pages 静态 URL
 */
const props = defineProps({
  modelValue: { type: [String, Array], default: () => '' },
  kind: { type: String, default: 'image' },
  hint: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const MAX_IMAGE = 8 * 1024 * 1024
const MAX_VIDEO = 40 * 1024 * 1024

/** van-uploader fileList：{ url, name } */
const fileList = ref([])

watch(
  () => props.modelValue,
  (val) => {
    syncFromModel(val)
  },
  { immediate: true }
)

function syncFromModel(val) {
  if (props.kind === 'images') {
    fileList.value = Array.isArray(val)
      ? val.filter(Boolean).map((url) => ({ url, name: url.split('/').pop() }))
      : []
  } else {
    fileList.value = val ? [{ url: val, name: val.split('/').pop() }] : []
  }
}

function emitModel() {
  if (props.kind === 'images') {
    emit('update:modelValue', fileList.value.map((f) => f.url).filter(Boolean))
  } else {
    emit('update:modelValue', fileList.value[0] ? fileList.value[0].url : '')
  }
}

/** 上传前检查大小 + 图片压缩 */
async function beforeRead(file) {
  if (props.kind === 'video') {
    if (file.size > MAX_VIDEO) {
      showToast(`视频不能超过 ${MAX_VIDEO / 1024 / 1024}MB`)
      return false
    }
    return file
  }
  if (file.size > MAX_IMAGE) {
    showToast(`图片不能超过 ${MAX_IMAGE / 1024 / 1024}MB`)
    return false
  }
  return compressImage(file)
}

/** 图片压缩：最大边 1600px，JPEG 0.82（手机原图动辄几 MB，压缩后一般 <300KB） */
function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, 1600 / Math.max(img.width, img.height))
        if (scale >= 1 && file.size < 400 * 1024) {
          resolve(file)
          return
        }
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })),
          'image/jpeg',
          0.82
        )
      }
      img.onerror = () => resolve(file)
      img.src = reader.result
    }
    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}

/** 上传到 GitHub 仓库并回填 URL */
async function afterRead(file) {
  file.status = 'uploading'
  file.message = '上传中...'
  try {
    const url = await uploadFile(file)
    file.url = url
    file.status = 'done'
    file.message = ''
    showToast('上传成功')
    emitModel()
  } catch (err) {
    file.status = 'failed'
    file.message = err.message || '上传失败'
    showToast(err.message || '上传失败')
  }
}

async function uploadFile(file) {
  const s = getSettings()
  if (!s) throw new Error('未配置 GitHub Token')
  const dir = props.kind === 'video' ? 'videos' : 'images'
  const ext = (file.file && file.file.name ? file.file.name : file.name || 'file')
    .split('.')
    .pop()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'webm'].includes(ext) ? ext : props.kind === 'video' ? 'mp4' : 'jpg'
  const name = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${safeExt}`
  const path = `public/uploads/${dir}/${name}`
  const base64 = String(file.content).split(',')[1] || ''
  if (!base64) throw new Error('文件读取失败')
  return uploadBinary(path, base64, `上传${props.kind === 'video' ? '视频' : '图片'} ${name}`)
}

const accept = props.kind === 'video' ? 'video/*' : 'image/*'
const maxCount = props.kind === 'images' ? 9 : 1
</script>

<template>
  <div class="img-uploader">
    <van-uploader
      v-model="fileList"
      :max-count="maxCount"
      :accept="accept"
      :before-read="beforeRead"
      :after-read="afterRead"
      :preview-full-image="kind === 'image' || kind === 'images'"
    />
    <div v-if="hint" class="upload-hint">{{ hint }}</div>
  </div>
</template>

<style scoped>
.img-uploader {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.upload-hint {
  font-size: 11px;
  color: #86909c;
}
</style>
