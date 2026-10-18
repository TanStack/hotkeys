import { flushSync, mount, unmount } from 'svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager, defineAppHotkeys } from '@tanstack/hotkeys'
import Harness from './ScopesHarness.svelte'
import { createScopesControls } from './scopes-controls.svelte'
import type { SvelteAppHotkeyList } from '../src/getAppHotkeys.svelte'

const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S' },
})

function press(key: string) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, metaKey: true, bubbles: true }),
  )
  document.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }))
}

afterEach(() => {
  HotkeyManager.resetInstance()
})

describe('HotkeysProvider scopes', () => {
  it('scopes, inherits, suspends, and allows hotkeys through nested providers', () => {
    const controls = createScopesControls()
    let list!: SvelteAppHotkeyList
    const component = mount(Harness, {
      target: document.body,
      props: { appHotkeys, controls, ready: (value) => (list = value) },
    })
    flushSync()
    const manager = HotkeyManager.getInstance()
    try {
      // Plain hotkeys use the nearest provider scope and inherited defaults.
      const options = Object.fromEntries(
        [...manager.registrations.state.values()].map((r) => [
          r.options.meta?.name ?? r.options.appHotkeyId,
          [r.options.scope, r.options.platform],
        ]),
      )
      expect(options).toEqual({
        root: ['global', 'mac'],
        palette: ['global', 'mac'],
        page: ['page', 'mac'],
        unscoped: ['page', 'mac'],
        panel: ['panel', 'mac'],
        'doc.save': ['panel', 'mac'],
      })

      // A nested scope beats its ancestor; nested providers share app hotkeys.
      press('s')
      press('e')
      expect(controls.fired).toEqual({ panel: 1, app: 1 })

      // An exclusive scope suspends the rest, except what it allows.
      controls.allow = ['global']
      controls.open = true
      flushSync()
      press('s')
      press('k')
      press('e')
      expect(controls.fired).toEqual({
        panel: 1,
        app: 1,
        dialog: 1,
        palette: 1,
      })
      expect(list.current.map((item) => item.status)).toEqual(['suspended'])

      // An equal allow list does not reactivate the scope.
      const activate = vi.spyOn(manager, 'activateScope')
      controls.allow = ['global']
      flushSync()
      expect(activate).not.toHaveBeenCalled()

      // Disabling an ancestor deactivates nested scopes.
      controls.open = false
      controls.enabled = false
      flushSync()
      press('s')
      expect(controls.fired.page ?? 0).toBe(0)
      expect(controls.fired.panel).toBe(1)
      expect(manager.isScopeActive('panel')).toBe(false)
    } finally {
      unmount(component)
    }
  })
})
