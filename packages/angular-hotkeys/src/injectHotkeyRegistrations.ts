import { injectStore } from '@tanstack/angular-store'
import {
  getHotkeyManager,
  getSequenceManager,
  toHotkeyRegistrationView,
} from '@tanstack/hotkeys'
import type {
  HotkeyRegistrationView,
  SequenceRegistrationView,
} from '@tanstack/hotkeys'
import type { Signal } from '@angular/core'

/**
 * Return type for injectHotkeyRegistrations.
 */
export interface HotkeyRegistrationsResult {
  /** Signal for all registered hotkeys (public view, no callbacks) */
  hotkeys: Signal<Array<HotkeyRegistrationView>>
  /** Signal for all registered sequences */
  sequences: Signal<Array<SequenceRegistrationView>>
}

/**
 * Angular injectable that reactively reads all hotkey and sequence registrations
 * from the singleton managers.
 *
 * This is a standalone injectable that does NOT require the HotkeysProvider.
 * It subscribes to both HotkeyManager and SequenceManager stores and
 * triggers change detection when registrations change.
 *
 * Must be called in an injection context (constructor, factory, or `inject()`).
 *
 * @returns Object with `hotkeys` and `sequences` signals
 */
export function injectHotkeyRegistrations(): HotkeyRegistrationsResult {
  const hotkeyManager = getHotkeyManager()
  const sequenceManager = getSequenceManager()

  const hotkeys = injectStore(hotkeyManager.registrations, (state) =>
    Array.from(state.values()).map(toHotkeyRegistrationView),
  )

  const sequences = injectStore(sequenceManager.registrations, (state) =>
    Array.from(state.values()),
  )

  return { hotkeys, sequences }
}
