import { keyEvent, withKeyLocks } from '@tanstack/hotkeys-test-utils'
/// <reference lib="dom" />
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { KeyStateTracker } from '../src/key-state-tracker'
import type { KeyLocks } from '@tanstack/hotkeys-test-utils'
import type { HotkeyPlatform } from '../src'
import type { HotkeyEventType } from '../src/hotkey.types'

/** Marks a test event as real user input, as the tracker ignores synthetic events for recovery. */
function trusted<T extends Event>(event: T): T {
  Object.defineProperty(event, 'isTrusted', { value: true })
  return event
}

/**
 * Helper to create and dispatch a KeyboardEvent
 */
function dispatchKey(
  type: HotkeyEventType,
  key: string,
  code?: string,
  modifiers: KeyboardEventInit = {},
): KeyboardEvent {
  const event = trusted(
    keyEvent(type, { key, code: code ?? key, ...modifiers }),
  )
  document.dispatchEvent(event)
  return event
}

/** Makes core platform detection report `platform`. */
function onPlatform(platform: HotkeyPlatform) {
  const userAgent = {
    mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    linux: 'Mozilla/5.0 (X11; Linux x86_64)',
  }[platform]
  vi.stubGlobal('navigator', { platform: '', userAgent })
}

/** The held key part of the tracker state, without the lock states. */
function heldState(tracker: KeyStateTracker) {
  const { heldKeys, heldCodes } = tracker.store.state
  return { heldKeys, heldCodes }
}

/** Dispatches a mouse event as real user input. */
function dispatchMouse(
  type: 'mousemove' | 'mousedown',
  init: MouseEventInit = {},
) {
  document.dispatchEvent(
    trusted(new MouseEvent(type, { bubbles: true, ...init })),
  )
}

