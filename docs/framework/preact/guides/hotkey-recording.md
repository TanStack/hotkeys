---
title: Hotkey Recording Guide
id: hotkey-recording
---

TanStack Hotkeys includes the `useHotkeyRecorder` hook for building keyboard shortcut customization UIs. Users record their own shortcuts by pressing the desired key combination, the same way system preferences or IDE shortcut editors work.

Recorders default to physical codes: recording a shortcut stores a string such as `Mod+[KeyS]`. Pass it directly to your hotkey registration and use `formatForDisplay` for the label. Set `recordBy: 'key'` when you intentionally want the produced character instead.

## Basic usage

```tsx
import { useHotkeyRecorder, formatForDisplay } from '@tanstack/preact-hotkeys'

function ShortcutRecorder() {
  const { isRecording, recordedHotkey, startRecording, stopRecording, cancelRecording } =
    useHotkeyRecorder({
      onRecord: (hotkey) => {
        console.log('Recorded:', hotkey) // e.g., "Mod+Shift+[KeyS]"
      },
    })

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording
          ? 'Press a key combination...'
          : recordedHotkey
            ? formatForDisplay(recordedHotkey)
            : 'Click to record'}
      </button>
      {isRecording && (
        <button onClick={cancelRecording}>Cancel</button>
      )}
    </div>
  )
}
```

## Return value

The `useHotkeyRecorder` hook returns an object with:

| Property | Type | Description |
|----------|------|-------------|
| `isRecording` | `boolean` | Whether the recorder is currently listening for key presses |
| `recordedHotkey` | `Hotkey \| null` | The last recorded hotkey string, or `null` if nothing recorded |
| `startRecording` | `() => void` | Start listening for key presses |
| `stopRecording` | `() => void` | Stop listening and reset recorder state without calling `onRecord` |
| `cancelRecording` | `() => void` | Stop listening and discard any recorded hotkey |

## Options

### `recordBy`

Recorders default to `recordBy: 'code'`. Option+S producing `ß` on macOS records `Alt+[KeyS]`; Option+2 producing `™` records `Alt+[Digit2]`. The stored brackets preserve physical identity through state, serialization, and registration; `formatForDisplay` produces a readable label. There is no code-to-letter conversion. Existing authored strings such as `Mod+S` remain logical bindings.

Set `recordBy: 'key'` to intentionally record the produced logical character. A code-mode event with no usable code is rejected rather than silently switching modes. IME composition is ignored. AltGraph character entry is rejected in code mode; key mode preserves the produced character without synthetic Control/Alt while retaining Shift. Recording events, repeats, and their releases do not trigger registered hotkeys or sequences.

```tsx
useHotkeyRecorder({
  recordBy: 'code', // default; choose 'key' for logical characters
  onRecord: (hotkey) => { /* called when a hotkey is recorded */ },
  onCancel: () => { /* called when recording is cancelled */ },
  onClear: () => { /* called when the recorded hotkey is cleared */ },
})
```

### `onRecord`

Called when the user presses a valid key combination (a modifier + a non-modifier key, or a single non-modifier key). Receives the recorded `Hotkey` string.

### `onCancel`

Called when recording is cancelled (either by pressing Escape or calling `cancelRecording()`).

### `onClear`

Called when the recorded hotkey is cleared (by pressing Backspace or Delete during recording).

### Global defaults via provider

You can set default options for all `useHotkeyRecorder` calls by wrapping your component tree with `HotkeysProvider`. Per-hook options override the provider defaults.

```tsx
import { HotkeysProvider } from '@tanstack/preact-hotkeys'

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

The recorder has specific behavior for different keys:

| Key | Behavior |
|-----|----------|
| Modifier only (Shift, Ctrl, etc.) | Waits for a non-modifier key; modifier-only presses don't complete a recording |
| Modifier + key (e.g., Ctrl+S) | Records the full combination |
| Single key (e.g., Escape, F1) | Records the single key |
| Escape | Cancels the recording |
| Backspace / Delete | Clears the currently recorded hotkey |

### `ignoreInputs`

The `HotkeyRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder doesn't intercept normal typing in text inputs, textareas, selects, or contentEditable elements. Keystrokes pass through to the input as usual. Pressing Escape still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.

```tsx
useHotkeyRecorder({
  ignoreInputs: false, // record even from inside inputs
  onRecord: (hotkey) => console.log(hotkey),
})
```

### Mod auto-conversion

Recorded hotkeys automatically use the portable `Mod` format. If a user on macOS presses Command+S, the recorded hotkey is `Mod+[KeyS]` rather than `Meta+[KeyS]`, so the shortcut keeps working when it syncs to a machine on another OS.

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

Here's a more complete example of a shortcut customization panel:

```tsx
import { useState } from 'preact/hooks'
import {
  useHotkey,
  useHotkeyRecorder,
  formatForDisplay,
} from '@tanstack/preact-hotkeys'
import type { Hotkey } from '@tanstack/preact-hotkeys'

function ShortcutSettings() {
  const [shortcuts, setShortcuts] = useState<Record<string, Hotkey>>({
    save: 'Mod+S',
    undo: 'Mod+Z',
    search: 'Mod+K',
  })

  const [editingAction, setEditingAction] = useState<string | null>(null)

  const recorder = useHotkeyRecorder({
    onRecord: (hotkey) => {
      if (editingAction) {
        setShortcuts((prev) => ({ ...prev, [editingAction]: hotkey }))
        setEditingAction(null)
      }
    },
    onCancel: () => setEditingAction(null),
  })

  // Register the actual hotkeys with their current bindings
  useHotkey(shortcuts.save, () => save())
  useHotkey(shortcuts.undo, () => undo())
  useHotkey(shortcuts.search, () => openSearch())

  return (
    <div>
      <h2>Keyboard Shortcuts</h2>
      {Object.entries(shortcuts).map(([action, hotkey]) => (
        <div key={action}>
          <span>{action}</span>
          <button
            onClick={() => {
              setEditingAction(action)
              recorder.startRecording()
            }}
          >
            {editingAction === action && recorder.isRecording
              ? 'Press keys...'
              : formatForDisplay(hotkey)}
          </button>
        </div>
      ))}
    </div>
  )
}
```

## Under the hood

The `useHotkeyRecorder` hook creates a `HotkeyRecorder` class instance and subscribes to its reactive state via `@tanstack/preact-store`. The class manages its own keyboard event listeners and state, and the hook handles cleanup on unmount.
