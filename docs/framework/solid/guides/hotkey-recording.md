---
title: Hotkey Recording Guide
id: hotkey-recording
---

TanStack Hotkeys provides the `createHotkeyRecorder` primitive for building keyboard shortcut customization UIs. This lets users record their own shortcuts by pressing the desired key combination, similar to how system preferences or IDE shortcut editors work.

## Basic Usage

```tsx
import { createHotkeyRecorder, formatForDisplay } from '@tanstack/solid-hotkeys'

function ShortcutRecorder() {
  const recorder = createHotkeyRecorder({
    onRecord: (hotkey) => {
      console.log('Recorded:', hotkey) // e.g., "Mod+Shift+S"
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
> In Solid, `isRecording` and `recordedHotkey` are **accessors** (signal getters). You must call them with `()` to read the value: `recorder.isRecording()`, `recorder.recordedHotkey()`.

## Return Value

The `createHotkeyRecorder` primitive returns an object with:

| Property | Type | Description |
|----------|------|-------------|
| `isRecording` | `() => boolean` | Accessor returning whether the recorder is currently listening |
| `recordedHotkey` | `() => Hotkey \| null` | Accessor returning the last recorded hotkey, or `null` |
| `startRecording` | `() => void` | Start listening for key presses |
| `stopRecording` | `() => void` | Stop listening and keep the recorded hotkey |
| `cancelRecording` | `() => void` | Stop listening and discard any recorded hotkey |

## Options

```tsx
createHotkeyRecorder({
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

### Global Default Options via Provider

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

## Recording Behavior

| Key | Behavior |
|-----|----------|
| **Modifier only** | Waits for a non-modifier key |
| **Modifier + key** | Records the full combination |
| **Single key** | Records the single key |
| **Escape** | Cancels the recording |
| **Backspace / Delete** | Clears the currently recorded hotkey |

### `ignoreInputs`

The `HotkeyRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements -- keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.

```tsx
createHotkeyRecorder({
  ignoreInputs: false, // record even from inside inputs
  onRecord: (hotkey) => console.log(hotkey),
})
```

### Mod Auto-Conversion

Recorded hotkeys automatically use the portable `Mod` format (Command on Mac, Control elsewhere).

## Building a Shortcut Settings UI

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

## Under the Hood

The `createHotkeyRecorder` primitive creates a `HotkeyRecorder` class instance and subscribes to its reactive state via `@tanstack/solid-store`. The class manages its own keyboard event listeners and state, and the primitive handles cleanup when the component is disposed.
