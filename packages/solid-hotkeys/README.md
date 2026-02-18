# @tanstack/solid-hotkeys

> SolidJS adapter for [TanStack Hotkeys](https://tanstack.com/hotkeys) - keyboard shortcuts made easy

[![npm version](https://img.shields.io/npm/v/@tanstack/solid-hotkeys.svg)](https://www.npmjs.com/package/@tanstack/solid-hotkeys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

✅ **Type-safe hotkey bindings** - Template strings (`Mod+Shift+S`, `Escape`) or parsed objects
✅ **Cross-platform** - `Mod` key automatically maps to Cmd on macOS, Ctrl on Windows/Linux
✅ **Sequence support** - Vim-style multi-key sequences (`g g`, `d d`)
✅ **Key state tracking** - Track which keys are currently held down
✅ **Hotkey recording** - Built-in UI helpers for letting users define their own shortcuts
✅ **SolidJS primitives** - Reactive primitives that work seamlessly with SolidJS

## Installation

```bash
npm install @tanstack/solid-hotkeys @tanstack/hotkeys
# or
bun add @tanstack/solid-hotkeys @tanstack/hotkeys
# or
pnpm add @tanstack/solid-hotkeys @tanstack/hotkeys
```

## Quick Start

```tsx
import { createHotkey } from '@tanstack/solid-hotkeys'

function App() {
  createHotkey('Mod+S', (event) => {
    event.preventDefault()
    console.log('Save!')
  })

  return <div>Press Cmd/Ctrl+S to save</div>
}
```

## Usage

### Basic Hotkey

```tsx
import { createHotkey } from '@tanstack/solid-hotkeys'

function SaveButton() {
  createHotkey('Mod+S', (event, { hotkey }) => {
    event.preventDefault()
    handleSave()
  })

  return <button>Save (Cmd/Ctrl+S)</button>
}
```

### Conditional Hotkeys

```tsx
import { createHotkey } from '@tanstack/solid-hotkeys'
import { Show, createSignal } from 'solid-js'

function Modal(props) {
  // Hotkey only active when modal is open
  createHotkey(
    'Escape',
    () => props.onClose(),
    () => ({
      enabled: props.isOpen,
    }),
  )

  return (
    <Show when={props.isOpen}>
      <div class="modal">Press Escape to close</div>
    </Show>
  )
}
```

### Scoped Hotkeys

```tsx
import { createHotkey } from '@tanstack/solid-hotkeys'

function Editor() {
  let editorRef: HTMLDivElement | undefined

  // Hotkey only works when editor is focused
  createHotkey(
    'Mod+B',
    () => {
      toggleBold()
    },
    { target: editorRef },
  )

  return <div ref={editorRef} contentEditable />
}
```

### Hotkey Sequences (Vim-style)

```tsx
import { createHotkeySequence } from '@tanstack/solid-hotkeys'

function VimEditor() {
  // 'g g' to go to top
  createHotkeySequence(['G', 'G'], () => {
    scrollToTop()
  })

  // 'd d' to delete line
  createHotkeySequence(['D', 'D'], () => {
    deleteLine()
  })

  // 'd i w' to delete inner word
  createHotkeySequence(
    ['D', 'I', 'W'],
    () => {
      deleteInnerWord()
    },
    { timeout: 500 },
  )

  return <div>Try Vim shortcuts!</div>
}
```

### Track Held Keys

```tsx
import { createHeldKeys, createKeyHold } from '@tanstack/solid-hotkeys'
import { For } from 'solid-js'

function KeyTracker() {
  const heldKeys = createHeldKeys()
  const shiftHeld = createKeyHold('Shift')

  return (
    <div>
      <div>Shift: {shiftHeld() ? 'Pressed' : 'Not pressed'}</div>
      <div>
        All held keys:
        <For each={heldKeys()}>{(key) => <kbd>{key}</kbd>}</For>
      </div>
    </div>
  )
}
```

### Hotkey Recorder

```tsx
import { createHotkeyRecorder } from '@tanstack/solid-hotkeys'
import { createSignal, Show } from 'solid-js'

function ShortcutSettings() {
  const [shortcut, setShortcut] = createSignal('Mod+S')

  const recorder = createHotkeyRecorder({
    onRecord: (hotkey) => {
      setShortcut(hotkey)
    },
    onCancel: () => {
      console.log('Recording cancelled')
    },
  })

  return (
    <div>
      <div>Current shortcut: {shortcut()}</div>
      <button onClick={recorder.startRecording}>
        {recorder.isRecording() ? 'Recording...' : 'Edit Shortcut'}
      </button>
      <Show when={recorder.recordedHotkey()}>
        <div>Preview: {recorder.recordedHotkey()}</div>
      </Show>
    </div>
  )
}
```

### Global Configuration

```tsx
import { HotkeysProvider } from '@tanstack/solid-hotkeys'

function App() {
  return (
    <HotkeysProvider
      defaultOptions={{
        hotkey: {
          preventDefault: true,
          enabled: true,
        },
        hotkeySequence: {
          timeout: 1000,
        },
      }}
    >
      <YourApp />
    </HotkeysProvider>
  )
}
```

## API

### `createHotkey(hotkey, callback, options?)`

Register a keyboard hotkey.

- `hotkey`: String like `"Mod+S"` or `"Escape"`, or accessor function
- `callback`: Function called when hotkey is pressed
- `options`: Optional configuration (or accessor function for reactive options)

**Options:**

- `enabled`: Whether the hotkey is active (default: `true`)
- `preventDefault`: Prevent default browser behavior (default: `false`)
- `stopPropagation`: Stop event propagation (default: `false`)
- `target`: DOM element to attach listener to (default: `document`)
- `platform`: Override platform detection

### `createHotkeySequence(sequence, callback, options?)`

Register a multi-key sequence (Vim-style).

- `sequence`: Array of hotkey strings like `["G", "G"]`, or accessor function
- `callback`: Function called when sequence completes
- `options`: Optional configuration (or accessor function)

**Options:**

- `enabled`: Whether sequence detection is active (default: `true`)
- `timeout`: Max time between keys in ms (default: `1000`)
- `platform`: Override platform detection

### `createHeldKeys()`

Returns a signal accessor for array of currently held keys.

```tsx
const heldKeys = createHeldKeys()
// heldKeys() => ["Shift", "A"]
```

### `createHeldKeyCodes()`

Returns a signal accessor for map of held keys to their physical key codes.

```tsx
const heldCodes = createHeldKeyCodes()
// heldCodes() => { "Shift": "ShiftLeft", "A": "KeyA" }
```

### `createKeyHold(key)`

Returns a signal accessor that's true when specific key is held.

```tsx
const isShiftHeld = createKeyHold('Shift')
// isShiftHeld() => true/false
```

### `createHotkeyRecorder(options)`

Hotkey recording interface.

**Options:**

- `onRecord`: Callback when hotkey is recorded
- `onCancel`: Callback when recording is cancelled

**Returns:**

- `isRecording`: Signal accessor for recording state
- `recordedHotkey`: Signal accessor for current hotkey preview
- `startRecording`: Function to start recording
- `stopRecording`: Function to stop recording
- `cancelRecording`: Function to cancel recording

### `HotkeysProvider`

Optional provider for global configuration.

## Cross-Platform Keys

Use `Mod` for cross-platform modifier:

- `Mod+S` → `Cmd+S` on macOS, `Ctrl+S` on Windows/Linux
- `Mod+Shift+P` → `Cmd+Shift+P` on macOS, `Ctrl+Shift+P` elsewhere

## Related

- [TanStack Hotkeys](https://tanstack.com/hotkeys) - The core library
- [@tanstack/react-hotkeys](https://tanstack.com/hotkeys) - React adapter

## License

MIT
