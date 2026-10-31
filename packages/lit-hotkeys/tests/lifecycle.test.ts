import { afterEach, expect, it, vi } from 'vitest'
import { LitElement } from 'lit'
import {
  HotkeyManager,
  KeyStateTracker,
  defineAppHotkeys,
  getHotkeyManager,
  getKeyStateTracker,
  provideAppHotkeys,
} from '@tanstack/hotkeys'
import { AppHotkeysController } from '../src/controllers/app-hotkeys'
import { HeldKeyCodesController } from '../src/controllers/held-key-codes'
import { HeldKeysController } from '../src/controllers/held-keys'
import { HotkeyController } from '../src/controllers/hotkey'
import { HotkeyHintController } from '../src/controllers/hotkey-hint'
import { HotkeyRecorderController } from '../src/controllers/hotkey-recorder'
import { HotkeyRegistrationsController } from '../src/controllers/hotkey-registrations'
import { HotkeyScopesStateController } from '../src/controllers/hotkey-scopes-state'
import { KeyHoldController } from '../src/controllers/key-hold'
import type { ReactiveController } from 'lit'

class HeldHost extends LitElement {
  hold = new KeyHoldController(this, 'Shift')
  heldKeys = new HeldKeysController(this)
  heldKeyCodes = new HeldKeyCodesController(this)
}
customElements.define('lifecycle-held-host', HeldHost)

class FieldHost extends LitElement {
  calls = 0
  save = new HotkeyController(this, 'K', () => this.calls++)
}
customElements.define('lifecycle-field-host', FieldHost)

class PlainHost extends LitElement {}
customElements.define('lifecycle-plain-host', PlainHost)

const press = (key: string, code: string) =>
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, code, bubbles: true }),
  )
const registrations = () =>
  Array.from(getHotkeyManager().registrations.state.values()).map(
    (registration) => registration.hotkey,
  )

afterEach(() => {
  document.body.replaceChildren()
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})

it('reads keys already held when the host connects and after it moves', async () => {
  getKeyStateTracker()
  press('Shift', 'ShiftLeft')
  const host = new HeldHost()
  document.body.append(host)
  await host.updateComplete
  const read = () => ({
    hold: host.hold.value,
    heldKeys: host.heldKeys.value,
    heldKeyCodes: host.heldKeyCodes.value,
  })
  const expected = {
    hold: true,
    heldKeys: ['Shift'],
    heldKeyCodes: { Shift: 'ShiftLeft' },
  }
  expect(read()).toEqual(expected)

  const parent = document.createElement('div')
  document.body.append(parent)
  parent.append(host)
  expect(read()).toEqual(expected)
})

it('registers a HotkeyController declared as a class field', async () => {
  const host = new FieldHost()
  document.body.append(host)
  await host.updateComplete
  expect(registrations()).toEqual(['K'])
  press('k', 'KeyK')
  expect(host.calls).toBe(1)
  host.remove()
  expect(registrations()).toEqual([])
})

it('ignores an extra addController for a HotkeyController on a connected host', async () => {
  const host = new PlainHost()
  document.body.append(host)
  await host.updateComplete
  const callback = vi.fn()
  // Created after connect: the constructor connects it, then the extra add.
  host.addController(new HotkeyController(host, 'K', callback))
  expect(registrations()).toEqual(['K'])
  press('k', 'KeyK')
  expect(callback).toHaveBeenCalledOnce()

  host.remove()
  expect(registrations()).toEqual([])
  // A leaked app hotkeys subscription would register K again here.
  getHotkeyManager().appHotkeys.setState(() => null)
  expect(registrations()).toEqual([])
})

const readControllers: Array<
  [string, (host: LitElement) => ReactiveController, () => void]
> = [
  ['KeyHoldController', (h) => new KeyHoldController(h, 'Shift'), pressShift],
  ['HeldKeysController', (h) => new HeldKeysController(h), pressShift],
  ['HeldKeyCodesController', (h) => new HeldKeyCodesController(h), pressShift],
  [
    'HotkeyHintController',
    (h) => new HotkeyHintController(h, 'Shift+K'),
    () => {
      getHotkeyManager().register('Shift+K', () => {})
      pressShift()
    },
  ],
  [
    'HotkeyRegistrationsController',
    (h) => new HotkeyRegistrationsController(h),
    () => getHotkeyManager().register('K', () => {}),
  ],
  [
    'HotkeyScopesStateController',
    (h) => new HotkeyScopesStateController(h),
    () => getHotkeyManager().activateScope('modal'),
  ],
  [
    'AppHotkeysController',
    (h) => new AppHotkeysController(h),
    () => provideAppHotkeys(defineAppHotkeys({ save: { hotkey: 'K' } })),
  ],
  [
    'HotkeyRecorderController',
    (h) => {
      const recorder = new HotkeyRecorderController(h, { onRecord() {} })
      afterRemove = () => recorder.startRecording()
      return recorder
    },
    () => afterRemove(),
  ],
]
let afterRemove = () => {}

function pressShift() {
  press('Shift', 'ShiftLeft')
}

it.each(readControllers)(
  '%s ignores an extra addController on a connected host',
  async (_name, create, change) => {
    const host = new PlainHost()
    document.body.append(host)
    await host.updateComplete
    host.addController(create(host))
    host.remove()
    const requestUpdate = vi.spyOn(host, 'requestUpdate')
    change()
    expect(requestUpdate).not.toHaveBeenCalled()
  },
)
