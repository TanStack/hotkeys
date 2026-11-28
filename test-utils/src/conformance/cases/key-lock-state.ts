import { getKeyStateTracker } from '@tanstack/hotkeys'
import { keydown } from '../../events'
import { withKeyLocks } from '../../key-locks'
import { defineGroup } from '../suite'
import type { KeyLocks } from '../../key-locks'

/** Real user input that reports lock states, as a mouse move. */
function moveMouse(locks: KeyLocks): void {
  document.dispatchEvent(
    withKeyLocks(new MouseEvent('mousemove', { bubbles: true }), locks),
  )
}

defineGroup({
  name: 'key lock state',
  cases: [
    {
      title: 'is null until an event reports the lock',
      async run({ harness, expect }) {
        const view = await harness.mountKeyLockState('CapsLock')
        expect(view.value()).toBe(null)
      },
    },
    {
      title: 'follows Caps Lock as events report it',
      requires: ['trusted-test-events'],
      async run({ harness, expect, act }) {
        const view = await harness.mountKeyLockState('CapsLock')
        await act(() =>
          document.dispatchEvent(
            withKeyLocks(keydown({ key: 'CapsLock', code: 'CapsLock' }), {
              CapsLock: true,
            }),
          ),
        )
        expect(view.value()).toBe(true)
        await act(() => moveMouse({}))
        expect(view.value()).toBe(false)
      },
    },
    {
      title: 'ignores lock state from events dispatched by page code',
      requires: ['trusted-test-events'],
      async run({ harness, expect, act, press }) {
        const view = await harness.mountKeyLockState('CapsLock')
        await act(() => moveMouse({ CapsLock: true }))
        await press({ key: 'a', code: 'KeyA' })
        expect(view.value()).toBe(true)
      },
    },
    {
      title: 'is null again after the window loses focus',
      requires: ['trusted-test-events'],
      async run({ harness, expect, act, blurWindow }) {
        const view = await harness.mountKeyLockState('CapsLock')
        await act(() => moveMouse({ CapsLock: true }))
        await blurWindow()
        expect(view.value()).toBe(null)
      },
    },
    {
      title: 'switches the tracked lock when the watched key changes',
      requires: ['trusted-test-events'],
      async run({ harness, expect, act }) {
        const view = await harness.mountKeyLockState('CapsLock')
        await act(() => moveMouse({ CapsLock: true }))
        await view.setKey('ScrollLock')
        // Null on macOS, where browsers don't report Scroll Lock.
        expect(view.value()).toBe(
          getKeyStateTracker().getKeyLockState('ScrollLock'),
        )
        expect(view.value()).not.toBe(true)
        await view.setKey('CapsLock')
        expect(view.value()).toBe(true)
      },
    },
    {
      title: 'unsubscribes from the key state tracker on unmount',
      async run({ harness, expect, trackSubscriptions }) {
        const active = trackSubscriptions(getKeyStateTracker().store)
        const view = await harness.mountKeyLockState('CapsLock')
        expect(active()).toBeGreaterThan(0)
        await view.unmount()
        expect(active()).toBe(0)
      },
    },
  ],
})
