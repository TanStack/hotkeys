import { createMemo } from 'solid-js'
import { findHotkeyConflicts, formatForDisplay } from '@tanstack/hotkeys'
import { useHotkeysDevtoolsState } from './HotkeysContextProvider'
import type { HotkeyConflict } from '@tanstack/hotkeys'

/** Refresh shared conflict reporting when either registry changes. */
export function useRegistrationConflicts(
  registration: () => HotkeyConflict['registration'],
) {
  const state = useHotkeysDevtoolsState()
  return createMemo(() => {
    state.registrations()
    const reg = registration()
    if (reg.options.enabled === false) return { overlapping: [], separate: [] }
    const binding = reg.hotkey
    const options = {
      target: reg.target,
      platform: reg.options.platform,
      eventType: reg.options.eventType,
      excludeIds: [reg.id],
    }
    // Registrations in other scopes never fire together, so they are only related.
    const scope = reg.options.scope ?? 'global'
    const overlapping = findHotkeyConflicts(binding, options)
      .map((c) => c.registration)
      .filter((r) => (r.options.scope ?? 'global') === scope)
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
  return formatForDisplay(reg.hotkey, {
    platform: reg.options.platform,
    sequenceSeparator: ' → ',
  })
}

/** Sequences may mix logical keys and physical codes, so report both when needed. */
export function getBindingKind(
  reg: HotkeyConflict['registration'],
): 'Key' | 'Code' | 'Mixed' {
  const parsed =
    reg.kind === 'sequence' ? reg.parsedSequence : [reg.parsedChord]
  const codes = parsed.filter((step) => step.code !== undefined).length
  return codes === 0 ? 'Key' : codes === parsed.length ? 'Code' : 'Mixed'
}
