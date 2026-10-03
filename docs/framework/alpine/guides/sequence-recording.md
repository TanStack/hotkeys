---
title: Sequence Recording Guide
id: sequence-recording
---

Use `createHotkeySequenceRecorder` to record an ordered sequence of chords. Recording defaults to physical codes, such as `['[KeyG]', 'Alt+[KeyS]']`. Use `recordBy: 'key'` for logical characters. Pass the saved array directly to `createHotkeySequence`.

## Reactive options

Recorder options support [property getters and functions returning options](./hotkeys.md#property-getters). Updated callbacks, validation, and recording settings apply during an active session without restarting it. Create getters in `init()` so they read the reactive component instance.

## Basic usage


```ts
import Alpine from 'alpinejs'
import { createHotkeysScope, formatForDisplay } from '@tanstack/alpine-hotkeys'
import type { AlpineHotkeySequenceRecorder, HotkeySequence } from '@tanstack/alpine-hotkeys'

class SequenceSettings {
	binding: HotkeySequence = ['G', 'G']
	scope = createHotkeysScope()
	recorder!: AlpineHotkeySequenceRecorder
	init() {
		this.recorder = this.scope.createHotkeySequenceRecorder({
			onRecord: (sequence) => { this.binding = sequence },
		})
		this.scope.createHotkeySequence(() => this.binding, () => console.log('Go to top'),
			() => ({ enabled: !this.recorder.isRecording }))
	}
	get preview() {
		return this.recorder.steps.map((step) => formatForDisplay(step)).join(' → ')
	}
	destroy() { this.scope.destroy() }
}

Alpine.data('sequenceSettings', () => new SequenceSettings())
```

```html
<div x-data="sequenceSettings">
	<button type="button" @click="recorder.startRecording()">Record sequence</button>
	<template x-if="recorder.isRecording">
		<div>
			<p x-text="preview"></p>
			<button type="button" @click="recorder.commitRecording()">Save</button>
			<button type="button" @click="recorder.cancelRecording()">Cancel</button>
		</div>
	</template>
</div>
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

Read state through the recorder object. Destructuring its reactive getters once captures a snapshot.

## Options

- `recordBy`: `'code'` by default, or `'key'` for logical characters. Missing physical codes never fall back to logical recording.
- `onRecord(sequence)`: called when a nonempty sequence is committed. Clearing calls only `onClear`.
- `onCancel` and `onClear`: handle cancellation and removal of a saved binding.
- `commitKeys`: `'enter'` by default. Use `'none'` for manual or idle-timeout commit; plain Enter can then be recorded as a chord.
- `commitOnEnter`: with `commitKeys: 'enter'`, set this to `false` to record Enter as a chord and finish another way.
- `idleTimeoutMs`: commit after this many milliseconds of inactivity following a completed chord. No timer runs while waiting for the first chord.
- `platform`: override platform detection for portable `Mod` conversion.

### Shared defaults

Pass defaults to `createHotkeysScope`. The scope accepts `hotkey`, `hotkeySequence`, `hotkeyRecorder`, and `hotkeySequenceRecorder` options. Pass a getter to follow Alpine state. Each component owns and destroys its scope. Call-specific options override scope defaults, and per-definition options override common options. Omitted options use the core defaults. See [shared defaults](../quick-start.md#shared-defaults) for a complete example. Use an options getter for reactive configuration.

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

The Alpine scope owns the core Store subscription and recorder. Call `scope.destroy()` from component teardown.

See the [createHotkeySequenceRecorder example](../examples/createHotkeySequenceRecorder) for editable sequence settings and the [kitchen sink](../examples/kitchen-sink) for manual commit, idle timeout, validation, and conflict feedback.
