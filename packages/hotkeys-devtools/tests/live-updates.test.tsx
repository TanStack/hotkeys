import { render } from '@solidjs/web'
import {
  AppHotkeysStore,
  HotkeyManager,
  KeyStateTracker,
  defineAppHotkeys,
  publishAppHotkeysStore,
} from '@tanstack/hotkeys'
import { withKeyLocks } from '@tanstack/hotkeys-test-utils'
import { flush } from 'solid-js'
import { afterEach, describe, expect, it } from 'vitest'
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
  flush()
  return state
}

afterEach(() => {
  dispose?.()
  dispose = undefined
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})

describe('devtools live updates', () => {
  it('follows key lock state', () => {
    KeyStateTracker.getInstance()
    const state = mountState()
    expect(state.keyLocks().CapsLock).toBeNull()
    document.dispatchEvent(
      withKeyLocks(new MouseEvent('mousemove', { bubbles: true }), {
        CapsLock: true,
      }),
    )
    flush()
    expect(state.keyLocks()).toEqual({
      CapsLock: true,
      NumLock: false,
      ScrollLock: false,
    })
  })

  it('follows registrations, scopes, held keys, and app hotkeys', () => {
    const manager = HotkeyManager.getInstance()
    KeyStateTracker.getInstance()
    const state = mountState()

    const handle = manager.register('Mod+K', () => {})
    flush()
    expect(state.registrations().map((r) => r.hotkey)).toEqual(['Mod+K'])
    handle.unregister()
    flush()
    expect(state.registrations()).toEqual([])

    const release = manager.activateScope('dialog')
    flush()
    expect(state.scopes().active).toContain('dialog')
    release()
    flush()
    expect(state.scopes().active).not.toContain('dialog')

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Shift', code: 'ShiftLeft' }),
    )
    flush()
    expect(state.heldKeys()).toEqual(['Shift'])
    expect(state.heldCodes()).toEqual({ Shift: 'ShiftLeft' })
    document.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'Shift', code: 'ShiftLeft' }),
    )
    flush()
    expect(state.heldKeys()).toEqual([])

    const appHotkeys = defineAppHotkeys({
      'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' } },
    })
    const store = new AppHotkeysStore(appHotkeys)
    const unpublish = publishAppHotkeysStore(store)
    flush()
    expect(state.appHotkeys().map((item) => item.appHotkey.hotkey)).toEqual([
      'Mod+S',
    ])
    store.setCustomHotkey('doc.save', 'Mod+Shift+S')
    flush()
    expect(state.appHotkeys().map((item) => item.appHotkey.hotkey)).toEqual([
      'Mod+Shift+S',
    ])
    unpublish()
    flush()
    expect(state.appHotkeys()).toEqual([])
  })
})
