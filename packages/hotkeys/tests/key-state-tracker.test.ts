/// <reference lib="dom" />
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { KeyStateTracker } from '../src/key-state-tracker'

/**
 * Helper to create and dispatch a KeyboardEvent
 */
function dispatchKey(
  type: 'keydown' | 'keyup',
  key: string,
  code?: string,
  modifiers: KeyboardEventInit = {},
): KeyboardEvent {
  const event = new KeyboardEvent(type, {
    key,
    code: code ?? key,
    bubbles: true,
    ...modifiers,
  })
  document.dispatchEvent(event)
  return event
}

describe('KeyStateTracker', () => {
  beforeEach(() => {
    KeyStateTracker.resetInstance()
  })

  afterEach(() => {
    KeyStateTracker.resetInstance()
    vi.restoreAllMocks()
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
      expect(tracker.store.state).toEqual({ heldKeys: [], heldCodes: {} })
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

    it('should clear non-modifier codes when modifier is released', () => {
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

  describe('modifier release clears stuck non-modifier keys (macOS workaround)', () => {
    it('should clear non-modifier keys when Meta is released (simulates Cmd+S on macOS)', () => {
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

    it('should clear non-modifier keys when Control is released', () => {
      const tracker = KeyStateTracker.getInstance()

      dispatchKey('keydown', 'Control', undefined, { ctrlKey: true })
      dispatchKey('keydown', 'c', undefined, { ctrlKey: true })
      dispatchKey('keyup', 'Control')

      expect(tracker.isKeyHeld('Control')).toBe(false)
      expect(tracker.isKeyHeld('C')).toBe(false)
      expect(tracker.getHeldKeys()).toEqual([])
    })

    it('should clear non-modifier keys when Alt is released', () => {
      const tracker = KeyStateTracker.getInstance()

      dispatchKey('keydown', 'Alt', undefined, { altKey: true })
      dispatchKey('keydown', 'Tab', undefined, { altKey: true })
      dispatchKey('keyup', 'Alt')

      expect(tracker.isKeyHeld('Alt')).toBe(false)
      expect(tracker.isKeyHeld('Tab')).toBe(false)
      expect(tracker.getHeldKeys()).toEqual([])
    })

    it('should keep other modifier keys when one modifier is released', () => {
      const tracker = KeyStateTracker.getInstance()

      // Ctrl+Shift+S — release Ctrl, Shift should remain
      dispatchKey('keydown', 'Control', undefined, { ctrlKey: true })
      dispatchKey('keydown', 'Shift', undefined, {
        ctrlKey: true,
        shiftKey: true,
      })
      dispatchKey('keydown', 's', undefined, { ctrlKey: true, shiftKey: true })
      dispatchKey('keyup', 'Control', undefined, { shiftKey: true })

      expect(tracker.isKeyHeld('Control')).toBe(false)
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
            document.dispatchEvent(new MouseEvent(type, { bubbles: true }))
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
        document.dispatchEvent(new MouseEvent('mousemove', flags))
        document.dispatchEvent(new MouseEvent('mousedown', flags))
        expect(tracker.store.state).toBe(state)
        expect(tracker.store.state.heldCodes).toEqual({ [modifier]: code })
      })
    })

    it('keeps the other physical modifier held until its own release', () => {
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'Shift', 'ShiftLeft', { shiftKey: true })
      dispatchKey('keydown', 'Shift', 'ShiftRight', { shiftKey: true })
      dispatchKey('keyup', 'Shift', 'ShiftRight', { shiftKey: true })
      expect(tracker.store.state).toEqual({
        heldKeys: ['Shift'],
        heldCodes: { Shift: 'ShiftLeft' },
      })
      dispatchKey('keyup', 'Shift', 'ShiftLeft')
      expect(tracker.store.state).toEqual({ heldKeys: [], heldCodes: {} })
    })

    it('clears both stale physical modifiers and code-less modifiers', () => {
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'Shift', 'ShiftLeft', { shiftKey: true })
      dispatchKey('keydown', 'Shift', 'ShiftRight', { shiftKey: true })
      dispatchKey('keydown', 'Meta', '', { shiftKey: true, metaKey: true })
      document.dispatchEvent(new MouseEvent('mousemove'))
      expect(tracker.store.state).toEqual({ heldKeys: [], heldCodes: {} })
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
      expect(listener).toHaveBeenCalledExactlyOnceWith({
        heldKeys: ['Shift', 'A'],
        heldCodes: { Shift: 'ShiftLeft', A: 'KeyA' },
      })
      subscription.unsubscribe()
    })

    it('recovers on a repeated keydown even when no new key entry is added', () => {
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'Shift', 'ShiftLeft', { shiftKey: true })
      dispatchKey('keydown', 'a', 'KeyA', { shiftKey: true })
      dispatchKey('keydown', 'a', 'KeyA', { repeat: true })
      expect(tracker.store.state).toEqual({
        heldKeys: ['A'],
        heldCodes: { A: 'KeyA' },
      })
    })

    it('does not infer physical keys or discard held non-modifiers from mouse state', () => {
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'a', 'KeyA')
      const state = tracker.store.state
      document.dispatchEvent(new MouseEvent('mousemove', { shiftKey: true }))
      document.dispatchEvent(new MouseEvent('mousemove'))
      expect(tracker.store.state).toBe(state)
      expect(tracker.store.state.heldCodes).toEqual({ A: 'KeyA' })
    })

    it('publishes mouse recovery once and removes listeners when destroyed', () => {
      const addListener = vi.spyOn(document, 'addEventListener')
      const removeListener = vi.spyOn(document, 'removeEventListener')
      const tracker = KeyStateTracker.getInstance()
      dispatchKey('keydown', 'Shift', 'ShiftLeft', { shiftKey: true })
      const listener = vi.fn()
      const subscription = tracker.store.subscribe(listener)
      document.dispatchEvent(new MouseEvent('mousemove'))
      document.dispatchEvent(new MouseEvent('mousemove'))
      document.dispatchEvent(new MouseEvent('mousedown'))
      expect(listener).toHaveBeenCalledTimes(1)
      tracker.destroy()
      for (const [type, handler, options] of addListener.mock.calls) {
        if (type === 'mousemove' || type === 'mousedown') {
          expect(removeListener).toHaveBeenCalledWith(type, handler, options)
        }
      }
      listener.mockClear()
      dispatchKey('keydown', 'Shift', 'ShiftLeft', { shiftKey: true })
      document.dispatchEvent(new MouseEvent('mousemove'))
      document.dispatchEvent(new MouseEvent('mousedown'))
      expect(listener).not.toHaveBeenCalled()
      expect(tracker.store.state).toEqual({ heldKeys: [], heldCodes: {} })
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
        child.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        expect(tracker.isKeyHeld('Shift')).toBe(false)
      } finally {
        child.remove()
      }
    })
  })

  describe('case insensitivity', () => {
    it('should normalize key names', () => {
      const tracker = KeyStateTracker.getInstance()

      dispatchKey('keydown', 'a')
      expect(tracker.isKeyHeld('a')).toBe(true)
      expect(tracker.isKeyHeld('A')).toBe(true)
    })
  })
})
