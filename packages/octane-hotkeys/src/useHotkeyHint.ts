import {
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
 * Reports whether held modifiers reveal a shortcut hint. A sequence reveals
 * its hint from its first step, and an app hotkey uses its effective hotkey
 * (false while unbound).
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
  return select(
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
}
