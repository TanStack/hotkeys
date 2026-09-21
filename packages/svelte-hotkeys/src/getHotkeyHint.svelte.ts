import { createSubscriber } from 'svelte/reactivity'
import { getKeyStateTracker, matchesHeldModifiers } from '@tanstack/hotkeys'
import { resolveMaybeGetter } from './internal.svelte'
import type { HeldModifierOptions, RegisterableHotkey } from '@tanstack/hotkeys'
import type { MaybeGetter } from './internal.svelte'

export interface SvelteHotkeyHint {
  readonly visible: boolean
}

/**
 * Returns an object with a reactive `visible` getter indicating whether held modifiers reveal this shortcut.
 * Pass getters to track changing bindings and options.
 * Uses the nonempty-subset/AltGr rules of `matchesHeldModifiers`; `exact` requires
 * every modifier. Combine with the action's enabled state before showing a badge.
 * This helper does not register a shortcut or check whether its target is focused.
 */
export function getHotkeyHint(
  hotkey: MaybeGetter<RegisterableHotkey>,
  options: MaybeGetter<HeldModifierOptions> = {},
): SvelteHotkeyHint {
  const tracker = getKeyStateTracker()
  // Resolve current reactive arguments without caching a stale binding.
  const read = () =>
    matchesHeldModifiers(
      resolveMaybeGetter(hotkey),
      tracker.store.state.heldKeys,
      resolveMaybeGetter(options),
    )
  let previous = false
  // Notify Svelte only when visibility changes, not for every unrelated held key.
  const subscribe = createSubscriber((update) => {
    previous = read()
    const subscription = tracker.store.subscribe(() => {
      const next = read()
      if (next !== previous) {
        previous = next
        update()
      }
    })
    return () => subscription.unsubscribe()
  })
  return {
    /** Reads visibility and subscribes the current reactive consumer when needed. */
    get visible() {
      subscribe()
      previous = read()
      return previous
    },
  }
}
