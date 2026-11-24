---
title: Testing Hotkeys in Vue
id: testing
description: Write reliable unit and component tests for Vue hotkeys by resetting singleton managers and pinning the target platform.
---

TanStack Hotkeys uses page-level singletons for the [hotkey manager](./hotkey-manager) and the held-key tracker. Two practices keep Vue component and composable tests deterministic across operating systems and test files: resetting those singletons after each test, and pinning `platform`.

## Reset singletons between tests

Unmounting a component cleans up its `useHotkey` registrations. Registrations added with `manager.register`, scopes from `activateScope`, and registrations left behind by failed tests stay in the singleton instances.

Reset `HotkeyManager` in `afterEach`, and reset `KeyStateTracker` in tests that read held keys:

```ts
import { afterEach, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import {
  HotkeyManager,
  KeyStateTracker,
  useHotkey,
} from '@tanstack/vue-hotkeys'

afterEach(() => {
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})

it('saves with Mod+S', () => {
  const save = vi.fn()

  const Editor = defineComponent({
    setup() {
      useHotkey('Mod+S', save, { platform: 'mac' })
      return () => null
    },
  })

  const wrapper = mount(Editor)
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 's', metaKey: true, bubbles: true }),
  )

  expect(save).toHaveBeenCalledOnce()
  wrapper.unmount()
})
```

`resetInstance()` removes all listeners and registrations, so the next call creates a fresh manager.

## Pin the platform

Simulated DOMs don't always match the operating system running the tests. For instance, `happy-dom` on macOS detects `'windows'`, which changes what `Mod` resolves to. Pass `platform: 'mac'` (or `'windows'` or `'linux'`) on the composable, or set it once for the whole test tree with [`HotkeysProvider`](./hotkeys-provider-and-scopes):

```ts
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import { HotkeysProvider } from '@tanstack/vue-hotkeys'

const wrapper = mount({
  render: () =>
    h(HotkeysProvider, { defaultOptions: { platform: 'mac' } }, () =>
      h(Editor),
    ),
})
```

## Dispatching keyboard events

- **Include `bubbles: true` and `cancelable: true`.** Listeners sit on `document` or target elements, and checking `event.defaultPrevented` requires `cancelable: true`.
- **Include `code` for physical bindings.** Bindings such as `[KeyS]` match `event.code`, not `event.key`:

```ts
const event = new KeyboardEvent('keydown', {
  key: 's',
  code: 'KeyS',
  metaKey: true,
  bubbles: true,
  cancelable: true,
})
document.dispatchEvent(event)
expect(event.defaultPrevented).toBe(true)
```

- **Dispatch `keydown` before `keyup`.** Hotkeys with `eventType: 'keyup'` fire only for the release of a matching press they observed.
- **Simulate key repeat.** Pass `repeat: true` to test `requireReset: true` chords. Repeats don't advance sequences, and a non-repeat `keydown` counts as a fresh press even without an intervening `keyup`.

## Testing sequences and timeouts

Dispatch each step in order, and use fake timers to verify the sequence `timeout` (`1000` ms by default):

```ts
vi.useFakeTimers()
try {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))
  vi.advanceTimersByTime(500)
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', bubbles: true }))
  expect(goHome).toHaveBeenCalledOnce()
} finally {
  vi.useRealTimers()
}
```

## Testing element targets and inputs

To test a hotkey with an element `target`, or to verify `ignoreInputs` inside an `<input>` or `<textarea>`, mount the component into the document, focus the element, and dispatch the event on it with `bubbles: true`:

```ts
const wrapper = mount(SearchBox, { attachTo: document.body })

const input = wrapper.get('input').element
input.focus()
input.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true }))
expect(shortcutCallback).not.toHaveBeenCalled()

wrapper.unmount()
```

Use `attachTo: document.body` so `focus()` works. Reactive changes to options such as `enabled` apply after `await nextTick()`.
