import Alpine from 'alpinejs'
import { afterEach, expect, it, vi } from 'vitest'

// Each test loads a fresh copy of the adapter, so no plugin is installed yet.
async function loadAdapter() {
  vi.resetModules()
  return import('../src')
}

function press(key: string) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
}

afterEach(() => {
  delete (globalThis as { Alpine?: unknown }).Alpine
})

it('uses the Alpine instance passed to the plugin, not window.Alpine', async () => {
  const { hotkeysPlugin, createHotkeysScope, HotkeyManager } =
    await loadAdapter()
  const other = {
    reactive: vi.fn(),
    effect: vi.fn(),
    release: vi.fn(),
  }
  ;(globalThis as { Alpine?: unknown }).Alpine = other
  const magic = vi.spyOn(Alpine, 'magic')
  hotkeysPlugin(Alpine)
  expect(magic).toHaveBeenCalledWith('hotkeys', expect.any(Function))

  const hotkeys = createHotkeysScope()
  const state = Alpine.reactive({ enabled: true })
  const callback = vi.fn()
  hotkeys.createHotkey('K', callback, () => ({ enabled: state.enabled }))
  const held = hotkeys.createHeldKeys()
  press('K')
  expect(callback).toHaveBeenCalledOnce()
  expect(held.value).toEqual(['K'])

  state.enabled = false
  await Alpine.nextTick()
  press('K')
  expect(callback).toHaveBeenCalledOnce()
  expect(other.reactive).not.toHaveBeenCalled()
  expect(other.effect).not.toHaveBeenCalled()

  hotkeys.destroy()
  magic.mockRestore()
  HotkeyManager.resetInstance()
})

it('falls back to window.Alpine, as with a script-tag Alpine', async () => {
  const { createHotkeysScope, HotkeyManager } = await loadAdapter()
  ;(globalThis as { Alpine?: unknown }).Alpine = Alpine
  const hotkeys = createHotkeysScope()
  const state = Alpine.reactive({ enabled: true })
  const callback = vi.fn()
  hotkeys.createHotkey('J', callback, () => ({ enabled: state.enabled }))
  state.enabled = false
  await Alpine.nextTick()
  press('J')
  expect(callback).not.toHaveBeenCalled()
  hotkeys.destroy()
  HotkeyManager.resetInstance()
})

it('creates a scope before Alpine is available, and explains the fix on first use', async () => {
  const { createHotkeysScope } = await loadAdapter()
  const hotkeys = createHotkeysScope()
  expect(() => hotkeys.createHotkey('K', () => {})).toThrow(
    'Call Alpine.plugin(hotkeysPlugin) before Alpine.start(), or set window.Alpine.',
  )
  hotkeys.destroy()
})
