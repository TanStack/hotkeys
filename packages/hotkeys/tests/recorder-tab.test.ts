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
function press(key: string, code: string, flags: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    code,
    bubbles: true,
    cancelable: true,
    ...flags,
  })
  document.dispatchEvent(event)
  return event
}
const tab = (flags: KeyboardEventInit = {}) => press('Tab', 'Tab', flags)

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
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', bubbles: true }),
    )
    expect(listener).toHaveBeenCalledOnce()
  })

  it('cancels a multi-step recording that already has steps', () => {
    const onRecord = vi.fn()
    const onCancel = vi.fn()
    const r = recorder({ maxSteps: Infinity, onRecord, onCancel })
    press('g', 'KeyG')
    expect(r.store.state.steps).toEqual(['[KeyG]'])
    tab()
    expect(onRecord).not.toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalledOnce()
    expect(r.store.state.steps).toEqual([])
  })

  it('records Tab with Control', () => {
    const onRecord = vi.fn()
    recorder({ onRecord })
    expect(tab({ ctrlKey: true }).defaultPrevented).toBe(true)
    expect(onRecord).toHaveBeenCalledWith('Control+[Tab]')
  })

  it.each([
    ['code', '[Tab]'],
    ['key', 'Tab'],
  ] as const)('records Tab by %s with recordTab', (recordBy, expected) => {
    const onRecord = vi.fn()
    const onCancel = vi.fn()
    recorder({ recordTab: true, recordBy, onRecord, onCancel })
    expect(tab().defaultPrevented).toBe(true)
    expect(onRecord).toHaveBeenCalledWith(expected)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('reads recordTab from setOptions', () => {
    const onRecord = vi.fn()
    const r = recorder({ onRecord })
    r.setOptions({ recordTab: true })
    tab()
    expect(onRecord).toHaveBeenCalledWith('[Tab]')
  })

  it('does not fire a registered Tab hotkey on the press that cancels', () => {
    const callback = vi.fn()
    HotkeyManager.getInstance().register('Tab', callback, { platform: 'mac' })
    recorder({ onRecord: vi.fn() })
    const event = tab()
    expect(callback).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
    document.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'Tab', code: 'Tab', bubbles: true }),
    )
    tab()
    expect(callback).toHaveBeenCalledOnce()
  })

  it('leaves recording active when Tab comes from a text field', () => {
    const onCancel = vi.fn()
    const input = document.createElement('input')
    document.body.append(input)
    input.focus()
    const r = recorder({ onRecord: vi.fn(), onCancel })
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        bubbles: true,
        cancelable: true,
      }),
    )
    expect(onCancel).not.toHaveBeenCalled()
    expect(r.store.state.isRecording).toBe(true)
  })
})
