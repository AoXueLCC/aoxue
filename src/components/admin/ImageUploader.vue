<script setup>
import { ref, watch } from 'vue'
import { showToast } from 'vant'
import { uploadBinary, getSettings } from '../../api/github'

/**
 * 图片/视频上传组件（admin 后台）
 * kind: image（单图）/ images（多图）/ video（单视频）
 * 上传到仓库 public/uploads/ 目录，返回 Pages 静态 URL
 * 外观：大虚线拖拽区 + 大图预览 + 红色清除按钮（对齐旧版 admin.html 观感）
 */
const props = defineProps({
  modelValue: { type: [String, Array], default: () => '' },
  kind: { type: String, default: 'image' },
  hint: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const MAX_IMAGE = 8 * 1024 * 1024
const MAX_VIDEO = 40 * 1024 * 1024
const maxCount = props.kind === 'images' ? 9 : 1

/** van-uploader fileList：{ url, name, content, status } */
const fileList = ref([])
const dragOver = ref(false)

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

/** ============ 拖拽上传（van-uploader 不支持原生拖拽，手动补 content 走同一流程） ============ */

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

function onDragOver(e) {
  e.preventDefault()
  dragOver.value = true
}

function onDragLeave(e) {
  e.preventDefault()
  dragOver.value = false
}

async function onDrop(e) {
  e.preventDefault()
  dragOver.value = false
  const files = Array.from(e.dataTransfer.files || [])
  for (const f of files) {
    const ok = await appendFile(f)
    if (!ok) break
  }
}

async function appendFile(rawFile) {
  const isVideo = props.kind === 'video'
  if (isVideo ? !rawFile.type.startsWith('video/') : !rawFile.type.startsWith('image/')) {
    showToast(isVideo ? '只能拖入视频文件' : '只能拖入图片文件')
    return false
  }
  if (fileList.value.length >= maxCount) {
    showToast(`最多上传 ${maxCount} 个文件`)
    return false
  }
  const processed = await beforeRead(rawFile)
  if (!processed) return false
  const item = { file: processed, content: await readAsDataURL(processed), status: 'uploading', message: '上传中...' }
  fileList.value.push(item)
  await afterRead(item)
  return true
}

function removeFile(index) {
  fileList.value.splice(index, 1)
  emitModel()
}

const accept = props.kind === 'video' ? 'video/*' : 'image/*'
</script>

<template>
  <div
    class="img-uploader"
    :class="kind === 'images' ? 'is-list' : ''"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <van-uploader
      v-model="fileList"
      :max-count="maxCount"
      :accept="accept"
      :before-read="beforeRead"
      :after-read="afterRead"
      :preview-full-image="kind === 'image' || kind === 'images'"
    >
      <!-- 上传区：大虚线框 -->
      <template #default>
        <div class="upload-zone" :class="{ 'is-dragging': dragOver }">
          <template v-if="kind === 'video'">
            <van-icon name="play-circle-o" size="30" />
            <span class="zone-text">拖拽视频到这里，或点击选择</span>
          </template>
          <template v-else-if="fileList.length === 0">
            <van-icon name="photo-o" size="30" />
            <span class="zone-text">拖拽图片到这里，或点击选择</span>
          </template>
          <template v-else>
            <van-icon name="plus" size="22" />
            <span class="zone-text">继续添加</span>
          </template>
        </div>
      </template>

      <!-- 文件项：大图预览 + 红色清除按钮 -->
      <template #file="{ file, index, previewImage, previewVideo, reuploadFile }">
        <div class="file-item" :class="{ 'is-error': file.status === 'failed' }">
          <img
            v-if="kind !== 'video'"
            class="file-thumb"
            :src="file.url || file.content"
            @click="previewImage(file)"
          />
          <div v-else class="file-video" @click="previewVideo(file)">
            <van-icon name="play-circle" size="34" color="#fff" />
            <span class="file-name">{{ (file.file && file.file.name) || '视频' }}</span>
          </div>

          <div v-if="file.status === 'uploading'" class="file-mask">
            <van-loading size="18" color="#fff" />
          </div>
          <div v-if="file.status === 'failed'" class="file-mask">
            <button class="file-retry" @click="reuploadFile(file)">点击重试</button>
          </div>

          <button class="file-del" @click="removeFile(index)">×</button>
          <span v-if="kind === 'images' && index === 0" class="file-main">主图</span>
        </div>
      </template>
    </van-uploader>

    <div v-if="hint" class="upload-hint">{{ hint }}</div>
  </div>
</template>

<style scoped>
.img-uploader {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.van-uploader__wrapper) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 单图/视频：文件项撑满整行 */
.img-uploader:not(.is-list) :deep(.van-uploader__preview) {
  flex: 1;
  min-width: 0;
}

/* ============ 上传区：大虚线框 ============ */
.upload-zone {
  min-width: 140px;
  min-height: 120px;
  padding: 16px;
  border: 2px dashed #c9cdd4;
  border-radius: 12px;
  background: #f8f9fb;
  color: #86909c;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
  box-sizing: border-box;
}

.upload-zone:hover,
.img-uploader.is-dragging .upload-zone {
  border-color: #1677ff;
  background: #e8f1ff;
  color: #1677ff;
}

.zone-text {
  font-size: 13px;
  white-space: nowrap;
}

/* 多图模式：上传区收成小方块 */
.is-list .upload-zone {
  width: 100px;
  height: 100px;
  min-width: 0;
  min-height: 0;
  padding: 8px;
}

/* ============ 文件项 ============ */
.file-item {
  position: relative;
  width: 100%;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  background: #f0f1f4;
  border: 2px solid transparent;
  box-sizing: border-box;
}

/* 多图模式：缩略图小方块 */
.is-list .file-item {
  width: 100px;
  height: 100px;
}

.file-item.is-error {
  border-color: #ff4d4f;
}

.file-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  cursor: zoom-in;
}

/* 单图/视频：完整显示全图 */
.img-uploader:not(.is-list) .file-thumb {
  object-fit: contain;
}

/* 视频占位 */
.file-video {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #4e5969, #1d2129);
  cursor: pointer;
}

.file-name {
  font-size: 11px;
  color: #fff;
  max-width: 88%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 上传中/失败遮罩 */
.file-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 清除按钮（红色圆形 ×） */
.file-del {
  position: absolute;
  top: -7px;
  right: -7px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: #e53935;
  color: #fff;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(229, 57, 53, 0.4);
  z-index: 2;
}

/* 主图角标（多图第一张） */
.file-main {
  position: absolute;
  left: 4px;
  bottom: 4px;
  font-size: 10px;
  color: #fff;
  background: #1677ff;
  padding: 1px 6px;
  border-radius: 6px;
  z-index: 2;
}

/* 失败重试 */
.file-retry {
  height: 28px;
  padding: 0 12px;
  border: none;
  border-radius: 14px;
  background: #fff;
  color: #ff4d4f;
  font-size: 12px;
  cursor: pointer;
}

.upload-hint {
  font-size: 11px;
  color: #86909c;
}
</style>
