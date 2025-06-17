import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',  // ← Add this line
  build: {
    outDir: 'dist',
  },
})
