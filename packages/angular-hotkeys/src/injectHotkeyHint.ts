import { computed } from '@angular/core'
import { getHotkeyManager, getKeyStateTracker } from '@tanstack/hotkeys'
import {
  isHotkeyHintVisible,
  resolveMaybeGetter,
} from '@tanstack/hotkeys/adapter'
import { injectSelector } from './_injectSelector'
import { runOutsideZone } from './_zone'
import { injectHotkeysContext } from './hotkeys-provider'
import type { Signal } from '@angular/core'
import type {
  AppHotkey,
  HeldModifierOptions,
  MaybeGetter,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

/**
 * Returns a signal indicating whether held modifiers reveal this shortcut.
 * The hint shows only while the hotkey can fire: some registration of it is
 * enabled and in an active scope. Pass getters to track changing hotkeys and
 * options. A sequence reveals its hint from its first step, and an app hotkey
 * matches its registrations by id and uses its effective hotkey (false while
 * unbound). No hotkey (`undefined`, `null`, or `''`) returns false. This
 * helper does not register a shortcut. A hotkey on an element counts only while focus is inside it.
 */
export function injectHotkeyHint(
  hotkey: MaybeGetter<RegisterableHotkey | AppHotkey | null | undefined>,
  options: MaybeGetter<HeldModifierOptions> = {},
): Signal<boolean> {
  const context = injectHotkeysContext()
  const manager = getHotkeyManager()
  // Tracks registration, enabled, and scope changes.
  const registrations = injectSelector(manager.registrations, (state) => state)
  const held = injectSelector(
    runOutsideZone(getKeyStateTracker).store,
    (state) => state.heldKeys,
  )
  return computed(() => {
    context.appHotkeysState()
    registrations()
    return isHotkeyHintVisible(
      resolveMaybeGetter(hotkey),
      held(),
      resolveMaybeGetter(options),
      context.appHotkeysStore,
    )
  })
}
