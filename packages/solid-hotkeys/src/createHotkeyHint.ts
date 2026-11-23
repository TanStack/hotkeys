import { getHotkeyManager, getKeyStateTracker } from '@tanstack/hotkeys'
import {
  isHotkeyHintVisible,
  resolveMaybeGetter,
} from '@tanstack/hotkeys/adapter'
import { createMemo } from 'solid-js'
import { useSelector } from './_useSelector'
import { useAppHotkeysStoreSource } from './defaultOptions'
import type {
  AppHotkey,
  HeldModifierOptions,
  MaybeGetter,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

/**
 * Returns an accessor indicating whether held modifiers reveal this shortcut.
 * The hint shows only while the hotkey can fire: some registration of it is
 * enabled and in an active scope. A sequence reveals its hint from its first
 * step, and an app hotkey matches its registrations by id and uses its
 * effective hotkey (false while unbound). No hotkey (`undefined`, `null`, or
 * `''`) returns false. This helper does not register a shortcut. A hotkey on an element counts only while focus is inside it.
 */
export function createHotkeyHint(
  hotkey: MaybeGetter<RegisterableHotkey | AppHotkey | null | undefined>,
  options: MaybeGetter<HeldModifierOptions> = {},
): () => boolean {
  const appHotkeys = useAppHotkeysStoreSource()
  // Tracks registration, enabled, and scope changes.
  const registrations = useSelector(
    getHotkeyManager().registrations,
    (state) => state,
  )
  const held = useSelector(
    getKeyStateTracker().store,
    (state) => state.heldKeys,
  )
  return createMemo(() => {
    appHotkeys.state()
    registrations()
    return isHotkeyHintVisible(
      resolveMaybeGetter(hotkey),
      held(),
      resolveMaybeGetter(options),
      appHotkeys.store,
    )
  })
}
