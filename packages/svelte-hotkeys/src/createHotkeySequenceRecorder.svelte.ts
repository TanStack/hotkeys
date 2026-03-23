import { HotkeySequenceRecorder } from '@tanstack/hotkeys'
import { onDestroy } from 'svelte'
import { getDefaultHotkeysOptions } from './HotkeysCtx'
import { createStoreSubscriber, resolveMaybeGetter } from './internal.svelte'
import type {
  HotkeySequence,
  HotkeySequenceRecorderOptions,
} from '@tanstack/hotkeys'
import type { MaybeGetter } from './internal.svelte'

export interface SvelteHotkeySequenceRecorder {
  readonly isRecording: boolean
  readonly steps: HotkeySequence
  readonly recordedSequence: HotkeySequence | null
  startRecording: () => void
  stopRecording: () => void
  cancelRecording: () => void
  commitRecording: () => void
}

class SvelteHotkeySequenceRecorderState implements SvelteHotkeySequenceRecorder {
  #recorder: HotkeySequenceRecorder
  #subscribe: () => void

  constructor(options: HotkeySequenceRecorderOptions) {
    this.#recorder = new HotkeySequenceRecorder(options)
    this.#subscribe = createStoreSubscriber(this.#recorder.store)
  }

  get isRecording(): boolean {
    this.#subscribe()
    return this.#recorder.store.state.isRecording
  }

  get steps(): HotkeySequence {
    this.#subscribe()
    return this.#recorder.store.state.steps
  }

  get recordedSequence(): HotkeySequence | null {
    this.#subscribe()
    return this.#recorder.store.state.recordedSequence
  }

  setOptions(options: HotkeySequenceRecorderOptions): void {
    this.#recorder.setOptions(options)
  }

  startRecording(): void {
    this.#recorder.start()
  }

  stopRecording(): void {
    this.#recorder.stop()
  }

  cancelRecording(): void {
    this.#recorder.cancel()
  }

  commitRecording(): void {
    this.#recorder.commit()
  }

  destroy(): void {
    this.#recorder.destroy()
  }
}

/**
 * Svelte helper for recording multi-chord sequences (Vim-style shortcuts).
 */
export function createHotkeySequenceRecorder(
  options: MaybeGetter<HotkeySequenceRecorderOptions>,
): SvelteHotkeySequenceRecorder {
  const recorder = new SvelteHotkeySequenceRecorderState({
    ...getDefaultHotkeysOptions().hotkeySequenceRecorder,
    ...resolveMaybeGetter(options),
  } as HotkeySequenceRecorderOptions)

  $effect(() => {
    recorder.setOptions({
      ...getDefaultHotkeysOptions().hotkeySequenceRecorder,
      ...resolveMaybeGetter(options),
    } as HotkeySequenceRecorderOptions)
  })

  onDestroy(() => {
    recorder.destroy()
  })

  return recorder
}
