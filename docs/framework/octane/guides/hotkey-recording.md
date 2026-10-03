---
title: Hotkey Recording Guide
id: hotkey-recording
---

Use `useHotkeyRecorder` to build a shortcut customization UI. Recording defaults to physical codes, producing values such as `Mod+[KeyS]`. Store that value directly and pass it to `useHotkey`. Use `formatForDisplay` for the label.

TanStack Hotkeys automatically suppresses registered hotkey and sequence callbacks while any recorder is active. You do not need to set `enabled` from `isRecording`. Registrations remain available for conflict detection, and recorded keys stay suppressed through repeats and key release.

## Basic usage


```tsx
import { useState } from 'octane'
import { useHotkey, useHotkeyRecorder, formatForDisplay } from '@tanstack/octane-hotkeys'
import type { Hotkey } from '@tanstack/octane-hotkeys'

export function ShortcutSettings() @{
	const [binding, setBinding] = useState<Hotkey>('Mod+S')
	const recorder = useHotkeyRecorder({
		onRecord: setBinding,
		onClear: () => setBinding('Mod+S'),
	})
	useHotkey(binding, () => console.log('Saved'))

	<div>
		<kbd>{formatForDisplay(binding)}</kbd>
		<button type="button" onClick={recorder.startRecording}>Record</button>
		@if (recorder.isRecording) {
			<div>
				<p>Press a shortcut. Escape cancels; Backspace resets the binding.</p>
				<button type="button" onClick={recorder.cancelRecording}>Cancel</button>
			</div>
		}
	</div>
}
```

This example stores the replacement binding in application state and restores `Mod+S` when the user clears it. Cancellation leaves the saved binding unchanged.

## Return value

| Property | Type | Meaning |
| --- | --- | --- |
| `isRecording` | `boolean` | Whether a session is active. |
| `recordedHotkey` | `Hotkey \| null` | The recorded binding, or `null` after starting, stopping, or cancelling. |
| `startRecording` | `() => void` | Start a new session. |
| `stopRecording` | `() => void` | Stop and clear recorder state without calling `onRecord` or `onCancel`. |
| `cancelRecording` | `() => void` | Stop, clear recorder state, and call `onCancel`. |

Read the returned state on each component render.

## Options

### `recordBy`

The default is `'code'`. On macOS, Option+S producing `ß` records `Alt+[KeyS]`, and Option+2 producing `™` records `Alt+[Digit2]`. Stored brackets preserve physical identity through serialization and registration. Existing authored strings such as `Mod+S` remain logical.

Set `recordBy: 'key'` to record the produced character. Code mode rejects an event without a usable code and never falls back to key mode. IME composition is ignored. AltGraph character entry is rejected in code mode; key mode preserves the character without synthetic Control/Alt while retaining Shift.

### `onRecord`

Receives the recorded `Hotkey` when the user enters a valid chord. A chord can be a single non-modifier key or a key with modifiers. Update your saved binding here.

### `onCancel`

Runs when Escape cancels a session or when you call `cancelRecording()`. Use it to exit an editing state without changing the saved binding.

### `onClear`

Runs when the user presses unmodified Backspace or Delete during recording. Clearing calls only `onClear`; it does not call `onRecord`. Your application decides whether to remove the binding or restore an initial value.

### Shared defaults and changing options

Set `hotkeyRecorder` defaults in `HotkeysProvider`. Options passed to an individual hook override provider defaults. For a plural hook, each definition's options override its common options. See the [provider setup](../quick-start.md#default-options-provider).

Options and callbacks refresh after every commit, so callbacks see current component state.

## Recording behavior

| Input | Behavior |
| --- | --- |
| Modifier alone | Wait for a non-modifier key. |
| Modifier plus a non-modifier key | Record the chord and finish. |
| Single non-modifier key, such as F1 | Record the key and finish. |
| Escape | Cancel. |
| Unmodified Backspace or Delete | Clear and call `onClear`. |
| Automatic key repeat or IME composition | Do not record a new chord. |

Recording events, repeats, and their key releases do not trigger registered hotkeys or sequences.

### `ignoreInputs`

This defaults to `true`. Normal typing in inputs, textareas, selects, and contentEditable elements passes through. Escape still cancels while an input is focused. Set `ignoreInputs: false` to capture shortcuts from a focused input.

### Mod auto-conversion

On macOS, Command+S becomes `Mod+[KeyS]`. Reusing that binding on Windows resolves `Mod` to Control while preserving the physical key position. Pass a `platform` option when detection must be overridden.

## Validation and conflicts

Supply these options alongside `onRecord`:

```ts
import type { HotkeyRecorderOptions } from '@tanstack/octane-hotkeys'

const options: HotkeyRecorderOptions = {
	onRecord: (hotkey) => console.log('Accepted', hotkey),
	detectConflicts: {
		// Replace this with the ID from the live registration being edited.
		excludeIds: ['registration-being-edited'],
		target: document,
		eventType: 'keydown',
	},
	validate: (_hotkey, { parsedHotkey }) =>
		parsedHotkey.modifiers.length > 0 || 'Include a modifier.',
	onReject: ({ reason, message, conflicts }) => {
		console.log(reason, message, conflicts)
	},
}
```

`validate` returns `true` to accept, or `false` or a message to reject. Validation runs before commit. A rejected candidate leaves recording active. `onReject` reports `missing-code`, `alt-graph`, `invalid`, `validation`, or `conflict`, plus the candidate when available and conflicting views for a conflict.

`detectConflicts: true` checks enabled live registrations with the intended event type, defaulting to keydown, and overlapping targets, defaulting to document. Document and nested element scopes can conflict; disjoint widgets can reuse a binding. The options object supports `scope: 'all'`, `includeDisabled`, and an `exclude(registration)` predicate.

Checks include single bindings and sequence prefixes. Source events detect physical/logical overlap on the recorded layout. This is conservative collision detection: propagation, input filtering, match priority, external listeners, unmounted routes, and other layouts can change dispatch.

For checks outside recording, call `findHotkeyConflicts(bindingOrSequence, options)`. Without source `events`, it compares identities and prefixes rather than guessing which logical character a physical position produces.

## Building a shortcut settings UI

For several actions, keep the bindings in an array or object and record the ID of the action being edited. On `onRecord`, replace that action's binding and clear the editing ID. On `onCancel`, clear only the editing ID. Use the plural registration API for the current list.

```tsx
useHotkeys(shortcuts.map((shortcut) => ({
	hotkey: shortcut.hotkey,
	callback: () => runAction(shortcut.id),
	options: { meta: { name: shortcut.name } },
})))
```

The [useHotkeyRecorder example](../examples/useHotkeyRecorder) includes multiple actions, editable names and descriptions, create/delete controls, reset and clear behavior, cancellation, and a live registry. The [kitchen sink](../examples/kitchen-sink) also demonstrates conflict feedback and physical versus logical recording.

## Under the hood

Octane uses `@tanstack/octane-store` to subscribe to the recorder. The hook destroys its recorder on unmount. The core `HotkeyRecorder` owns the recording listeners. Store the accepted binding in application state rather than relying on recorder session state as your preferences store.
