import {
  DestroyRef,
  NgZone,
  computed,
  effect,
  inject,
  linkedSignal,
  untracked,
} from '@angular/core'
import { HotkeyRecorder } from '@tanstack/hotkeys'
import { withDefaults } from '@tanstack/hotkeys/adapter'
import { injectDefaultHotkeysOptions } from './hotkeys-provider'
import type { Store } from '@tanstack/hotkeys/adapter'
import type { Signal } from '@angular/core'
import type {
  Hotkey,
  HotkeyChord,
  HotkeyChordRecorderOptions,
  HotkeyRecorderOptions,
  HotkeySequence,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'

export interface AngularHotkeyRecorder<THotkey extends Hotkey = Hotkey> {
  /** Whether recording is currently active */
  readonly isRecording: () => boolean
  /** Chords recorded so far in a multi-step recording (for live preview) */
  readonly steps: () => HotkeySequence
  /** The last committed hotkey */
  readonly recordedHotkey: () => THotkey | null
  /** Start recording a new hotkey */
  readonly startRecording: () => void
  /** Stop recording without calling onCancel */
  readonly stopRecording: () => void
  /** Cancel recording and call onCancel */
  readonly cancelRecording: () => void
  /** Commit the recorded steps now (multi-step recordings) */
  readonly commitRecording: () => void
}

/**
 * Angular inject-based API for recording keyboard shortcuts.
 *
 * With the default `maxSteps: 1`, the first valid chord is recorded. With a
 * larger `maxSteps`, each chord adds a step; the recording commits on Enter
 * (unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
 * `onRecord` receives a chord (one step) or a sequence. Escape cancels;
 * Backspace/Delete removes the last step or clears.
 *
 * @param options - Configuration options for the recorder (or getter)
 * @returns Object with recording state signals and control functions
 *
 * @example
 * ```ts
 * @Component({ ... })
 * export class ShortcutSettingsComponent {
 *   shortcut = signal<Hotkey>('Mod+S')
 *   recorder = injectHotkeyRecorder({
 *     onRecord: (hotkey) => this.shortcut.set(hotkey),
 *     onCancel: () => console.log('Recording cancelled'),
 *   })
 *
 *   constructor() {
 *     injectHotkey(
 *       () => this.shortcut(),
 *       () => this.handleSave(),
 *     )
 *   }
 * }
 * ```
 */
export function injectHotkeyRecorder(
  options: HotkeyChordRecorderOptions,
): AngularHotkeyRecorder<HotkeyChord>
export function injectHotkeyRecorder(
  options: HotkeySequenceRecorderOptions,
): AngularHotkeyRecorder
// Getter overloads list sequences first: TypeScript keeps a lambda's parameter
// types from the first overload it tries, and sequence types also fit chords.
export function injectHotkeyRecorder(
  options: () => HotkeySequenceRecorderOptions,
): AngularHotkeyRecorder
export function injectHotkeyRecorder(
  options: () => HotkeyChordRecorderOptions,
): AngularHotkeyRecorder<HotkeyChord>
export function injectHotkeyRecorder(
  options: () => HotkeyRecorderOptions,
): AngularHotkeyRecorder
export function injectHotkeyRecorder(
  options: HotkeyRecorderOptions | (() => HotkeyRecorderOptions),
): AngularHotkeyRecorder {
  const defaultOptions = injectDefaultHotkeysOptions()
  const destroyRef = inject(DestroyRef)
  const zone = inject(NgZone)

  // Callbacks run in the zone, so their changes update the view.
  const resolve = (): HotkeySequenceRecorderOptions => {
    const resolved: Record<string, any> = withDefaults(
      defaultOptions.hotkeyRecorder,
      typeof options === 'function' ? options() : options,
    )
    for (const key of ['onRecord', 'onCancel', 'onClear', 'onReject']) {
      const callback = resolved[key]
      if (callback)
        resolved[key] = (...args: Array<any>) => zone.run(callback, null, args)
    }
    // Overloads already checked the options; either shape is valid here.
    return resolved as never
  }

  // Stable signal to lazy initialize the recorder
  const recorderSignal = computed(() =>
    untracked(() => new HotkeyRecorder(resolve())),
  )

  // Subscribe to recorder state
  const recorderStore = computed(() => untracked(() => recorderSignal().store))
  const isRecording = injectLazyStore(
    recorderStore,
    (state) => state.isRecording,
  )
  const steps = injectLazyStore(recorderStore, (state) => state.steps)
  const recordedHotkey = injectLazyStore(
    recorderStore,
    (state) => state.recordedHotkey,
  )

  // Sync options on every effect run (matches React's sync on render)
  effect(() => {
    recorderSignal().setOptions(resolve())
  })

  destroyRef.onDestroy(() => {
    recorderSignal().destroy()
  })

  return {
    isRecording,
    steps,
    recordedHotkey,
    // Its listeners attach outside the zone, so keys don't run change
    // detection while recording.
    startRecording: () =>
      zone.runOutsideAngular(() => recorderSignal().start()),
    stopRecording: () => recorderSignal().stop(),
    cancelRecording: () => recorderSignal().cancel(),
    commitRecording: () => recorderSignal().commit(),
  }
}

function injectLazyStore<TState, TSelected = NoInfer<TState>>(
  storeSignal: Signal<Pick<Store<TState>, 'get' | 'subscribe'>>,
  selector: (state: NoInfer<TState>) => TSelected,
): Signal<TSelected> {
  const slice = linkedSignal(() => selector(storeSignal().get()))

  effect((onCleanup) => {
    const currentStore = storeSignal()
    slice.set(selector(currentStore.get()))
    const { unsubscribe } = currentStore.subscribe((s) => {
      slice.set(selector(s))
    })
    onCleanup(() => unsubscribe())
  })

  return slice.asReadonly()
}
