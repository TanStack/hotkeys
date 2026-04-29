/// <reference lib="dom" />
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HotkeySequenceRecorder } from '../src/hotkey-sequence-recorder'
import { KeyStateTracker } from '../src/key-state-tracker'

/**
 * Helper to create and dispatch a KeyboardEvent
 */
function dispatchKey(
  type: 'keydown' | 'keyup',
  key: string,
  code?: string,
): KeyboardEvent {
  const event = new KeyboardEvent(type, {
    key,
    code: code ?? key,
    bubbles: true,
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

      dispatchKey('keydown', 'Control', 'ControlLeft')
      dispatchKey('keydown', 'Shift', 'ShiftRight')
      dispatchKey('keydown', 'a', 'KeyA')

      expect(tracker.store.state.heldCodes).toEqual({
        Control: 'ControlLeft',
        Shift: 'ShiftRight',
        A: 'KeyA',
      })
    })

    it('should clear non-modifier codes when modifier is released', () => {
      const tracker = KeyStateTracker.getInstance()

      dispatchKey('keydown', 'Meta', 'MetaLeft')
      dispatchKey('keydown', 's', 'KeyS')
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
      dispatchKey('keydown', 'Meta')
      dispatchKey('keydown', 's')
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

      dispatchKey('keydown', 'Control')
      dispatchKey('keydown', 'c')
      dispatchKey('keyup', 'Control')

      expect(tracker.isKeyHeld('Control')).toBe(false)
      expect(tracker.isKeyHeld('C')).toBe(false)
      expect(tracker.getHeldKeys()).toEqual([])
    })

    it('should clear non-modifier keys when Alt is released', () => {
      const tracker = KeyStateTracker.getInstance()

      dispatchKey('keydown', 'Alt')
      dispatchKey('keydown', 'Tab')
      dispatchKey('keyup', 'Alt')

      expect(tracker.isKeyHeld('Alt')).toBe(false)
      expect(tracker.isKeyHeld('Tab')).toBe(false)
      expect(tracker.getHeldKeys()).toEqual([])
    })

    it('should keep other modifier keys when one modifier is released', () => {
      const tracker = KeyStateTracker.getInstance()

      // Ctrl+Shift+S — release Ctrl, Shift should remain
      dispatchKey('keydown', 'Control')
      dispatchKey('keydown', 'Shift')
      dispatchKey('keydown', 's')
      dispatchKey('keyup', 'Control')

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

  describe('case insensitivity', () => {
    it('should normalize key names', () => {
      const tracker = KeyStateTracker.getInstance()

      dispatchKey('keydown', 'a')
      expect(tracker.isKeyHeld('a')).toBe(true)
      expect(tracker.isKeyHeld('A')).toBe(true)
    })
  })

  describe('capture phase registration', () => {
    // Regression: a HotkeySequenceRecorder registers a capture-phase keydown
    // listener that calls stopPropagation. If the tracker is on the bubble
    // phase, propagation halts before its listener runs and held-key state
    // goes stale. Capture-phase registration ensures the tracker observes
    // every key, even when a recorder is active.
    it('tracks held keys while a HotkeySequenceRecorder is active', () => {
      const tracker = KeyStateTracker.getInstance()
      const recorder = new HotkeySequenceRecorder({ onRecord: () => {} })
      recorder.start()

      const child = document.createElement('div')
      document.body.appendChild(child)

      try {
        child.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Control',
            code: 'ControlLeft',
            bubbles: true,
          }),
        )

        expect(tracker.getHeldKeys()).toContain('Control')
      } finally {
        recorder.destroy()
        child.remove()
      }
    })
  })
})
