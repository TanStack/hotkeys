import {
  ApplicationRef,
  ChangeDetectorRef,
  ErrorHandler,
  NgZone,
  inject,
} from '@angular/core'

/** Apps with a change detection pass queued by `queueTick`. */
const queuedTicks = new WeakSet<ApplicationRef>()

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
 * as in a root service, there's no view to mark.
 *
 * Zoneless apps then run change detection in a microtask, after the callback
 * returns and again after its promise settles, instead of on the next frame.
 * Effects that apply options such as `enabled` run before the browser sends
 * the next key. Must be called in an injection context.
 */
export function injectWrapCallback(): <TArgs extends Array<any>, TResult>(
  callback: (...args: TArgs) => TResult,
) => (...args: TArgs) => TResult {
  const zone = inject(NgZone)
  const changeDetector = inject(ChangeDetectorRef, { optional: true })
  // Zoneless apps provide a `NoopNgZone`, which isn't an `NgZone`.
  const zoneless = !(zone instanceof NgZone)
  const appRef = inject(ApplicationRef)
  const update = () => {
    changeDetector?.markForCheck()
    if (zoneless) queueTick(appRef)
  }
  return (callback) =>
    (...args) =>
      zone.run(() => {
        try {
          const result = callback(...args)
          // `finally` keeps a rejection unhandled, so it's still reported.
          if ((changeDetector || zoneless) && result instanceof Promise) {
            result.finally(update)
          }
          return result
        } finally {
          update()
        }
      })
}

/**
 * Runs change detection in a microtask, once for all the callbacks of a key
 * press. Errors go to the `ErrorHandler`.
 *
 * After a tick it didn't start, Angular's zoneless scheduler runs the rest of
 * the task's passes in microtasks, and dev mode throws NG0103 after 100 of
 * them. Real key presses arrive in separate tasks, so only a test that sends
 * over 100 matching keys or awaited writes in one task reaches the limit.
 */
function queueTick(appRef: ApplicationRef): void {
  if (queuedTicks.has(appRef)) return
  queuedTicks.add(appRef)
  queueMicrotask(() => {
    queuedTicks.delete(appRef)
    if (appRef.destroyed) return
    try {
      appRef.tick()
    } catch (error) {
      // Resolved here, because an `ErrorHandler` may inject a service that
      // registers hotkeys.
      appRef.injector.get(ErrorHandler).handleError(error)
    }
  })
}
