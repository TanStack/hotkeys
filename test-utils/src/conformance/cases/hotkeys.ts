import { mod, modUp } from '../keys'
import { defineGroup, registered, spy } from '../suite'
import type { RegisterableHotkey } from '@tanstack/hotkeys'
import type { ConformanceCase } from '../suite'
import type { ConformanceHotkey, HotkeysSpec } from '../types'

const G = { key: 'g', code: 'KeyG' }
const H = { key: 'h', code: 'KeyH' }

const noop = () => {}

function casesFor(form: HotkeysSpec['form']): Array<ConformanceCase> {
  const spec = (...hotkeys: Array<ConformanceHotkey>): HotkeysSpec => ({
    form,
    hotkeys,
  })
  const one = (
    hotkey: RegisterableHotkey | null | undefined,
    callback: ConformanceHotkey['callback'] = noop,
    options?: ConformanceHotkey['options'],
  ): HotkeysSpec => spec({ hotkey, callback, options })

  return [
    {
      title: 'fires its callback for its chord',
      async run({ harness, expect, press }) {
        const callback = spy()
        await harness.mountHotkeys(one('Mod+K', callback))
        await press(mod('k'))
        expect(callback.calls).toHaveLength(1)
        const [event, context] = callback.calls[0]!
        expect(event.type).toBe('keydown')
        expect(context).toMatchObject({ kind: 'chord', hotkey: 'Mod+K' })
      },
    },
    {
      title: 'ignores other keys and extra modifiers',
      async run({ harness, expect, press }) {
        const callback = spy()
        await harness.mountHotkeys(one('Mod+K', callback))
        await press({ key: 'k', code: 'KeyK' })
        await press(mod('j'))
        await press(mod('K', { shiftKey: true }))
        expect(callback.calls).toHaveLength(0)
      },
    },
    {
      title: 'registers once and stops firing after unmount',
      async run({ harness, expect, press }) {
        const callback = spy()
        const view = await harness.mountHotkeys(one('Mod+K', callback))
        expect(registered().map((reg) => reg.hotkey)).toEqual(['Mod+K'])
        await view.unmount()
        expect(registered()).toEqual([])
        await press(mod('k'))
        expect(callback.calls).toHaveLength(0)
      },
    },
    {
      title: 'keeps its registration but stops firing while disabled',
      async run({ harness, expect, press }) {
        const callback = spy()
        const view = await harness.mountHotkeys(
          one('Mod+K', callback, { enabled: false }),
        )
        const [disabled] = registered()
        expect(disabled).toMatchObject({ status: 'disabled' })
        await press(mod('k'))
        expect(callback.calls).toHaveLength(0)
        await view.update(one('Mod+K', callback, { enabled: true }))
        const [enabled] = registered()
        expect(enabled).toMatchObject({ id: disabled!.id, status: 'active' })
        await press(mod('k'))
        expect(callback.calls).toHaveLength(1)
        await view.update(one('Mod+K', callback, { enabled: false }))
        await press(mod('k'))
        expect(callback.calls).toHaveLength(1)
      },
    },
    {
      title: 'moves to a new hotkey string',
      async run({ harness, expect, press }) {
        const callback = spy()
        const view = await harness.mountHotkeys(one('Mod+K', callback))
        await view.update(one('Mod+J', callback))
        expect(registered().map((reg) => reg.hotkey)).toEqual(['Mod+J'])
        await press(mod('k'))
        expect(callback.calls).toHaveLength(0)
        await press(mod('j'))
        expect(callback.calls).toHaveLength(1)
      },
    },
    {
      title: 'switches between a chord and a sequence',
      async run({ harness, expect, press }) {
        const callback = spy()
        const view = await harness.mountHotkeys(one('Mod+K', callback))
        await view.update(one(['G', 'H'], callback))
        expect(registered()).toHaveLength(1)
        expect(registered()[0]).toMatchObject({
          kind: 'sequence',
          hotkey: ['G', 'H'],
        })
        await press(mod('k'))
        expect(callback.calls).toHaveLength(0)
        await press(G)
        await press(H)
        expect(callback.calls).toHaveLength(1)
        await view.update(one('Mod+K', callback))
        expect(registered()[0]).toMatchObject({
          kind: 'chord',
          hotkey: 'Mod+K',
        })
        await press(mod('k'))
        expect(callback.calls).toHaveLength(2)
      },
    },
    {
      title: 'calls the latest callback after it changes',
      // A list is read again on each change, so only single calls need this.
      requires: form === 'single' ? ['callback-identity'] : [],
      async run({ harness, expect, press }) {
        const first = spy()
        const second = spy()
        const view = await harness.mountHotkeys(one('Mod+K', first))
        const [before] = registered()
        await view.update(one('Mod+K', second))
        await press(mod('k'))
        expect([first.calls.length, second.calls.length]).toEqual([0, 1])
        expect(registered()[0]!.id).toBe(before!.id)
      },
    },
    {
      title: 'listens only on its target element',
      requires: ['element-target'],
      async run({ harness, expect, press }) {
        const callback = spy()
        const view = await harness.mountHotkeys(
          one('Mod+K', callback, { target: 'element' }),
        )
        await press(mod('k'))
        expect(callback.calls).toHaveLength(0)
        await press(mod('k', { target: view.element() }))
        expect(callback.calls).toHaveLength(1)
        expect(registered()[0]!.target).toBe(view.element())
      },
    },
    {
      title: 'fires on keyup with eventType keyup',
      async run({ harness, expect, press, release }) {
        const callback = spy()
        await harness.mountHotkeys(
          one('Mod+K', callback, { eventType: 'keyup' }),
        )
        await press(mod('k'))
        expect(callback.calls).toHaveLength(0)
        await release(mod('k'))
        expect(callback.calls).toHaveLength(1)
      },
    },
    {
      title: 'prevents the default action unless preventDefault is false',
      async run({ harness, expect, press }) {
        const view = await harness.mountHotkeys(one('Mod+K'))
        expect((await press(mod('k'))).defaultPrevented).toBe(true)
        await view.update(one('Mod+K', noop, { preventDefault: false }))
        expect((await press(mod('k'))).defaultPrevented).toBe(false)
      },
    },
    {
      title: 'passes meta and scope through to the registration',
      async run({ harness, expect }) {
        await harness.mountHotkeys(
          one('Mod+K', noop, { meta: { name: 'Find' }, scope: 'editor' }),
        )
        expect(registered()[0]!.options).toMatchObject({
          meta: { name: 'Find' },
          scope: 'editor',
        })
      },
    },
    {
      title: 'fires each hotkey of several with its own callback',
      async run({ harness, expect, press }) {
        const k = spy()
        const j = spy()
        await harness.mountHotkeys(
          spec(
            { hotkey: 'Mod+K', callback: k },
            { hotkey: 'Mod+J', callback: j },
          ),
        )
        expect(registered()).toHaveLength(2)
        await press(mod('j'))
        expect([k.calls.length, j.calls.length]).toEqual([0, 1])
        await press(mod('k'))
        expect([k.calls.length, j.calls.length]).toEqual([1, 1])
      },
    },
    {
      title: 'adds and removes hotkeys when the list changes',
      async run({ harness, expect, press }) {
        const k = spy()
        const j = spy()
        const view = await harness.mountHotkeys(
          spec({ hotkey: 'Mod+K', callback: k }),
        )
        await view.update(
          spec(
            { hotkey: 'Mod+K', callback: k },
            { hotkey: 'Mod+J', callback: j },
          ),
        )
        expect(registered().map((reg) => reg.hotkey)).toEqual([
          'Mod+K',
          'Mod+J',
        ])
        await press(mod('j'))
        expect(j.calls).toHaveLength(1)
        await view.update(spec({ hotkey: 'Mod+J', callback: j }))
        expect(registered().map((reg) => reg.hotkey)).toEqual(['Mod+J'])
        await press(mod('k'))
        await press(mod('j'))
        expect([k.calls.length, j.calls.length]).toEqual([0, 2])
        await view.update(spec())
        expect(registered()).toEqual([])
      },
    },
    {
      title: 'fires a sequence after its last step',
      async run({ harness, expect, press }) {
        const callback = spy()
        await harness.mountHotkeys(one(['G', 'H'], callback))
        expect(registered()[0]).toMatchObject({
          kind: 'sequence',
          hotkey: ['G', 'H'],
        })
        await press(G)
        expect(callback.calls).toHaveLength(0)
        await press(H)
        expect(callback.calls).toHaveLength(1)
        expect(callback.calls[0]![1]).toMatchObject({
          kind: 'sequence',
          hotkey: ['G', 'H'],
        })
      },
    },
    {
      title: 'does not fire a sequence for a wrong step',
      async run({ harness, expect, press }) {
        const callback = spy()
        await harness.mountHotkeys(one(['G', 'H'], callback))
        await press(H)
        await press(G)
        await press({ key: 'j', code: 'KeyJ' })
        await press(H)
        expect(callback.calls).toHaveLength(0)
      },
    },
    {
      title: 'passes the sequence timeout through',
      async run({ harness, expect }) {
        await harness.mountHotkeys(one(['G', 'H'], noop, { timeout: 400 }))
        expect(registered()[0]!.options).toMatchObject({ timeout: 400 })
      },
    },
    {
      title: 'registers a one-step sequence as its chord',
      async run({ harness, expect, press }) {
        const callback = spy()
        await harness.mountHotkeys(one(['Mod+K'], callback))
        expect(registered()[0]).toMatchObject({
          kind: 'chord',
          hotkey: 'Mod+K',
        })
        await press(mod('k'))
        expect(callback.calls).toHaveLength(1)
      },
    },
    {
      title: 'fires a chord once per press with requireReset',
      async run({ harness, expect, press, release }) {
        const callback = spy()
        await harness.mountHotkeys(
          one('Mod+K', callback, { requireReset: true }),
        )
        await press(mod('k'))
        await press(mod('k', { repeat: true }))
        expect(callback.calls).toHaveLength(1)
        await release(mod('k'))
        await release(modUp())
        await press(mod('k'))
        expect(callback.calls).toHaveLength(2)
      },
    },
  ]
}

