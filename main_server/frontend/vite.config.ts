import { resolve } from 'node:path'

import react from '@vitejs/plugin-react'
import { type Connect, defineConfig, type Plugin } from 'vite'

const PAGES = ['login', 'console', 'console/recordings', 'console/devices', 'console/users']

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

export default defineConfig({
  plugins: [react(), trailingSlashRedirect()],
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