describe('KeyStateTracker', () => {
  beforeEach(() => {
    KeyStateTracker.resetInstance()
  })

  afterEach(() => {
    KeyStateTracker.resetInstance()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = KeyStateTracker.getInstance()
      const instance2 = KeyStateTracker.getInstance()
      expect(instance1).toBe(instance2)
    })

    it('should reset instance correctly', () => {
      const instance1 = KeyStateTracker.getInstance()
      KeyStateTracker.resetInstance()
      const instance2 = KeyStateTracker.getInstance()
      expect(instance1).not.toBe(instance2)
    })
  })

  describe('key tracking', () => {
    it('should track pressed keys', () => {
      const tracker = KeyStateTracker.getInstance()

      dispatchKey('keydown', 'a')
      expect(tracker.getHeldKeys()).toContain('A')
      expect(tracker.isKeyHeld('A')).toBe(true)
    })

    it('should remove keys on keyup', () => {
      const tracker = KeyStateTracker.getInstance()

      dispatchKey('keydown', 'a')
      expect(tracker.isKeyHeld('A')).toBe(true)

      dispatchKey('keyup', 'a')
      expect(tracker.isKeyHeld('A')).toBe(false)
    })

    it('does not hold input method keydowns, whose keyup may never come', () => {
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'Process', 'KeyN', { keyCode: 229 })
      dispatchKey('keydown', 'k', 'KeyK', { isComposing: true })
      dispatchKey('keydown', 'Unidentified', '', { keyCode: 229 })
      expect(tracker.getHeldKeys()).toEqual([])
    })

    it('holds a modifier pressed during an input method composition', () => {
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'Control', 'ControlLeft', {
        ctrlKey: true,
        isComposing: true,
        keyCode: 229,
      })
      expect(tracker.isKeyHeld('Control')).toBe(true)
    })

    it('holds AltGr pressed during an input method composition', () => {
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'AltGraph', 'AltRight', {
        isComposing: true,
        keyCode: 229,
      })
      expect(tracker.isKeyHeld('AltGraph')).toBe(true)
    })

    it('pairs keyup by code when the logical key changes', () => {
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'ф', 'KeyA')
      dispatchKey('keyup', 'a', 'KeyA')
      expect(tracker.isKeyHeld('ф')).toBe(false)
    })

    it('should track multiple keys', () => {
      const tracker = KeyStateTracker.getInstance()

      dispatchKey('keydown', 'Control', undefined, { ctrlKey: true })
      dispatchKey('keydown', 'Shift', undefined, {
        ctrlKey: true,
        shiftKey: true,
      })
      dispatchKey('keydown', 'a', undefined, { ctrlKey: true, shiftKey: true })

      const heldKeys = tracker.getHeldKeys()
      expect(heldKeys).toContain('Control')
      expect(heldKeys).toContain('Shift')
      expect(heldKeys).toContain('A')
    })

    it('should check if any keys are held', () => {
      const tracker = KeyStateTracker.getInstance()

      dispatchKey('keydown', 'Control')

      expect(tracker.isAnyKeyHeld(['Control', 'Shift'])).toBe(true)
      expect(tracker.isAnyKeyHeld(['Alt', 'Meta'])).toBe(false)
    })

    it('should check if all keys are held', () => {
      const tracker = KeyStateTracker.getInstance()

      dispatchKey('keydown', 'Control', undefined, { ctrlKey: true })
      dispatchKey('keydown', 'Shift', undefined, {
        ctrlKey: true,
        shiftKey: true,
      })

      expect(tracker.areAllKeysHeld(['Control', 'Shift'])).toBe(true)
      expect(tracker.areAllKeysHeld(['Control', 'Shift', 'Alt'])).toBe(false)
    })
  })

  describe('TanStack Store integration', () => {
    it('should expose store with heldKeys state', () => {
      const tracker = KeyStateTracker.getInstance()

      expect(tracker.store).toBeDefined()
      expect(heldState(tracker)).toEqual({ heldKeys: [], heldCodes: {} })
    })

    it('should update store state on key changes', () => {
      const tracker = KeyStateTracker.getInstance()

      dispatchKey('keydown', 'a')
      expect(tracker.store.state.heldKeys).toContain('A')

      dispatchKey('keyup', 'a')
      expect(tracker.store.state.heldKeys).not.toContain('A')
    })

    it('should allow subscribing to store changes', () => {
      const tracker = KeyStateTracker.getInstance()
      const listener = vi.fn()

      const unsubscribe = tracker.store.subscribe(() => {
        listener(tracker.store.state.heldKeys)
      }).unsubscribe

      dispatchKey('keydown', 'a')
      expect(listener).toHaveBeenCalledWith(['A'])

      dispatchKey('keyup', 'a')
      expect(listener).toHaveBeenCalledWith([])

      unsubscribe()

      // Should not be called after unsubscribe
      listener.mockClear()
      dispatchKey('keydown', 'b')
      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('event.code tracking', () => {
    it('should track event.code alongside key name', () => {
      const tracker = KeyStateTracker.getInstance()

      dispatchKey('keydown', 'a', 'KeyA')
      expect(tracker.store.state.heldCodes).toEqual({ A: 'KeyA' })
    })

    it('should remove code on keyup', () => {
      const tracker = KeyStateTracker.getInstance()

      dispatchKey('keydown', 'a', 'KeyA')
      expect(tracker.store.state.heldCodes).toEqual({ A: 'KeyA' })

      dispatchKey('keyup', 'a', 'KeyA')
      expect(tracker.store.state.heldCodes).toEqual({})
    })

    it('should track multiple codes simultaneously', () => {
      const tracker = KeyStateTracker.getInstance()

      dispatchKey('keydown', 'Control', 'ControlLeft', { ctrlKey: true })
      dispatchKey('keydown', 'Shift', 'ShiftRight', {
        ctrlKey: true,
        shiftKey: true,
      })
      dispatchKey('keydown', 'a', 'KeyA', { ctrlKey: true, shiftKey: true })

      expect(tracker.store.state.heldCodes).toEqual({
        Control: 'ControlLeft',
        Shift: 'ShiftRight',
        A: 'KeyA',
      })
    })

    it('should clear non-modifier codes when Command is released on macOS', () => {
      onPlatform('mac')
      const tracker = KeyStateTracker.getInstance()

      dispatchKey('keydown', 'Meta', 'MetaLeft', { metaKey: true })
      dispatchKey('keydown', 's', 'KeyS', { metaKey: true })
      expect(tracker.store.state.heldCodes).toEqual({
        Meta: 'MetaLeft',
        S: 'KeyS',
      })

      // Only Meta keyup fires — S keyup swallowed by macOS
      dispatchKey('keyup', 'Meta', 'MetaLeft')
      expect(tracker.store.state.heldCodes).toEqual({})
    })

    it('should distinguish left vs right modifier codes', () => {
      const tracker = KeyStateTracker.getInstance()

      dispatchKey('keydown', 'Shift', 'ShiftLeft')
      expect(tracker.store.state.heldCodes).toEqual({ Shift: 'ShiftLeft' })

      // Same key name but different code — should not duplicate in heldKeys
      // (second keydown is ignored since 'Shift' is already in heldKeysSet)
      dispatchKey('keyup', 'Shift', 'ShiftLeft')
      expect(tracker.store.state.heldCodes).toEqual({})
    })
  })

  describe('Command release clears stuck non-modifier keys (macOS workaround)', () => {
    it('should clear non-modifier keys when Meta is released (simulates Cmd+S on macOS)', () => {
      onPlatform('mac')
      const tracker = KeyStateTracker.getInstance()

      // Simulate Cmd+S: keydown Meta, keydown S, then only keyup Meta
      // (macOS swallows the keyup for S)
      dispatchKey('keydown', 'Meta', undefined, { metaKey: true })
      dispatchKey('keydown', 's', undefined, { metaKey: true })
      expect(tracker.getHeldKeys()).toContain('Meta')
      expect(tracker.getHeldKeys()).toContain('S')

      // Only Meta keyup fires — S keyup is swallowed by macOS
      dispatchKey('keyup', 'Meta')
      expect(tracker.isKeyHeld('Meta')).toBe(false)
      expect(tracker.isKeyHeld('S')).toBe(false)
      expect(tracker.getHeldKeys()).toEqual([])
    })

    it.each(['windows', 'linux'] as const)(
      'should keep non-modifier keys when Meta is released on %s',
      (platform) => {
        onPlatform(platform)
        const tracker = KeyStateTracker.getInstance()

        dispatchKey('keydown', 'w', 'KeyW')
        dispatchKey('keydown', 'Meta', 'MetaLeft', { metaKey: true })
        dispatchKey('keyup', 'Meta', 'MetaLeft')

        expect(tracker.getHeldKeys()).toEqual(['W'])
      },
    )

    describe.each(['mac', 'windows', 'linux'] as const)('on %s', (platform) => {
      it.each([
        ['Shift', 'ShiftLeft', { shiftKey: true }],
        ['Control', 'ControlLeft', { ctrlKey: true }],
        ['Alt', 'AltLeft', { altKey: true }],
      ] as const)(
        'should keep a held letter when %s is tapped',
        (modifier, code, flags) => {
          onPlatform(platform)
          const tracker = KeyStateTracker.getInstance()

          dispatchKey('keydown', 'w', 'KeyW')
          dispatchKey('keydown', modifier, code, flags)
          dispatchKey('keyup', modifier, code)

          expect(tracker.getHeldKeys()).toEqual(['W'])
          expect(tracker.isKeyHeld('W')).toBe(true)
          dispatchKey('keyup', 'w', 'KeyW')
          expect(tracker.getHeldKeys()).toEqual([])
        },
      )
    })

    it('should keep other modifier keys when Command is released', () => {
      onPlatform('mac')
      const tracker = KeyStateTracker.getInstance()

      // Cmd+Shift+S — release Cmd, Shift should remain
      dispatchKey('keydown', 'Meta', undefined, { metaKey: true })
      dispatchKey('keydown', 'Shift', undefined, {
        metaKey: true,
        shiftKey: true,
      })
      dispatchKey('keydown', 's', undefined, { metaKey: true, shiftKey: true })
      dispatchKey('keyup', 'Meta', undefined, { shiftKey: true })

      expect(tracker.isKeyHeld('Meta')).toBe(false)
      expect(tracker.isKeyHeld('Shift')).toBe(true)
      // S should be cleared (non-modifier)
      expect(tracker.isKeyHeld('S')).toBe(false)
    })

    it('should not clear non-modifier keys when a non-modifier key is released', () => {
      const tracker = KeyStateTracker.getInstance()

      dispatchKey('keydown', 'a')
      dispatchKey('keydown', 'b')
      dispatchKey('keyup', 'a')

      // b should still be held — only modifier releases trigger cleanup
      expect(tracker.isKeyHeld('A')).toBe(false)
      expect(tracker.isKeyHeld('B')).toBe(true)
    })
  })

  describe('recovery after missed modifier releases', () => {
    const modifiers = [
      ['Control', 'ControlLeft', { ctrlKey: true }],
      ['Alt', 'AltLeft', { altKey: true }],
      ['Shift', 'ShiftLeft', { shiftKey: true }],
      ['Meta', 'MetaLeft', { metaKey: true }],
    ] as const

    describe.each(modifiers)('%s', (modifier, code, flags) => {
      it.each(['keydown', 'keyup', 'mousemove', 'mousedown'])(
        'recovers on %s without a modifier keyup or blur',
        (type) => {
          const tracker = KeyStateTracker.getInstance()
          dispatchKey('keydown', modifier, code, flags)
          // The OS consumed the modifier release without blurring the page.
          // A later event reports that no modifier is active.
          if (type === 'keydown' || type === 'keyup') {
            dispatchKey(type, 'a', 'KeyA')
          } else {
            dispatchMouse(type as 'mousemove' | 'mousedown')
          }
          expect(tracker.isKeyHeld(modifier)).toBe(false)
          expect(tracker.store.state.heldKeys).not.toContain(modifier)
          expect(tracker.store.state.heldCodes).not.toHaveProperty(modifier)
        },
      )

      it('preserves a held modifier across keyboard and mouse events', () => {
        const tracker = KeyStateTracker.getInstance()
        dispatchKey('keydown', modifier, code, flags)
        dispatchKey('keydown', 'a', 'KeyA', flags)
        dispatchKey('keyup', 'a', 'KeyA', flags)
        const state = tracker.store.state
        dispatchMouse('mousemove', flags)
        dispatchMouse('mousedown', flags)
        expect(tracker.store.state).toBe(state)
        expect(tracker.store.state.heldCodes).toEqual({ [modifier]: code })
      })
    })

    // AltGr has no event flag, only modifier state
    it('recovers a missed AltGraph release from modifier state', () => {
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'AltGraph', 'AltRight', {
        altGraph: true,
      } as never)
      dispatchKey('keydown', '@', 'KeyQ', { altGraph: true } as never)
      expect(tracker.isKeyHeld('AltGraph')).toBe(true)
      dispatchKey('keydown', 'a', 'KeyA')
      expect(tracker.isKeyHeld('AltGraph')).toBe(false)
    })

    it('keeps the other physical modifier held until its own release', () => {
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'Shift', 'ShiftLeft', { shiftKey: true })
      dispatchKey('keydown', 'Shift', 'ShiftRight', { shiftKey: true })
      dispatchKey('keyup', 'Shift', 'ShiftRight', { shiftKey: true })
      expect(heldState(tracker)).toEqual({
        heldKeys: ['Shift'],
        heldCodes: { Shift: 'ShiftLeft' },
      })
      dispatchKey('keyup', 'Shift', 'ShiftLeft')
      expect(heldState(tracker)).toEqual({ heldKeys: [], heldCodes: {} })
    })

    it('clears both stale physical modifiers and code-less modifiers', () => {
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'Shift', 'ShiftLeft', { shiftKey: true })
      dispatchKey('keydown', 'Shift', 'ShiftRight', { shiftKey: true })
      dispatchKey('keydown', 'Meta', '', { shiftKey: true, metaKey: true })
      dispatchMouse('mousemove')
      expect(heldState(tracker)).toEqual({ heldKeys: [], heldCodes: {} })
    })

    it('removes only released modifiers and publishes one final state per keyboard event', () => {
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'Control', 'ControlLeft', { ctrlKey: true })
      dispatchKey('keydown', 'Shift', 'ShiftLeft', {
        ctrlKey: true,
        shiftKey: true,
      })
      const listener = vi.fn()
      const subscription = tracker.store.subscribe(() =>
        listener(tracker.store.state),
      )
      dispatchKey('keydown', 'a', 'KeyA', { shiftKey: true })
      expect(listener).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          heldKeys: ['Shift', 'A'],
          heldCodes: { Shift: 'ShiftLeft', A: 'KeyA' },
        }),
      )
      subscription.unsubscribe()
    })

    it('recovers on a repeated keydown even when no new key entry is added', () => {
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'Shift', 'ShiftLeft', { shiftKey: true })
      dispatchKey('keydown', 'a', 'KeyA', { shiftKey: true })
      dispatchKey('keydown', 'a', 'KeyA', { repeat: true })
      expect(heldState(tracker)).toEqual({
        heldKeys: ['A'],
        heldCodes: { A: 'KeyA' },
      })
    })

    it('does not infer physical keys or discard held non-modifiers from mouse state', () => {
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'a', 'KeyA')
      const state = tracker.store.state
      dispatchMouse('mousemove', { shiftKey: true })
      dispatchMouse('mousemove')
      expect(tracker.store.state).toBe(state)
      expect(tracker.store.state.heldCodes).toEqual({ A: 'KeyA' })
    })

    it('publishes mouse recovery once and removes listeners when destroyed', () => {
      const addListener = vi.spyOn(window, 'addEventListener')
      const removeListener = vi.spyOn(window, 'removeEventListener')
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'Shift', 'ShiftLeft', { shiftKey: true })
      const listener = vi.fn()
      const subscription = tracker.store.subscribe(listener)
      dispatchMouse('mousemove')
      dispatchMouse('mousemove')
      dispatchMouse('mousedown')
      expect(listener).toHaveBeenCalledTimes(1)
      tracker.destroy()
      expect(
        addListener.mock.calls.filter(
          ([type]) => type === 'mousemove' || type === 'mousedown',
        ),
      ).toHaveLength(2)
      for (const [type, handler, options] of addListener.mock.calls) {
        if (type === 'mousemove' || type === 'mousedown') {
          expect(removeListener).toHaveBeenCalledWith(type, handler, options)
        }
      }
      listener.mockClear()
      dispatchKey('keydown', 'Shift', 'ShiftLeft', { shiftKey: true })
      dispatchMouse('mousemove')
      dispatchMouse('mousedown')
      expect(listener).not.toHaveBeenCalled()
      expect(heldState(tracker)).toEqual({ heldKeys: [], heldCodes: {} })
      subscription.unsubscribe()
    })

    it('recovers before a child mouse handler that stops propagation', () => {
      const tracker = KeyStateTracker.getInstance()
      const child = document.createElement('div')
      document.body.append(child)
      child.addEventListener('mousedown', (event) => {
        event.stopPropagation()
        expect(tracker.isKeyHeld('Shift')).toBe(false)
      })
      try {
        dispatchKey('keydown', 'Shift', 'ShiftLeft', { shiftKey: true })
        child.dispatchEvent(
          trusted(new MouseEvent('mousedown', { bubbles: true })),
        )
        expect(tracker.isKeyHeld('Shift')).toBe(false)
      } finally {
        child.remove()
      }
    })
  })

  it.each(['mousemove', 'keydown'] as const)(
    'keeps a held modifier when page code dispatches a synthetic %s',
    (type) => {
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'Shift', 'ShiftLeft', { shiftKey: true })
      // Synthetic events report no modifiers even while the user holds one
      document.dispatchEvent(
        type === 'mousemove'
          ? new MouseEvent(type, { bubbles: true })
          : keyEvent(type, { key: 'a', code: 'KeyA' }),
      )
      expect(tracker.isKeyHeld('Shift')).toBe(true)
    },
  )

  describe('case insensitivity', () => {
    it('should normalize key names', () => {
      const tracker = KeyStateTracker.getInstance()

      dispatchKey('keydown', 'a')
      expect(tracker.isKeyHeld('a')).toBe(true)
      expect(tracker.isKeyHeld('A')).toBe(true)
    })
  })

  // Chrome autofill sends a trusted plain `Event` named keydown or keyup,
  // with no key, code or modifier flags
  describe('key events without key or code', () => {
    it.each(['keydown', 'keyup'])(
      'a %s holds no key and releases no modifier',
      (type) => {
        const tracker = KeyStateTracker.getInstance()
        dispatchKey('keydown', 'Shift', 'ShiftLeft', { shiftKey: true })
        document.dispatchEvent(trusted(new Event(type, { bubbles: true })))
        expect(heldState(tracker)).toEqual({
          heldKeys: ['Shift'],
          heldCodes: { Shift: 'ShiftLeft' },
        })
      },
    )
  })

  describe('lost keyups', () => {
    it('forgets held keys when a native context menu opens', () => {
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'Shift', 'ShiftLeft', { shiftKey: true })
      dispatchKey('keydown', 'ContextMenu', 'ContextMenu', { shiftKey: true })
      document.dispatchEvent(
        trusted(
          new MouseEvent('contextmenu', { bubbles: true, shiftKey: true }),
        ),
      )
      // Shift is still reported as held, so it stays.
      expect(tracker.getHeldKeys()).toEqual(['Shift'])
      document.dispatchEvent(
        trusted(new MouseEvent('contextmenu', { bubbles: true })),
      )
      expect(tracker.getHeldKeys()).toEqual([])
    })

    it('keeps held keys when the page shows its own context menu', () => {
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'k', 'KeyK')
      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
      })
      event.preventDefault()
      document.dispatchEvent(trusted(event))
      expect(tracker.getHeldKeys()).toEqual(['K'])
    })

    it('keeps held keys when page code dispatches a context menu event', () => {
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'k', 'KeyK')
      document.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }))
      expect(tracker.getHeldKeys()).toEqual(['K'])
    })

    it('forgets held keys when the page is hidden', () => {
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'k', 'KeyK')
      const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
      document.dispatchEvent(new Event('visibilitychange', { bubbles: true }))
      expect(tracker.getHeldKeys()).toEqual(['K'])
      hidden.mockReturnValue(true)
      document.dispatchEvent(new Event('visibilitychange', { bubbles: true }))
      expect(tracker.getHeldKeys()).toEqual([])
    })

    it('forgets held keys when the page is hidden, even if a page listener stops the event', () => {
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'k', 'KeyK')
      const stop = (event: Event) => event.stopPropagation()
      document.addEventListener('visibilitychange', stop)
      vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
      document.dispatchEvent(new Event('visibilitychange', { bubbles: true }))
      document.removeEventListener('visibilitychange', stop)
      expect(tracker.getHeldKeys()).toEqual([])
    })
  })

  describe('key lock state', () => {
    function lockKey(
      type: HotkeyEventType,
      key: string,
      locks: KeyLocks,
    ): void {
      document.dispatchEvent(
        withKeyLocks(keyEvent(type, { key, code: key }), locks),
      )
    }

    function lockMouse(type: 'mousemove' | 'mousedown', locks: KeyLocks) {
      document.dispatchEvent(
        withKeyLocks(new MouseEvent(type, { bubbles: true }), locks),
      )
    }

    beforeEach(() => onPlatform('windows'))

    it('reports every lock as unknown until an event reports it', () => {
      const tracker = KeyStateTracker.getInstance()
      expect(tracker.store.state.locks).toEqual({
        CapsLock: null,
        NumLock: null,
        ScrollLock: null,
      })
      expect(tracker.getKeyLockState('CapsLock')).toBeNull()
    })

    it('reads lock state from keydown and keyup', () => {
      const tracker = KeyStateTracker.getInstance()
      lockKey('keydown', 'CapsLock', { NumLock: true })
      expect(tracker.store.state.locks).toEqual({
        CapsLock: false,
        NumLock: true,
        ScrollLock: false,
      })
      // The lock key's own keyup settles a keydown that reported the old state.
      lockKey('keyup', 'CapsLock', { CapsLock: true, NumLock: true })
      expect(tracker.getKeyLockState('CapsLock')).toBe(true)
    })

    it.each(['mousemove', 'mousedown'] as const)(
      'reads lock state from %s',
      (type) => {
        const tracker = KeyStateTracker.getInstance()
        lockMouse(type, { ScrollLock: true })
        expect(tracker.getKeyLockState('ScrollLock')).toBe(true)
        expect(tracker.getKeyLockState('CapsLock')).toBe(false)
      },
    )

    it('ignores events dispatched by page code', () => {
      const tracker = KeyStateTracker.getInstance()
      lockMouse('mousemove', { CapsLock: true })
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
      document.dispatchEvent(keyEvent('keydown', { key: 'a', code: 'KeyA' }))
      expect(tracker.getKeyLockState('CapsLock')).toBe(true)
    })

    it('publishes only when a lock changes', () => {
      const tracker = KeyStateTracker.getInstance()
      let updates = 0
      const subscription = tracker.store.subscribe(() => updates++)
      lockMouse('mousemove', { CapsLock: true })
      lockMouse('mousemove', { CapsLock: true })
      lockMouse('mousedown', { CapsLock: true })
      expect(updates).toBe(1)
      lockMouse('mousemove', {})
      expect(updates).toBe(2)
      subscription.unsubscribe()
    })

    it('publishes lock state and held keys together, once per event', () => {
      const tracker = KeyStateTracker.getInstance()
      const states: Array<unknown> = []
      const subscription = tracker.store.subscribe(() =>
        states.push(tracker.store.state),
      )
      lockKey('keydown', 'Shift', { CapsLock: true })
      expect(states).toEqual([
        expect.objectContaining({
          heldKeys: ['Shift'],
          locks: { CapsLock: true, NumLock: false, ScrollLock: false },
        }),
      ])
      window.dispatchEvent(new Event('blur'))
      expect(states).toHaveLength(2)
      expect(states[1]).toMatchObject({
        heldKeys: [],
        locks: { CapsLock: null, NumLock: null, ScrollLock: null },
      })
      subscription.unsubscribe()
    })

    it('keeps held key arrays when only lock state changes', () => {
      const tracker = KeyStateTracker.getInstance()
      document.dispatchEvent(keyEvent('keydown', { key: 'a', code: 'KeyA' }))
      const { heldKeys, heldCodes } = tracker.store.state
      lockMouse('mousemove', { CapsLock: true })
      expect(tracker.getKeyLockState('CapsLock')).toBe(true)
      expect(tracker.store.state.heldKeys).toBe(heldKeys)
      expect(tracker.store.state.heldCodes).toBe(heldCodes)
    })

    it('keeps held key arrays on a keyup that only changes lock state', () => {
      const tracker = KeyStateTracker.getInstance()
      document.dispatchEvent(keyEvent('keydown', { key: 'a', code: 'KeyA' }))
      const { heldKeys, heldCodes } = tracker.store.state
      // Caps Lock was pressed before the tracker started, so only its keyup arrives.
      lockKey('keyup', 'CapsLock', { CapsLock: true })
      expect(tracker.getKeyLockState('CapsLock')).toBe(true)
      expect(tracker.store.state.heldKeys).toBe(heldKeys)
      expect(tracker.store.state.heldCodes).toBe(heldCodes)
    })

    it('keeps lock state when held keys change', () => {
      const tracker = KeyStateTracker.getInstance()
      lockMouse('mousemove', { CapsLock: true })
      // Untrusted events change held keys but report no lock state.
      document.dispatchEvent(
        keyEvent('keydown', { key: 'Shift', code: 'ShiftLeft' }),
      )
      expect(tracker.getHeldKeys()).toEqual(['Shift'])
      expect(tracker.getKeyLockState('CapsLock')).toBe(true)
    })

    it('forgets lock state when the window loses focus', () => {
      const tracker = KeyStateTracker.getInstance()
      lockMouse('mousemove', { CapsLock: true })
      window.dispatchEvent(new Event('blur'))
      expect(tracker.getKeyLockState('CapsLock')).toBeNull()
      expect(tracker.getKeyLockState('NumLock')).toBeNull()
    })

    it('ignores mouse events while the window is unfocused', () => {
      const tracker = KeyStateTracker.getInstance()
      vi.spyOn(document, 'hasFocus').mockReturnValue(false)
      lockMouse('mousemove', { CapsLock: true })
      expect(tracker.getKeyLockState('CapsLock')).toBeNull()
    })

    it('stays unknown when only page code dispatches events', () => {
      const tracker = KeyStateTracker.getInstance()
      document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
      document.dispatchEvent(keyEvent('keydown', { key: 'a', code: 'KeyA' }))
      expect(tracker.getKeyLockState('CapsLock')).toBeNull()
    })

    it('keeps lock state when the page becomes visible', () => {
      const tracker = KeyStateTracker.getInstance()
      lockMouse('mousemove', { CapsLock: true })
      vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
      document.dispatchEvent(new Event('visibilitychange', { bubbles: true }))
      expect(tracker.getKeyLockState('CapsLock')).toBe(true)
    })

    it('forgets lock state when the page is hidden', () => {
      const tracker = KeyStateTracker.getInstance()
      lockMouse('mousemove', { NumLock: true })
      vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
      document.dispatchEvent(new Event('visibilitychange', { bubbles: true }))
      expect(tracker.getKeyLockState('NumLock')).toBeNull()
    })

    it('leaves Num Lock and Scroll Lock unknown on macOS', () => {
      onPlatform('mac')
      const tracker = KeyStateTracker.getInstance()
      // Firefox on macOS reports Num Lock for every numpad key.
      lockKey('keydown', '1', { CapsLock: true, NumLock: true })
      lockMouse('mousemove', { CapsLock: true, ScrollLock: true })
      expect(tracker.store.state.locks).toEqual({
        CapsLock: true,
        NumLock: null,
        ScrollLock: null,
      })
    })

    it('resets lock state when destroyed', () => {
      const tracker = KeyStateTracker.getInstance()
      lockMouse('mousemove', { CapsLock: true })
      tracker.destroy()
      expect(tracker.getKeyLockState('CapsLock')).toBeNull()
    })
  })
})
