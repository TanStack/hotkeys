---
title: Sequence Recording Guide
id: sequence-recording
---

TanStack Hotkeys provides the `useHotkeySequenceRecorder` composable for building UIs where users record multi-chord sequences (Vim-style shortcuts). The recorder captures each step like a single hotkey chord. Users finish with Enter by default, or you can use manual commit and an optional idle timeout.

Sequence recording uses `recordBy: 'code'` by default, preserving every step as a physical string such as `['[KeyG]', 'Alt+[KeyS]']`. Set `recordBy: 'key'` for logical characters. The shared rejection and conflict options follow the [hotkey recording guide](./hotkey-recording.md#validation-and-conflicts).

## Basic usage

```vue
<script setup lang="ts">
import { formatForDisplay, useHotkeySequenceRecorder } from '@tanstack/vue-hotkeys'
import type { HotkeySequence } from '@tanstack/vue-hotkeys'

const { isRecording, recordedSequence, startRecording, cancelRecording } =
  useHotkeySequenceRecorder({
    onRecord: (sequence: HotkeySequence) => {
      console.log('Recorded:', sequence)
    },
  })
</script>

<template>
  <div>
    <button
      type="button"
      @click="isRecording ? cancelRecording() : startRecording()"
    >
      {{
        isRecording
          ? 'Press chords, then Enter...'
          : recordedSequence
            ? recordedSequence.map((h) => formatForDisplay(h)).join(' ')
            : 'Click to record'
      }}
    </button>
    <button v-if="isRecording" type="button" @click="cancelRecording()">
      Cancel
    </button>
  </div>
</template>
```

## Return value

| Property | Type | Description |
|----------|------|-------------|
| `isRecording` | `boolean` | Whether the recorder is listening |
| `steps` | `HotkeySequence` | Chords captured in the current session |
| `recordedSequence` | `HotkeySequence \| null` | Last committed sequence |
| `startRecording` | `() => void` | Start a new session |
| `stopRecording` | `() => void` | Stop without calling `onRecord` |
| `cancelRecording` | `() => void` | Stop and call `onCancel` |
| `commitRecording` | `() => void` | Commit current `steps` (no-op if empty) |

## Options

`recordBy` defaults to `'code'`; choose `'key'` for logical characters. Repeats and IME composition never append steps. Modifier-only presses wait for a complete chord.

Core options live on `HotkeySequenceRecorderOptions` from `@tanstack/hotkeys`:

- `onRecord(sequence)`: called when a nonempty sequence is committed. Clearing calls only `onClear`.
- `onCancel`, `onClear`: same intent as the hotkey recorder.
- `commitKeys`: `'enter'` (default) or `'none'`. With `'none'`, only `commitRecording()` (or `idleTimeoutMs`) finishes recording; plain Enter can be recorded as a chord.
- `commitOnEnter`: when `commitKeys` is `'enter'`, set to `false` to treat Enter as a normal chord (then use `commitRecording()` or idle timeout to finish).
- `idleTimeoutMs`: optional milliseconds of inactivity after the last completed chord to auto-commit. The timer does not run while waiting for the first chord.

### Provider defaults

```vue
<HotkeysProvider
  defaultOptions={{
    hotkeySequenceRecorder: {
      idleTimeoutMs: 2000,
    },
  }}
>
  <App />
</HotkeysProvider>
```

### `ignoreInputs`

The `HotkeySequenceRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder doesn't intercept normal typing in text inputs, textareas, selects, or contentEditable elements; keystrokes pass through to the input as usual. Pressing Escape still cancels recording even when an input has focus. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.

## Validation and conflicts

Sequence `validate(sequence, { events, parsedSequence })` runs when committing and returns true, false, or a rejection message. `detectConflicts` checks sequence prefixes as well as single bindings. Rejected commits keep recording active with the steps intact so the user can edit them with Backspace. Empty Backspace/Delete clears and emits `onClear` only; removing a nonempty step does not commit. Recorded steps, commit keys, and releases are isolated from application handlers.

## Behavior

| Input | Behavior |
|-------|----------|
| Valid chord | Appended to `steps`; listener stays active |
| Enter (no modifiers), `commitKeys: 'enter'`, `steps.length >= 1` | Commits and calls `onRecord` |
| Escape | Cancels; `onCancel` |
| Backspace / Delete (no modifiers) | Removes last step, or if empty runs only `onClear` and stops |

Recorded chords use portable `Mod` format, same as `HotkeyRecorder`.

## Under the hood

`useHotkeySequenceRecorder` wraps the `HotkeySequenceRecorder` class and subscribes to its TanStack Store, same pattern as `useHotkeyRecorder`.
