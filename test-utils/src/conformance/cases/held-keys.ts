import { getKeyStateTracker } from '@tanstack/hotkeys'
import { defineGroup } from '../suite'
import type { IndividualKey } from '@tanstack/hotkeys'

const SHIFT = { key: 'Shift', code: 'ShiftLeft', shiftKey: true }
const SHIFT_UP = { key: 'Shift', code: 'ShiftLeft' }
const CONTROL = { key: 'Control', code: 'ControlLeft', ctrlKey: true }
const CONTROL_UP = { key: 'Control', code: 'ControlLeft' }

const modifierCases = (
  [
    ['Control', 'ControlLeft'],
    ['Alt', 'AltLeft'],
    ['Shift', 'ShiftLeft'],
    ['Meta', 'MetaLeft'],
  ] as const
).map(([key, code]) => ({
  title: `adds and removes the ${key} modifier`,
  run: async ({ harness, expect, press, release }) => {
    const view = await harness.mountHeldKeys('Shift')
    await press({ key, code })
    expect(view.keys()).toEqual([key])
    expect(view.codes()).toEqual({ [key]: code })
    await release({ key, code })
    expect(view.keys()).toEqual([])
  },
})) satisfies Parameters<typeof defineGroup>[0]['cases']

defineGroup({
  name: 'held keys',
  cases: [
    {
      title: 'starts with no held keys',
      async run({ harness, expect }) {
        const view = await harness.mountHeldKeys('Shift')
        expect(view.keys()).toEqual([])
        expect(view.codes()).toEqual({})
      },
    },
    {
      title: 'lists a key while it is held and drops it on release',
      async run({ harness, expect, press, release }) {
        const view = await harness.mountHeldKeys('Shift')
        await press({ key: 'a', code: 'KeyA' })
        expect(view.keys()).toEqual(['A'])
        expect(view.codes()).toEqual({ A: 'KeyA' })
        await release({ key: 'a', code: 'KeyA' })
        expect(view.keys()).toEqual([])
        expect(view.codes()).toEqual({})
      },
    },
    {
      title: 'lists the keys of a combination in press order',
      async run({ harness, expect, press, release }) {
        const view = await harness.mountHeldKeys('Shift')
        const S = { key: 'S', code: 'KeyS', ctrlKey: true, shiftKey: true }
        await press(CONTROL)
        await press({ ...SHIFT, ctrlKey: true })
        await press(S)
        expect(view.keys()).toEqual(['Control', 'Shift', 'S'])
        await release(S)
        expect(view.keys()).toEqual(['Control', 'Shift'])
        await release({ ...SHIFT_UP, ctrlKey: true })
        expect(view.keys()).toEqual(['Control'])
        await release(CONTROL_UP)
        expect(view.keys()).toEqual([])
      },
    },
    ...modifierCases,
    {
      title: 'maps each held key to its physical code',
      async run({ harness, expect, press }) {
        const view = await harness.mountHeldKeys('Shift')
        await press({ key: 'Shift', code: 'ShiftRight', shiftKey: true })
        await press({ key: 'A', code: 'KeyA', shiftKey: true })
        expect(view.codes()).toEqual({ Shift: 'ShiftRight', A: 'KeyA' })
      },
    },
    {
      title: 'names a key by event.key, not its physical code',
      async run({ harness, expect, press }) {
        const view = await harness.mountHeldKeys('Shift')
        // AZERTY: the key labeled Q sits where QWERTY has A.
        await press({ key: 'q', code: 'KeyA' })
        expect(view.keys()).toEqual(['Q'])
        expect(view.codes()).toEqual({ Q: 'KeyA' })
      },
    },
    {
      title:
        'keeps a modifier held until both of its physical keys are released',
      async run({ harness, expect, press, release }) {
        const view = await harness.mountHeldKeys('Shift')
        await press(SHIFT)
        await press({ key: 'Shift', code: 'ShiftRight', shiftKey: true })
        expect(view.keys()).toEqual(['Shift'])
        await release({ key: 'Shift', code: 'ShiftLeft', shiftKey: true })
        expect(view.keys()).toEqual(['Shift'])
        expect(view.codes()).toEqual({ Shift: 'ShiftRight' })
        await release({ key: 'Shift', code: 'ShiftRight' })
        expect(view.keys()).toEqual([])
      },
    },
    {
      title: 'lists a repeated key once',
      async run({ harness, expect, press }) {
        const view = await harness.mountHeldKeys('Shift')
        await press({ key: 'a', code: 'KeyA' })
        await press({ key: 'a', code: 'KeyA', repeat: true })
        expect(view.keys()).toEqual(['A'])
      },
    },
    {
      title: 'clears every held key when the window loses focus',
      async run({ harness, expect, press, blurWindow }) {
        const view = await harness.mountHeldKeys('Shift')
        await press(CONTROL)
        await press({ key: 'a', code: 'KeyA', ctrlKey: true })
        await blurWindow()
        expect(view.keys()).toEqual([])
        expect(view.codes()).toEqual({})
      },
    },
    {
      // issues/bugs/BUG-065-modifier-release-clears-held-letters.md
      title: 'keeps a held letter when a modifier is tapped',
      bug: 'BUG-065',
      async run({ harness, expect, press, release }) {
        const view = await harness.mountHeldKeys('Shift')
        await press({ key: 'w', code: 'KeyW' })
        await press(SHIFT)
        await release(SHIFT_UP)
        expect(view.keys()).toEqual(['W'])
      },
    },
  ],
})

