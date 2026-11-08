import { ChangeDetectorRef, NgZone, inject } from '@angular/core'

/**
 * Runs `fn` outside the Angular zone, so core listeners it attaches don't
 * run change detection on every event. Zoneless apps call `fn` directly.
 * Must be called in an injection context.
 */
export function runOutsideZone<T>(fn: () => T): T {
  return inject(NgZone).runOutsideAngular(fn)
}

/**
 * Wraps a user callback so it runs inside the Angular zone and then marks
 * the calling component for check, as Angular's own listeners do. This
 * updates OnPush views and schedules change detection in zoneless apps.
 * A callback that returns a promise marks again when the promise settles, so
 * changes made after an `await` also reach the view. Outside a component, such
 * as in a root service, there's no view to mark. Must be called in an
 * injection context.
 */
export function injectWrapCallback(): <TArgs extends Array<any>, TResult>(
  callback: (...args: TArgs) => TResult,
) => (...args: TArgs) => TResult {
  const zone = inject(NgZone)
  const changeDetector = inject(ChangeDetectorRef, { optional: true })
  const mark = () => changeDetector?.markForCheck()
  return (callback) =>
    (...args) =>
      zone.run(() => {
        try {
          const result = callback(...args)
          // `finally` keeps a rejection unhandled, so it's still reported.
          if (changeDetector && result instanceof Promise) result.finally(mark)
          return result
        } finally {
          mark()
        }
      })
}
