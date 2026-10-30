import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'solid-js/web'
import {
  AppHotkeysStore,
  HotkeyManager,
  KeyStateTracker,
  defineAppHotkeys,
  publishAppHotkeysStore,
} from '@tanstack/hotkeys'
import {
  HotkeysContextProvider,
  useHotkeysDevtoolsState,
} from '../src/HotkeysContextProvider'

let dispose: (() => void) | undefined

/** Mounts the devtools state with its real subscriptions. */
function mountState() {
  let state!: ReturnType<typeof useHotkeysDevtoolsState>
  dispose = render(
    () => (
      <HotkeysContextProvider>
        {(() => {
          state = useHotkeysDevtoolsState()
          return null
        })()}
      </HotkeysContextProvider>
    ),
    document.createElement('div'),
  )
  return state
}

afterEach(() => {
  dispose?.()
  dispose = undefined
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})

describe('devtools live updates', () => {
  it('follows registrations, scopes, held keys, and app hotkeys', () => {
    const manager = HotkeyManager.getInstance()
    KeyStateTracker.getInstance()
    const state = mountState()

    const handle = manager.register('Mod+K', () => {})
    expect(state.registrations().map((r) => r.hotkey)).toEqual(['Mod+K'])
    handle.unregister()
    expect(state.registrations()).toEqual([])

    const release = manager.activateScope('dialog')
    expect(state.scopes().active).toContain('dialog')
    release()
    expect(state.scopes().active).not.toContain('dialog')

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Shift', code: 'ShiftLeft' }),
    )
    expect(state.heldKeys()).toEqual(['Shift'])
    expect(state.heldCodes()).toEqual({ Shift: 'ShiftLeft' })
    document.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'Shift', code: 'ShiftLeft' }),
    )
    expect(state.heldKeys()).toEqual([])

    const appHotkeys = defineAppHotkeys({
      'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' } },
    })
    const store = new AppHotkeysStore(appHotkeys)
    const unpublish = publishAppHotkeysStore(store)
    expect(state.appHotkeys().map((item) => item.appHotkey.hotkey)).toEqual([
      'Mod+S',
    ])
    store.setCustomHotkey('doc.save', 'Mod+Shift+S')
    expect(state.appHotkeys().map((item) => item.appHotkey.hotkey)).toEqual([
      'Mod+Shift+S',
    ])
    unpublish()
    expect(state.appHotkeys()).toEqual([])
  })
})
