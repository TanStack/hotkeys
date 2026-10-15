import { createSubscriber } from 'svelte/reactivity'
import {
  getKeyStateTracker,
  isAppHotkey,
  matchesHeldModifiers,
  resolveAppHotkey,
} from '@tanstack/hotkeys'
import { getHotkeysContext } from './HotkeysCtx'
import { resolveMaybeGetter } from './internal.svelte'
import type {
  AppHotkey,
  HeldModifierOptions,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type { MaybeGetter } from './internal.svelte'

export interface SvelteHotkeyHint {
  readonly visible: boolean
}

/**
 * Returns an object with a reactive `visible` getter indicating whether held
 * modifiers reveal this shortcut. Pass getters to track changing hotkeys and
 * options. A sequence reveals its hint from its first step, and an app hotkey
 * uses its effective hotkey (false while unbound). This helper does not
 * register a shortcut or check whether its target is focused.
 */
export function getHotkeyHint(
  hotkey: MaybeGetter<RegisterableHotkey | AppHotkey>,
  options: MaybeGetter<HeldModifierOptions> = {},
): SvelteHotkeyHint {
  const tracker = getKeyStateTracker()
  const store = getHotkeysContext()?.appHotkeysStore ?? null
  // Resolve current reactive arguments without caching a stale hotkey.
  const read = () => {
    const value = resolveMaybeGetter(hotkey)
    const resolved = isAppHotkey(value)
      ? resolveAppHotkey(value, store).hotkey
      : value
    return (
      resolved !== null &&
      matchesHeldModifiers(
        resolved,
        tracker.store.state.heldKeys,
        resolveMaybeGetter(options),
      )
    )
  }
  let previous = false
  // Notify Svelte only when visibility changes, not for every unrelated held key.
  const subscribe = createSubscriber((update) => {
    previous = read()
    const check = () => {
      const next = read()
      if (next !== previous) {
        previous = next
        update()
      }
    }
    const keys = tracker.store.subscribe(check)
    const custom = store?.store.subscribe(check)
    return () => {
      keys.unsubscribe()
      custom?.unsubscribe()
    }
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
