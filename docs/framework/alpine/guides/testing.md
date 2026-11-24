---
title: Testing Hotkeys in Alpine
id: testing
description: Write reliable unit and component tests for Alpine hotkeys by resetting singleton managers and pinning the target platform.
---

TanStack Hotkeys keeps page-level singletons for the [hotkey manager](./hotkey-manager) and the held-key tracker. Two practices keep component tests deterministic across operating systems and test files. Reset those singletons after each test, and pin `platform`.

## Reset singletons between tests

Destroying an owner from `createHotkeysScope` unregisters the hotkeys it created. Hotkeys registered with `manager.register`, scopes from `activateScope`, and registrations left behind by a failed test stay in the singletons.

Destroy every owner and reset `HotkeyManager` in `afterEach`. Reset `KeyStateTracker` too in tests that read held keys:

```ts
import Alpine from 'alpinejs'
import { afterEach, expect, it, vi } from 'vitest'
import {
  HotkeyManager,
  KeyStateTracker,
  createHotkeysScope,
  hotkeysPlugin,
} from '@tanstack/alpine-hotkeys'

Alpine.plugin(hotkeysPlugin)

const scopes: Array<ReturnType<typeof createHotkeysScope>> = []

afterEach(() => {
  scopes.splice(0).forEach((scope) => scope.destroy())
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
  document.body.replaceChildren()
})

it('saves with Mod+S', () => {
  const save = vi.fn()
  const hotkeys = createHotkeysScope({ platform: 'mac' })
  scopes.push(hotkeys)

  hotkeys.createHotkey('Mod+S', save)
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 's', metaKey: true, bubbles: true }),
  )

  expect(save).toHaveBeenCalledOnce()
})
```

Register `hotkeysPlugin` with `Alpine.plugin(hotkeysPlugin)` before calling `createHotkeysScope()`, without needing mounted DOM markup unless a test uses `Alpine.data`. `resetInstance()` removes every listener and registration, and the next `getHotkeyManager()` call creates a fresh manager.

To test a component that uses `Alpine.data`, install `hotkeysPlugin` first, as your app does before `Alpine.start()`. Mount the markup, call `Alpine.initTree(element)`, and call `Alpine.destroyTree(element)` before the next test.

## Pin the platform

Simulated DOMs don't always match your development or CI operating system. For example, `happy-dom` on macOS detects `'windows'`, which changes what `Mod` means. Pass `platform: 'mac'`, `'windows'`, or `'linux'` in the default options of `createHotkeysScope`, or as an option on one hotkey:

```ts
const hotkeys = createHotkeysScope({ platform: 'mac' }) // Hotkeys, recorders, and labels

hotkeys.createHotkey('Mod+S', save, { platform: 'mac' }) // One hotkey
```

The scope's `platform` is the default for every hotkey, recorder, and label function the owner creates. A `platform` on a single hotkey wins over it.

## Dispatching keyboard events

- **Include `bubbles: true` and `cancelable: true`.** Listeners sit on `document` or target elements, and checking `event.defaultPrevented` requires `cancelable: true`.
- **Include `code` for physical bindings.** Bindings like `[KeyS]` match `event.code`, not `event.key`:

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
- **Simulate key repeat.** Pass `repeat: true` to test `requireReset: true` chords. Repeats don't advance sequences. A non-repeat `keydown` counts as a fresh press even without an intervening `keyup`.
- **Wait for Alpine after a state change.** Reactive options and getters update in Alpine's next tick, so `await Alpine.nextTick()` before the next key press.

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

For a hotkey with an element `target`, or to verify `ignoreInputs` inside an `<input>` or `<textarea>`, focus the element first and dispatch the event on it with `bubbles: true`:

```ts
const input = document.querySelector('input')!
input.focus()
input.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true }))
expect(shortcutCallback).not.toHaveBeenCalled()
```

A getter that returns the `target` runs when Alpine evaluates it, so call `Alpine.initTree` on the markup and `await Alpine.nextTick()` before dispatching an event on the target.
