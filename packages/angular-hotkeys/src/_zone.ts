import { NgZone, inject } from '@angular/core'

/**
 * Runs `fn` outside the Angular zone, so core listeners it attaches don't
 * run change detection on every event. Zoneless apps call `fn` directly.
 * Must be called in an injection context.
 */
export function runOutsideZone<T>(fn: () => T): T {
  return inject(NgZone).runOutsideAngular(fn)
}
