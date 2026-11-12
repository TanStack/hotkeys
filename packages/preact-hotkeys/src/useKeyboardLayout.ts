import { getKeyboardLayoutStore, loadKeyboardLayout } from '@tanstack/hotkeys'
import { useLayoutEffect, useState } from 'preact/hooks'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import type { KeyboardLayoutMap } from '@tanstack/hotkeys'

/**
 * The browser's keyboard layout, or `null` until it loads and in browsers
 * that don't report one. The layout maps each physical code to the character
 * it types, such as `KeyQ` to `a` on a French AZERTY keyboard. Only Chromium
 * browsers report one.
 *
 * The layout loads after the first component that uses this hook mounts, so
 * server-rendered output hydrates unchanged. `useFormatForDisplay` uses this
 * hook, so you only need it for labels you draw yourself.
 *
 * To never ask the browser for the layout, set `keyboardLayout: false` in
 * `HotkeysProvider`'s `defaultOptions`. This hook then returns `null`.
 *
 * @example
 * ```tsx
 * function MoveKeys() {
 *   const layoutMap = useKeyboardLayout()
 *   const label = (code: string) => (layoutMap?.get(code) ?? code).toUpperCase()
 *
 *   return <kbd>{label('KeyW')}</kbd>
 * }
 * ```
 */
export function useKeyboardLayout(): KeyboardLayoutMap | null {
  const enabled = useDefaultHotkeysOptions().keyboardLayout !== false
  // Server HTML never has a layout, so every first render starts without one.
  const [layoutMap, setLayoutMap] = useState<KeyboardLayoutMap | null>(null)
  // A layout effect, so a layout that already loaded shows before paint.
  useLayoutEffect(() => {
    if (!enabled) return
    const store = getKeyboardLayoutStore()
    setLayoutMap(store.get())
    const { unsubscribe } = store.subscribe(setLayoutMap)
    const stop = loadKeyboardLayout()
    return () => {
      unsubscribe()
      stop()
    }
  }, [enabled])
  return enabled ? layoutMap : null
}
