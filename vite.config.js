import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/Marry2025SY/', // ⭐ 레포 이름과 정확히 동일
})