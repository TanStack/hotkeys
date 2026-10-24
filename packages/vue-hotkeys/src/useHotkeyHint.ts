import { computed, toValue } from 'vue'
import { useSelector } from '@tanstack/vue-store'
import {
  getHotkeyManager,
  getKeyStateTracker,
  isAppHotkey,
  matchesHeldModifiers,
  resolveAppHotkey,
} from '@tanstack/hotkeys'
import { useAppHotkeysStoreSource } from './defaultOptions'
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
 * (false while unbound). This helper does not register a shortcut or
 * check whether its target is focused.
 */
export function useHotkeyHint(
  hotkey: MaybeRefOrGetter<RegisterableHotkey | AppHotkey>,
  options: MaybeRefOrGetter<HeldModifierOptions> = {},
): ComputedRef<boolean> {
  const appHotkeys = useAppHotkeysStoreSource()
  const manager = getHotkeyManager()
  // Tracks registration, enabled, and scope changes.
  const registrations = useSelector(manager.registrations, (state) => state)
  const held = useSelector(
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
