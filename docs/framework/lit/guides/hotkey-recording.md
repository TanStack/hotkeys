---
title: Hotkey Recording Guide
id: hotkey-recording
---

TanStack Hotkeys provides the `HotkeyRecorderController` for building keyboard shortcut customization UIs. This lets users record their own shortcuts by pressing the desired key combination, similar to how system preferences or IDE shortcut editors work.

Recorders default to physical codes: recording a shortcut stores a string such as `Mod+[KeyS]`. Pass it directly to your hotkey registration and use `formatForDisplay` for the label. Set `recordBy: 'key'` when you intentionally want the produced character instead.

## Basic usage

```ts
import { LitElement, html, nothing } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HotkeyRecorderController, formatForDisplay } from '@tanstack/lit-hotkeys'

@customElement('shortcut-recorder')
class ShortcutRecorder extends LitElement {
  private recorder = new HotkeyRecorderController(this, {
    onRecord: (hotkey) => {
      console.log('Recorded:', hotkey) // e.g., "Mod+Shift+[KeyS]"
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
| `stopRecording()` | `() => void` | Stop listening and reset recorder state without calling `onRecord` |
| `cancelRecording()` | `() => void` | Stop listening and discard any recorded hotkey |
| `setOptions(opts)` | `(Partial<HotkeyRecorderOptions>) => void` | Update callbacks at runtime |

The controller registers itself with the host in its constructor, subscribes to the underlying `HotkeyRecorder` store on `hostConnected`, and cleans up on `hostDisconnected`.

## Options

### `recordBy`

Recorders default to `recordBy: 'code'`. Option+S producing `ß` on macOS records `Alt+[KeyS]`; Option+2 producing `™` records `Alt+[Digit2]`. The stored brackets preserve physical identity through state, serialization, and registration; `formatForDisplay` produces a readable label. There is no code-to-letter conversion. Existing authored strings such as `Mod+S` remain logical bindings.

Set `recordBy: 'key'` to intentionally record the produced logical character. A code-mode event with no usable code is rejected rather than silently switching modes. IME composition is ignored. AltGraph character entry is rejected in code mode; key mode preserves the produced character without synthetic Control/Alt while retaining Shift. Recording events, repeats, and their releases do not trigger registered hotkeys or sequences.

Pass options as the second argument to the constructor:

```ts
new HotkeyRecorderController(this, {
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

```ts
new HotkeyRecorderController(this, {
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

## Under the hood

The `HotkeyRecorderController` creates a `HotkeyRecorder` class instance and subscribes to its reactive state via the recorder's TanStack Store. The class manages its own keyboard event listeners and state, and the controller handles cleanup on disconnect.
