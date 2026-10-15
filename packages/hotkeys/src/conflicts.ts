import { detectPlatform } from './platform'
import { isHotkeySequence, parseRegisterableHotkey } from './parse'
import { getTargetDocument } from './_event-target'
import { keysEqual } from './_keyboard-event'
import { matchesKeyboardEvent } from './match'
import { getHotkeyManager, toHotkeyRegistrationView } from './hotkey-manager'
import type { HotkeyRegistrationView } from './hotkey-manager'
import type {
  RegisterableHotkey,
  RegisterableHotkeyChord,
} from './hotkey.types'

/** A live registration that overlaps a candidate hotkey. */
export interface HotkeyConflict {
  registration: HotkeyRegistrationView
}

export interface HotkeyConflictOptions {
  /** Intended registration target. Defaults to document; disjoint targets are excluded. */
  target?: HTMLElement | Document | Window
  /** Check all targets instead of overlapping targets. Default: overlapping. */
  scope?: 'overlapping' | 'all'
  /** Intended event type. Default: keydown. */
  eventType?: 'keydown' | 'keyup'
  /** Include disabled registrations. Default: false. */
  includeDisabled?: boolean
  /** IDs of registrations being edited. */
  excludeIds?: ReadonlyArray<string>
  /** Additional app-specific exclusions, such as all instances of one action. */
  exclude?: (registration: HotkeyRegistrationView) => boolean
  /** Platform used to resolve Mod in the candidate. Registrations retain their own platform. */
  platform?: 'mac' | 'windows' | 'linux'
  /** Source events allow detecting physical/logical overlap on the recorded layout. */
  events?: ReadonlyArray<KeyboardEvent>
}

/** Whether two targets share a document and one contains the other (or is its window). */
function targetsOverlap(
  a: HTMLElement | Document | Window,
  b: HTMLElement | Document | Window,
): boolean {
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
  const steps: ReadonlyArray<RegisterableHotkeyChord> = isHotkeySequence(
    candidate,
  )
    ? candidate
    : [candidate]
  if (steps.length === 0) return []
  const platform = options.platform ?? detectPlatform()
  const parsed = steps.map((step) => parseRegisterableHotkey(step, platform))
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
    // Compare only the common prefix: a shorter sequence can collide with a longer one.
    return parsed
      .slice(0, Math.min(parsed.length, bindings.length))
      .every((a, index) => {
        const b = parseRegisterableHotkey(
          bindings[index]!,
          registration.options.platform,
        )
        const same =
          a.ctrl === b.ctrl &&
          a.alt === b.alt &&
          a.shift === b.shift &&
          a.meta === b.meta &&
          (a.code !== undefined || b.code !== undefined
            ? a.code === b.code
            : keysEqual(a.key, b.key))
        // A source event can establish code/key overlap without guessing its layout.
        const event = options.events?.[index]
        return (
          same ||
          (event !== undefined &&
            matchesKeyboardEvent(event, a, platform) &&
            matchesKeyboardEvent(event, b, registration.options.platform))
        )
      })
  }
  for (const registration of getHotkeyManager().registrations.state.values()) {
    const view = toHotkeyRegistrationView(registration)
    const bindings = view.kind === 'sequence' ? view.hotkey : [view.hotkey]
    if (matches(view, bindings)) conflicts.push({ registration: view })
  }
  return conflicts
}
