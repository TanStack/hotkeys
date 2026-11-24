---
title: Testing Hotkeys in Preact
id: testing
description: Write reliable unit and component tests for Preact hotkeys by resetting singleton managers and pinning the target platform.
---

Because TanStack Hotkeys uses page-level singletons for the [hotkey manager](./hotkey-manager) and held-key tracker, two practices keep component and hook tests deterministic across operating systems and test files: resetting those singletons after each test, and pinning `platform`.

## Reset singletons between tests

Unmounting a component cleans up its `useHotkey` registrations, but registrations added via `manager.register`, scopes from `activateScope`, and registrations left behind by failed tests stay in the singleton instances.

Reset `HotkeyManager` in `afterEach` (and `KeyStateTracker` if testing held keys), and unmount rendered components with `cleanup()`:

```tsx
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/preact'
import {
  HotkeyManager,
  KeyStateTracker,
  useHotkey,
} from '@tanstack/preact-hotkeys'

afterEach(() => {
  cleanup()
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})

it('saves with Mod+S', () => {
  const save = vi.fn()

  function Editor() {
    useHotkey('Mod+S', save, { platform: 'mac' })
    return null
  }

  render(<Editor />)
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 's', metaKey: true, bubbles: true }),
  )

  expect(save).toHaveBeenCalledOnce()
})
```

`resetInstance()` removes all listeners and registrations so the next call creates a fresh manager.

## Pin the platform

Simulated DOMs don't always reflect the development or CI operating system. For instance, `happy-dom` on macOS detects `'windows'`, which changes what `Mod` resolves to. Pass `platform: 'mac'` (or `'windows'` or `'linux'`) on the hook, or set it once for the entire test tree through [`HotkeysProvider`](./hotkeys-provider-and-scopes):

```tsx
<HotkeysProvider defaultOptions={{ platform: 'mac' }}>
  <Editor />
</HotkeysProvider>
```

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
- **Simulate key repeat.** Pass `repeat: true` to test `requireReset: true` chords (repeats don't advance sequences). A non-repeat `keydown` counts as a fresh press even without an intervening `keyup`.
- **Flush state updates with `act`.** When a callback sets state, wrap the dispatch in `act` from `preact/test-utils` before asserting on the DOM. `fireEvent` from `@testing-library/preact` does this automatically.

## Testing sequences and timeouts

Dispatch each step in order, and use fake timers to verify the sequence `timeout` (`1000` ms by default):

```tsx
vi.useFakeTimers()

document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))
vi.advanceTimersByTime(500)
document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', bubbles: true }))
expect(goHome).toHaveBeenCalledOnce()

vi.useRealTimers()
```

## Testing element targets and inputs

For hotkeys scoped to an element `target`, or to verify `ignoreInputs` inside an `<input>` or `<textarea>`, focus the element first and dispatch the event directly on it with `bubbles: true`:

```ts
const { getByRole } = render(<Search />)
const input = getByRole('textbox')
input.focus()
input.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true }))
expect(shortcutCallback).not.toHaveBeenCalled()
```
