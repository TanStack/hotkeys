'use client'

import { getKeyboardLayoutStore, loadKeyboardLayout } from '@tanstack/hotkeys'
import { useEffect, useSyncExternalStore } from 'react'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import type { KeyboardLayoutMap } from '@tanstack/hotkeys'

const subscribe = (onChange: () => void) =>
  getKeyboardLayoutStore().subscribe(onChange).unsubscribe
const getSnapshot = () => getKeyboardLayoutStore().get()
const subscribeToNothing = () => () => {}
const getNothing = () => null
// Server HTML never has a layout, so hydration starts without one.
const getServerSnapshot = () => null

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
  useEffect(() => (enabled ? loadKeyboardLayout() : undefined), [enabled])
  // Switched off, a layout that something else loads changes nothing here.
  return useSyncExternalStore(
    enabled ? subscribe : subscribeToNothing,
    enabled ? getSnapshot : getNothing,
    getServerSnapshot,
  )
}
