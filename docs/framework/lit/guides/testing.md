---
title: Testing Hotkeys in Lit
id: testing
description: Write reliable unit and element tests for Lit hotkeys by resetting singleton managers and pinning the target platform.
---

TanStack Hotkeys keeps page-level singletons for the [hotkey manager](./hotkey-manager) and the held-key tracker. Two practices keep element tests deterministic across operating systems and test files. Reset those singletons after each test, and pin `platform`.

> [!NOTE]
> The examples use `@customElement` and `@hotkey`, so your test tool must compile decorators the way your app build does. Without decorator support, register the same hotkeys with `HotkeyController`.

## Reset singletons between tests

A disconnected element unregisters its `@hotkey` and `HotkeyController` registrations. Hotkeys registered with `manager.register`, scopes from `activateScope`, and registrations left behind by a failed test stay in the singletons.

Remove the elements and reset `HotkeyManager` in `afterEach`. Reset `KeyStateTracker` too in tests that read held keys:

```ts
import { afterEach, expect, it, vi } from 'vitest'
import { LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HotkeyManager, KeyStateTracker, hotkey } from '@tanstack/lit-hotkeys'

@customElement('test-editor')
class TestEditor extends LitElement {
  @hotkey('Mod+S', { platform: 'mac' })
  save() {
    this.dispatchEvent(new CustomEvent('save'))
  }
}

afterEach(() => {
  document.body.replaceChildren()
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})

it('saves with Mod+S', async () => {
  const save = vi.fn()
  const editor = new TestEditor()
  editor.addEventListener('save', save)

  document.body.append(editor)
  await editor.updateComplete
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 's', metaKey: true, bubbles: true }),
  )

  expect(save).toHaveBeenCalledOnce()
})
```

`resetInstance()` removes every listener and registration, and the next `getHotkeyManager()` call creates a fresh manager.

## Pin the platform

Simulated DOMs don't always match your development or CI operating system. For example, `happy-dom` on macOS detects `'windows'`, which changes what `Mod` means. Pass `platform: 'mac'`, `'windows'`, or `'linux'` as an option on each hotkey:

```ts
@hotkey('Mod+S', { platform: 'mac' })
save() {}

private saveHotkey = new HotkeyController(this, 'Mod+S', () => this.save(), () => ({
  platform: 'mac',
}))
```

Lit has no provider to set the platform once, so share an options object between hotkeys. Pass the same `platform` to `FormatForDisplayController` and `HotkeyHintController` when a test reads labels or hints:

```ts
const testOptions = { platform: 'mac' } as const

private formatForDisplay = new FormatForDisplayController(this, testOptions)
```

## Dispatching keyboard events

- **Include `bubbles: true` and `cancelable: true`.** Listeners sit on `document` or target elements, and checking `event.defaultPrevented` requires `cancelable: true`.
- **Include `composed: true` inside a shadow root.** An event dispatched on an element in a shadow root stops at the root without it, so a `document` hotkey never sees it.
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

For a hotkey with an element `target`, or to verify `ignoreInputs` inside an `<input>` or `<textarea>`, focus the element first and dispatch the event on it with `bubbles: true`. Add `composed: true` when the element lives in the shadow root of your component:

```ts
const input = editor.shadowRoot!.querySelector('input')!
input.focus()
input.dispatchEvent(
  new KeyboardEvent('keydown', { key: 'k', bubbles: true, composed: true }),
)
expect(shortcutCallback).not.toHaveBeenCalled()
```

A `HotkeyController` reads its `target` after each update of its element, so await `editor.updateComplete` before dispatching an event on the target.
