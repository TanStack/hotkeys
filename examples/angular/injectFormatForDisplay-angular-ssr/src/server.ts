import { join } from 'node:path'
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node'
import express from 'express'

const browserDistFolder = join(import.meta.dirname, '../browser')

const app = express()
const angularApp = new AngularNodeAppEngine()

// Serve static files from /browser
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
)

// Render every other request with Angular. The request reaches the app
// through the `REQUEST` token.
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next)
})

if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000
  app.listen(port, (error) => {
    if (error) throw error
    console.log(`Node Express server listening on http://localhost:${port}`)
  })
}

// Used by the Angular CLI dev server and build
export const reqHandler = createNodeRequestHandler(app)
