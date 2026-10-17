import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  HotkeyManager,
  toHotkeyRegistrationView,
} from '../src/hotkey-manager'
import {
  AppHotkeysStore,
  defineAppHotkeys,
  getAppHotkeyRegistrationOptions,
} from '../src/app-hotkeys'
import {
  activateHotkeysProviderScope,
  getHotkeysProviderScopeKey,
  mergeHotkeysProviderDefaults,
} from '../src/adapter'

function press(target: EventTarget = document.body, key = 's', code = 'KeyS') {
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      code,
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    }),
  )
  target.dispatchEvent(
    new KeyboardEvent('keyup', { key, code, bubbles: true, cancelable: true }),
  )
}

const options = { platform: 'windows' as const }

describe('hotkey scopes', () => {
  afterEach(() => {
    HotkeyManager.resetInstance()
    vi.restoreAllMocks()
  })

  it('fires scoped hotkeys only while their scope is active', () => {
    const manager = HotkeyManager.getInstance()
    const save = vi.fn()
    manager.register('Control+S', save, { ...options, scope: 'editor' })

    press()
    expect(save).not.toHaveBeenCalled()

    const release = manager.activateScope('editor')
    press()
    expect(save).toHaveBeenCalledTimes(1)

    release()
    press()
    expect(save).toHaveBeenCalledTimes(1)
  })

  it('keeps a scope active until every activation is released', () => {
    const manager = HotkeyManager.getInstance()
    const first = manager.activateScope('editor')
    const second = manager.activateScope('editor')
    first()
    first()
    expect(manager.isScopeActive('editor')).toBe(true)
    second()
    expect(manager.isScopeActive('editor')).toBe(false)
  })

  it('lets the most recently activated scope handle a shared hotkey', () => {
    const manager = HotkeyManager.getInstance()
    const global = vi.fn()
    const editor = vi.fn()
    manager.register('Control+S', global, options)
    manager.register('Control+S', editor, { ...options, scope: 'editor' })

    press()
    expect([global.mock.calls.length, editor.mock.calls.length]).toEqual([1, 0])

    const release = manager.activateScope('editor')
    press()
    expect([global.mock.calls.length, editor.mock.calls.length]).toEqual([1, 1])

    release()
    press()
    expect([global.mock.calls.length, editor.mock.calls.length]).toEqual([2, 1])
  })

  it('lets a nested scope beat its ancestors even when activated first', () => {
    const manager = HotkeyManager.getInstance()
    const page = vi.fn()
    const panel = vi.fn()
    manager.register('Control+S', page, { ...options, scope: 'page' })
    manager.register('Control+S', panel, { ...options, scope: 'panel' })

    // Effects run child-first, so the nested scope activates before its parent.
    manager.activateScope('panel', { parent: 'page' })
    manager.activateScope('page')
    expect(manager.scopes.state.active).toEqual(['page', 'panel'])
    press()
    expect([page.mock.calls.length, panel.mock.calls.length]).toEqual([0, 1])
  })

  it('lets a newer scope in another branch beat an older nested scope', () => {
    const manager = HotkeyManager.getInstance()
    const dialog = vi.fn()
    const panel = vi.fn()
    manager.register('Control+S', dialog, { ...options, scope: 'dialog' })
    manager.register('Control+S', panel, { ...options, scope: 'panel' })
    manager.activateScope('page')
    manager.activateScope('dialog', { parent: 'page' })
    manager.activateScope('panel')
    expect(manager.scopes.state.active).toEqual(['page', 'dialog', 'panel'])
    press()
    expect([dialog.mock.calls.length, panel.mock.calls.length]).toEqual([0, 1])
  })

  it('suspends every other scope while an exclusive scope is active', () => {
    const manager = HotkeyManager.getInstance()
    const global = vi.fn()
    const editor = vi.fn()
    const dialog = vi.fn()
    const escape = vi.fn()
    manager.register('Control+S', global, options)
    manager.register('Control+S', editor, { ...options, scope: 'editor' })
    manager.register('Control+S', dialog, { ...options, scope: 'dialog' })
    manager.register('Control+K', escape, options)

    manager.activateScope('editor')
    const close = manager.activateScope('dialog', { exclusive: true })
    expect(manager.scopes.state).toEqual({
      active: ['editor', 'dialog'],
      exclusive: 'dialog',
      allowed: [],
      suspended: ['global', 'editor'],
    })
    press()
    press(document.body, 'k', 'KeyK')
    expect(dialog).toHaveBeenCalledTimes(1)
    expect(editor).not.toHaveBeenCalled()
    expect(global).not.toHaveBeenCalled()
    expect(escape).not.toHaveBeenCalled()

    close()
    press()
    expect(editor).toHaveBeenCalledTimes(1)
    expect(dialog).toHaveBeenCalledTimes(1)
  })

  it('keeps scopes nested in the exclusive scope active', () => {
    const manager = HotkeyManager.getInstance()
    const tab = vi.fn()
    manager.register('Control+S', tab, { ...options, scope: 'tab' })
    manager.activateScope('tab', { parent: 'dialog' })
    manager.activateScope('dialog', { exclusive: true })
    press()
    expect(tab).toHaveBeenCalledTimes(1)
  })

  it('keeps allowed scopes active while exclusive', () => {
    const manager = HotkeyManager.getInstance()
    const global = vi.fn()
    const palette = vi.fn()
    const editor = vi.fn()
    manager.register('Control+K', global, options)
    manager.register('Control+P', palette, { ...options, scope: 'palette' })
    manager.register('Control+S', editor, { ...options, scope: 'editor' })
    manager.activateScope('palette')
    manager.activateScope('editor')
    manager.activateScope('dialog', {
      exclusive: { allow: ['global', 'palette', 'unmounted'] },
    })
    expect(manager.scopes.state).toMatchObject({
      allowed: ['global', 'palette'],
      suspended: ['editor'],
    })
    expect(manager.isScopeActive('unmounted')).toBe(false)

    press(document.body, 'k', 'KeyK')
    press(document.body, 'p', 'KeyP')
    press()
    expect([global, palette, editor].map((f) => f.mock.calls.length)).toEqual([
      1, 1, 0,
    ])
  })

  it('lets a scope opened over the exclusive scope handle shared hotkeys', () => {
    const manager = HotkeyManager.getInstance()
    const dialog = vi.fn()
    const popover = vi.fn()
    manager.register('Control+S', dialog, { ...options, scope: 'dialog' })
    manager.register('Control+S', popover, { ...options, scope: 'popover' })
    manager.activateScope('dialog', { exclusive: { allow: ['popover'] } })
    const close = manager.activateScope('popover')
    press()
    expect([dialog.mock.calls.length, popover.mock.calls.length]).toEqual([
      0, 1,
    ])
    close()
    press()
    expect([dialog.mock.calls.length, popover.mock.calls.length]).toEqual([
      1, 1,
    ])
  })

  it('applies only the newest exclusive scope allow list', () => {
    const manager = HotkeyManager.getInstance()
    manager.activateScope('settings', { exclusive: { allow: ['global'] } })
    manager.activateScope('confirm', { exclusive: true })
    expect(manager.isScopeActive('global')).toBe(false)
    expect(manager.isScopeActive('settings')).toBe(false)
  })

  it('gives the most recent exclusive scope the keyboard', () => {
    const manager = HotkeyManager.getInstance()
    const first = vi.fn()
    const second = vi.fn()
    manager.register('Control+S', first, { ...options, scope: 'first' })
    manager.register('Control+S', second, { ...options, scope: 'second' })

    manager.activateScope('first', { exclusive: true })
    const closeSecond = manager.activateScope('second', { exclusive: true })
    press()
    expect([first.mock.calls.length, second.mock.calls.length]).toEqual([0, 1])

    closeSecond()
    press()
    expect([first.mock.calls.length, second.mock.calls.length]).toEqual([1, 1])
  })

  it('warns when the same exclusive scope is activated twice', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const manager = HotkeyManager.getInstance()
    manager.activateScope('dialog', { exclusive: true })
    manager.activateScope('dialog', { exclusive: true })
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('suspends sequences outside the active scope', () => {
    const manager = HotkeyManager.getInstance()
    const top = vi.fn()
    manager.register(['G', 'G'], top, { ...options, scope: 'list' })
    const tap = () => {
      document.body.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'g', code: 'KeyG', bubbles: true }),
      )
      document.body.dispatchEvent(
        new KeyboardEvent('keyup', { key: 'g', code: 'KeyG', bubbles: true }),
      )
    }
    tap()
    tap()
    expect(top).not.toHaveBeenCalled()
    manager.activateScope('list')
    tap()
    tap()
    expect(top).toHaveBeenCalledTimes(1)
  })

  it('does not warn about the same hotkey in different scopes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const manager = HotkeyManager.getInstance()
    manager.register('Control+S', () => {}, options)
    manager.register('Control+S', () => {}, { ...options, scope: 'dialog' })
    expect(warn).not.toHaveBeenCalled()
    manager.register('Control+S', () => {}, { ...options, scope: 'dialog' })
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('passes declared scopes to registrations and lists suspended app hotkeys', () => {
    const appHotkeys = defineAppHotkeys({
      'dialog.save': { hotkey: 'Control+S', scope: 'dialog' },
      'doc.save': { hotkey: 'Control+S' },
    })
    expect(
      getAppHotkeyRegistrationOptions(appHotkeys['dialog.save']).scope,
    ).toBe('dialog')
    expect(
      'scope' in getAppHotkeyRegistrationOptions(appHotkeys['doc.save']),
    ).toBe(false)

    const manager = HotkeyManager.getInstance()
    const store = new AppHotkeysStore(appHotkeys)
    for (const appHotkey of Object.values(appHotkeys)) {
      manager.register('Control+S', () => {}, {
        ...options,
        ...getAppHotkeyRegistrationOptions(appHotkey),
      })
    }
    const statuses = () =>
      store
        .getList(
          [...manager.registrations.state.values()].map(
            toHotkeyRegistrationView,
          ),
        )
        .map((item) => item.status)

    expect(statuses()).toEqual(['suspended', 'active'])
    manager.activateScope('dialog', { exclusive: true })
    expect(statuses()).toEqual(['active', 'suspended'])
  })
})

