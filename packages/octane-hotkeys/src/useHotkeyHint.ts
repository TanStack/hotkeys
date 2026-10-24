import {
  getHotkeyManager,
  getKeyStateTracker,
  isAppHotkey,
  matchesHeldModifiers,
  resolveAppHotkey,
} from '@tanstack/hotkeys'
import { useHotkeysContext } from './HotkeysProvider'
import { select, splitSlot, subSlot, useAppHotkeysStore } from './internal'
import type {
  AppHotkey,
  HeldModifierOptions,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

/**
 * Reports whether held modifiers reveal a shortcut hint. The hint shows only
 * while the hotkey can fire: some registration of it is enabled and in an
 * active scope. A sequence reveals its hint from its first step, and an app
 * hotkey matches its registrations by id and uses its effective hotkey (false
 * while unbound). Focus and `target` are not checked.
 */
export function useHotkeyHint(
  hotkey: RegisterableHotkey | AppHotkey,
  options?: HeldModifierOptions,
): boolean
export function useHotkeyHint(
  hotkey: RegisterableHotkey | AppHotkey,
  ...rest: [options?: HeldModifierOptions, slot?: symbol]
): boolean {
  const [args, slot] = splitSlot(rest)
  const store = useAppHotkeysStore(
    useHotkeysContext()?.appHotkeysStore ?? null,
    subSlot(slot, 'app-hotkeys'),
  )
  const resolved = isAppHotkey(hotkey)
    ? resolveAppHotkey(hotkey, store).hotkey
    : hotkey
  const manager = getHotkeyManager()
  const active = select(
    manager.registrations,
    () => resolved !== null && manager.hasActiveRegistration(hotkey),
    undefined,
    subSlot(slot, 'hint-active'),
  )
  const held = select(
    getKeyStateTracker().store,
    (state) =>
      resolved !== null &&
      matchesHeldModifiers(
        resolved,
        state.heldKeys,
        args[0] as HeldModifierOptions | undefined,
      ),
    undefined,
    subSlot(slot, 'hint'),
  )
  return active && held
}
