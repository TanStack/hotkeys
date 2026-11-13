import {
  NgZone,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core'
import { getKeyboardLayoutStore, loadKeyboardLayout } from '@tanstack/hotkeys'
import { followKeyboardLayout } from '@tanstack/hotkeys/adapter'
import { injectHotkeysContext } from './hotkeys-provider'
import type { Signal } from '@angular/core'
import type { KeyboardLayoutMap } from '@tanstack/hotkeys'

/**
 * Angular inject-based API that returns a signal of the browser's keyboard
 * layout, or `null` until it loads and in browsers that don't report one. The
 * layout maps each physical code to the character it types, such as `KeyQ` to
 * `a` on a French AZERTY keyboard. Only Chromium browsers report one.
 *
 * The layout loads after the first component that uses this function renders,
 * so server-rendered output hydrates unchanged. `injectFormatForDisplay` uses
 * this function, so you only need it for labels you draw yourself. Call it in
 * an injection context, such as a field initializer.
 *
 * To never ask the browser for the layout, set `keyboardLayout: false` in
 * `provideHotkeys`'s `defaultOptions`. The signal then holds `null`.
 *
 * @returns Signal of the keyboard layout, or `null`
 *
 * @example
 * ```ts
 * @Component({
 *   selector: 'app-move-keys',
 *   template: `<kbd>{{ label('KeyW') }}</kbd>`,
 * })
 * export class MoveKeys {
 *   layoutMap = injectKeyboardLayout()
 *
 *   label(code: string) {
 *     return (this.layoutMap()?.get(code) ?? code).toUpperCase()
 *   }
 * }
 * ```
 */
export function injectKeyboardLayout(): Signal<KeyboardLayoutMap | null> {
  const context = injectHotkeysContext()
  const enabled = computed(
    () => context.defaultOptions.keyboardLayout !== false,
  )
  const layout = signal<KeyboardLayoutMap | null>(null)
  // Server HTML never has a layout, so a component that hydrates starts
  // without one, even when the layout has already loaded. This runs only in
  // the browser, after the render.
  const rendered = signal(false)
  afterNextRender(() => rendered.set(true))
  const zone = inject(NgZone)
  effect((onCleanup) => {
    if (!rendered() || !enabled()) return
    // Load outside the zone, so the loader's focus listener doesn't run
    // change detection each time the window regains focus.
    const stop = followKeyboardLayout(
      (next) => layout.set(next),
      () => untracked(() => zone.runOutsideAngular(loadKeyboardLayout)),
    )
    layout.set(getKeyboardLayoutStore().get())
    onCleanup(stop)
  })
  return computed(() => (enabled() ? layout() : null))
}
