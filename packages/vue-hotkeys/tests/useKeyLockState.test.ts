import { HotkeyManager, KeyStateTracker } from '@tanstack/hotkeys'
import { withKeyLocks } from '@tanstack/hotkeys-test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { effectScope, ref, watchEffect } from 'vue'
import { useKeyLockState } from '../src/useKeyLockState'
import type { LockKey } from '@tanstack/hotkeys'
import type { KeyLocks } from '@tanstack/hotkeys-test-utils'

function moveMouse(locks: KeyLocks) {
  document.dispatchEvent(
    withKeyLocks(new MouseEvent('mousemove', { bubbles: true }), locks),
  )
}

function keyEvent(type: 'keydown' | 'keyup', locks: KeyLocks) {
  document.dispatchEvent(
    withKeyLocks(
      new KeyboardEvent(type, {
        key: 'Shift',
        code: 'ShiftLeft',
        bubbles: true,
      }),
      locks,
    ),
  )
}

describe('useKeyLockState', () => {
  beforeEach(() => {
    HotkeyManager.resetInstance()
    KeyStateTracker.resetInstance()
  })

  afterEach(() => {
    HotkeyManager.resetInstance()
    KeyStateTracker.resetInstance()
  })

  it('tracks a getter key', () => {
    const scope = effectScope()
    const capsLock = scope.run(() => useKeyLockState(() => 'CapsLock'))!
    expect(capsLock.value).toBe(null)
    moveMouse({ CapsLock: true })
    expect(capsLock.value).toBe(true)
    scope.stop()
  })

  it('follows a ref key without waiting for an event', () => {
    const key = ref<LockKey>('NumLock')
    const scope = effectScope()
    const lock = scope.run(() => useKeyLockState(key))!
    moveMouse({ CapsLock: true })
    expect(lock.value).not.toBe(true)

    key.value = 'CapsLock'
    expect(lock.value).toBe(true)
    scope.stop()
  })

  it('notifies only when its own lock changes', () => {
    const scope = effectScope()
    let runs = 0
    scope.run(() => {
      const capsLock = useKeyLockState('CapsLock')
      watchEffect(
        () => {
          void capsLock.value
          runs++
        },
        { flush: 'sync' },
      )
    })
    moveMouse({ CapsLock: true })
    expect(runs).toBe(2)

    // Holding and releasing Shift changes the held keys, not the lock.
    keyEvent('keydown', { CapsLock: true })
    keyEvent('keyup', { CapsLock: true })
    expect(runs).toBe(2)

    moveMouse({})
    expect(runs).toBe(3)
    scope.stop()
  })
})
