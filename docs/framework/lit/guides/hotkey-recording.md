---
title: Hotkey Recording Guide
id: hotkey-recording
---

TanStack Hotkeys provides the `HotkeyRecorderController` for building keyboard shortcut customization UIs. This lets users record their own shortcuts by pressing the desired key combination, similar to how system preferences or IDE shortcut editors work.

## Basic Usage

```ts
import { LitElement, html, nothing } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HotkeyRecorderController, formatForDisplay } from '@tanstack/lit-hotkeys'

@customElement('shortcut-recorder')
class ShortcutRecorder extends LitElement {
  private recorder = new HotkeyRecorderController(this, {
    onRecord: (hotkey) => {
      console.log('Recorded:', hotkey) // e.g., "Mod+Shift+S"
    },
  })

  render() {
    const { isRecording, recordedHotkey } = this.recorder
    return html`
      <div>
        <button
          @click=${() =>
            isRecording
              ? this.recorder.stopRecording()
              : this.recorder.startRecording()}
        >
          ${isRecording
            ? 'Press a key combination...'
            : recordedHotkey
              ? formatForDisplay(recordedHotkey)
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

`HotkeyRecorderController` exposes the following reactive getters and methods:

| Member | Type | Description |
|--------|------|-------------|
| `isRecording` | `boolean` (getter) | Whether the recorder is currently listening for key presses |
| `recordedHotkey` | `Hotkey \| null` (getter) | The last recorded hotkey string, or `null` if nothing recorded |
| `startRecording()` | `() => void` | Start listening for key presses |
| `stopRecording()` | `() => void` | Stop listening and keep the recorded hotkey |
| `cancelRecording()` | `() => void` | Stop listening and discard any recorded hotkey |
| `setOptions(opts)` | `(Partial<HotkeyRecorderOptions>) => void` | Update callbacks at runtime |

The controller registers itself with the host in its constructor, subscribes to the underlying `HotkeyRecorder` store on `hostConnected`, and cleans up on `hostDisconnected`.

## Options

Pass options as the second argument to the constructor:

```ts
new HotkeyRecorderController(this, {
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


## Recording Behavior

The recorder has specific behavior for different keys:

| Key | Behavior |
|-----|----------|
| **Modifier only** (Shift, Ctrl, etc.) | Waits for a non-modifier key — modifier-only presses don't complete a recording |
| **Modifier + key** (e.g., Ctrl+S) | Records the full combination |
| **Single key** (e.g., Escape, F1) | Records the single key |
| **Escape** | Cancels the recording |
| **Backspace / Delete** | Clears the currently recorded hotkey |

### `ignoreInputs`

The `HotkeyRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements -- keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.

```ts
new HotkeyRecorderController(this, {
  ignoreInputs: false, // record even from inside inputs
  onRecord: (hotkey) => console.log(hotkey),
})
```

### Mod Auto-Conversion

Recorded hotkeys automatically use the portable `Mod` format. If a user on macOS presses Command+S, the recorded hotkey will be `Mod+S` rather than `Meta+S`. This ensures shortcuts are portable across platforms.

## Building a Shortcut Settings UI

Here's a more complete example of a shortcut customization panel:

```ts
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {
  HotkeyRecorderController,
  HotkeyController,
  formatForDisplay,
} from '@tanstack/lit-hotkeys'
import type { Hotkey } from '@tanstack/lit-hotkeys'

interface ShortcutMap {
  save: Hotkey
  undo: Hotkey
  search: Hotkey
}

@customElement('shortcut-settings')
class ShortcutSettings extends LitElement {
  @state() private shortcuts: ShortcutMap = {
    save: 'Mod+S',
    undo: 'Mod+Z',
    search: 'Mod+K',
  }

  @state() private editingAction: keyof ShortcutMap | null = null

  private recorder = new HotkeyRecorderController(this, {
    onRecord: (hotkey) => {
      if (this.editingAction) {
        this.shortcuts = { ...this.shortcuts, [this.editingAction]: hotkey }
        this.editingAction = null
      }
    },
    onCancel: () => {
      this.editingAction = null
    },
  })

  private saveCtrl?: HotkeyController
  private undoCtrl?: HotkeyController
  private searchCtrl?: HotkeyController

  connectedCallback() {
    super.connectedCallback()
    this._registerHotkeys()
  }

  updated() {
    this._unregisterHotkeys()
    this._registerHotkeys()
  }

  private _registerHotkeys() {
    this.saveCtrl = new HotkeyController(this, this.shortcuts.save, () => save())
    this.undoCtrl = new HotkeyController(this, this.shortcuts.undo, () => undo())
    this.searchCtrl = new HotkeyController(this, this.shortcuts.search, () => openSearch())
  }

  private _unregisterHotkeys() {
    this.saveCtrl?.hostDisconnected()
    this.undoCtrl?.hostDisconnected()
    this.searchCtrl?.hostDisconnected()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this._unregisterHotkeys()
  }

  render() {
    return html`
      <div>
        <h2>Keyboard Shortcuts</h2>
        ${(Object.entries(this.shortcuts) as Array<[keyof ShortcutMap, Hotkey]>).map(
          ([action, hotkey]) => html`
            <div>
              <span>${action}</span>
              <button
                @click=${() => {
                  this.editingAction = action
                  this.recorder.startRecording()
                }}
              >
                ${this.editingAction === action && this.recorder.isRecording
                  ? 'Press keys...'
                  : formatForDisplay(hotkey)}
              </button>
            </div>
          `,
        )}
      </div>
    `
  }
}
```

## Under the Hood

The `HotkeyRecorderController` creates a `HotkeyRecorder` class instance and subscribes to its reactive state via the recorder's TanStack Store. The class manages its own keyboard event listeners and state, and the controller handles cleanup on disconnect.
