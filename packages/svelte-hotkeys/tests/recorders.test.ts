import { flushSync, mount, unmount } from 'svelte'
import { expect, it } from 'vitest'
import RecorderHarness from './RecorderHarness.svelte'
import type { SvelteHotkeyRecorder } from '../src/createHotkeyRecorder.svelte'
import type { SvelteHotkeySequenceRecorder } from '../src/createHotkeySequenceRecorder.svelte'

it('allows recorder controls to be passed directly to event handlers', async () => {
  let single!: SvelteHotkeyRecorder
  let sequence!: SvelteHotkeySequenceRecorder
  const component = mount(RecorderHarness, {
    target: document.body,
    props: {
      ready: (s, q) => {
        single = s
        sequence = q
      },
    },
  })
  flushSync()
  try {
    for (const recorder of [single, sequence]) {
      const { startRecording, stopRecording, cancelRecording } = recorder
      startRecording.call(document.body)
      expect(recorder.isRecording).toBe(true)
      stopRecording.call(document.body)
      expect(recorder.isRecording).toBe(false)
      startRecording.call(document.body)
      cancelRecording.call(document.body)
      expect(recorder.isRecording).toBe(false)
    }
    const { startRecording, commitRecording } = sequence
    startRecording.call(document.body)
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'x', code: 'KeyX' }),
    )
    document.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'x', code: 'KeyX' }),
    )
    commitRecording.call(document.body)
    expect(sequence.recordedSequence).toEqual(['[KeyX]'])
    expect(sequence.isRecording).toBe(false)
  } finally {
    await unmount(component)
  }
})
