import { createMemo } from 'solid-js'
import { useSelector } from '@tanstack/solid-store'
import { getKeyStateTracker, matchesHeldModifiers } from '@tanstack/hotkeys'
import type { HeldModifierOptions, RegisterableHotkey } from '@tanstack/hotkeys'

/**
 * Returns a boolean accessor indicating whether held modifiers reveal this shortcut.
 * Pass accessors to track changing bindings and options.
 * Uses the nonempty-subset/AltGr rules of `matchesHeldModifiers`; `exact` requires
 * every modifier. Combine with the action's enabled state before showing a badge.
 * This helper does not register a shortcut or check whether its target is focused.
 */
export function createHotkeyHint(
  hotkey: RegisterableHotkey | (() => RegisterableHotkey),
  options: HeldModifierOptions | (() => HeldModifierOptions) = {},
): () => boolean {
  const held = useSelector(
    getKeyStateTracker().store,
    (state) => state.heldKeys,
  )
  return createMemo(() =>
    matchesHeldModifiers(
      typeof hotkey === 'function' ? hotkey() : hotkey,
      held(),
      typeof options === 'function' ? options() : options,
    ),
  )
}
