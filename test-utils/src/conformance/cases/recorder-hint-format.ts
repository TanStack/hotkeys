import { detectPlatform, formatForDisplay } from '@tanstack/hotkeys'
import { mod, modDown, modUp } from '../keys'
import { defineGroup, spy } from '../suite'
import type { Hotkey } from '@tanstack/hotkeys'

defineGroup({
  name: 'hotkey recorder',
  requires: ['recorder'],
  cases: [
    {
      title: 'records a chord and stops recording',
      async run({ harness, expect, press }) {
        const onRecord = spy<[Hotkey]>()
        const recorder = await harness.mountRecorder!({
          options: { onRecord, recordBy: 'key' },
        })
        expect(recorder.state().isRecording).toBe(false)
        await recorder.start()
        expect(recorder.state().isRecording).toBe(true)
        await press(mod('s'))
        expect(onRecord.calls).toEqual([['Mod+S']])
        expect(recorder.state()).toMatchObject({
          isRecording: false,
          recordedHotkey: 'Mod+S',
        })
      },
    },
    {
      title: 'cancels without recording and calls onCancel',
      async run({ harness, expect, press }) {
        const onRecord = spy()
        const onCancel = spy()
        const recorder = await harness.mountRecorder!({
          options: { onRecord, onCancel },
        })
        await recorder.start()
        await recorder.cancel()
        expect(recorder.state().isRecording).toBe(false)
        await press(mod('s'))
        expect([onRecord.calls.length, onCancel.calls.length]).toEqual([0, 1])
      },
    },
    {
      title: 'cancels on Escape',
      async run({ harness, expect, press }) {
        const onRecord = spy()
        const onCancel = spy()
        const recorder = await harness.mountRecorder!({
          options: { onRecord, onCancel },
        })
        await recorder.start()
        await press({ key: 'Escape', code: 'Escape' })
        expect(recorder.state().isRecording).toBe(false)
        expect([onRecord.calls.length, onCancel.calls.length]).toEqual([0, 1])
      },
    },
    {
      title: 'stops without calling onCancel',
      async run({ harness, expect }) {
        const onCancel = spy()
        const recorder = await harness.mountRecorder!({
          options: { onRecord: () => {}, onCancel },
        })
        await recorder.start()
        await recorder.stop()
        expect(recorder.state().isRecording).toBe(false)
        expect(onCancel.calls).toHaveLength(0)
      },
    },
    {
      title: 'records a sequence step by step and commits on Enter',
      async run({ harness, expect, press }) {
        const onRecord = spy<[Hotkey]>()
        const recorder = await harness.mountRecorder!({
          options: { onRecord, maxSteps: Infinity, recordBy: 'key' },
        })
        await recorder.start()
        await press({ key: 'g', code: 'KeyG' })
        expect(recorder.state().steps).toEqual(['G'])
        await press({ key: 'h', code: 'KeyH' })
        expect(recorder.state().steps).toEqual(['G', 'H'])
        expect(onRecord.calls).toHaveLength(0)
        await press({ key: 'Enter', code: 'Enter' })
        expect(onRecord.calls).toEqual([[['G', 'H']]])
        expect(recorder.state()).toMatchObject({
          isRecording: false,
          recordedHotkey: ['G', 'H'],
        })
      },
    },
    {
      title: 'commits the steps recorded so far',
      async run({ harness, expect, press }) {
        const onRecord = spy<[Hotkey]>()
        const recorder = await harness.mountRecorder!({
          options: { onRecord, maxSteps: Infinity, recordBy: 'key' },
        })
        await recorder.start()
        await press({ key: 'g', code: 'KeyG' })
        await recorder.commit()
        expect(onRecord.calls).toEqual([['G']])
        expect(recorder.state().isRecording).toBe(false)
      },
    },
    {
      title: 'keeps registered hotkeys from firing while recording',
      async run({ harness, expect, press, release }) {
        const callback = spy()
        await harness.mountHotkeys({
          form: 'single',
          hotkeys: [{ hotkey: 'Mod+K', callback }],
        })
        const recorder = await harness.mountRecorder!({
          options: { onRecord: () => {}, recordBy: 'key' },
        })
        await recorder.start()
        await press(mod('k'))
        expect(callback.calls).toHaveLength(0)
        await release(mod('k'))
        await release(modUp())
        await press(mod('k'))
        expect(callback.calls).toHaveLength(1)
      },
    },
    {
      title: 'stops recording when it unmounts',
      async run({ harness, expect, press }) {
        const onRecord = spy()
        const recorder = await harness.mountRecorder!({
          options: { onRecord, recordBy: 'key' },
        })
        await recorder.start()
        await recorder.unmount()
        await press(mod('s'))
        expect(onRecord.calls).toHaveLength(0)
      },
    },
    {
      title: 'records Mod on the provider platform',
      requires: ['provider-defaults'],
      async run({ harness, expect, press }) {
        const onRecord = spy<[Hotkey]>()
        const recorder = await harness.mountRecorder!({
          options: { onRecord, recordBy: 'key' },
          provider: { platform: 'mac' },
        })
        await recorder.start()
        await press({ key: 's', code: 'KeyS', metaKey: true })
        expect(onRecord.calls).toEqual([['Mod+S']])
      },
    },
  ],
})

