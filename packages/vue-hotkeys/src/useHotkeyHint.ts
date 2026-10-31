import { computed, toValue } from 'vue'
import {
  getHotkeyManager,
  getKeyStateTracker,
  isAppHotkey,
  matchesHeldModifiers,
  resolveAppHotkey,
} from '@tanstack/hotkeys'
import { useAppHotkeysStoreSource } from './defaultOptions'
import { useStoreSelector } from './useStoreSelector'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type {
  AppHotkey,
  HeldModifierOptions,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

/**
 * Returns a computed ref indicating whether held modifiers reveal this shortcut.
 * The hint shows only while the hotkey can fire: some registration of it is
 * enabled and in an active scope. Pass refs or getters to track changing
 * hotkeys and options. A sequence reveals its hint from its first step, and
 * an app hotkey matches its registrations by id and uses its effective hotkey
 * (false while unbound). No hotkey (`undefined`, `null`, or `''`) returns
 * false. This helper does not register a shortcut. A hotkey on an element counts only while focus is inside it.
 */
export function useHotkeyHint(
  hotkey: MaybeRefOrGetter<RegisterableHotkey | AppHotkey | null | undefined>,
  options: MaybeRefOrGetter<HeldModifierOptions> = {},
): ComputedRef<boolean> {
  const appHotkeys = useAppHotkeysStoreSource()
  const manager = getHotkeyManager()
  // Tracks registration, enabled, and scope changes.
  const registrations = useStoreSelector(
    manager.registrations,
    (state) => state,
  )
  const held = useStoreSelector(
    getKeyStateTracker().store,
    (state) => state.heldKeys,
  )
  return computed(() => {
    void appHotkeys.state.value
    const value = toValue(hotkey)
    const resolved = isAppHotkey(value)
      ? resolveAppHotkey(value, appHotkeys.store).hotkey
      : value
    return (
      resolved !== null &&
      matchesHeldModifiers(resolved, held.value, toValue(options)) &&
      registrations.value.size > 0 &&
      manager.hasActiveRegistration(value)
    )
  })
}
