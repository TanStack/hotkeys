---
title: Testing Hotkeys in Svelte
id: testing
description: Write reliable unit and component tests for Svelte hotkeys by resetting singleton managers and pinning the target platform.
---

TanStack Hotkeys uses page-level singletons for the [hotkey manager](./hotkey-manager) and the held-key tracker. Two practices keep Svelte component tests deterministic across operating systems and test files: resetting those singletons after each test, and pinning `platform`.

## Reset singletons between tests

Unmounting a component cleans up its `createHotkey` registrations. Registrations added with `manager.register`, scopes from `activateScope`, and registrations left behind by failed tests stay in the singleton instances.

Reset `HotkeyManager` in `afterEach`, and reset `KeyStateTracker` in tests that read held keys:

```svelte
<!-- Editor.svelte -->
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  let { onSave }: { onSave: () => void } = $props()

  createHotkey('Mod+S', () => onSave(), { platform: 'mac' })
</script>

<textarea></textarea>
```

```ts
// Editor.test.ts
import { afterEach, expect, it, vi } from 'vitest'
import { flushSync, mount, unmount } from 'svelte'
import { HotkeyManager, KeyStateTracker } from '@tanstack/svelte-hotkeys'
import Editor from './Editor.svelte'

let mounted: Record<string, unknown> | undefined

afterEach(() => {
  if (mounted) {
    unmount(mounted)
    mounted = undefined
  }
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})

it('saves with Mod+S', () => {
  const save = vi.fn()
  mounted = mount(Editor, {
    target: document.body,
    props: { onSave: save },
  })

  flushSync()
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 's', metaKey: true, bubbles: true }),
  )

  expect(save).toHaveBeenCalledOnce()
})
```

`flushSync()` runs the effect that registers the hotkey before the test presses a key. `resetInstance()` removes all listeners and registrations, so the next call creates a fresh manager.

## Pin the platform

Simulated DOMs don't always match the operating system running the tests. For instance, `happy-dom` on macOS detects `'windows'`, which changes what `Mod` resolves to. Pass `platform: 'mac'` (or `'windows'` or `'linux'`) on the hotkey, or set it once for the whole test tree with [`HotkeysProvider`](./hotkeys-provider-and-scopes):

```svelte
<HotkeysProvider defaultOptions={{ platform: 'mac' }}>
  <Editor {onSave} />
</HotkeysProvider>
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

To test a hotkey attached to an element, or to verify `ignoreInputs` inside an `<input>` or `<textarea>`, mount the component into `document.body`, focus the element, and dispatch the event on it with `bubbles: true`:

```ts
const component = mount(SearchBox, { target: document.body })
try {
  flushSync()

  const input = document.querySelector('input')!
  input.focus()
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true }))
  expect(shortcutCallback).not.toHaveBeenCalled()
} finally {
  unmount(component)
}
```
