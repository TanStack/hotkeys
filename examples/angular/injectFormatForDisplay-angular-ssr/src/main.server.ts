import { bootstrapApplication } from '@angular/platform-browser'
import { App } from './app/app'
import { config } from './app/app.config.server'
import type { BootstrapContext } from '@angular/platform-browser'

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(App, config, context)

export default bootstrap
