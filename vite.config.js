import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import letusCalendar from './api/letus-calendar.js'

// 自分のPCで動かすとき（npm run dev）も、Vercel と同じように /api/letus-calendar を使えるようにする
const localApi = {
  name: 'local-api',
  configureServer(server) {
    server.middlewares.use('/api/letus-calendar', (req, res) => letusCalendar(req, res))
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApi],
})
