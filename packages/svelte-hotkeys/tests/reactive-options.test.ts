import ReactiveRecorders from './ReactiveRecorders.svelte'
import type { SvelteHotkeyRecorder } from '../src/createHotkeyRecorder.svelte'
import type { SvelteHotkeySequenceRecorder } from '../src/createHotkeySequenceRecorder.svelte'
import { flushSync, mount, unmount } from 'svelte'
import { expect, it, vi } from 'vitest'
import { HotkeyManager } from '@tanstack/hotkeys'
import Harness from './ReactiveOptions.svelte'
it.each(['local', 'provider'] as const)(
  'updates %s enabled options',
  async (kind) => {
    HotkeyManager.resetInstance()
    const callback = vi.fn()
    let disable!: () => void
    const component = mount(Harness, {
      target: document.body,
      props: { kind, callback, ready: (f: () => void) => (disable = f) },
    })
    flushSync()
    const press = () =>
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'a', bubbles: true }),
      )
    try {
      press()
      expect(callback).toHaveBeenCalledTimes(1)
      disable()
      flushSync()
      press()
      expect(callback).toHaveBeenCalledTimes(1)
    } finally {
      await unmount(component)
      HotkeyManager.resetInstance()
    }
  },
)

it.each(['single', 'sequence'] as const)(
  'updates an active %s recorder callback getter',
  async (kind) => {
    const first = vi.fn(),
      second = vi.fn()
    let single!: SvelteHotkeyRecorder,
      sequence!: SvelteHotkeySequenceRecorder,
      change!: () => void
    const component = mount(ReactiveRecorders, {
      target: document.body,
      props: {
        first,
        second,
        ready: (s, q, update) => {
          single = s
          sequence = q
          change = update
        },
      },
    })
    flushSync()
    try {
      const recorder = kind === 'single' ? single : sequence
      recorder.startRecording()
      change()
      flushSync()
      recorder.cancelRecording()
      expect(first).not.toHaveBeenCalled()
      expect(second).toHaveBeenCalledOnce()
    } finally {
      await unmount(component)
    }
  },
)