defineGroup({
  name: 'hotkey hint',
  requires: ['hint'],
  cases: [
    {
      title: 'is false while nothing registers the hotkey',
      async run({ harness, expect, press }) {
        const hint = await harness.mountHint!({ hotkey: 'Mod+K' })
        await press(modDown())
        expect(hint.value()).toBe(false)
      },
    },
    {
      title: 'is true only while the modifiers of a registered hotkey are held',
      async run({ harness, expect, press, release }) {
        await harness.mountHotkeys({
          form: 'single',
          hotkeys: [{ hotkey: 'Mod+K', callback: () => {} }],
        })
        const hint = await harness.mountHint!({ hotkey: 'Mod+K' })
        expect(hint.value()).toBe(false)
        await press(modDown())
        expect(hint.value()).toBe(true)
        await release(modUp())
        expect(hint.value()).toBe(false)
      },
    },
    {
      title: 'is false while the hotkey is disabled',
      async run({ harness, expect, press }) {
        const view = await harness.mountHotkeys({
          form: 'single',
          hotkeys: [
            {
              hotkey: 'Mod+K',
              callback: () => {},
              options: { enabled: false },
            },
          ],
        })
        const hint = await harness.mountHint!({ hotkey: 'Mod+K' })
        await press(modDown())
        expect(hint.value()).toBe(false)
        await view.update({
          hotkeys: [
            {
              hotkey: 'Mod+K',
              callback: () => {},
              options: { enabled: true },
            },
          ],
        })
        expect(hint.value()).toBe(true)
      },
    },
    {
      title: 'follows a change of hotkey',
      async run({ harness, expect, press }) {
        await harness.mountHotkeys({
          form: 'single',
          hotkeys: [
            { hotkey: 'Mod+K', callback: () => {} },
            { hotkey: 'Alt+K', callback: () => {} },
          ],
        })
        const hint = await harness.mountHint!({ hotkey: 'Mod+K' })
        await press(modDown())
        expect(hint.value()).toBe(true)
        await hint.setHotkey('Alt+K')
        expect(hint.value()).toBe(false)
        await hint.setHotkey('Mod+K')
        expect(hint.value()).toBe(true)
      },
    },
    {
      title: 'is false for an unset hotkey',
      async run({ harness, expect, press }) {
        await harness.mountHotkeys({
          form: 'single',
          hotkeys: [{ hotkey: 'Mod+K', callback: () => {} }],
        })
        const hint = await harness.mountHint!({ hotkey: undefined })
        await press(modDown())
        expect(hint.value()).toBe(false)
        await hint.setHotkey(null)
        expect(hint.value()).toBe(false)
      },
    },
    {
      title: 'counts a hotkey on an element only while focus is inside it',
      requires: ['element-target'],
      async run({ harness, expect, press, release, act }) {
        const view = await harness.mountHotkeys({
          form: 'single',
          hotkeys: [
            {
              hotkey: 'Mod+K',
              callback: () => {},
              options: { target: 'element' },
            },
          ],
        })
        const hint = await harness.mountHint!({ hotkey: 'Mod+K' })
        await press(modDown())
        expect(hint.value()).toBe(false)
        await release(modUp())
        await act(() => view.element().focus())
        await press(modDown())
        expect(hint.value()).toBe(true)
        await release(modUp())
        await act(() => view.element().blur())
        await press(modDown())
        expect(hint.value()).toBe(false)
      },
    },
    {
      title: 'reveals a sequence from its first step',
      async run({ harness, expect, press }) {
        await harness.mountHotkeys({
          form: 'single',
          hotkeys: [{ hotkey: ['Mod+K', 'S'], callback: () => {} }],
        })
        const hint = await harness.mountHint!({ hotkey: ['Mod+K', 'S'] })
        await press(modDown())
        expect(hint.value()).toBe(true)
      },
    },
  ],
})

defineGroup({
  name: 'format for display',
  requires: ['format'],
  cases: [
    {
      title: 'formats on the provider platform',
      requires: ['provider-defaults'],
      async run({ harness, expect }) {
        const mac = await harness.mountFormat!({ platform: 'mac' })
        expect(mac.format('Mod+S')).toBe('⌘ S')
        await mac.unmount()
        const windows = await harness.mountFormat!({ platform: 'windows' })
        expect(windows.format('Mod+S')).toBe('Ctrl+S')
      },
    },
    {
      title: 'lets a platform passed to format win over the provider',
      requires: ['provider-defaults'],
      async run({ harness, expect }) {
        const view = await harness.mountFormat!({ platform: 'mac' })
        expect(view.format('Mod+S', { platform: 'windows' })).toBe('Ctrl+S')
      },
    },
    {
      title: 'uses the detected platform without a provider',
      async run({ harness, expect }) {
        const view = await harness.mountFormat!({})
        expect(view.format('Mod+Shift+S')).toBe(
          formatForDisplay('Mod+Shift+S', { platform: detectPlatform() }),
        )
        expect(view.format(['G', 'H'])).toBe(formatForDisplay(['G', 'H']))
      },
    },
  ],
})
