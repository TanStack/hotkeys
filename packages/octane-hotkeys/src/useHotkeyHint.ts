import { getKeyStateTracker, matchesHeldModifiers } from '@tanstack/hotkeys'
import { select, splitSlot, subSlot } from './internal'
import type { HeldModifierOptions, RegisterableHotkey } from '@tanstack/hotkeys'

/** Reports whether held modifiers reveal a shortcut hint. */
export function useHotkeyHint(
  hotkey: RegisterableHotkey,
  options?: HeldModifierOptions,
): boolean
export function useHotkeyHint(
  hotkey: RegisterableHotkey,
  ...rest: [options?: HeldModifierOptions, slot?: symbol]
): boolean {
  const [args, slot] = splitSlot(rest)
  return select(
    getKeyStateTracker().store,
    (state) =>
      matchesHeldModifiers(
        hotkey,
        state.heldKeys,
        args[0] as HeldModifierOptions | undefined,
      ),
    undefined,
    subSlot(slot, 'hint'),
  )
}
