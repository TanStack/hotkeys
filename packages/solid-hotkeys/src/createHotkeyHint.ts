import { createMemo } from 'solid-js'
import { useSelector } from '@tanstack/solid-store'
import {
  getKeyStateTracker,
  isAppHotkey,
  matchesHeldModifiers,
  resolveAppHotkey,
} from '@tanstack/hotkeys'
import { useAppHotkeysStoreSource } from './defaultOptions'
import type {
  AppHotkey,
  HeldModifierOptions,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

/**
 * Returns an accessor indicating whether held modifiers reveal this shortcut.
 * A sequence reveals its hint from its first step, and an app hotkey uses its
 * effective hotkey (false while unbound). This helper does not register a
 * shortcut or check whether its target is focused.
 */
export function createHotkeyHint(
  hotkey:
    RegisterableHotkey | AppHotkey | (() => RegisterableHotkey | AppHotkey),
  options: HeldModifierOptions | (() => HeldModifierOptions) = {},
): () => boolean {
  const appHotkeys = useAppHotkeysStoreSource()
  const held = useSelector(
    getKeyStateTracker().store,
    (state) => state.heldKeys,
  )
  return createMemo(() => {
    appHotkeys.state()
    const value = typeof hotkey === 'function' ? hotkey() : hotkey
    const resolved = isAppHotkey(value)
      ? resolveAppHotkey(value, appHotkeys.store).hotkey
      : value
    return (
      resolved !== null &&
      matchesHeldModifiers(
        resolved,
        held(),
        typeof options === 'function' ? options() : options,
      )
    )
  })
}