describe('provider scope helpers', () => {
  afterEach(() => {
    HotkeyManager.resetInstance()
  })

  it('merges defaults over the parent and sets the scope', () => {
    expect(
      mergeHotkeysProviderDefaults(
        {
          hotkey: { platform: 'mac', scope: 'page' },
          hotkeyRecorder: { recordBy: 'key' },
        },
        { hotkey: { requireReset: true } },
        'panel',
      ),
    ).toEqual({
      hotkey: { platform: 'mac', scope: 'panel', requireReset: true },
      hotkeyRecorder: { recordBy: 'key' },
    })
    expect(
      mergeHotkeysProviderDefaults(
        { hotkey: { scope: 'page' } },
        undefined,
        undefined,
      ).hotkey,
    ).toEqual({ scope: 'page' })
  })

  it('keys activations by value and activates them', () => {
    const key = (exclusive: boolean | { allow: Array<string> }) =>
      getHotkeysProviderScopeKey({
        scope: 'dialog',
        exclusive,
        active: true,
        parent: 'page',
      })
    expect(key({ allow: ['global'] })).toBe(key({ allow: ['global'] }))
    expect(key(true)).not.toBe(key(false))
    expect(
      getHotkeysProviderScopeKey({
        scope: 'dialog',
        exclusive: true,
        active: false,
        parent: undefined,
      }),
    ).toBeNull()
    expect(
      getHotkeysProviderScopeKey({
        scope: undefined,
        exclusive: true,
        active: true,
        parent: undefined,
      }),
    ).toBeNull()

    const manager = HotkeyManager.getInstance()
    manager.activateScope('page')
    const release = activateHotkeysProviderScope(key({ allow: ['global'] })!)
    expect(manager.scopes.state).toMatchObject({
      active: ['page', 'dialog'],
      exclusive: 'dialog',
      allowed: ['global'],
    })
    release()
    expect(manager.scopes.state.exclusive).toBeNull()
  })
})
