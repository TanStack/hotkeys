import type { ApplicationConfig } from '@angular/core'
import { provideZoneChangeDetection } from '@angular/core'
import { provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHotkeys({}),
  ],
}
