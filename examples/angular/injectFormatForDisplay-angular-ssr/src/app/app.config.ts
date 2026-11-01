import {
  REQUEST,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core'
import { provideClientHydration } from '@angular/platform-browser'
import { provideRouter } from '@angular/router'
import { detectPlatform, provideHotkeys } from '@tanstack/angular-hotkeys'
import { routes } from './app.routes'
import type { ApplicationConfig } from '@angular/core'

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    // The request's User-Agent on the server. `REQUEST` is null in the
    // browser, where `detectPlatform()` reads the browser's navigator.
    provideHotkeys({
      defaultOptions: () => ({
        platform: detectPlatform(inject(REQUEST)?.headers.get('user-agent')),
      }),
    }),
  ],
}
