---
title: Sequence Recording Guide
id: sequence-recording
---

Use `useHotkeySequenceRecorder` to record an ordered sequence of chords. Recording defaults to physical codes, such as `['[KeyG]', 'Alt+[KeyS]']`. Use `recordBy: 'key'` for logical characters. Pass the saved array directly to `useHotkeySequence`.

TanStack Hotkeys automatically suppresses registered hotkey and sequence callbacks while any recorder is active. You do not need to set `enabled` from `isRecording`. Registrations remain available for conflict detection, and recorded keys stay suppressed through repeats and key release.

## Basic usage


```tsx
import { useState } from 'octane'
import { useHotkeySequence, useHotkeySequenceRecorder, formatForDisplay } from '@tanstack/octane-hotkeys'
import type { HotkeySequence } from '@tanstack/octane-hotkeys'

export function SequenceSettings() @{
	const [binding, setBinding] = useState<HotkeySequence>(['G', 'G'])
	const recorder = useHotkeySequenceRecorder({ onRecord: setBinding })
	useHotkeySequence(binding, () => console.log('Go to top'))

	<div>
		<button type="button" onClick={recorder.startRecording}>Record sequence</button>
		@if (recorder.isRecording) {
			<div>
				<p>{recorder.steps.map((step) => formatForDisplay(step)).join(' → ')}</p>
				<button type="button" onClick={recorder.commitRecording}>Save</button>
				<button type="button" onClick={recorder.cancelRecording}>Cancel</button>
			</div>
		}
	</div>
}
```

Press and release each chord, then press Enter or click Save. Cancellation leaves the saved binding unchanged.

## Return value

| Property | Type | Meaning |
| --- | --- | --- |
| `isRecording` | `boolean` | Whether a session is active. |
| `steps` | `HotkeySequence` | Chords captured in the current session. |
| `recordedSequence` | `HotkeySequence \| null` | The last committed sequence. |
| `startRecording` | `() => void` | Start a new session. |
| `stopRecording` | `() => void` | Stop without calling `onRecord` or `onCancel`. |
| `cancelRecording` | `() => void` | Discard the session and call `onCancel`. |
| `commitRecording` | `() => void` | Commit current steps; do nothing if empty. |


## Options

- `recordBy`: `'code'` by default, or `'key'` for logical characters. Missing physical codes never fall back to logical recording.
- `onRecord(sequence)`: called when a nonempty sequence is committed. Clearing calls only `onClear`.
- `onCancel` and `onClear`: handle cancellation and removal of a saved binding.
- `commitKeys`: `'enter'` by default. Use `'none'` for manual or idle-timeout commit; plain Enter can then be recorded as a chord.
- `commitOnEnter`: with `commitKeys: 'enter'`, set this to `false` to record Enter as a chord and finish another way.
- `idleTimeoutMs`: commit after this many milliseconds of inactivity following a completed chord. No timer runs while waiting for the first chord.
- `platform`: override platform detection for portable `Mod` conversion.

### Shared defaults

Set `hotkeySequenceRecorder` defaults in `HotkeysProvider`. Options passed to an individual hook override provider defaults. For a plural hook, each definition's options override its common options. See the [provider setup](../quick-start.md#default-options-provider). Hook options refresh after each commit.

### `ignoreInputs`

The default is `true`, so normal typing in inputs, textareas, selects, and contentEditable elements passes through. Escape still cancels. Set `ignoreInputs: false` to record in a focused input.

## Validation and conflicts

`validate(sequence, { events, parsedSequence })` runs when committing and returns `true`, `false`, or a rejection message. `detectConflicts` checks single bindings and sequence prefixes. A rejected commit keeps the session active and the steps intact, so the user can edit them with Backspace.

The recorder supports the same `detectConflicts`, `validate`, and `onReject` options as the [single-hotkey recorder](./hotkey-recording.md#validation-and-conflicts). Use live registration IDs to exclude the binding being edited. Physical/logical overlap is based on the captured events, not a guessed keyboard layout.

## Behavior

| Input | Behavior |
| --- | --- |
| Valid chord | Append to `steps` and continue listening. |
| Unmodified Enter with default commit settings and nonempty steps | Commit and call `onRecord`. |
| Escape | Cancel and call `onCancel`. |
| Unmodified Backspace or Delete with nonempty steps | Remove the last step without committing. |
| Unmodified Backspace or Delete with empty steps | Stop and call only `onClear`. |
| Modifier-only press, repeat, or IME composition | Do not append a step. |

Recorded chords use portable `Mod`. Recording events, commit keys, and their releases are isolated from application hotkeys and sequences. Code mode rejects AltGraph character entry; key mode preserves the produced character without synthetic Control/Alt.

## Under the hood

Octane subscribes with `@tanstack/octane-store` and destroys the recorder on unmount.

See the [useHotkeySequenceRecorder example](../examples/useHotkeySequenceRecorder) for editable sequence settings and the [kitchen sink](../examples/kitchen-sink) for manual commit, idle timeout, validation, and conflict feedback.
