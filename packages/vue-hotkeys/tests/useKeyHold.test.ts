import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { HotkeyManager, KeyStateTracker } from '@tanstack/hotkeys'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useKeyHold } from '../src/useKeyHold'
import type { MaybeRefOrGetter, Ref } from 'vue'
import type { IndividualKey } from '@tanstack/hotkeys'

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
