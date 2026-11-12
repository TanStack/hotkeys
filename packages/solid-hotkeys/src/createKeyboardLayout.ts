import { getKeyboardLayoutStore, loadKeyboardLayout } from '@tanstack/hotkeys'
import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { useDefaultHotkeysOptionsSource } from './defaultOptions'
import type { KeyboardLayoutMap } from '@tanstack/hotkeys'

/**
 * SolidJS primitive that returns a signal of the browser's keyboard layout,
 * or `null` until it loads and in browsers that don't report one. The layout
 * maps each physical code to the character it types, such as `KeyQ` to `a` on
 * a French AZERTY keyboard. Only Chromium browsers report one.
 *
 * The layout loads after the first component that uses this primitive mounts,
 * so server-rendered output hydrates unchanged. `createFormatForDisplay` uses
 * this primitive, so you only need it for labels you draw yourself.
 *
 * To never ask the browser for the layout, set `keyboardLayout: false` in
 * `HotkeysProvider`'s `defaultOptions`. The signal then stays `null`.
 *
 * @returns Signal accessor for the keyboard layout, or `null`
 *
 * @example
 * ```tsx
 * function MoveKeys() {
 *   const layoutMap = createKeyboardLayout()
 *   const label = (code: string) =>
 *     (layoutMap()?.get(code) ?? code).toUpperCase()
 *
 *   return <kbd>{label('KeyW')}</kbd>
 * }
 * ```
 */
export function createKeyboardLayout(): () => KeyboardLayoutMap | null {
  const defaultOptions = useDefaultHotkeysOptionsSource()
  // A memo, so a change to another default option does not restart loading.
  const enabled = createMemo(() => defaultOptions().keyboardLayout !== false)
  // Server HTML never has a layout, so hydration starts without one.
  const [layoutMap, setLayoutMap] = createSignal<KeyboardLayoutMap | null>(null)
  // Effects run after mount, and never on a server.
  createEffect(() => {
    if (!enabled()) return
    const store = getKeyboardLayoutStore()
    setLayoutMap(() => store.get())
    const { unsubscribe } = store.subscribe((state) => {
      setLayoutMap(() => state)
    })
    const stop = loadKeyboardLayout()
    onCleanup(() => {
      unsubscribe()
      stop()
    })
  })
  return () => (enabled() ? layoutMap() : null)
}
