import { HotkeyManager, KeyStateTracker } from '@tanstack/hotkeys'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeysDevtoolsCore, HotkeysDevtoolsCoreNoOp } from '../src/core'

afterEach(() => {
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
  document.body.replaceChildren()
  vi.unstubAllEnvs()
  vi.resetModules()
})

/** Waits for the lazily loaded panel to render. */
async function until(check: () => boolean) {
  await vi.waitFor(() => expect(check()).toBe(true))
}

describe('HotkeysDevtoolsCore', () => {
  it('mounts the panel with live registrations and removes it on unmount', async () => {
    HotkeyManager.getInstance().register('Mod+S', () => {}, {
      platform: 'windows',
    })
    const el = document.createElement('div')
    document.body.append(el)
    const core = new HotkeysDevtoolsCore()
    await core.mount(el, { theme: 'dark', devtoolsOpen: true })
    await until(() => el.textContent?.includes('Ctrl+S') ?? false)
    expect(el.textContent).toContain('TanStack Hotkeys')
    expect(el.textContent).toContain('Hotkeys (1)')

    core.unmount()
    expect(el.textContent).toBe('')
  })

  it('keeps the no-op core empty', async () => {
    const el = document.createElement('div')
    const core = new HotkeysDevtoolsCoreNoOp()
    await core.mount(el, { theme: 'dark', devtoolsOpen: true })
    expect(el.childNodes).toHaveLength(0)
    expect(() => core.unmount()).not.toThrow()
  })
})

describe('entry points', () => {
  it.each([
    ['development', 'index', 'real'],
    ['production', 'index', 'no-op'],
    ['test', 'index', 'no-op'],
    ['production', 'production', 'real'],
  ] as const)(
    'NODE_ENV=%s from the %s entry exports the %s core',
    async (env, entry, expected) => {
      vi.stubEnv('NODE_ENV', env)
      vi.resetModules()
      const core = await import('../src/core')
      const mod =
        entry === 'index'
          ? await import('../src/index')
          : await import('../src/production')
      expect(mod.HotkeysDevtoolsCore).toBe(
        expected === 'real'
          ? core.HotkeysDevtoolsCore
          : core.HotkeysDevtoolsCoreNoOp,
      )
    },
  )
})
