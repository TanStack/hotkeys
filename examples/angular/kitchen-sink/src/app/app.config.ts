import { isDevMode, provideZoneChangeDetection } from '@angular/core'
import { provideTanStackDevtools } from '@tanstack/angular-devtools/provider'
import { provideHotkeys } from '@tanstack/angular-hotkeys'
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
    provideHotkeys({ hotkey: { requireReset: true } }),
  ],
}
