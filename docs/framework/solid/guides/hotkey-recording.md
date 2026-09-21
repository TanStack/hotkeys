---
title: Hotkey Recording Guide
id: hotkey-recording
---

TanStack Hotkeys provides the `createHotkeyRecorder` primitive for building keyboard shortcut customization UIs. This lets users record their own shortcuts by pressing the desired key combination, similar to how system preferences or IDE shortcut editors work.

Recorders default to physical codes: recording a shortcut stores a string such as `Mod+[KeyS]`. Pass it directly to your hotkey registration and use `formatForDisplay` for the label. Set `recordBy: 'key'` when you intentionally want the produced character instead.

## Basic usage

```tsx
import { createHotkeyRecorder, formatForDisplay } from '@tanstack/solid-hotkeys'

function ShortcutRecorder() {
  const recorder = createHotkeyRecorder({
    onRecord: (hotkey) => {
      console.log('Recorded:', hotkey) // e.g., "Mod+Shift+[KeyS]"
    },
  })

  return (
    <div>
      <button onClick={() => recorder.isRecording() ? recorder.stopRecording() : recorder.startRecording()}>
        {recorder.isRecording()
          ? 'Press a key combination...'
          : recorder.recordedHotkey()
            ? formatForDisplay(recorder.recordedHotkey()!)
            : 'Click to record'}
      </button>
      <Show when={recorder.isRecording()}>
        <button onClick={recorder.cancelRecording}>Cancel</button>
      </Show>
    </div>
  )
}
```

> [!NOTE]
> In Solid, `isRecording` and `recordedHotkey` are accessors (signal getters). You must call them with `()` to read the value: `recorder.isRecording()`, `recorder.recordedHotkey()`.

## Return value

The `createHotkeyRecorder` primitive returns an object with:

| Property | Type | Description |
|----------|------|-------------|
| `isRecording` | `() => boolean` | Accessor returning whether the recorder is currently listening |
| `recordedHotkey` | `() => Hotkey \| null` | Accessor returning the last recorded hotkey, or `null` |
| `startRecording` | `() => void` | Start listening for key presses |
| `stopRecording` | `() => void` | Stop listening and reset recorder state without calling `onRecord` |
| `cancelRecording` | `() => void` | Stop listening and discard any recorded hotkey |

## Options

### `recordBy`

Recorders default to `recordBy: 'code'`. Option+S producing `ß` on macOS records `Alt+[KeyS]`; Option+2 producing `™` records `Alt+[Digit2]`. The stored brackets preserve physical identity through state, serialization, and registration; `formatForDisplay` produces a readable label. There is no code-to-letter conversion. Existing authored strings such as `Mod+S` remain logical bindings.

Set `recordBy: 'key'` to intentionally record the produced logical character. A code-mode event with no usable code is rejected rather than silently switching modes. IME composition is ignored. AltGraph character entry is rejected in code mode; key mode preserves the produced character without synthetic Control/Alt while retaining Shift. Recording events, repeats, and their releases do not trigger registered hotkeys or sequences.

```tsx
createHotkeyRecorder({
  recordBy: 'code', // default; choose 'key' for logical characters
  onRecord: (hotkey) => { /* called when a hotkey is recorded */ },
  onCancel: () => { /* called when recording is cancelled */ },
  onClear: () => { /* called when the recorded hotkey is cleared */ },
})
```

Options can also be passed as an accessor function for reactive configuration.

### `onRecord`

Called when the user presses a valid key combination. Receives the recorded `Hotkey` string.

### `onCancel`

Called when recording is cancelled (Escape or `cancelRecording()`).

### `onClear`

Called when the recorded hotkey is cleared (Backspace or Delete during recording).

### Global defaults via provider

```tsx
import { HotkeysProvider } from '@tanstack/solid-hotkeys'

<HotkeysProvider
  defaultOptions={{
    hotkeyRecorder: {
      onCancel: () => console.log('Recording cancelled'),
    },
  }}
>
  <App />
</HotkeysProvider>
```

## Recording behavior

| Key | Behavior |
|-----|----------|
| Modifier only | Waits for a non-modifier key |
| Modifier + key | Records the full combination |
| Single key | Records the single key |
| Escape | Cancels the recording |
| Backspace / Delete | Clears the currently recorded hotkey |

