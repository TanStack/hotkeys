import { HotkeyRecorder } from '@tanstack/hotkeys'
import { withDefaults } from '@tanstack/hotkeys/adapter'
import { read, scopeOf } from './scope'
import type {
  HotkeyChord,
  HotkeyChordRecorderOptions,
  HotkeyRecorderOptions,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'
import type { AlpineHotkeyRecorder, AlpineHotkeys, MaybeGetter } from './types'

/**
 * Creates a recorder owned by a `createHotkeysScope` owner. It uses the
 * owner's `hotkeyRecorder` defaults, and options can follow Alpine state.
 * `maxSteps` (default 1) selects chords or sequences.
 */
export function createHotkeyRecorder(
  owner: AlpineHotkeys,
  options: HotkeyChordRecorderOptions,
): AlpineHotkeyRecorder<HotkeyChord>
export function createHotkeyRecorder(
  owner: AlpineHotkeys,
  options: HotkeySequenceRecorderOptions,
): AlpineHotkeyRecorder
// Getter overloads list sequences first: TypeScript keeps a lambda's parameter
// types from the first overload it tries, and sequence types also fit chords.
export function createHotkeyRecorder(
  owner: AlpineHotkeys,
  options: () => HotkeySequenceRecorderOptions,
): AlpineHotkeyRecorder
export function createHotkeyRecorder(
  owner: AlpineHotkeys,
  options: () => HotkeyChordRecorderOptions,
): AlpineHotkeyRecorder<HotkeyChord>
export function createHotkeyRecorder(
  owner: AlpineHotkeys,
  options: () => HotkeyRecorderOptions,
): AlpineHotkeyRecorder
export function createHotkeyRecorder(
  owner: AlpineHotkeys,
  options: MaybeGetter<HotkeyRecorderOptions>,
): AlpineHotkeyRecorder {
  return createRecorder(scopeOf(owner), options)
}

export function createRecorder(
  scope: HotkeysScope,
  options: MaybeGetter<HotkeyRecorderOptions>,
): AlpineHotkeyRecorder {
  scope.assertActive()
  // The overloads already checked the options; either shape is valid.
  const instance = new HotkeyRecorder(
    () =>
      withDefaults(
        scope.defaultOptions().hotkeyRecorder,
        read(options),
      ) as HotkeySequenceRecorderOptions,
  )
  const state = scope.select(instance.store, (value) => value)
  scope.addCleanup(() => instance.destroy())
  return {
    get isRecording() {
      return state.value.isRecording
    },
    get steps() {
      return state.value.steps
    },
    get recordedHotkey() {
      return state.value.recordedHotkey
    },
    startRecording: () => {
      if (!scope.destroyed) instance.start()
    },
    stopRecording: () => instance.stop(),
    cancelRecording: () => instance.cancel(),
    commitRecording: () => instance.commit(),
  }
}
