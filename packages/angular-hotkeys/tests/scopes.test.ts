import {
  EnvironmentInjector,
  InjectionToken,
  createEnvironmentInjector,
  inject,
  provideZonelessChangeDetection,
  runInInjectionContext,
  signal,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { HotkeyManager, defineAppHotkeys } from '@tanstack/hotkeys'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { injectHotkeysContext, provideHotkeys } from '../src/hotkeys-provider'
import { injectAppHotkeyList } from '../src/injectAppHotkeys'
import { injectHotkey } from '../src/injectHotkey'
import { injectHotkeyScopesState } from '../src/injectHotkeyScopesState'
import type { ProvideHotkeysOptions } from '../src/hotkeys-provider'

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

function setup() {
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideHotkeys({
        appHotkeys,
        customHotkeys: { 'doc.save': 'Mod+E' },
        defaultOptions: { hotkey: { platform: 'mac' } },
      }),
    ],
  })
  return TestBed.inject(EnvironmentInjector)
}

/** A child injector with its own provider, like a component's `providers`. */
function nest(parent: EnvironmentInjector, options: ProvideHotkeysOptions) {
  return createEnvironmentInjector([provideHotkeys(options)], parent)
}

function run<T>(injector: EnvironmentInjector, fn: () => T): T {
  const result = runInInjectionContext(injector, fn)
  TestBed.tick()
  return result
}

afterEach(() => {
  TestBed.resetTestingModule()
  HotkeyManager.resetInstance()
})

describe('provideHotkeys scopes', () => {
  it('registers hotkeys in the nearest scope with inherited app hotkeys and defaults', () => {
    const root = setup()
    const page = nest(root, { scope: 'page' })
    const unscoped = nest(page, {
      defaultOptions: { hotkey: { requireReset: true } },
    })
    const save = vi.fn()
    run(root, () => injectHotkey('Mod+P', () => {}, { meta: { name: 'root' } }))
    run(page, () => injectHotkey('Mod+P', () => {}, { meta: { name: 'page' } }))
    run(unscoped, () => injectHotkey(appHotkeys['doc.save'], save))

    const options = [
      ...HotkeyManager.getInstance().registrations.state.values(),
    ].map((r) => [r.options.meta?.name ?? r.options.appHotkeyId, r.options])
    expect(Object.fromEntries(options)).toMatchObject({
      root: { scope: 'global', platform: 'mac' },
      page: { scope: 'page', platform: 'mac' },
      'doc.save': { scope: 'page', platform: 'mac', requireReset: true },
    })
    press('e')
    expect(save).toHaveBeenCalledTimes(1)
  })

  it('lets a nested scope beat its ancestor', () => {
    const root = setup()
    const page = nest(root, { scope: 'page' })
    const panel = nest(page, { scope: 'panel' })
    const outer = vi.fn()
    const inner = vi.fn()
    run(page, () => injectHotkey('Mod+S', outer))
    run(panel, () => injectHotkey('Mod+S', inner))
    press('s')
    expect([outer.mock.calls.length, inner.mock.calls.length]).toEqual([0, 1])
  })

  it('suspends other scopes while an exclusive scope exists, except allowed ones', () => {
    const root = setup()
    const editor = nest(root, { scope: 'editor' })
    const editorSave = vi.fn()
    const palette = vi.fn()
    const dialogSave = vi.fn()
    run(editor, () => injectHotkey('Mod+S', editorSave))
    run(root, () => injectHotkey(appHotkeys['palette.open'], palette))
    const list = run(root, () => injectAppHotkeyList())

    const dialog = nest(root, {
      scope: 'dialog',
      exclusive: { allow: ['global'] },
    })
    run(dialog, () => injectHotkey('Mod+S', dialogSave))
    press('s')
    press('k')
    expect(
      [editorSave, dialogSave, palette].map((f) => f.mock.calls.length),
    ).toEqual([0, 1, 1])
    expect(
      list().find((item) => item.appHotkey.id === 'palette.open')?.status,
    ).toBe('active')

    dialog.destroy()
    press('s')
    expect(editorSave).toHaveBeenCalledTimes(1)
  })

  it('follows a signal for enabled and deactivates nested scopes', () => {
    const root = setup()
    const enabled = signal(true)
    const workspace = nest(root, { scope: 'workspace', enabled })
    const editor = nest(workspace, { scope: 'editor' })
    const save = vi.fn()
    run(editor, () => injectHotkey('Mod+S', save))
    press('s')
    enabled.set(false)
    TestBed.tick()
    press('s')
    expect(save).toHaveBeenCalledTimes(1)
    expect(HotkeyManager.getInstance().isScopeActive('editor')).toBe(false)
  })

  it('runs getters in the injection context, so they can inject state', () => {
    const root = setup()
    const FOLDER = new InjectionToken<{
      name: string
      current: ReturnType<typeof signal<boolean>>
    }>('FOLDER')
    const current = signal(false)
    const folder = createEnvironmentInjector(
      [
        { provide: FOLDER, useValue: { name: 'inbox', current } },
        provideHotkeys({
          scope: () => inject(FOLDER).name,
          enabled: () => inject(FOLDER).current(),
        }),
      ],
      root,
    )
    const add = vi.fn()
    run(folder, () => injectHotkey('Mod+S', add))
    press('s')
    current.set(true)
    TestBed.tick()
    press('s')
    expect(add).toHaveBeenCalledTimes(1)
    expect(
      [...HotkeyManager.getInstance().registrations.state.values()][0]?.options
        .scope,
    ).toBe('inbox')
  })

  it('does not reactivate when a getter returns an equal allow list', () => {
    const root = setup()
    const allow = signal(['global'])
    const dialog = nest(root, {
      scope: 'dialog',
      exclusive: () => ({ allow: allow() }),
    })
    run(dialog, () => injectHotkey('Escape', () => {}))
    const activate = vi.spyOn(HotkeyManager.getInstance(), 'activateScope')
    allow.set(['global'])
    TestBed.tick()
    expect(activate).not.toHaveBeenCalled()
  })
  it('activates an exclusive provider with no hotkeys once its context is injected', () => {
    const root = setup()
    const outer = vi.fn()
    run(root, () => injectHotkey('Mod+S', outer))

    const dialog = nest(root, { scope: 'dialog', exclusive: true })
    // The provider factory is lazy, so nothing activates it yet.
    TestBed.tick()
    press('s')
    expect(outer).toHaveBeenCalledTimes(1)

    run(dialog, () => injectHotkeysContext())
    press('s')
    expect(outer).toHaveBeenCalledTimes(1)
    expect(HotkeyManager.getInstance().scopes.state.exclusive).toBe('dialog')

    dialog.destroy()
    press('s')
    expect(outer).toHaveBeenCalledTimes(2)
  })

  it('exposes the scopes state as a signal', () => {
    const root = setup()
    const state = run(root, () => injectHotkeyScopesState())
    expect(state().exclusive).toBeNull()

    const release = HotkeyManager.getInstance().activateScope('dialog', {
      exclusive: true,
    })
    TestBed.tick()
    expect(state()).toMatchObject({
      active: ['dialog'],
      exclusive: 'dialog',
      suspended: ['global'],
    })

    release()
    TestBed.tick()
    expect(state()).toMatchObject({ exclusive: null, suspended: [] })
  })
})
