import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { HotkeyRecorder } from '@tanstack/hotkeys'
import { withDefaults } from '@tanstack/hotkeys/adapter'
import { read, scopeDefaults, select } from './utils'
import type { EmberHotkeysScope } from './createHotkeysScope'
import type { EmberHotkeyRecorder } from './types'
import type {
  HotkeyChord,
  HotkeyChordRecorderOptions,
  HotkeyRecorderOptions,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'
import type { MaybeGetter } from './utils'

/**
 * Creates an owned recorder with autotracked state and current callback
 * options. With the default `maxSteps: 1`, the first valid chord is recorded.
 * With a larger `maxSteps`, each chord adds a step; the recording commits on
 * Enter (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at
 * `maxSteps`, and `onRecord` receives a chord (one step) or a sequence.
 * Pass a scope from `createHotkeysScope` to apply its `hotkeyRecorder`
 * defaults.
 */
export function useHotkeyRecorder(
  owner: object,
  options: HotkeyChordRecorderOptions,
  scope?: EmberHotkeysScope,
): EmberHotkeyRecorder<HotkeyChord>
export function useHotkeyRecorder(
  owner: object,
  options: HotkeySequenceRecorderOptions,
  scope?: EmberHotkeysScope,
): EmberHotkeyRecorder
// Getter overloads list sequences first: TypeScript keeps a lambda's parameter
// types from the first overload it tries, and sequence types also fit chords.
export function useHotkeyRecorder(
  owner: object,
  options: () => HotkeySequenceRecorderOptions,
  scope?: EmberHotkeysScope,
): EmberHotkeyRecorder
export function useHotkeyRecorder(
  owner: object,
  options: () => HotkeyChordRecorderOptions,
  scope?: EmberHotkeysScope,
): EmberHotkeyRecorder<HotkeyChord>
export function useHotkeyRecorder(
  owner: object,
  options: () => HotkeyRecorderOptions,
  scope?: EmberHotkeysScope,
): EmberHotkeyRecorder
export function useHotkeyRecorder(
  owner: object,
  options: MaybeGetter<HotkeyRecorderOptions>,
  scope?: EmberHotkeysScope,
): EmberHotkeyRecorder {
  // Overloads already checked the options; either shape is valid here.
  const recorder = new HotkeyRecorder(
    () =>
      withDefaults(
        scope && read(scopeDefaults.get(scope)!).hotkeyRecorder,
        read(options),
      ) as HotkeySequenceRecorderOptions,
  )
  const state = select(owner, recorder.store, (value) => value)
  registerDestructor(owner, () => recorder.destroy())
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
    startRecording() {
      if (isDestroying(owner) || isDestroyed(owner)) return
      recorder.start()
    },
    stopRecording: () => recorder.stop(),
    cancelRecording: () => recorder.cancel(),
    commitRecording: () => recorder.commit(),
  }
}
