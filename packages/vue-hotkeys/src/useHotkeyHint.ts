import { computed, toValue } from 'vue'
import { useSelector } from '@tanstack/vue-store'
import { getKeyStateTracker, matchesHeldModifiers } from '@tanstack/hotkeys'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { HeldModifierOptions, RegisterableHotkey } from '@tanstack/hotkeys'

/**
 * Returns a computed ref indicating whether held modifiers reveal this shortcut.
 * Pass refs or getters to track changing bindings and options.
 * Uses the nonempty-subset/AltGr rules of `matchesHeldModifiers`; `exact` requires
 * every modifier. Combine with the action's enabled state before showing a badge.
 * This helper does not register a shortcut or check whether its target is focused.
 */
export function useHotkeyHint(
  hotkey: MaybeRefOrGetter<RegisterableHotkey>,
  options: MaybeRefOrGetter<HeldModifierOptions> = {},
): ComputedRef<boolean> {
  const held = useSelector(
    getKeyStateTracker().store,
    (state) => state.heldKeys,
  )
  return computed(() =>
    matchesHeldModifiers(toValue(hotkey), held.value, toValue(options)),
  )
}
