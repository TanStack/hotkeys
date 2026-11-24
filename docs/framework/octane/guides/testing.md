---
title: Testing Hotkeys in Octane
id: testing
description: Write reliable unit and component tests for Octane hotkeys by resetting singleton managers and pinning the target platform.
---

Because TanStack Hotkeys uses page-level singletons for the [hotkey manager](./hotkey-manager) and held-key tracker, two practices keep component and hook tests deterministic across operating systems and test files: resetting those singletons after each test, and pinning `platform`.

## Reset singletons between tests

Unmounting a root cleans up its `useHotkey` registrations, but registrations added via `manager.register`, scopes from `activateScope`, and registrations left behind by failed tests stay in the singleton instances.

Reset `HotkeyManager` in `afterEach` (and `KeyStateTracker` if testing held keys), and unmount the root the test created:

```tsx
// Editor.tsrx
import { useHotkey } from '@tanstack/octane-hotkeys'

export function Editor({ onSave }: { onSave: () => void }) @{
  useHotkey('Mod+S', onSave, { platform: 'mac' })

  <textarea />
}
```

```ts
// Editor.test.ts
import { afterEach, expect, it, vi } from 'vitest'
import { createRoot, flushSync } from 'octane'
import { HotkeyManager, KeyStateTracker } from '@tanstack/octane-hotkeys'
import { Editor } from './Editor.tsrx'

let root: ReturnType<typeof createRoot> | undefined
let container: HTMLDivElement | undefined

afterEach(() => {
  root?.unmount()
  root = undefined
  container?.remove()
  container = undefined
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})

it('saves with Mod+S', () => {
  const save = vi.fn()
  container = document.body.appendChild(document.createElement('div'))
  root = createRoot(container)

  flushSync(() => root!.render(Editor, { onSave: save }))
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 's', metaKey: true, bubbles: true }),
  )

  expect(save).toHaveBeenCalledOnce()
})
```

`resetInstance()` removes all listeners and registrations so the next call creates a fresh manager.

## Pin the platform

Simulated DOMs don't always reflect the development or CI operating system. For instance, `happy-dom` on macOS detects `'windows'`, which changes what `Mod` resolves to. Pass `platform: 'mac'` (or `'windows'` or `'linux'`) in the hook options, or set it once for the entire test tree through [`HotkeysProvider`](./hotkeys-provider-and-scopes):

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
- **Flush state updates with `flushSync`.** When a callback sets state, dispatch inside `flushSync` from `octane` so the commit finishes before assertions.

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

For hotkeys scoped to an element `target`, or to verify `ignoreInputs` inside an `<input>` or `<textarea>`, focus the element first and dispatch the event directly on it with `bubbles: true`:

```ts
const input = container.querySelector('input')!
input.focus()
input.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true }))
expect(shortcutCallback).not.toHaveBeenCalled()
```
