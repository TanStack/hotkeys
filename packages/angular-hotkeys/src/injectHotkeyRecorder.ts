import {
  DestroyRef,
  computed,
  effect,
  inject,
  linkedSignal,
  untracked,
} from '@angular/core'
import { HotkeyRecorder } from '@tanstack/hotkeys'
import { injectDefaultHotkeysOptions } from './hotkeys-provider'
import type { Atom, ReadonlyAtom } from '@tanstack/angular-store'
import type { Signal } from '@angular/core'
import type { Hotkey, HotkeyRecorderOptions } from '@tanstack/hotkeys'

export interface AngularHotkeyRecorder {
  /** Whether recording is currently active */
  readonly isRecording: () => boolean
  /** The currently recorded hotkey (for live preview) */
  readonly recordedHotkey: () => Hotkey | null
  /** Start recording a new hotkey */
  readonly startRecording: () => void
  /** Stop recording (same as cancel) */
  readonly stopRecording: () => void
  /** Cancel recording without saving */
  readonly cancelRecording: () => void
}

/**
 * Angular inject-based API for recording keyboard shortcuts.
 *
 * Thin wrapper around the framework-agnostic HotkeyRecorder class: captures
 * keyboard events, converts them to hotkey strings, and handles Escape to
 * cancel or Backspace/Delete to clear.
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
 *       () => ({ enabled: !this.recorder.isRecording() }),
 *     )
 *   }
 * }
 * ```
 */
export function injectHotkeyRecorder(
  options: HotkeyRecorderOptions | (() => HotkeyRecorderOptions),
): AngularHotkeyRecorder {
  const defaultOptions = injectDefaultHotkeysOptions()
  const destroyRef = inject(DestroyRef)

  // Stable signal to lazy initialize the recorder
  const recorderSignal = computed(() =>
    untracked(() => {
      const resolvedOptions =
        typeof options === 'function' ? options() : options

      const mergedOptions = {
        ...defaultOptions.hotkeyRecorder,
        ...resolvedOptions,
      } as HotkeyRecorderOptions

      return new HotkeyRecorder(mergedOptions)
    }),
  )

  // Subscribe to recorder state
  const recorderStore = computed(() => untracked(() => recorderSignal().store))
  const isRecording = injectLazyStore(
    recorderStore,
    (state) => state.isRecording,
  )
  const recordedHotkey = injectLazyStore(
    recorderStore,
    (state) => state.recordedHotkey,
  )

  // Sync options on every effect run (matches React's sync on render)
  effect(() => {
    const resolved = typeof options === 'function' ? options() : options
    recorderSignal().setOptions({
      ...defaultOptions.hotkeyRecorder,
      ...resolved,
    } as HotkeyRecorderOptions)
  })

  destroyRef.onDestroy(() => {
    recorderSignal().destroy()
  })

  return {
    isRecording,
    recordedHotkey,
    startRecording: () => recorderSignal().start(),
    stopRecording: () => recorderSignal().stop(),
    cancelRecording: () => recorderSignal().cancel(),
  }
}

function injectLazyStore<TState, TSelected = NoInfer<TState>>(
  storeSignal: Signal<Atom<TState> | ReadonlyAtom<TState>>,
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
