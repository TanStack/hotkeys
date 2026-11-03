import fs from 'node:fs/promises'
import express from 'express'
import type { ViteDevServer } from 'vite'
import type { render as Render } from './src/entry-server'

// `pnpm dev` serves the source through Vite, `pnpm preview` serves the build
const isProduction = process.argv.includes('--production')
const port = Number(process.env.PORT) || 3069

const app = express()
let vite: ViteDevServer | undefined

if (isProduction) {
  process.env.NODE_ENV = 'production'
  app.use(express.static('dist/client', { index: false }))
} else {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  })
  app.use(vite.middlewares)
}

app.use(async (req, res) => {
  try {
    let template: string
    let render: typeof Render
    if (vite) {
      template = await fs.readFile('index.html', 'utf-8')
      template = await vite.transformIndexHtml(req.originalUrl, template)
      render = (await vite.ssrLoadModule('/src/entry-server.ts')).render
    } else {
      template = await fs.readFile('dist/client/index.html', 'utf-8')
      const serverEntry = './dist/server/entry-server.js'
      render = ((await import(serverEntry)) as { render: typeof Render }).render
    }

    // Render with the platform from the request's User-Agent header
    const html = await render(req.headers['user-agent'])
    res
      .status(200)
      .set({ 'Content-Type': 'text/html' })
      .send(template.replace('<!--app-html-->', html))
  } catch (error) {
    if (error instanceof Error) vite?.ssrFixStacktrace(error)
    console.error(error)
    res.status(500).end(String(error))
  }
})

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})
