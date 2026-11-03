import { provideBrowserGlobalErrorListeners } from '@angular/core'
import { provideClientHydration } from '@angular/platform-browser'
import { provideFileRouter } from '@analogjs/router'
import { injectRequest } from '@analogjs/router/tokens'
import { detectPlatform, provideHotkeys } from '@tanstack/angular-hotkeys'
import type { ApplicationConfig } from '@angular/core'

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideFileRouter(),
    provideClientHydration(),
    // The request's User-Agent on the server. `injectRequest()` is null in the
    // browser, where `detectPlatform()` reads the browser's navigator.
    provideHotkeys({
      defaultOptions: () => ({
        platform: detectPlatform(injectRequest()?.headers['user-agent']),
      }),
    }),
  ],
}
