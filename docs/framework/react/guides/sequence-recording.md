---
title: Sequence Recording Guide
id: sequence-recording
---

TanStack Hotkeys provides the `useHotkeySequenceRecorder` hook for building UIs where users record **multi-chord sequences** (Vim-style shortcuts). Each step is captured like a single hotkey chord; users finish with **Enter** by default, or you can use manual commit and optional idle timeout.

## Basic usage

```tsx
import { useHotkeySequenceRecorder, formatForDisplay } from '@tanstack/react-hotkeys'
import type { HotkeySequence } from '@tanstack/react-hotkeys'

function HotkeySequenceRecorder() {
  const recorder = useHotkeySequenceRecorder({
    onRecord: (sequence: HotkeySequence) => {
      console.log('Recorded:', sequence)
    },
  })

  return (
    <div>
      <button
        type="button"
        onClick={
          recorder.isRecording ? recorder.cancelRecording : recorder.startRecording
        }
      >
        {recorder.isRecording
          ? 'Press chords, then Enter…'
          : recorder.recordedSequence
            ? recorder.recordedSequence.map((h) => formatForDisplay(h)).join(' ')
            : 'Click to record'}
      </button>
      {recorder.isRecording && (
        <button type="button" onClick={recorder.cancelRecording}>
          Cancel
        </button>
      )}
    </div>
  )
}
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

Core options live on `HotkeySequenceRecorderOptions` from `@tanstack/hotkeys`:

- `onRecord(sequence)` — called when a sequence is committed (including `[]` when cleared via Backspace with no steps).
- `onCancel`, `onClear` — same intent as the hotkey recorder.
- `commitKeys` — `'enter'` (default) or `'none'`. With `'none'`, only `commitRecording()` (or `idleTimeoutMs`) finishes recording; plain Enter can be recorded as a chord.
- `commitOnEnter` — when `commitKeys` is `'enter'`, set to `false` to treat Enter as a normal chord (then use `commitRecording()` or idle timeout to finish).
- `idleTimeoutMs` — optional milliseconds of inactivity **after the last completed chord** to auto-commit. The timer does not run while waiting for the **first** chord.

### Provider defaults

```tsx
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

## Behavior

| Input | Behavior |
|-------|----------|
| Valid chord | Appended to `steps`; listener stays active |
| Enter (no modifiers), `commitKeys: 'enter'`, `steps.length >= 1` | Commits and calls `onRecord` |
| Escape | Cancels; `onCancel` |
| Backspace / Delete (no modifiers) | Removes last step, or if empty runs `onClear` + `onRecord([])` and stops |

Recorded chords use portable `Mod` format, same as `HotkeyRecorder`.

## Under the hood

`useHotkeySequenceRecorder` wraps the `HotkeySequenceRecorder` class and subscribes to its TanStack Store, same pattern as `useHotkeyRecorder`.
