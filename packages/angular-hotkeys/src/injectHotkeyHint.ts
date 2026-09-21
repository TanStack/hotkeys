import { computed } from '@angular/core'
import { injectSelector } from '@tanstack/angular-store'
import { getKeyStateTracker, matchesHeldModifiers } from '@tanstack/hotkeys'
import type { Signal } from '@angular/core'
import type { HeldModifierOptions, RegisterableHotkey } from '@tanstack/hotkeys'

/**
 * Returns a computed signal indicating whether held modifiers reveal this shortcut.
 * Call in an injection context; pass signal getters for changing inputs.
 * Uses the nonempty-subset/AltGr rules of `matchesHeldModifiers`; `exact` requires
 * every modifier. Combine with the action's enabled state before showing a badge.
 * This helper does not register a shortcut or check whether its target is focused.
 */
export function injectHotkeyHint(
  hotkey: RegisterableHotkey | (() => RegisterableHotkey),
  options: HeldModifierOptions | (() => HeldModifierOptions) = {},
): Signal<boolean> {
  const held = injectSelector(
    getKeyStateTracker().store,
    (state) => state.heldKeys,
  )
  return computed(() =>
    matchesHeldModifiers(
      typeof hotkey === 'function' ? hotkey() : hotkey,
      held(),
      typeof options === 'function' ? options() : options,
    ),
  )
}