### `ignoreInputs`

The `HotkeyRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder doesn't intercept normal typing in text inputs, textareas, selects, or contentEditable elements. Keystrokes pass through to the input as usual. Pressing Escape still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.

```tsx
createHotkeyRecorder({
  ignoreInputs: false, // record even from inside inputs
  onRecord: (hotkey) => console.log(hotkey),
})
```

### Mod auto-conversion

Recorded hotkeys automatically use the portable `Mod` format (Command on Mac, Control elsewhere).

## Validation and conflicts

Both recorder APIs accept `detectConflicts`, `validate`, and `onReject`. For a single-hotkey recorder, these options can be supplied alongside `onRecord`:

```ts
const options = {
  detectConflicts: {
    // Use registration IDs to exclude the binding being edited:
    excludeIds: [registrationId],
    target: document,
    eventType: 'keydown',
  },
  validate: (_hotkey, { parsedHotkey }) =>
    parsedHotkey.modifiers.length > 0 || 'Include a modifier.',
  onReject: ({ reason, message, conflicts }) => {
    // Show feedback; recording stays active.
    console.log(reason, message, conflicts)
  },
}
```

`validate` returns true to accept, or false/a message to reject. `onReject` receives `reason` (`missing-code`, `alt-graph`, `invalid`, `validation`, or `conflict`), a message, the candidate when available, and conflicting registration views for conflict rejections. Validation runs before commit; rejection never falls back to another key identity.

`detectConflicts: true` checks enabled live registrations with the intended event type (default keydown) and overlapping targets (default document). Document/nested scopes can conflict; disjoint widgets can reuse a binding. The options object also supports `scope: 'all'`, `includeDisabled`, and an `exclude(registration)` predicate. Both single bindings and sequence prefixes are checked. Source events detect physical/logical overlap on the recorded layout. This is a conservative collision check, not a promise that two callbacks will execute: propagation, input filtering, match priority, external listeners, unmounted routes, and other layouts can affect actual dispatch.

For checks outside recording, use `findHotkeyConflicts(bindingOrSequence, options)`. Without source `events`, it compares binding identity and sequence prefixes; it does not guess equivalence between a logical character and a physical position.

## Building a shortcut settings UI

```tsx
import { createSignal } from 'solid-js'
import {
  createHotkey,
  createHotkeyRecorder,
  formatForDisplay,
} from '@tanstack/solid-hotkeys'
import type { Hotkey } from '@tanstack/solid-hotkeys'

function ShortcutSettings() {
  const [shortcuts, setShortcuts] = createSignal<Record<string, Hotkey>>({
    save: 'Mod+S',
    undo: 'Mod+Z',
    search: 'Mod+K',
  })

  const [editingAction, setEditingAction] = createSignal<string | null>(null)

  const recorder = createHotkeyRecorder({
    onRecord: (hotkey) => {
      const action = editingAction()
      if (action) {
        setShortcuts((prev) => ({ ...prev, [action]: hotkey }))
        setEditingAction(null)
      }
    },
    onCancel: () => setEditingAction(null),
  })

  // Register the actual hotkeys with their current bindings
  createHotkey(() => shortcuts().save, () => save())
  createHotkey(() => shortcuts().undo, () => undo())
  createHotkey(() => shortcuts().search, () => openSearch())

  return (
    <div>
      <h2>Keyboard Shortcuts</h2>
      <For each={Object.entries(shortcuts())}>
        {([action, hotkey]) => (
          <div>
            <span>{action}</span>
            <button
              onClick={() => {
                setEditingAction(action)
                recorder.startRecording()
              }}
            >
              {editingAction() === action && recorder.isRecording()
                ? 'Press keys...'
                : formatForDisplay(hotkey)}
            </button>
          </div>
        )}
      </For>
    </div>
  )
}
```

## Under the hood

The `createHotkeyRecorder` primitive creates a `HotkeyRecorder` class instance and subscribes to its reactive state via `@tanstack/solid-store`. The class manages its own keyboard event listeners and state, and the primitive handles cleanup when the component is disposed.
