import { getHotkeyManager } from '@tanstack/hotkeys'
import { defineGroup } from '../suite'
import type { RegisterableHotkey } from '@tanstack/hotkeys'
import type {
  ConformanceHarness,
  ConformanceHotkeyOptions,
  HotkeysHandle,
} from '../types'

const noop = () => {}

function mountOne(
  harness: ConformanceHarness,
  hotkey: RegisterableHotkey,
  options: ConformanceHotkeyOptions = {},
): Promise<HotkeysHandle> {
  return Promise.resolve(
    harness.mountHotkeys({
      form: 'single',
      hotkeys: [{ hotkey, callback: noop, options }],
    }),
  )
}

defineGroup({
  name: 'hotkey registrations',
  cases: [
    {
      title: 'starts empty',
      async run({ harness, expect }) {
        const view = await harness.mountRegistrations()
        expect(view.list()).toEqual([])
        expect(view.rendered()).toBe(0)
      },
    },
    {
      title: 'lists a hotkey while its component is mounted',
      async run({ harness, expect }) {
        const view = await harness.mountRegistrations()
        const hotkey = await mountOne(harness, 'Mod+K')
        expect(view.list().map((reg) => reg.hotkey)).toEqual(['Mod+K'])
        expect(view.rendered()).toBe(1)
        await hotkey.unmount()
        expect(view.list()).toEqual([])
        expect(view.rendered()).toBe(0)
      },
    },
    {
      title: 'reflects registrations added and removed on the manager',
      async run({ harness, expect, act }) {
        const view = await harness.mountRegistrations()
        const manager = getHotkeyManager()
        let first: ReturnType<typeof manager.register> | undefined
        await act(() => {
          first = manager.register('Mod+S', noop)
          manager.register('Escape', noop)
        })
        expect(view.list().map((reg) => reg.hotkey)).toEqual([
          'Mod+S',
          'Escape',
        ])
        await act(() => first!.unregister())
        expect(view.list().map((reg) => reg.hotkey)).toEqual(['Escape'])
      },
    },
    {
      title: 'shows the options a hotkey was registered with',
      async run({ harness, expect }) {
        const view = await harness.mountRegistrations()
        await mountOne(harness, 'Mod+S', { meta: { name: 'Save' } })
        expect(view.list()[0]!.options).toMatchObject({
          enabled: true,
          meta: { name: 'Save' },
        })
      },
    },
    {
      title: 'does not expose callbacks',
      async run({ harness, expect }) {
        const view = await harness.mountRegistrations()
        await mountOne(harness, 'Mod+S')
        expect(view.list()[0]).not.toHaveProperty('callback')
        expect(view.list()[0]!.options).not.toHaveProperty('callback')
      },
    },
    {
      title: 'updates when a hotkey is disabled and enabled again',
      async run({ harness, expect }) {
        const view = await harness.mountRegistrations()
        const hotkey = await mountOne(harness, 'Mod+S', { enabled: true })
        expect(view.list()[0]).toMatchObject({ status: 'active' })
        await hotkey.update({
          hotkeys: [
            { hotkey: 'Mod+S', callback: noop, options: { enabled: false } },
          ],
        })
        expect(view.list()).toHaveLength(1)
        expect(view.list()[0]).toMatchObject({
          options: { enabled: false },
          status: 'disabled',
        })
        await hotkey.update({
          hotkeys: [
            { hotkey: 'Mod+S', callback: noop, options: { enabled: true } },
          ],
        })
        expect(view.list()[0]).toMatchObject({
          options: { enabled: true },
          status: 'active',
        })
      },
    },
    {
      title: 'updates when the hotkey string changes',
      async run({ harness, expect }) {
        const view = await harness.mountRegistrations()
        const hotkey = await mountOne(harness, 'Mod+S')
        await hotkey.update({ hotkeys: [{ hotkey: 'Mod+J', callback: noop }] })
        expect(view.list().map((reg) => reg.hotkey)).toEqual(['Mod+J'])
        expect(view.rendered()).toBe(1)
      },
    },
    {
      title: 'shows the scope of a registration and whether it can fire',
      async run({ harness, expect, act }) {
        const view = await harness.mountRegistrations()
        const manager = getHotkeyManager()
        await act(() => manager.register('Escape', noop, { scope: 'dialog' }))
        expect(view.list()[0]).toMatchObject({
          options: { scope: 'dialog' },
          status: 'suspended',
        })
        let release = () => {}
        await act(() => (release = manager.activateScope('dialog')))
        expect(view.list()[0]).toMatchObject({ status: 'active' })
        await act(() => release())
        expect(view.list()[0]).toMatchObject({ status: 'suspended' })
      },
    },
    {
      title: 'lists sequences with their steps and progress',
      async run({ harness, expect, press }) {
        const view = await harness.mountRegistrations()
        await mountOne(harness, ['G', 'H'])
        expect(view.list()[0]).toMatchObject({
          kind: 'sequence',
          hotkey: ['G', 'H'],
          matchedStepCount: 0,
        })
        await press({ key: 'g', code: 'KeyG' })
        expect(view.list()[0]).toMatchObject({ matchedStepCount: 1 })
      },
    },
    {
      title: 'unsubscribes from the registry on unmount',
      async run({ harness, expect, trackSubscriptions }) {
        const active = trackSubscriptions(getHotkeyManager().registrations)
        const view = await harness.mountRegistrations()
        expect(active()).toBeGreaterThan(0)
        await view.unmount()
        expect(active()).toBe(0)
      },
    },
    {
      title: 'does not add subscriptions when remounted',
      async run({ harness, expect, act, trackSubscriptions }) {
        const active = trackSubscriptions(getHotkeyManager().registrations)
        const first = await harness.mountRegistrations()
        const mounted = active()
        await first.unmount()
        const second = await harness.mountRegistrations()
        expect(active()).toBe(mounted)
        await act(() => getHotkeyManager().register('Escape', noop))
        expect(second.rendered()).toBe(1)
      },
    },
  ],
})
