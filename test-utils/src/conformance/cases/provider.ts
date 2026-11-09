import { defineAppHotkeys, getHotkeyManager } from '@tanstack/hotkeys'
import { mod } from '../keys'
import { defineGroup, registered, spy } from '../suite'

export const conformanceAppHotkeys = defineAppHotkeys({
  'doc.save': {
    hotkey: 'Mod+S',
    meta: { name: 'Save' },
    options: { preventDefault: false },
  },
  'nav.home': { hotkey: ['G', 'H'], options: { timeout: 400 } },
  'palette.open': { hotkey: null },
})

defineGroup({
  name: 'provider scopes',
  requires: ['provider-scope'],
  cases: [
    {
      title: 'registers hotkeys in the provider scope',
      async run({ harness, expect, press }) {
        const callback = spy()
        await harness.mountHotkeys({
          form: 'single',
          hotkeys: [{ hotkey: 'Mod+K', callback }],
          provider: { scope: 'editor' },
        })
        expect(registered()[0]).toMatchObject({
          status: 'active',
          options: { scope: 'editor' },
        })
        await press(mod('k'))
        expect(callback.calls).toHaveLength(1)
      },
    },
    {
      title: 'suspends its hotkeys while the provider is disabled',
      async run({ harness, expect, press }) {
        const callback = spy()
        const hotkeys = [{ hotkey: 'Mod+K' as const, callback }]
        const view = await harness.mountHotkeys({
          form: 'single',
          hotkeys,
          provider: { scope: 'editor', enabled: false },
        })
        expect(registered()[0]).toMatchObject({ status: 'suspended' })
        await press(mod('k'))
        expect(callback.calls).toHaveLength(0)
        await view.update({ provider: { scope: 'editor', enabled: true } })
        expect(registered()[0]).toMatchObject({ status: 'active' })
        await press(mod('k'))
        expect(callback.calls).toHaveLength(1)
      },
    },
    {
      title: 'suspends its hotkeys when the provider is disabled at runtime',
      async run({ harness, expect, press }) {
        const callback = spy()
        const view = await harness.mountHotkeys({
          form: 'single',
          hotkeys: [{ hotkey: 'Mod+K', callback }],
          provider: { scope: 'editor' },
        })
        await view.update({ provider: { scope: 'editor', enabled: false } })
        expect(registered()[0]).toMatchObject({ status: 'suspended' })
        await press(mod('k'))
        expect(callback.calls).toHaveLength(0)
      },
    },
    {
      title: 'deactivates the scope when the provider unmounts',
      async run({ harness, expect, act }) {
        const view = await harness.mountHotkeys({
          form: 'single',
          hotkeys: [{ hotkey: 'Mod+K', callback: () => {} }],
          provider: { scope: 'editor' },
        })
        expect(getHotkeyManager().isScopeActive('editor')).toBe(true)
        await view.unmount()
        await act(() => {})
        expect(getHotkeyManager().isScopeActive('editor')).toBe(false)
      },
    },
    {
      title: 'an exclusive provider suspends hotkeys in other scopes',
      async run({ harness, expect, press }) {
        const page = spy()
        const dialog = spy()
        await harness.mountHotkeys({
          form: 'single',
          hotkeys: [{ hotkey: 'Mod+K', callback: page }],
        })
        const overlay = await harness.mountHotkeys({
          form: 'single',
          hotkeys: [{ hotkey: 'Mod+J', callback: dialog }],
          provider: { scope: 'dialog', exclusive: true },
        })
        await press(mod('k'))
        await press(mod('j'))
        expect([page.calls.length, dialog.calls.length]).toEqual([0, 1])
        await overlay.unmount()
        await press(mod('k'))
        expect(page.calls).toHaveLength(1)
      },
    },
    {
      title: 'an exclusive provider keeps allowed scopes active',
      async run({ harness, expect, press }) {
        const page = spy()
        await harness.mountHotkeys({
          form: 'single',
          hotkeys: [{ hotkey: 'Mod+K', callback: page }],
        })
        await harness.mountHotkeys({
          form: 'single',
          hotkeys: [{ hotkey: 'Mod+J', callback: () => {} }],
          provider: { scope: 'dialog', exclusive: { allow: ['global'] } },
        })
        await press(mod('k'))
        expect(page.calls).toHaveLength(1)
      },
    },
  ],
})

