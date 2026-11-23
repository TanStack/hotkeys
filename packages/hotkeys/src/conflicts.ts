import { hotkeySteps } from './_chord'
import { getTargetDocument } from './_event-target'
import { managerRef } from './_manager-ref'
import { stepsOverlap } from './_steps'
import { toHotkeyRegistrationView } from './hotkey-manager'
import { parseHotkey } from './parse'
import { detectPlatform } from './platform'
import type { HotkeyRegistrationView } from './hotkey-manager'
import type {
  HotkeyEventType,
  RegisterableHotkey,
  RegisterableHotkeyChord,
  Target,
} from './hotkey.types'
import type { HotkeyPlatform } from './platform'

/** A live registration that overlaps a candidate hotkey. */
export interface HotkeyConflict {
  registration: HotkeyRegistrationView
}

export interface HotkeyConflictOptions {
  /** Intended registration target. Defaults to document; disjoint targets are excluded. */
  target?: Target
  /** Check all targets instead of overlapping targets. Default: overlapping. */
  scope?: 'overlapping' | 'all'
  /** Intended event type. Default: keydown. */
  eventType?: HotkeyEventType
  /** Include disabled registrations. Default: false. */
  includeDisabled?: boolean
  /** IDs of registrations being edited. */
  excludeIds?: ReadonlyArray<string>
  /** Additional app-specific exclusions, such as all instances of one action. */
  exclude?: (registration: HotkeyRegistrationView) => boolean
  /** Platform used to resolve Mod in the candidate. Registrations retain their own platform. */
  platform?: HotkeyPlatform
  /** Source events allow detecting physical/logical overlap on the recorded layout. */
  events?: ReadonlyArray<KeyboardEvent>
}

/** Whether two targets share a document and one contains the other (or is its window). */
function targetsOverlap(a: Target, b: Target): boolean {
  if (a === b) return true
  if (getTargetDocument(a) !== getTargetDocument(b)) return false
  if (!('contains' in a) || !('contains' in b)) return true
  return a.contains(b) || b.contains(a)
}

/**
 * Find equivalent bindings and sequence-prefix conflicts in the live registry.
 * With source events, also checks observed logical/physical overlap. Does not
 * discover unmounted handlers, external listeners, or other keyboard layouts.
 */
export function findHotkeyConflicts(
  candidate: RegisterableHotkey,
  options: HotkeyConflictOptions = {},
): Array<HotkeyConflict> {
  const steps = hotkeySteps(candidate)
  if (steps.length === 0) return []
  const platform = options.platform ?? detectPlatform()
  // Throw for an invalid candidate even when nothing is registered.
  for (const step of steps) parseHotkey(step, platform)
  const target =
    options.target ?? (typeof document === 'undefined' ? undefined : document)
  const conflicts: Array<HotkeyConflict> = []
  // Apply scope policy before comparing equivalent bindings or observed event overlap.
  const matches = (
    registration: HotkeyRegistrationView,
    bindings: ReadonlyArray<RegisterableHotkeyChord>,
  ) => {
    if (
      (!options.includeDisabled && registration.options.enabled === false) ||
      (registration.options.eventType ?? 'keydown') !==
        (options.eventType ?? 'keydown') ||
      options.excludeIds?.includes(registration.id) ||
      options.exclude?.(registration) ||
      (options.scope !== 'all' &&
        target &&
        !targetsOverlap(target, registration.target))
    )
      return false
    // Compare only the common prefix: a shorter sequence can collide with a
    // longer one. A source event can establish code/key overlap without
    // guessing its layout.
    return stepsOverlap(
      steps,
      bindings,
      [platform, registration.options.platform ?? detectPlatform()],
      options.events,
    )
  }
  // Without a manager nothing is registered; don't create one just to check.
  const registrations = managerRef.current?.registrations.state.values() ?? []
  for (const registration of registrations) {
    const view = toHotkeyRegistrationView(registration)
    if (matches(view, hotkeySteps(view.hotkey)))
      conflicts.push({ registration: view })
  }
  return conflicts
}
