---
title: Hotkey Recording Guide
id: hotkey-recording
---

TanStack Hotkeys provides the `useHotkeyRecorder` hook for building keyboard shortcut customization UIs. This lets users record their own shortcuts by pressing the desired key combination, similar to how system preferences or IDE shortcut editors work.

## Basic Usage

```tsx
import { useHotkeyRecorder, formatForDisplay } from '@tanstack/react-hotkeys'

function ShortcutRecorder() {
  const { isRecording, recordedHotkey, startRecording, stopRecording, cancelRecording } =
    useHotkeyRecorder({
      onRecord: (hotkey) => {
        console.log('Recorded:', hotkey) // e.g., "Mod+Shift+S"
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

## Return Value

The `useHotkeyRecorder` hook returns an object with:

| Property | Type | Description |
|----------|------|-------------|
| `isRecording` | `boolean` | Whether the recorder is currently listening for key presses |
| `recordedHotkey` | `Hotkey \| null` | The last recorded hotkey string, or `null` if nothing recorded |
| `startRecording` | `() => void` | Start listening for key presses |
| `stopRecording` | `() => void` | Stop listening and keep the recorded hotkey |
| `cancelRecording` | `() => void` | Stop listening and discard any recorded hotkey |

## Options

```tsx
useHotkeyRecorder({
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

### Global Default Options via Provider

You can set default options for all `useHotkeyRecorder` calls by wrapping your component tree with `HotkeysProvider`. Per-hook options will override the provider defaults.

```tsx
import { HotkeysProvider } from '@tanstack/react-hotkeys'

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

## Recording Behavior

The recorder has specific behavior for different keys:

| Key | Behavior |
|-----|----------|
| **Modifier only** (Shift, Ctrl, etc.) | Waits for a non-modifier key -- modifier-only presses don't complete a recording |
| **Modifier + key** (e.g., Ctrl+S) | Records the full combination |
| **Single key** (e.g., Escape, F1) | Records the single key |
| **Escape** | Cancels the recording |
| **Backspace / Delete** | Clears the currently recorded hotkey |

### `ignoreInputs`

The `HotkeyRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements -- keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.

```tsx
useHotkeyRecorder({
  ignoreInputs: false, // record even from inside inputs
  onRecord: (hotkey) => console.log(hotkey),
})
```

### Mod Auto-Conversion

Recorded hotkeys automatically use the portable `Mod` format. If a user on macOS presses Command+S, the recorded hotkey will be `Mod+S` rather than `Meta+S`. This ensures shortcuts are portable across platforms.

## Building a Shortcut Settings UI

Here's a more complete example of a shortcut customization panel:

```tsx
import { useState } from 'react'
import {
  useHotkey,
  useHotkeyRecorder,
  formatForDisplay,
} from '@tanstack/react-hotkeys'
import type { Hotkey } from '@tanstack/react-hotkeys'

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

## Under the Hood

The `useHotkeyRecorder` hook creates a `HotkeyRecorder` class instance and subscribes to its reactive state via `@tanstack/react-store`. The class manages its own keyboard event listeners and state, and the hook handles cleanup on unmount.
