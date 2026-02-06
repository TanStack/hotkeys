/// <reference lib="dom" />
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { KeyStateTracker } from '../src/key-state-tracker'

/**
 * Helper to create and dispatch a KeyboardEvent
 */
function dispatchKey(type: 'keydown' | 'keyup', key: string): KeyboardEvent {
  const event = new KeyboardEvent(type, { key, bubbles: true })
  document.dispatchEvent(event)
  return event
}

describe('KeyStateTracker', () => {
  beforeEach(() => {
    KeyStateTracker.resetInstance()
  })

  afterEach(() => {
    KeyStateTracker.resetInstance()
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

    it('should track multiple keys', () => {
      const tracker = KeyStateTracker.getInstance()

      dispatchKey('keydown', 'Control')
      dispatchKey('keydown', 'Shift')
      dispatchKey('keydown', 'a')

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

      dispatchKey('keydown', 'Control')
      dispatchKey('keydown', 'Shift')

      expect(tracker.areAllKeysHeld(['Control', 'Shift'])).toBe(true)
      expect(tracker.areAllKeysHeld(['Control', 'Shift', 'Alt'])).toBe(false)
    })
  })

  describe('TanStack Store integration', () => {
    it('should expose store with heldKeys state', () => {
      const tracker = KeyStateTracker.getInstance()

      expect(tracker.store).toBeDefined()
      expect(tracker.store.state).toEqual({ heldKeys: [] })
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
      })

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

  describe('subscriptions (backwards compatibility)', () => {
    it('should notify subscribers on key changes', () => {
      const tracker = KeyStateTracker.getInstance()
      const listener = vi.fn()

      tracker.subscribe(listener)
      // Subscriber is called immediately with current state
      expect(listener).toHaveBeenCalledWith([])

      listener.mockClear()
      dispatchKey('keydown', 'a')
      expect(listener).toHaveBeenCalledWith(['A'])
    })

    it('should allow unsubscribing', () => {
      const tracker = KeyStateTracker.getInstance()
      const listener = vi.fn()

      const unsubscribe = tracker.subscribe(listener)
      listener.mockClear()

      unsubscribe()

      dispatchKey('keydown', 'a')
      expect(listener).not.toHaveBeenCalled()
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
