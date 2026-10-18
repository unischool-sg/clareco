import { resolve } from 'node:path'

import react from '@vitejs/plugin-react'
import { type Connect, defineConfig, type Plugin } from 'vite'

const PAGES = ['login', 'console']

// `/console` のような末尾スラッシュなしのアクセスは SPA フォールバックで
// ルートの index.html (home) が返ってしまうため、`/console/` へリダイレクトする
function trailingSlashRedirect(): Plugin {
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const [pathname, query] = (req.url ?? '').split(/\?(.*)/s)
    if (PAGES.some((page) => pathname === `/${page}`)) {
      res.statusCode = 301
      res.setHeader('Location', `${pathname}/${query ? `?${query}` : ''}`)
      res.end()
      return
    }
    next()
  }
  return {
    name: 'trailing-slash-redirect',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), trailingSlashRedirect()],
  server: {
    proxy: {
      '/api': process.env.API_URL ?? 'http://localhost:8001',
    },
  },
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        ...Object.fromEntries(
          PAGES.map((page) => [page, resolve(import.meta.dirname, `${page}/index.html`)]),
        ),
      },
    },
  },
})
