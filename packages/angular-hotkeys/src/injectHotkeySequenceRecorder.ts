import {
  DestroyRef,
  computed,
  effect,
  inject,
  linkedSignal,
  untracked,
} from '@angular/core'
import { HotkeySequenceRecorder } from '@tanstack/hotkeys'
import { injectDefaultHotkeysOptions } from './hotkeys-provider'
import type { Atom, ReadonlyAtom } from '@tanstack/angular-store'
import type { Signal } from '@angular/core'
import type {
  HotkeySequence,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'

export interface AngularHotkeySequenceRecorder {
  readonly isRecording: () => boolean
  readonly steps: () => HotkeySequence
  readonly recordedSequence: () => HotkeySequence | null
  readonly startRecording: () => void
  readonly stopRecording: () => void
  readonly cancelRecording: () => void
  readonly commitRecording: () => void
}

/**
 * Angular inject-based API for recording multi-chord sequences.
 */
export function injectHotkeySequenceRecorder(
  options:
    | HotkeySequenceRecorderOptions
    | (() => HotkeySequenceRecorderOptions),
): AngularHotkeySequenceRecorder {
  const defaultOptions = injectDefaultHotkeysOptions()
  const destroyRef = inject(DestroyRef)

  const recorderSignal = computed(() =>
    untracked(() => {
      const resolvedOptions =
        typeof options === 'function' ? options() : options

      const mergedOptions = {
        ...defaultOptions.hotkeySequenceRecorder,
        ...resolvedOptions,
      } as HotkeySequenceRecorderOptions

      return new HotkeySequenceRecorder(mergedOptions)
    }),
  )

  const recorderStore = computed(() => untracked(() => recorderSignal().store))
  const isRecording = injectLazyStore(
    recorderStore,
    (state) => state.isRecording,
  )
  const steps = injectLazyStore(recorderStore, (state) => state.steps)
  const recordedSequence = injectLazyStore(
    recorderStore,
    (state) => state.recordedSequence,
  )

  effect(() => {
    const resolved = typeof options === 'function' ? options() : options
    recorderSignal().setOptions({
      ...defaultOptions.hotkeySequenceRecorder,
      ...resolved,
    } as HotkeySequenceRecorderOptions)
  })

  destroyRef.onDestroy(() => {
    recorderSignal().destroy()
  })

  return {
    isRecording,
    steps,
    recordedSequence,
    startRecording: () => recorderSignal().start(),
    stopRecording: () => recorderSignal().stop(),
    cancelRecording: () => recorderSignal().cancel(),
    commitRecording: () => recorderSignal().commit(),
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
