---
title: Sequence Recording Guide
id: sequence-recording
---

Use `createHotkeySequenceRecorder` to capture a series of shortcut chords. By default, each step records its physical code: pressing G twice produces `['[KeyG]', '[KeyG]']`. Set `recordBy: 'key'` to follow logical characters instead. Pass the resulting array directly to sequence registration and format each step for display.

## Record and display a sequence

This example uses a Save button so plain Enter can be recorded as a step:

```svelte
<script lang="ts">
  import { createHotkeySequenceRecorder, formatForDisplay } from '@tanstack/svelte-hotkeys'

  const recorder = createHotkeySequenceRecorder({
    commitKeys: 'none',
    onRecord: (sequence) => console.log('Register or persist:', sequence),
    onReject: ({ message }) => console.log(message),
  })
  const displayedSteps = $derived(recorder.isRecording ? recorder.steps : recorder.recordedSequence ?? [])
</script>

<button onclick={recorder.startRecording}>Record sequence</button>
<p>{displayedSteps.map((step) => formatForDisplay(step)).join(' → ')}</p>
{#if recorder.isRecording}
  <button onclick={recorder.commitRecording}>Save</button>
  <button onclick={recorder.cancelRecording}>Cancel</button>
{/if}
```

## State and controls

The recorder exposes `isRecording`, `steps`, and `recordedSequence` as reactive getters. `steps` contains the current attempt; `recordedSequence` contains the last committed result. `startRecording()` begins a new session. `commitRecording()` saves a nonempty attempt, while `cancelRecording()` discards it and calls `onCancel`. `stopRecording()` resets recorder state without calling `onRecord` or `onCancel`.

## Options and keyboard behavior

- `recordBy`: `'code'` by default; `'key'` records produced logical characters.
- `commitKeys`: `'enter'` by default; plain Enter commits a nonempty sequence. `'none'` lets Enter become a step and requires manual or idle commit.
- `commitOnEnter: false`: also permits Enter as a step when `commitKeys` is `'enter'`.
- `idleTimeoutMs`: optionally commits after inactivity following a completed step. No timer runs before the first step.
- `ignoreInputs`: true by default, including shadow-root inputs. Set false to record from editable fields. Escape still cancels from an input.

Escape cancels. Unmodified Backspace/Delete removes the last step; when already empty it stops and calls only `onClear`. Modifier-only presses, automatic repeats, and IME composition do not append steps. Recorded events and their releases do not trigger application shortcuts.

Set provider defaults through `HotkeysProvider` with `defaultOptions.hotkeySequenceRecorder`.

## Validation and conflicts

`validate(sequence, { events, parsedSequence })` runs at commit. Return true to accept, or false/a message to reject. `detectConflicts` checks live bindings and sequence prefixes, including physical/logical overlap established by the recorded events. `onReject` receives feedback; rejected steps remain editable with Backspace.

The shared options and exclusions are described in the [hotkey recording guide](./hotkey-recording.md#validation-and-conflicts). The application owns reset, persistence, and any binding being edited; clearing never calls `onRecord([])`.
