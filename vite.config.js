import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'

export default defineConfig(({ command }) => ({
  // 生产部署到 GitHub Pages 子路径 /aoxue/，开发环境保持根路径
  base: command === 'build' ? '/aoxue/' : '/',
  plugins: [vue(), UnoCSS()],
  server: {
    host: true,
    port: 5173,
    open: false
  },
  build: {
    target: 'es2018',
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1500
  }
}))
