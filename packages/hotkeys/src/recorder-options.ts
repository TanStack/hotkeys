import type { Hotkey, ParsedHotkey } from './hotkey.types'
import type { HotkeyConflict, HotkeyConflictOptions } from './conflicts'

/** Event property used to record a binding. Physical codes are the default. */
export type RecorderKeyMode = 'code' | 'key'

export interface RecorderRejection {
  reason: 'missing-code' | 'alt-graph' | 'invalid' | 'conflict' | 'validation'
  message: string
  /** The rejected chord or sequence, when one was recorded. */
  hotkey?: Hotkey
  conflicts?: Array<HotkeyConflict>
}

export interface RecorderOptions {
  /** Physical code recording is the default. Choose key to record logical characters. */
  recordBy?: RecorderKeyMode
  /** Platform used for Mod and AltGraph handling. Defaults to platform detection. */
  platform?: 'mac' | 'windows' | 'linux'
  /** Opt in to live-registry conflicts, including sequence prefixes. Default: false. */
  detectConflicts?: boolean | HotkeyConflictOptions
  /** Rejected candidates leave recording active. */
  onReject?: (rejection: RecorderRejection) => void
}

/** Validation context for a recorded chord or sequence. */
export interface HotkeyRecorderValidationContext {
  /** The event that recorded the last chord. */
  event: KeyboardEvent
  /** The last chord, parsed. */
  parsedHotkey: ParsedHotkey
  /** The event that recorded each step. */
  events: ReadonlyArray<KeyboardEvent>
  /** Every step, parsed. */
  parsedSequence: ReadonlyArray<ParsedHotkey>
}
