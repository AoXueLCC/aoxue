<script setup>
import { ref, computed } from 'vue'
import { showImagePreview, showToast } from 'vant'
import { svgImg } from '../mock/helpers'

/**
 * Vehicle Gallery：大图轮播 + 数量提示 + 视频播放（16:9 卡片，56px 播放按钮）
 * 点击图片 → 全屏预览（van-image-preview 支持双指缩放）
 */
const props = defineProps({
  images: { type: Array, default: () => [] },
  video: { type: String, default: '' },
  title: { type: String, default: '' }
})

const playing = ref(false)
const current = ref(0)

const placeholder = computed(() =>
  svgImg({ icon: '🚚', title: props.title, sub: '冷藏车实拍图 · 待上传', c1: '#3B82F6', c2: '#6366F1' })
)

const countText = computed(() => `${current.value + 1}/${props.images.length}`)

function onPreview(index) {
  if (!props.images.length) return
  showImagePreview({
    images: props.images,
    startPosition: index,
    closeable: true,
    closeIconPosition: 'top-right'
  })
}

function openVideo() {
  playing.value = true
}

function onVideoError() {
  playing.value = false
  showToast('视频加载失败，请检查网络')
}
</script>

<template>
  <div class="truck-swiper">
    <div class="gallery">
      <van-swipe
        v-if="images.length"
        class="swipe"
        :autoplay="4000"
        indicator-color="#FFFFFF"
        :loop="images.length > 1"
        @change="(i) => (current = i)"
      >
        <van-swipe-item v-for="(img, i) in images" :key="i">
          <img :src="img" :alt="`车辆图片${i + 1}`" class="swipe-img" @click="onPreview(i)" />
        </van-swipe-item>
      </van-swipe>
      <img v-else :src="placeholder" alt="车辆图片占位" class="swipe-img" />

      <span v-if="images.length > 1" class="count-badge num">{{ countText }}</span>

      <button v-if="video" class="video-btn" @click="openVideo">
        <van-icon name="play" size="24" />
      </button>
    </div>

    <transition name="fade">
      <div v-if="playing" class="video-overlay" @click.self="playing = false">
        <video
          class="video-player"
          :src="video"
          controls
          autoplay
          playsinline
          @error="onVideoError"
        ></video>
        <button class="video-close" @click="playing = false">
          <van-icon name="cross" size="18" />
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.gallery {
  position: relative;
  border-radius: var(--radius-image);
  overflow: hidden;
  background: var(--tag-bg);
}

.swipe {
  aspect-ratio: 16 / 9;
}

.swipe-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.count-badge {
  position: absolute;
  right: 12px;
  bottom: 12px;
  height: 24px;
  padding: 0 10px;
  border-radius: var(--radius-chip);
  background: rgba(17, 24, 39, 0.55);
  color: #ffffff;
  font-size: var(--fs-caption);
  display: inline-flex;
  align-items: center;
}

.video-btn {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(17, 24, 39, 0.45);
  backdrop-filter: blur(4px);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease-out;
  z-index: 5;
}

.video-btn:active {
  transform: translate(-50%, -50%) scale(0.92);
}

.video-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-player {
  width: 100%;
  max-height: 100vh;
}

.video-close {
  position: absolute;
  top: calc(16px + var(--safe-top));
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
