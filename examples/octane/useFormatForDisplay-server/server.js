// A small Node server. In development it renders through Vite's dev server;
// with --production it serves the files from `pnpm build`.
import fs from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const isProduction = process.argv.includes('--production')
if (isProduction) process.env.NODE_ENV = 'production'
const port = Number(process.env.PORT ?? 3069)
const root = path.dirname(fileURLToPath(import.meta.url))
const clientDir = path.join(root, 'dist/client')

const server = http.createServer((req, res) => {
  /** @param {unknown} error */
  const fail = (error) => {
    if (error instanceof Error) vite?.ssrFixStacktrace(error)
    console.error(error)
    res.writeHead(500).end('Server error')
  }
  if (vite) {
    // Vite serves source modules and assets, then calls back for the page
    vite.middlewares(req, res, () => {
      renderPage(req, res).catch(fail)
    })
  } else {
    serveAsset(req, res)
      .then((served) => (served ? undefined : renderPage(req, res)))
      .catch(fail)
  }
})

/** @type {import('vite').ViteDevServer | undefined} */
let vite
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    root,
    // Hot updates share this server's port
    server: { middlewareMode: true, hmr: { server } },
    appType: 'custom',
  })
}

/**
 * Renders the page with the request's `User-Agent` header.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
async function renderPage(req, res) {
  const url = req.url ?? '/'
  /** @type {string} */
  let template
  /** @type {(userAgent: string | undefined) => { html: string, css: string }} */
  let render
  if (vite) {
    template = await fs.readFile(path.join(root, 'index.html'), 'utf-8')
    template = await vite.transformIndexHtml(url, template)
    render = (await vite.ssrLoadModule('/src/entry-server.ts')).render
  } else {
    template = await fs.readFile(path.join(clientDir, 'index.html'), 'utf-8')
    // Built by `pnpm build`
    const entry = new URL('./dist/server/entry-server.js', import.meta.url)
    render = (await import(entry.href)).render
  }

  const { html, css } = render(req.headers['user-agent'])
  const page = template
    .replace('<!--app-head-->', css)
    .replace('<!--app-html-->', html)
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end(page)
}

const contentTypes = /** @type {Record<string, string>} */ ({
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
})

/**
 * Serves a built asset, if the request names one.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
async function serveAsset(req, res) {
  const pathname = new URL(req.url ?? '/', 'http://localhost').pathname
  if (!pathname.startsWith('/assets/')) return false
  const file = path.join(clientDir, path.normalize(pathname))
  if (!file.startsWith(clientDir)) return false
  try {
    const body = await fs.readFile(file)
    res.writeHead(200, {
      'Content-Type':
        contentTypes[path.extname(file)] ?? 'application/octet-stream',
    })
    res.end(body)
    return true
  } catch {
    return false
  }
}

server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`)
})