defineGroup({
  name: 'provider defaults',
  requires: ['provider-defaults'],
  cases: [
    {
      title: 'applies provider hotkey defaults',
      async run({ harness, expect, press }) {
        const callback = spy()
        await harness.mountHotkeys({
          form: 'single',
          hotkeys: [{ hotkey: 'Mod+K', callback }],
          provider: { hotkey: { preventDefault: false, meta: { name: 'P' } } },
        })
        expect(registered()[0]!.options).toMatchObject({
          preventDefault: false,
          meta: { name: 'P' },
        })
        expect((await press(mod('k'))).defaultPrevented).toBe(false)
        expect(callback.calls).toHaveLength(1)
      },
    },
    {
      title: 'follows provider defaults that change at runtime',
      async run({ harness, expect, press }) {
        const callback = spy()
        const view = await harness.mountHotkeys({
          form: 'single',
          hotkeys: [{ hotkey: 'Mod+K', callback }],
          provider: { hotkey: { enabled: true } },
        })
        await view.update({ provider: { hotkey: { enabled: false } } })
        expect(registered()[0]).toMatchObject({ status: 'disabled' })
        await press(mod('k'))
        expect(callback.calls).toHaveLength(0)
        await view.update({ provider: { hotkey: { enabled: true } } })
        await press(mod('k'))
        expect(callback.calls).toHaveLength(1)
      },
    },
    {
      title: 'lets call-site options win over provider defaults',
      async run({ harness, expect, press }) {
        const on = spy()
        const off = spy()
        await harness.mountHotkeys({
          form: 'single',
          hotkeys: [
            { hotkey: 'Mod+K', callback: on, options: { enabled: true } },
            { hotkey: 'Mod+J', callback: off },
          ],
          provider: { hotkey: { enabled: false } },
        })
        await press(mod('k'))
        await press(mod('j'))
        expect([on.calls.length, off.calls.length]).toEqual([1, 0])
      },
    },
    {
      title: 'keeps provider defaults for call-site options set to undefined',
      async run({ harness, expect, press }) {
        const callback = spy()
        await harness.mountHotkeys({
          form: 'single',
          hotkeys: [
            {
              hotkey: 'Mod+K',
              callback,
              options: { enabled: undefined, preventDefault: undefined },
            },
          ],
          provider: { hotkey: { enabled: false, preventDefault: false } },
        })
        expect(registered()[0]!.options).toMatchObject({
          enabled: false,
          preventDefault: false,
        })
        await press(mod('k'))
        expect(callback.calls).toHaveLength(0)
      },
    },
    {
      title: 'matches Mod on the provider platform',
      async run({ harness, expect, press }) {
        const callback = spy()
        await harness.mountHotkeys({
          form: 'single',
          hotkeys: [{ hotkey: 'Mod+K', callback }],
          provider: { platform: 'mac' },
        })
        await press({ key: 'k', code: 'KeyK', ctrlKey: true })
        expect(callback.calls).toHaveLength(0)
        await press({ key: 'k', code: 'KeyK', metaKey: true })
        expect(callback.calls).toHaveLength(1)
      },
    },
  ],
})

defineGroup({
  name: 'app hotkeys',
  requires: ['app-hotkeys'],
  cases: [
    {
      title: 'registers an app hotkey with its declared meta, options and id',
      async run({ harness, expect, press }) {
        const callback = spy()
        await harness.mountHotkeys({
          form: 'single',
          hotkeys: [{ hotkey: conformanceAppHotkeys['doc.save'], callback }],
          provider: { appHotkeys: conformanceAppHotkeys },
        })
        expect(registered()[0]).toMatchObject({
          hotkey: 'Mod+S',
          options: {
            appHotkeyId: 'doc.save',
            meta: { name: 'Save' },
            preventDefault: false,
          },
        })
        await press(mod('s'))
        expect(callback.calls).toHaveLength(1)
      },
    },
    {
      title: 'uses the custom hotkey from the provider',
      async run({ harness, expect, press }) {
        const callback = spy()
        await harness.mountHotkeys({
          form: 'single',
          hotkeys: [{ hotkey: conformanceAppHotkeys['doc.save'], callback }],
          provider: {
            appHotkeys: conformanceAppHotkeys,
            customHotkeys: { 'doc.save': 'Mod+E' },
          },
        })
        await press(mod('s'))
        expect(callback.calls).toHaveLength(0)
        await press(mod('e'))
        expect(callback.calls).toHaveLength(1)
      },
    },
    {
      title: 'registers a sequence app hotkey with its declared options',
      async run({ harness, expect }) {
        await harness.mountHotkeys({
          form: 'single',
          hotkeys: [
            { hotkey: conformanceAppHotkeys['nav.home'], callback: () => {} },
          ],
          provider: { appHotkeys: conformanceAppHotkeys },
        })
        expect(registered()[0]).toMatchObject({
          kind: 'sequence',
          hotkey: ['G', 'H'],
          options: { timeout: 400, appHotkeyId: 'nav.home' },
        })
      },
    },
    {
      title: 'registers nothing while an app hotkey is unbound',
      async run({ harness, expect }) {
        await harness.mountHotkeys({
          form: 'single',
          hotkeys: [
            {
              hotkey: conformanceAppHotkeys['palette.open'],
              callback: () => {},
            },
          ],
          provider: { appHotkeys: conformanceAppHotkeys },
        })
        expect(registered()).toEqual([])
      },
    },
    {
      title: 'moves the registration when the saved custom hotkeys change',
      async run({ harness, expect, press }) {
        const callback = spy()
        const hotkeys = [
          { hotkey: conformanceAppHotkeys['doc.save'], callback },
        ]
        const view = await harness.mountHotkeys({
          form: 'single',
          hotkeys,
          provider: { appHotkeys: conformanceAppHotkeys },
        })
        await view.update({
          provider: {
            appHotkeys: conformanceAppHotkeys,
            customHotkeys: { 'doc.save': 'Mod+E' },
          },
        })
        expect(registered().map((reg) => reg.hotkey)).toEqual(['Mod+E'])
        await press(mod('e'))
        expect(callback.calls).toHaveLength(1)
      },
    },
  ],
})