defineGroup({ name: 'single hotkey', cases: casesFor('single') })
defineGroup({
  name: 'hotkey list',
  requires: ['list-form'],
  cases: casesFor('list'),
})

function unsetCasesFor(form: HotkeysSpec['form']): Array<ConformanceCase> {
  const spec = (...hotkeys: Array<ConformanceHotkey>): HotkeysSpec => ({
    form,
    hotkeys,
  })
  return [
    {
      title: 'registers nothing for undefined, null or empty hotkeys',
      async run({ harness, expect, press }) {
        const callback = spy()
        await harness.mountHotkeys(
          spec(
            { hotkey: undefined, callback },
            { hotkey: null, callback },
            { hotkey: '' as RegisterableHotkey, callback },
          ),
        )
        expect(registered()).toEqual([])
        await press(mod('k'))
        expect(callback.calls).toHaveLength(0)
      },
    },
    {
      title:
        'registers once an unset hotkey is set, and unregisters when cleared',
      async run({ harness, expect, press }) {
        const callback = spy()
        const view = await harness.mountHotkeys(
          spec({ hotkey: undefined, callback }),
        )
        await view.update(spec({ hotkey: 'Mod+K', callback }))
        expect(registered().map((reg) => reg.hotkey)).toEqual(['Mod+K'])
        await press(mod('k'))
        expect(callback.calls).toHaveLength(1)
        await view.update(spec({ hotkey: null, callback }))
        expect(registered()).toEqual([])
        await view.update(spec({ hotkey: '' as RegisterableHotkey, callback }))
        expect(registered()).toEqual([])
        await press(mod('k'))
        expect(callback.calls).toHaveLength(1)
      },
    },
    {
      title: 'keeps the defaults for options set to undefined',
      async run({ harness, expect, press }) {
        const callback = spy()
        await harness.mountHotkeys(
          spec({
            hotkey: 'Mod+K',
            callback,
            options: {
              enabled: undefined,
              eventType: undefined,
              preventDefault: undefined,
              requireReset: undefined,
              scope: undefined,
              platform: undefined,
            },
          }),
        )
        expect(registered()[0]).toMatchObject({
          status: 'active',
          options: {
            enabled: true,
            eventType: 'keydown',
            preventDefault: true,
            scope: 'global',
          },
        })
        expect((await press(mod('k'))).defaultPrevented).toBe(true)
        expect(callback.calls).toHaveLength(1)
      },
    },
  ]
}

defineGroup({ name: 'unset values', cases: unsetCasesFor('single') })
defineGroup({
  name: 'unset values in a list',
  requires: ['list-form'],
  cases: unsetCasesFor('list'),
})
