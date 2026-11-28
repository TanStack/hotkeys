import { inject, isDevMode, provideZoneChangeDetection } from '@angular/core'
import { provideTanStackDevtools } from '@tanstack/angular-devtools/provider'
import { provideHotkeys } from '@tanstack/angular-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/angular-hotkeys-devtools'
import { CharacterKeysSetting } from './app.component'
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
    provideHotkeys({
      defaultOptions: { hotkey: { requireReset: true } },
      // The getter runs in this provider's injection context, so it can read
      // the setting's signal. It applies app-wide while the app is running.
      suspendCharacterKeys: () => !inject(CharacterKeysSetting).enabled(),
    }),
  ],
}
