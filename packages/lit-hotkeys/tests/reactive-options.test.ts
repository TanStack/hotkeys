import { afterEach, expect, it, vi } from 'vitest'
import { LitElement } from 'lit'
import { HotkeyManager, SequenceManager } from '@tanstack/hotkeys'
import { HotkeyController } from '../src/controllers/hotkey'
import { HotkeySequenceController } from '../src/controllers/hotkey-sequence'
import { HotkeySequenceRecorderController } from '../src/controllers/hotkey-sequence-recorder'
import { HotkeyRecorderController } from '../src/controllers/hotkey-recorder'
class ReactiveHost extends LitElement {
  static properties = { enabled: { type: Boolean } }
  declare enabled: boolean
  constructor() {
    super()
    this.enabled = true
  }
}
customElements.define('reactive-options-host', ReactiveHost)
const press = (key: string) =>
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
afterEach(() => {
  document.body.replaceChildren()
  HotkeyManager.resetInstance()
  SequenceManager.resetInstance()
})
it.each(['hotkey', 'sequence'])(
  'updates a %s enabled getter after the host updates',
  async (kind) => {
    const host = new ReactiveHost(),
      callback = vi.fn()
    const options = {
      get enabled() {
        return host.enabled
      },
    }
    const controller =
      kind === 'hotkey'
        ? new HotkeyController(host, 'A', callback, options)
        : new HotkeySequenceController(host, ['A', 'B'], callback, options)
    host.addController(controller)
    document.body.append(host)
    await host.updateComplete
    const invoke = () => {
      press('a')
      if (kind === 'sequence') press('b')
    }
    invoke()
    expect(callback).toHaveBeenCalledTimes(1)
    host.enabled = false
    host.requestUpdate()
    await host.updateComplete
    invoke()
    expect(callback).toHaveBeenCalledTimes(1)
  },
)
it('reads recorder property getters live', async () => {
  const host = new ReactiveHost(),
    first = vi.fn(),
    second = vi.fn()
  const recorder = new HotkeyRecorderController(host, {
    onRecord() {},
    get onCancel() {
      return host.enabled ? first : second
    },
  })
  document.body.append(host)
  await host.updateComplete
  recorder.startRecording()
  host.enabled = false
  recorder.cancelRecording()
  expect(second).toHaveBeenCalledOnce()
  expect(first).not.toHaveBeenCalled()
})

it.each(['hotkey', 'sequence'] as const)(
  'moves %s listeners when getter targets change and retains handles for option updates',
  async (kind) => {
    const host = new ReactiveHost(),
      callback = vi.fn()
    const first = document.createElement('div'),
      second = document.createElement('div')
    let target: HTMLElement | null = null
    let eventType: 'keydown' | 'keyup' = 'keydown'
    const options = () => ({ target, eventType, enabled: host.enabled })
    const controller =
      kind === 'hotkey'
        ? new HotkeyController(host, 'A', callback, options)
        : new HotkeySequenceController(host, ['A', 'B'], callback, options)
    const registrations =
      kind === 'hotkey'
        ? HotkeyManager.getInstance().registrations
        : SequenceManager.getInstance().registrations
    const invoke = (element: HTMLElement, type = 'keydown') => {
      element.dispatchEvent(
        new KeyboardEvent(type, { key: 'a', bubbles: true }),
      )
      if (kind === 'sequence')
        element.dispatchEvent(
          new KeyboardEvent(type, { key: 'b', bubbles: true }),
        )
    }
    host.addController(controller)
    document.body.append(host)
    await host.updateComplete
    expect(registrations.state.size).toBe(0)
    target = first
    host.requestUpdate()
    await host.updateComplete
    const id = [...registrations.state.keys()][0]
    invoke(first)
    expect(callback).toHaveBeenCalledTimes(1)
    eventType = 'keyup'
    host.requestUpdate()
    await host.updateComplete
    expect([...registrations.state.keys()]).toEqual([id])
    invoke(first)
    expect(callback).toHaveBeenCalledTimes(1)
    invoke(first, 'keyup')
    expect(callback).toHaveBeenCalledTimes(2)
    target = second
    host.requestUpdate()
    await host.updateComplete
    expect([...registrations.state.keys()]).not.toEqual([id])
    invoke(first, 'keyup')
    expect(callback).toHaveBeenCalledTimes(2)
    invoke(second, 'keyup')
    expect(callback).toHaveBeenCalledTimes(3)
    host.remove()
    invoke(second, 'keyup')
    expect(callback).toHaveBeenCalledTimes(3)
    expect(registrations.state.size).toBe(0)
    document.body.append(host)
    await host.updateComplete
    invoke(second, 'keyup')
    expect(callback).toHaveBeenCalledTimes(4)
  },
)
it.each(['single', 'sequence'] as const)(
  'keeps %s recorder getters live after a partial setOptions',
  async (kind) => {
    const host = new ReactiveHost(),
      first = vi.fn(),
      second = vi.fn(),
      record = vi.fn()
    const options = {
      onRecord: record,
      get onCancel() {
        return host.enabled ? first : second
      },
    }
    const recorder =
      kind === 'single'
        ? new HotkeyRecorderController(host, options)
        : new HotkeySequenceRecorderController(host, () => options)
    document.body.append(host)
    await host.updateComplete
    recorder.setOptions({ onRecord: record })
    recorder.startRecording()
    host.enabled = false
    recorder.cancelRecording()
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledOnce()
    recorder.setOptions({ onCancel: first })
    recorder.startRecording()
    recorder.cancelRecording()
    expect(first).toHaveBeenCalledOnce()
    expect(second).toHaveBeenCalledOnce()
  },
)