defineGroup({
  name: 'key hold',
  cases: [
    {
      title: 'is true only while a named key is held',
      async run({ harness, expect, press, release }) {
        const view = await harness.mountHeldKeys('Shift')
        expect(view.held()).toBe(false)
        await press(SHIFT)
        expect(view.held()).toBe(true)
        await release(SHIFT_UP)
        expect(view.held()).toBe(false)
      },
    },
    {
      title: 'is true for a letter pressed with or without Shift',
      async run({ harness, expect, press, release }) {
        const view = await harness.mountHeldKeys('A')
        await press({ key: 'a', code: 'KeyA' })
        expect(view.held()).toBe(true)
        await release({ key: 'a', code: 'KeyA' })
        expect(view.held()).toBe(false)
        await press(SHIFT)
        await press({ key: 'A', code: 'KeyA', shiftKey: true })
        expect(view.held()).toBe(true)
      },
    },
    {
      // issues/bugs/BUG-067-key-hold-case-rules-differ-across-adapters.md
      title: 'folds the case of a letter like core isKeyHeld',
      async run({ harness, expect, press }) {
        const view = await harness.mountHeldKeys('a' as IndividualKey)
        await press({ key: 'A', code: 'KeyA', shiftKey: true })
        expect(getKeyStateTracker().isKeyHeld('a')).toBe(true)
        expect(view.held()).toBe(true)
      },
    },
    {
      // issues/bugs/BUG-067-key-hold-case-rules-differ-across-adapters.md
      title: 'matches named keys case-sensitively like core isKeyHeld',
      async run({ harness, expect, press }) {
        const view = await harness.mountHeldKeys('escape' as IndividualKey)
        await press({ key: 'Escape', code: 'Escape' })
        expect(getKeyStateTracker().isKeyHeld('escape')).toBe(false)
        expect(view.held()).toBe(false)
      },
    },
    {
      title: 'tracks the space bar as Space',
      async run({ harness, expect, press }) {
        const view = await harness.mountHeldKeys('Space')
        await press({ key: ' ', code: 'Space' })
        expect(view.held()).toBe(true)
      },
    },
    {
      title: 'follows event.key, not the physical code',
      async run({ harness, expect, press }) {
        const view = await harness.mountHeldKeys('Q')
        await press({ key: 'q', code: 'KeyA' })
        expect(view.held()).toBe(true)
        await view.setKey('A')
        expect(view.held()).toBe(false)
        await view.setKey('KeyA' as IndividualKey)
        expect(view.held()).toBe(false)
      },
    },
    {
      title: 'reads a key that was already held when it mounts',
      async run({ harness, expect, press }) {
        getKeyStateTracker()
        await press(SHIFT)
        const view = await harness.mountHeldKeys('Shift')
        expect(view.held()).toBe(true)
        expect(view.keys()).toEqual(['Shift'])
      },
    },
  ],
})

defineGroup({
  name: 'held keys lifecycle',
  cases: [
    {
      title: 'unsubscribes from the key state tracker on unmount',
      async run({ harness, expect, trackSubscriptions }) {
        const active = trackSubscriptions(getKeyStateTracker().store)
        const view = await harness.mountHeldKeys('Shift')
        expect(active()).toBeGreaterThan(0)
        await view.unmount()
        expect(active()).toBe(0)
      },
    },
    {
      title: 'does not add subscriptions when remounted',
      async run({ harness, expect, press, trackSubscriptions }) {
        const active = trackSubscriptions(getKeyStateTracker().store)
        const first = await harness.mountHeldKeys('Shift')
        const mounted = active()
        await first.unmount()
        const second = await harness.mountHeldKeys('Shift')
        expect(active()).toBe(mounted)
        await press(SHIFT)
        expect(second.held()).toBe(true)
      },
    },
    {
      title: 'does not add subscriptions when the watched key changes',
      async run({ harness, expect, trackSubscriptions }) {
        const active = trackSubscriptions(getKeyStateTracker().store)
        const view = await harness.mountHeldKeys('Shift')
        const mounted = active()
        await view.setKey('Control')
        await view.setKey('Alt')
        await view.setKey('Shift')
        expect(active()).toBe(mounted)
        await view.unmount()
        expect(active()).toBe(0)
      },
    },
  ],
})

defineGroup({
  name: 'held keys reactivity',
  cases: [
    {
      title: 'updates the rendered output as keys change',
      async run({ harness, expect, press, release }) {
        const view = await harness.mountHeldKeys('Control')
        await press(CONTROL)
        expect(view.keys()).toEqual(['Control'])
        expect(view.held()).toBe(true)
        await release(CONTROL_UP)
        expect(view.keys()).toEqual([])
        expect(view.held()).toBe(false)
      },
    },
    {
      title: 'switches the tracked key when the watched key changes',
      async run({ harness, expect, press, release }) {
        const view = await harness.mountHeldKeys('Shift')
        await press(SHIFT)
        expect(view.held()).toBe(true)
        await view.setKey('Control')
        expect(view.held()).toBe(false)
        await press({ ...CONTROL, shiftKey: true })
        expect(view.held()).toBe(true)
        await view.setKey('Shift')
        expect(view.held()).toBe(true)
        await release({ ...SHIFT_UP, ctrlKey: true })
        expect(view.held()).toBe(false)
      },
    },
  ],
})
