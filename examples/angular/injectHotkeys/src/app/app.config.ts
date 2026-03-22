import {
  provideZoneChangeDetection,
  type ApplicationConfig,
} from '@angular/core'

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true })],
}
