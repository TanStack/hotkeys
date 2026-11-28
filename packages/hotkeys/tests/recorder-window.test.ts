import { keydown, keyup } from '@tanstack/hotkeys-test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager } from '../src/hotkey-manager'
import { HotkeyRecorder } from '../src/hotkey-recorder'
import type { HotkeyChordRecorderOptions } from '../src/hotkey-recorder'

// A recorder started from a button in a Picture-in-Picture window records
// that window's key presses. A same-origin iframe stands in for the window.

const instances: Array<HotkeyRecorder> = []
const frames: Array<Window> = []

function createRecorder(options: HotkeyChordRecorderOptions) {
  const recorder = new HotkeyRecorder({ platform: 'mac', ...options })
  instances.push(recorder)
  return recorder
}

function otherWindow(): Window {
  const iframe = document.createElement('iframe')
  document.body.append(iframe)
  frames.push(iframe.contentWindow!)
  return iframe.contentWindow!
}

afterEach(() => {
  instances.splice(0).forEach((recorder) => recorder.destroy())
  // Releases guards for keys the tests left held
  for (const view of [window, ...frames.splice(0)]) {
    view.dispatchEvent(new Event('blur'))
  }
  HotkeyManager.resetInstance()
  document.body.replaceChildren()
})

describe('HotkeyRecorder with a target window', () => {
  it.each(['window', 'document'] as const)(
    'records a key pressed in another window given its %s',
    (kind) => {
      const view = otherWindow()
      const onRecord = vi.fn()
      const recorder = createRecorder({
        onRecord,
        target: kind === 'window' ? view : view.document,
      })
      recorder.start()
      const event = keydown({
        key: 's',
        code: 'KeyS',
        metaKey: true,
        target: view.document.body,
      })
      expect(onRecord).toHaveBeenCalledWith('Mod+S', expect.anything())
      expect(event.defaultPrevented).toBe(true)
    },
  )

  it('ignores key presses in the main window', () => {
    const view = otherWindow()
    const onRecord = vi.fn()
    createRecorder({ onRecord, target: view }).start()
    keydown({ key: 's', code: 'KeyS', metaKey: true, target: document.body })
    expect(onRecord).not.toHaveBeenCalled()
  })

  it("cancels on Escape before that window's page listeners see it", () => {
    const view = otherWindow()
    const closeDialog = vi.fn()
    view.document.addEventListener('keydown', closeDialog, true)
    const onCancel = vi.fn()
    const recorder = createRecorder({
      onRecord: vi.fn(),
      onCancel,
      target: view,
    })
    recorder.start()
    keydown({ key: 'Escape', code: 'Escape', target: view.document.body })
    expect(onCancel).toHaveBeenCalledOnce()
    expect(closeDialog).not.toHaveBeenCalled()
  })

  it('cancels when that window loses focus, not the main window', () => {
    const view = otherWindow()
    const onCancel = vi.fn()
    const recorder = createRecorder({
      onRecord: vi.fn(),
      onCancel,
      target: view,
    })
    recorder.start()
    window.dispatchEvent(new Event('blur'))
    expect(recorder.store.state.isRecording).toBe(true)
    view.dispatchEvent(new Event('blur'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('lets typing in a text field in that window through', () => {
    const view = otherWindow()
    const input = view.document.createElement('input')
    view.document.body.append(input)
    input.focus()
    const onRecord = vi.fn()
    createRecorder({ onRecord, target: view }).start()
    keydown({ key: 'a', code: 'KeyA', target: input })
    expect(onRecord).not.toHaveBeenCalled()
  })

  it("hides the recorded key's release from that window's page and hotkeys", () => {
    const view = otherWindow()
    const released = vi.fn()
    view.document.addEventListener('keyup', released)
    const hotkey = vi.fn()
    HotkeyManager.getInstance().register('S', hotkey, {
      target: view.document,
      eventType: 'keyup',
    })
    createRecorder({ onRecord: vi.fn(), target: view }).start()
    keydown({ key: 's', code: 'KeyS', target: view.document.body })
    keyup({ key: 's', code: 'KeyS', target: view.document.body })
    expect(released).not.toHaveBeenCalled()
    expect(hotkey).not.toHaveBeenCalled()
  })

  it('stops listening in that window once recording ends', () => {
    const view = otherWindow()
    const onRecord = vi.fn()
    const onCancel = vi.fn()
    const recorder = createRecorder({ onRecord, onCancel, target: view })
    recorder.start()
    recorder.stop()
    const event = keydown({
      key: 's',
      code: 'KeyS',
      metaKey: true,
      target: view.document.body,
    })
    view.dispatchEvent(new Event('blur'))
    expect(onRecord).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
  })

  it('reads the target when recording starts', () => {
    const view = otherWindow()
    const onRecord = vi.fn()
    const recorder = createRecorder({ onRecord })
    recorder.setOptions({ target: view })
    recorder.start()
    keydown({ key: 'a', code: 'KeyA', target: view.document.body })
    recorder.setOptions({ target: undefined })
    recorder.start()
    keydown({ key: 'b', code: 'KeyB', target: document.body })
    expect(onRecord.mock.calls.map(([hotkey]) => hotkey)).toEqual(['A', 'B'])
  })

  it('cancels when that window closes, even with cancelOnBlur off', () => {
    const view = otherWindow()
    const onCancel = vi.fn()
    const recorder = createRecorder({
      onRecord: vi.fn(),
      onCancel,
      cancelOnBlur: false,
      target: view,
    })
    const hotkey = vi.fn()
    HotkeyManager.getInstance().register('K', hotkey)
    recorder.start()
    view.dispatchEvent(new Event('pagehide'))
    keydown({ key: 'k', code: 'KeyK', target: document.body })
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(recorder.store.state.isRecording).toBe(false)
    expect(hotkey).toHaveBeenCalledTimes(1)
  })

  it('lets a recorded key still held when that window closes reach hotkeys', () => {
    const view = otherWindow()
    const hotkey = vi.fn()
    HotkeyManager.getInstance().register('S', hotkey)
    createRecorder({ onRecord: vi.fn(), target: view }).start()
    keydown({ key: 's', code: 'KeyS', target: view.document.body })
    view.dispatchEvent(new Event('pagehide'))
    keydown({ key: 's', code: 'KeyS', target: document.body })
    expect(hotkey).toHaveBeenCalledTimes(1)
  })

  it('does not start in a closed window or a document without one', () => {
    const iframe = document.createElement('iframe')
    document.body.append(iframe)
    const closed = iframe.contentWindow!
    iframe.remove()
    const hotkey = vi.fn()
    HotkeyManager.getInstance().register('K', hotkey)
    for (const target of [
      closed,
      document.implementation.createHTMLDocument(),
    ]) {
      const recorder = createRecorder({ onRecord: vi.fn(), target })
      recorder.start()
      expect(recorder.store.state.isRecording).toBe(false)
    }
    keydown({ key: 'k', code: 'KeyK', target: document.body })
    expect(hotkey).toHaveBeenCalledTimes(1)
  })

  it("stops listening in its window when another recorder's onCancel stops it while it starts", () => {
    const view = otherWindow()
    const onRecord = vi.fn()
    const second = createRecorder({ onRecord, target: view })
    createRecorder({
      onRecord: vi.fn(),
      onCancel: () => second.stop(),
    }).start()
    second.start()
    second.stop()
    // Recording again elsewhere must not hear the first window
    second.setOptions({ target: undefined })
    second.start()
    keydown({
      key: 's',
      code: 'KeyS',
      metaKey: true,
      target: view.document.body,
    })
    expect(onRecord).not.toHaveBeenCalled()
  })
})
