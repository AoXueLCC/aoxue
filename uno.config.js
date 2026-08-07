import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno()],
  theme: {
    colors: {
      primary: '#1677FF',
      danger: '#FF4D4F',
      bg: '#F5F7FA',
      card: '#FFFFFF',
      border: '#E5E6EB'
    },
    borderRadius: {
      DEFAULT: '16px'
    },
    boxShadow: {
      card: '0 4px 16px rgba(29, 33, 41, 0.06)'
    }
  },
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'card-base': 'bg-card rounded-[16px] shadow-card'
  }
})
