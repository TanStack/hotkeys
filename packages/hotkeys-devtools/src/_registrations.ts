import { createMemo } from 'solid-js'
import {
  findHotkeyConflicts,
  formatForDisplay,
  parseHotkey,
} from '@tanstack/hotkeys'
import { useHotkeysDevtoolsState } from './HotkeysContextProvider'
import type { HotkeyConflict } from '@tanstack/hotkeys'

/** Refresh shared conflict reporting when either registry changes. */
export function useRegistrationConflicts(
  registration: () => HotkeyConflict['registration'],
) {
  const state = useHotkeysDevtoolsState()
  return createMemo(() => {
    state.registrations()
    state.sequenceRegistrations()
    const reg = registration()
    if (reg.options.enabled === false) return { overlapping: [], separate: [] }
    const binding = 'sequence' in reg ? reg.sequence : reg.hotkey
    const options = {
      target: reg.target,
      platform: reg.options.platform,
      eventType: reg.options.eventType,
      excludeIds: [reg.id],
    }
    const overlapping = findHotkeyConflicts(binding, options).map(
      (c) => c.registration,
    )
    const ids = new Set(overlapping.map((r) => r.id))
    const separate = findHotkeyConflicts(binding, { ...options, scope: 'all' })
      .map((c) => c.registration)
      .filter((r) => !ids.has(r.id))
    // Without source events, key/code overlap depends on the layout and cannot be inferred.
    return { overlapping, separate }
  })
}

/** Format either kind of registration, respecting its platform and physical labels. */
export function formatRegistration(
  reg: HotkeyConflict['registration'],
): string {
  const steps = 'sequence' in reg ? reg.sequence : [reg.hotkey]
  return steps
    .map((step) => formatForDisplay(step, { platform: reg.options.platform }))
    .join(' → ')
}

/** Sequences may mix logical keys and physical codes, so report both when needed. */
export function getBindingKind(
  reg: HotkeyConflict['registration'],
): 'Key' | 'Code' | 'Mixed' {
  const parsed =
    'sequence' in reg
      ? reg.sequence.map((step) => parseHotkey(step, reg.options.platform))
      : [reg.parsedHotkey]
  const codes = parsed.filter((step) => step.code !== undefined).length
  return codes === 0 ? 'Key' : codes === parsed.length ? 'Code' : 'Mixed'
}
