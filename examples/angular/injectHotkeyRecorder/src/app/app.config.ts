import { isDevMode, provideZoneChangeDetection } from '@angular/core'
import { provideTanStackDevtools } from '@tanstack/angular-devtools/provider'
import { hotkeysDevtoolsPlugin } from '@tanstack/angular-hotkeys-devtools'
import type { ApplicationConfig } from '@angular/core'

export const appConfig: ApplicationConfig = {
  providers: [
    ...(isDevMode()
      ? [
          provideTanStackDevtools(() => ({
            plugins: [hotkeysDevtoolsPlugin()],
          })),
        ]
      : []),
    provideZoneChangeDetection({ eventCoalescing: true }),
  ],
}
