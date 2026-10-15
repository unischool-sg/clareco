import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Cloudflare Tunnel 経由で公開しているドメイン
    allowedHosts: ['clareco.unischool.jp'],
    proxy: {
      // 教職員用 API（teacher）
      '/api': process.env.API_URL ?? 'http://localhost:8001',
    },
  },
})
