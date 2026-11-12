import { keydown, keyup } from '@tanstack/hotkeys-test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager, HotkeyRecorder } from '../src'
import type { HotkeySequenceRecorderOptions } from '../src'

const instances: Array<HotkeyRecorder> = []
function recorder(
  options: Omit<HotkeySequenceRecorderOptions, 'maxSteps'> & {
    maxSteps?: number
  },
) {
  const value = new HotkeyRecorder({ platform: 'mac', maxSteps: 1, ...options })
  instances.push(value)
  value.start()
  return value
}
const tab = (flags: KeyboardEventInit = {}) =>
  keydown({ key: 'Tab', code: 'Tab', ...flags, target: document })

afterEach(() => {
  instances.splice(0).forEach((r) => r.destroy())
  window.dispatchEvent(new Event('blur'))
  HotkeyManager.resetInstance()
  document.body.replaceChildren()
})

describe('Tab while recording', () => {
  it.each([
    ['Tab', {}],
    ['Shift+Tab', { shiftKey: true }],
  ] as const)('%s cancels without preventing focus movement', (_, flags) => {
    const onRecord = vi.fn()
    const onCancel = vi.fn()
    const r = recorder({ onRecord, onCancel })
    const event = tab(flags)
    expect(event.defaultPrevented).toBe(false)
    expect(onRecord).not.toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalledOnce()
    expect(r.store.state.isRecording).toBe(false)
  })

  it('lets the Tab keydown reach other listeners', () => {
    const listener = vi.fn()
    document.body.addEventListener('keydown', listener)
    recorder({ onRecord: vi.fn() })
    keydown({ key: 'Tab', code: 'Tab', target: document.body })
    expect(listener).toHaveBeenCalledOnce()
  })

  it('cancels a multi-step recording that already has steps', () => {
    const onRecord = vi.fn()
    const onCancel = vi.fn()
    const r = recorder({ maxSteps: Infinity, onRecord, onCancel })
    keydown({ key: 'g', code: 'KeyG', target: document })
    expect(r.store.state.steps).toEqual(['G'])
    tab()
    expect(onRecord).not.toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalledOnce()
    expect(r.store.state.steps).toEqual([])
  })

  it('records Tab with Control', () => {
    const onRecord = vi.fn()
    recorder({ onRecord })
    expect(tab({ ctrlKey: true }).defaultPrevented).toBe(true)
    expect(onRecord).toHaveBeenCalledWith('Control+Tab', expect.anything())
  })

  it.each([
    ['Alt', { altKey: true }, 'Alt+Tab'],
    ['Meta', { metaKey: true }, 'Mod+Tab'],
  ] as const)('records Tab with %s', (_, flags, expected) => {
    const onRecord = vi.fn()
    recorder({ onRecord })
    expect(tab(flags).defaultPrevented).toBe(true)
    expect(onRecord).toHaveBeenCalledWith(expected, expect.anything())
  })

  it('records Windows AltGr+Tab instead of cancelling', () => {
    const onRecord = vi.fn()
    const onCancel = vi.fn()
    recorder({ platform: 'windows', onRecord, onCancel })
    // Windows reports AltGr as Control+Alt
    keydown({
      key: 'Tab',
      code: 'Tab',
      ctrlKey: true,
      altKey: true,
      altGraph: true,
      target: document,
    })
    expect(onCancel).not.toHaveBeenCalled()
    expect(onRecord).toHaveBeenCalledWith('Mod+Alt+Tab', expect.anything())
  })

  it('cancels on a repeated Tab without preventing it', () => {
    const onCancel = vi.fn()
    recorder({ onRecord: vi.fn(), onCancel })
    expect(tab({ repeat: true }).defaultPrevented).toBe(false)
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it.each([
    ['code', '[Tab]'],
    ['key', 'Tab'],
    ['auto', 'Tab'],
  ] as const)('records Tab by %s with recordTab', (recordBy, expected) => {
    const onRecord = vi.fn()
    const onCancel = vi.fn()
    recorder({ recordTab: true, recordBy, onRecord, onCancel })
    expect(tab().defaultPrevented).toBe(true)
    expect(onRecord).toHaveBeenCalledWith(expected, expect.anything())
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('reads recordTab from setOptions', () => {
    const onRecord = vi.fn()
    const r = recorder({ onRecord })
    r.setOptions({ recordTab: true })
    tab()
    expect(onRecord).toHaveBeenCalledWith('Tab', expect.anything())
  })

  it('does not fire a registered Tab hotkey on the press that cancels', () => {
    const callback = vi.fn()
    HotkeyManager.getInstance().register('Tab', callback, { platform: 'mac' })
    recorder({ onRecord: vi.fn() })
    const event = tab()
    expect(callback).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
    keyup({ key: 'Tab', code: 'Tab', target: document })
    tab()
    expect(callback).toHaveBeenCalledOnce()
  })

  it('leaves recording active when Tab comes from a text field', () => {
    const onCancel = vi.fn()
    const input = document.createElement('input')
    document.body.append(input)
    input.focus()
    const r = recorder({ onRecord: vi.fn(), onCancel })
    keydown({ key: 'Tab', code: 'Tab', cancelable: true, target: input })
    expect(onCancel).not.toHaveBeenCalled()
    expect(r.store.state.isRecording).toBe(true)
  })
})
