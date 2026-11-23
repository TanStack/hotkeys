import { HotkeyManager, KeyStateTracker } from '@tanstack/hotkeys'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  defineComponent,
  effectScope,
  h,
  nextTick,
  ref,
  watch,
  watchEffect,
} from 'vue'
import { useKeyHold } from '../src/useKeyHold'
import type { IndividualKey } from '@tanstack/hotkeys'
import type { MaybeRefOrGetter, Ref } from 'vue'

const CODES: Record<string, string> = {
  Shift: 'ShiftLeft',
  Control: 'ControlLeft',
}

function press(key: string) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, code: CODES[key], bubbles: true }),
  )
}

function release(key: string) {
  document.dispatchEvent(
    new KeyboardEvent('keyup', { key, code: CODES[key], bubbles: true }),
  )
}

function mountKeyHold(key: MaybeRefOrGetter<IndividualKey>) {
  let held!: Ref<boolean>
  const wrapper = mount(
    defineComponent({
      setup() {
        held = useKeyHold(key)
        return () => h('div', String(held.value))
      },
    }),
  )
  return { wrapper, held: () => held.value }
}

describe('useKeyHold', () => {
  beforeEach(() => {
    HotkeyManager.resetInstance()
    KeyStateTracker.resetInstance()
  })

  afterEach(() => {
    release('Shift')
    release('Control')
    HotkeyManager.resetInstance()
    KeyStateTracker.resetInstance()
  })

  it('tracks a plain key', () => {
    const { wrapper, held } = mountKeyHold('Shift')
    press('Shift')
    expect(held()).toBe(true)
    release('Shift')
    expect(held()).toBe(false)
    wrapper.unmount()
  })

  it('notifies only when its own key changes', () => {
    const scope = effectScope()
    let runs = 0
    scope.run(() => {
      const shift = useKeyHold('Shift')
      watchEffect(
        () => {
          void shift.value
          runs++
        },
        { flush: 'sync' },
      )
    })
    expect(runs).toBe(1)

    press('Control')
    release('Control')
    expect(runs).toBe(1)

    press('Shift')
    expect(runs).toBe(2)
    release('Shift')
    expect(runs).toBe(3)
    scope.stop()
  })

  it('follows a ref key to a held key, then sees that key released', () => {
    const key = ref<IndividualKey>('Shift')
    const scope = effectScope()
    const held = scope.run(() => useKeyHold(key))!
    press('Control')
    expect(held.value).toBe(false)

    key.value = 'Control'
    expect(held.value).toBe(true)
    release('Control')
    expect(held.value).toBe(false)
    scope.stop()
  })

  it('gives the new answer to a watcher that runs before its own', () => {
    const key = ref<IndividualKey>('Shift')
    const scope = effectScope()
    const seen: Array<boolean> = []
    scope.run(() => {
      let held: { readonly value: boolean } | undefined
      watch(
        key,
        () => {
          seen.push(held!.value)
        },
        { flush: 'sync' },
      )
      held = useKeyHold(key)
    })
    press('Control')
    key.value = 'Control'
    expect(seen).toEqual([true])
    scope.stop()
  })

  it('releases its subscription when its scope is disposed', () => {
    const store = KeyStateTracker.getInstance().store
    const subscribe = store.subscribe.bind(store)
    const unsubscribed = vi.fn()
    vi.spyOn(store, 'subscribe').mockImplementation((listener) => {
      const subscription = subscribe(listener)
      return {
        unsubscribe: () => {
          unsubscribed()
          subscription.unsubscribe()
        },
      }
    })
    const scope = effectScope()
    scope.run(() => useKeyHold('Shift'))
    expect(unsubscribed).not.toHaveBeenCalled()
    scope.stop()
    expect(unsubscribed).toHaveBeenCalledOnce()
  })

  it('tracks a getter key', () => {
    const { wrapper, held } = mountKeyHold(() => 'Shift')
    press('Shift')
    expect(held()).toBe(true)
    wrapper.unmount()
  })

  it('follows a ref key without waiting for a key event', async () => {
    const key = ref<IndividualKey>('Shift')
    const { wrapper, held } = mountKeyHold(key)
    press('Shift')
    expect(held()).toBe(true)

    key.value = 'Control'
    await nextTick()
    expect(held()).toBe(false)

    key.value = 'Shift'
    await nextTick()
    expect(held()).toBe(true)
    wrapper.unmount()
  })
})
