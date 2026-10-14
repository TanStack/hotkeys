import { computed } from '@angular/core'
import { injectSelector } from '@tanstack/angular-store'
import {
  getKeyStateTracker,
  isAppHotkey,
  matchesHeldModifiers,
  resolveAppHotkey,
} from '@tanstack/hotkeys'
import { injectHotkeysContext } from './hotkeys-provider'
import type { Signal } from '@angular/core'
import type {
  AppHotkey,
  HeldModifierOptions,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

/**
 * Returns a signal indicating whether held modifiers reveal this shortcut.
 * Pass getters to track changing hotkeys and options. A sequence reveals its
 * hint from its first step, and an app hotkey uses its effective hotkey
 * (false while unbound). This helper does not register a shortcut or check
 * whether its target is focused.
 */
export function injectHotkeyHint(
  hotkey:
    RegisterableHotkey | AppHotkey | (() => RegisterableHotkey | AppHotkey),
  options: HeldModifierOptions | (() => HeldModifierOptions) = {},
): Signal<boolean> {
  const context = injectHotkeysContext()
  const held = injectSelector(
    getKeyStateTracker().store,
    (state) => state.heldKeys,
  )
  return computed(() => {
    context.appHotkeysState()
    const value = typeof hotkey === 'function' ? hotkey() : hotkey
    const resolved = isAppHotkey(value)
      ? resolveAppHotkey(value, context.appHotkeysStore).hotkey
      : value
    return (
      resolved !== null &&
      matchesHeldModifiers(
        resolved,
        held(),
        typeof options === 'function' ? options() : options,
      )
    )
  })
}
