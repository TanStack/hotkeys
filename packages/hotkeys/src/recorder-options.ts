import type { Hotkey, ParsedHotkey } from './hotkey.types'
import type { HotkeyConflict, HotkeyConflictOptions } from './conflicts'

/** Event property used to record a binding. Physical codes are the default. */
export type RecorderKeyMode = 'code' | 'key'

export interface RecorderRejection {
  reason: 'missing-code' | 'alt-graph' | 'invalid' | 'conflict' | 'validation'
  message: string
  hotkey?: Hotkey
  sequence?: Array<Hotkey>
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

export interface HotkeyRecorderValidationContext {
  event: KeyboardEvent
  parsedHotkey: ParsedHotkey
}

export interface HotkeySequenceRecorderValidationContext {
  events: ReadonlyArray<KeyboardEvent>
  parsedSequence: ReadonlyArray<ParsedHotkey>
}
