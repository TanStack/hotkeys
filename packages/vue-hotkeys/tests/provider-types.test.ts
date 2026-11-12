import { describe, expectTypeOf, it } from 'vitest'
import { h } from 'vue'
import { HotkeysProvider } from '../src'
import type { CustomHotkeys } from '@tanstack/hotkeys'

// `HotkeysProvider` has a written-out type, so that its declaration reads the
// same on every supported Vue version. These checks keep that type as strict
// as the one Vue infers.
describe('HotkeysProvider types', () => {
  type Instance = InstanceType<typeof HotkeysProvider>

  it('is a typed component', () => {
    expectTypeOf(HotkeysProvider).not.toBeAny()
    expectTypeOf<Instance['$props']>().not.toBeAny()
  })

  it('accepts its props and rejects wrong ones', () => {
    h(HotkeysProvider, { scope: 'dialog', exclusive: { allow: ['global'] } })
    h(HotkeysProvider, { enabled: false, customHotkeys: null })
    // @ts-expect-error scope is a string
    h(HotkeysProvider, { scope: 123 })
    // @ts-expect-error exclusive is a boolean or an allow list
    h(HotkeysProvider, { exclusive: 'yes' })
    // @ts-expect-error enabled is a boolean
    h(HotkeysProvider, { enabled: 'no' })
    h(HotkeysProvider, { defaultOptions: { keyboardLayout: false } })
    // @ts-expect-error keyboardLayout is a boolean
    h(HotkeysProvider, { defaultOptions: { keyboardLayout: 'no' } })
  })

  it('types the custom-hotkeys-change event', () => {
    h(HotkeysProvider, {
      onCustomHotkeysChange: (custom) => {
        expectTypeOf(custom).toEqualTypeOf<CustomHotkeys>()
      },
    })
    expectTypeOf<Instance['$emit']>().toBeCallableWith(
      'customHotkeysChange',
      {},
    )
    expectTypeOf<Instance['$emit']>()
      .parameter(0)
      .toEqualTypeOf<'customHotkeysChange'>()
  })

  it('resolves prop defaults on the instance', () => {
    expectTypeOf<Instance['enabled']>().toEqualTypeOf<boolean>()
  })
})
