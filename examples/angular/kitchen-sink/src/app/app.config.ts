import { provideZoneChangeDetection } from '@angular/core'
import { provideHotkeys } from '@tanstack/angular-hotkeys'
import type { ApplicationConfig } from '@angular/core'

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHotkeys({ hotkey: { requireReset: true } }),
  ],
}
