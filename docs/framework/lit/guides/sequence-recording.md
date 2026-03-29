---
title: Sequence Recording Guide
id: sequence-recording
---

TanStack Hotkeys provides the `HotkeySequenceRecorderController` for building UIs where users record **multi-chord sequences** (Vim-style shortcuts). Each step is captured like a single hotkey chord; users finish with **Enter** by default, or you can use manual commit and optional idle timeout.

## Basic Usage

```ts
import { LitElement, html, nothing } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HotkeySequenceRecorderController, formatForDisplay } from '@tanstack/lit-hotkeys'
import type { HotkeySequence } from '@tanstack/lit-hotkeys'

@customElement('sequence-recorder')
class SequenceRecorder extends LitElement {
  private recorder = new HotkeySequenceRecorderController(this, {
    onRecord: (sequence: HotkeySequence) => {
      console.log('Recorded:', sequence) // e.g., ["G", "G"]
    },
  })

  render() {
    const { isRecording, steps, recordedSequence } = this.recorder
    return html`
      <div>
        <button
          @click=${() =>
            isRecording
              ? this.recorder.cancelRecording()
              : this.recorder.startRecording()}
        >
          ${isRecording
            ? 'Press chords, then Enter…'
            : recordedSequence
              ? recordedSequence.map((h) => formatForDisplay(h)).join(' ')
              : 'Click to record'}
        </button>
        ${isRecording
          ? html`<button @click=${() => this.recorder.cancelRecording()}>
              Cancel
            </button>`
          : nothing}
      </div>
    `
  }
}
```

## Controller API

`HotkeySequenceRecorderController` exposes the following reactive getters and methods:

| Member | Type | Description |
|--------|------|-------------|
| `isRecording` | `boolean` | Whether the recorder is currently listening |
| `steps` | `HotkeySequence` | Chords captured in the current session |
| `recordedSequence` | `HotkeySequence \| null` | Last committed sequence |
| `startRecording()` | `() => void` | Start a new recording session |
| `stopRecording()` | `() => void` | Stop without calling `onRecord` |
| `cancelRecording()` | `() => void` | Stop and call `onCancel` |
| `commitRecording()` | `() => void` | Commit current `steps` (no-op if empty) |
| `setOptions(opts)` | `(Partial<HotkeySequenceRecorderOptions>) => void` | Update options at runtime |

The controller registers itself with the host in its constructor, subscribes to the underlying `HotkeySequenceRecorder` store on `hostConnected`, and cleans up on `hostDisconnected`.

## Options

Pass options as the second argument to the constructor:

```ts
new HotkeySequenceRecorderController(this, {
  onRecord: (sequence) => { /* called when a sequence is committed */ },
  onCancel: () => { /* called when recording is cancelled */ },
  onClear: () => { /* called when cleared via Backspace with no steps */ },
  commitKeys: 'enter', // or 'none'
  idleTimeoutMs: 2000,
})
```

### `onRecord`

Called when a sequence is committed (including `[]` when cleared via Backspace with no steps). Receives the recorded `HotkeySequence` array.

### `onCancel`

Called when recording is cancelled (either by pressing Escape or calling `cancelRecording()`).

### `onClear`

Called when the sequence is cleared (by pressing Backspace or Delete during recording when no steps remain).

### `commitKeys`

Controls how the user finishes recording from the keyboard:

- `'enter'` (default) — plain Enter (no modifiers) commits when at least one step exists.
- `'none'` — only `commitRecording()` or `idleTimeoutMs` finishes recording; plain Enter can be recorded as a chord.

### `commitOnEnter`

When `commitKeys` is `'enter'`, set to `false` to treat Enter as a normal chord. Use `commitRecording()` or idle timeout to finish instead.

### `idleTimeoutMs`

Milliseconds of inactivity **after the last completed chord** to auto-commit. The timer does not run while waiting for the **first** chord.

### `ignoreInputs`

The `HotkeySequenceRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements -- keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.

```ts
new HotkeySequenceRecorderController(this, {
  ignoreInputs: false, // record even from inside inputs
  onRecord: (sequence) => console.log(sequence),
})
```

## Recording Behavior

| Input | Behavior |
|-------|----------|
| Valid chord | Appended to `steps`; listener stays active |
| Enter (no modifiers), `commitKeys: 'enter'`, `steps.length >= 1` | Commits and calls `onRecord` |
| Escape | Cancels; calls `onCancel` |
| Backspace / Delete (no modifiers) | Removes last step, or if empty runs `onClear` + `onRecord([])` and stops |

Recorded chords use portable `Mod` format, same as `HotkeyRecorderController`.

## Under the Hood

The `HotkeySequenceRecorderController` creates a `HotkeySequenceRecorder` class instance and subscribes to its reactive state via `@tanstack/store`. The class manages its own keyboard event listeners and state, and the controller handles cleanup on disconnect.
