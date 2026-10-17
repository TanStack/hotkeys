import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { HotkeyManager, defineAppHotkeys } from '@tanstack/hotkeys'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { useAppHotkeyList } from '../src/useAppHotkeys'
import { useHotkey } from '../src/useHotkey'
import type { VNodeChild } from 'vue'

const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S' },
  'palette.open': { hotkey: 'Mod+K', scope: 'global' },
})

function press(key: string) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, metaKey: true, bubbles: true }),
  )
  document.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }))
}

/** A component that runs `setup` and renders nothing. */
function child(setup: () => void) {
  return h(
    defineComponent({
      setup() {
        setup()
        return () => null
      },
    }),
  )
}

const save = (onSave: () => void) =>
  child(() => useHotkey(appHotkeys['doc.save'], onSave))
const palette = (onOpen: () => void) =>
  child(() => useHotkey(appHotkeys['palette.open'], onOpen))

function provider(props: Record<string, unknown>, children: () => VNodeChild) {
  return h(HotkeysProvider, props, { default: children })
}

function mountRoot(children: () => VNodeChild) {
  return mount(
    defineComponent({
      setup() {
        return () =>
          provider(
            {
              appHotkeys,
              customHotkeys: { 'doc.save': 'Mod+E' },
              defaultOptions: { hotkey: { platform: 'mac' } },
            },
            children,
          )
      },
    }),
  )
}

describe('HotkeysProvider scopes', () => {
  afterEach(() => {
    HotkeyManager.resetInstance()
  })

  it('inherits app hotkeys, custom hotkeys, and defaults in nested providers', () => {
    const onSave = vi.fn()
    const wrapper = mountRoot(() =>
      provider({ scope: 'editor' }, () => save(onSave)),
    )
    press('e')
    expect(onSave).toHaveBeenCalledTimes(1)
    const [registration] =
      HotkeyManager.getInstance().registrations.state.values()
    expect(registration?.options).toMatchObject({
      scope: 'editor',
      platform: 'mac',
    })
    wrapper.unmount()
  })

  it('registers plain hotkeys in the nearest provider scope', () => {
    const plain = (id: string) =>
      child(() => useHotkey('Mod+P', () => {}, { meta: { name: id } }))
    const wrapper = mountRoot(() => [
      plain('root'),
      provider({ scope: 'page' }, () => [
        plain('page'),
        provider({ defaultOptions: { hotkey: { requireReset: true } } }, () =>
          plain('unscoped'),
        ),
        provider({ scope: 'panel' }, () => plain('panel')),
      ]),
    ])
    expect(
      Object.fromEntries(
        [...HotkeyManager.getInstance().registrations.state.values()].map(
          (r) => [r.options.meta?.name, r.options.scope],
        ),
      ),
    ).toEqual({
      root: 'global',
      page: 'page',
      unscoped: 'page',
      panel: 'panel',
    })
    wrapper.unmount()
  })

  it('lets a nested provider handle a hotkey its ancestor shares', () => {
    const outer = vi.fn()
    const inner = vi.fn()
    const wrapper = mountRoot(() =>
      provider({ scope: 'page' }, () => [
        save(outer),
        provider({ scope: 'panel' }, () => save(inner)),
      ]),
    )
    press('e')
    expect([outer.mock.calls.length, inner.mock.calls.length]).toEqual([0, 1])
    wrapper.unmount()
  })

  it('suspends other scopes while an exclusive provider is mounted', async () => {
    const editorSave = vi.fn()
    const dialogSave = vi.fn()
    const onOpen = vi.fn()
    const open = ref(false)
    const wrapper = mountRoot(() =>
      provider({ scope: 'editor' }, () => [
        save(editorSave),
        palette(onOpen),
        open.value
          ? provider({ scope: 'dialog', exclusive: true }, () =>
              save(dialogSave),
            )
          : null,
      ]),
    )
    const calls = () =>
      [editorSave, dialogSave, onOpen].map((f) => f.mock.calls.length)

    press('e')
    press('k')
    expect(calls()).toEqual([1, 0, 1])

    open.value = true
    await nextTick()
    press('e')
    press('k')
    expect(calls()).toEqual([1, 1, 1])

    open.value = false
    await nextTick()
    press('e')
    expect(calls()).toEqual([2, 1, 1])
    wrapper.unmount()
  })

  it('keeps allowed scopes active and does not reactivate for a new object', async () => {
    const editorSave = vi.fn()
    const onOpen = vi.fn()
    const tick = ref(0)
    // Reading `tick` re-renders the root, which passes a new `exclusive` object.
    const wrapper = mountRoot(() => [
      void tick.value,
      provider({ scope: 'editor' }, () => save(editorSave)),
      palette(onOpen),
      provider(
        { scope: 'dialog', exclusive: { allow: ['global'] } },
        () => null,
      ),
    ])
    const activate = vi.spyOn(HotkeyManager.getInstance(), 'activateScope')
    tick.value++
    await nextTick()
    expect(activate).not.toHaveBeenCalled()

    press('e')
    press('k')
    expect([editorSave, onOpen].map((f) => f.mock.calls.length)).toEqual([0, 1])
    wrapper.unmount()
  })

  it('deactivates nested scopes when an ancestor is disabled', async () => {
    const onSave = vi.fn()
    const enabled = ref(true)
    const wrapper = mountRoot(() =>
      provider({ scope: 'workspace', enabled: enabled.value }, () =>
        provider({ scope: 'editor' }, () => save(onSave)),
      ),
    )
    press('e')
    enabled.value = false
    await nextTick()
    press('e')
    expect(onSave).toHaveBeenCalledTimes(1)
    expect(HotkeyManager.getInstance().isScopeActive('editor')).toBe(false)
    wrapper.unmount()
  })

  it('lists app hotkeys suspended by an exclusive scope', async () => {
    let statuses = () => [] as Array<string>
    const open = ref(false)
    // Defined once, so re-rendering the root does not remount them.
    const Hotkeys = defineComponent({
      setup() {
        useHotkey(appHotkeys['doc.save'], () => {})
        useHotkey(appHotkeys['palette.open'], () => {})
        return () => null
      },
    })
    const List = defineComponent({
      setup() {
        const list = useAppHotkeyList()
        statuses = () => list.value.map((item) => item.status)
        return () => null
      },
    })
    const wrapper = mountRoot(() => [
      h(Hotkeys),
      open.value
        ? provider({ scope: 'dialog', exclusive: true }, () => null)
        : null,
      h(List),
    ])
    expect(statuses()).toEqual(['active', 'active'])
    open.value = true
    await nextTick()
    expect(statuses()).toEqual(['suspended', 'suspended'])
    wrapper.unmount()
  })
})
