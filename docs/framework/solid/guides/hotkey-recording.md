---
title: Hotkey Recording Guide
id: hotkey-recording
---

`createHotkeyRecorder` is for building keyboard shortcut customization UIs. Users record their own shortcuts by pressing the key combination they want, the same way system preferences or IDE shortcut editors work. By default it records one chord; set `maxSteps` to let users record a [sequence](./sequences) too.

Recorders default to physical codes: recording a shortcut stores a string such as `Mod+[KeyS]`. Pass it directly to your hotkey registration and use `formatForDisplay` for the label. Set `recordBy: 'key'` when you intentionally want the produced character instead.

TanStack Hotkeys automatically suppresses registered hotkey callbacks while any recorder is active. You do not need to disable hotkeys while recording. Registrations remain available for conflict detection, and recorded keys stay suppressed through repeats and key release.

## Basic usage

```tsx
import { createHotkeyRecorder, formatForDisplay } from '@tanstack/solid-hotkeys'

function ShortcutRecorder() {
  const recorder = createHotkeyRecorder({
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // e.g. 'Mod+Shift+[KeyS]'
  })

  return (
    <button onClick={recorder.isRecording() ? recorder.cancelRecording : recorder.startRecording}>
      {recorder.isRecording()
        ? 'Press a key combination...'
        : recorder.recordedHotkey()
          ? formatForDisplay(recorder.recordedHotkey()!)
          : 'Click to record'}
    </button>
  )
}
```

## Recorder state and actions

| Member | Description |
| --- | --- |
| `isRecording` | Whether the recorder is currently listening for key presses |
| `steps` | Chords captured so far in a multi-step recording |
| `recordedHotkey` | The last recorded hotkey, or `null` if nothing recorded |
| `startRecording()` | Start listening for key presses |
| `stopRecording()` | Stop listening without calling `onRecord` or `onCancel` |
| `cancelRecording()` | Stop listening and call `onCancel` |
| `commitRecording()` | Commit the current `steps` now (multi-step recordings) |

Each state member is an accessor: call `isRecording()`, `steps()`, and `recordedHotkey()`.

## Options

### `recordBy`

Recorders default to `recordBy: 'code'`. Option+S producing `ß` on macOS records `Alt+[KeyS]`; Option+2 producing `™` records `Alt+[Digit2]`. The stored brackets preserve physical identity through state, serialization, and registration; `formatForDisplay` produces a readable label. Existing authored strings such as `Mod+S` remain logical hotkeys.

Set `recordBy: 'key'` to intentionally record the produced logical character. A code-mode event with no usable code is rejected rather than silently switching modes. IME composition is ignored. AltGraph character entry is rejected in code mode; key mode preserves the produced character without synthetic Control/Alt while retaining Shift.

### `onRecord`

Called when a recording commits. With the default `maxSteps: 1`, it receives a chord string such as `'Mod+[KeyS]'` as soon as the user presses a valid combination (a modifier + a non-modifier key, or a single non-modifier key). With a larger `maxSteps`, it receives a chord when one step was recorded, or a sequence otherwise.

### `onCancel`

Called when recording is cancelled, by pressing Escape or calling `cancelRecording()`.

### `onClear`

Called when the recording is cleared: Backspace or Delete with no modifiers and no recorded steps. Clearing calls only `onClear`; your app decides whether that removes a hotkey or restores a default.

### `ignoreInputs`

Defaults to `true`. The recorder doesn't intercept normal typing in text inputs, textareas, selects, or contentEditable elements; keystrokes pass through to the input as usual. Escape still cancels recording even while an input is focused. Set `ignoreInputs: false` to record from inside input elements.

Options can also be an accessor, such as `createHotkeyRecorder(() => ({ maxSteps: 3, recordBy: mode(), onRecord }))`, so recording policy can follow signals.

### Default options

Set defaults for every recorder with `HotkeysProvider`. Per-recorder options override them.

```tsx
<HotkeysProvider
  defaultOptions={{
    hotkeyRecorder: { idleTimeoutMs: 2000, onCancel: () => console.log('Recording cancelled') },
  }}
>
  <App />
</HotkeysProvider>
```

## Recording sequences

Set `maxSteps` above 1 to record up to that many chords. Each chord adds a step, and the recording commits when the user presses Enter, when it reaches `maxSteps`, or after `idleTimeoutMs` without a new step:

```tsx
const recorder = createHotkeyRecorder({
  maxSteps: 3,
  onRecord: (hotkey) => console.log('Recorded:', hotkey), // 'Mod+[KeyS]' or ['[KeyG]', '[KeyG]']
})

// Live preview while recording
const label = () =>
  recorder.isRecording()
    ? formatForDisplay(recorder.steps()) || 'Press chords, then Enter…'
    : formatForDisplay(recorder.recordedHotkey() ?? [])
```

A one-step recording commits as a chord, so the result can always be passed straight to your hotkey registration. Use `maxSteps: Infinity` for no limit.

| Option | Description |
| --- | --- |
| `maxSteps` | Maximum chords to record. Reaching it commits. Default `1`. |
| `commitKeys` | `'enter'` (default) commits on plain Enter. With `'none'`, plain Enter can be recorded as a step, and only `commitRecording()`, `idleTimeoutMs`, or `maxSteps` commit. |
| `idleTimeoutMs` | Commit automatically after this many milliseconds without a new step. The timer does not run before the first chord. |

`commitKeys` and `idleTimeoutMs` are only accepted when `maxSteps` is set. With `maxSteps` above 1, `onRecord` and `validate` receive `Hotkey` (a chord or a sequence) instead of a chord.

## Recording behavior

| Key | Behavior |
| --- | --- |
| Modifier only (Shift, Ctrl, etc.) | Waits for a non-modifier key; modifier-only presses don't complete a step |
| Modifier + key (e.g., Ctrl+S) | Records the full combination |
| Single key (e.g., Escape, F1) | Records the single key |
| Enter (multi-step, `commitKeys: 'enter'`) | Commits the recorded steps |
| Escape | Cancels the recording |
| Backspace / Delete | Removes the last step; with no steps, clears and calls `onClear` |

Repeats and IME composition never add a step. Recorded hotkeys use the portable `Mod` format: Command+S on macOS records `Mod+[KeyS]` rather than `Meta+[KeyS]`, so the primary modifier becomes Control if the hotkey is later used on Windows.

## Validation and conflicts

The recorder accepts `detectConflicts`, `validate`, and `onReject` alongside `onRecord`:

```ts
const options = {
  detectConflicts: {
    // Use registration IDs to exclude the hotkey being edited:
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

`validate(hotkey, context)` returns true to accept, or false/a message to reject. The context holds the last chord's `event` and `parsedHotkey`, plus `events` and `parsedSequence` for every step. `onReject` receives `reason` (`missing-code`, `alt-graph`, `invalid`, `validation`, or `conflict`), a message, the rejected `hotkey` when available, and conflicting registrations for conflict rejections. Validation runs before commit; rejection never falls back to another key identity. A rejected multi-step recording keeps its steps so the user can edit them with Backspace.

`detectConflicts: true` checks enabled live registrations with the intended event type (default keydown) and overlapping targets (default document). Document/nested scopes can conflict; disjoint widgets can reuse a hotkey. The options object also supports `scope: 'all'`, `includeDisabled`, and an `exclude(registration)` predicate. Chords and sequence prefixes are checked: a recorded chord conflicts with a sequence that starts with it, and a recorded sequence conflicts with a registered chord equal to its first step. Source events detect physical/logical overlap on the recorded layout. This is a conservative collision check, not a promise that two callbacks will execute.

For checks outside recording, use `findHotkeyConflicts(hotkey, options)`. Without source `events`, it compares hotkey identity and sequence prefixes; it does not guess equivalence between a logical character and a physical position.

## Building a shortcut settings UI

For an app-wide settings screen, declare the hotkeys with [app hotkeys](./app-hotkeys) and save the recorder's result with `setCustomHotkey`. That keeps cheat sheets, conflicts, and persistence in one place.

For a single component, ordinary state is enough:

```tsx
import { createSignal, For } from 'solid-js'
import { createHotkeys, createHotkeyRecorder, formatForDisplay } from '@tanstack/solid-hotkeys'
import type { Hotkey } from '@tanstack/solid-hotkeys'

const actions = { save, undo, search }
type Action = keyof typeof actions

function ShortcutSettings() {
  const [shortcuts, setShortcuts] = createSignal<Record<Action, Hotkey>>({
    save: 'Mod+S',
    undo: 'Mod+Z',
    search: ['G', 'S'],
  })
  const [editing, setEditing] = createSignal<Action | null>(null)

  const recorder = createHotkeyRecorder({
    maxSteps: 2,
    onRecord: (hotkey) => {
      const action = editing()
      if (action) setShortcuts((prev) => ({ ...prev, [action]: hotkey }))
      setEditing(null)
    },
    onCancel: () => setEditing(null),
  })

  createHotkeys(() =>
    Object.entries(shortcuts()).map(([action, hotkey]) => ({
      hotkey,
      callback: actions[action as Action],
    })),
  )

  return (
    <For each={Object.entries(shortcuts())}>
      {([action, hotkey]) => (
        <button
          onClick={() => {
            setEditing(action as Action)
            recorder.startRecording()
          }}
        >
          {action}: {editing() === action && recorder.isRecording() ? 'Press keys…' : formatForDisplay(hotkey)}
        </button>
      )}
    </For>
  )
}
```

## Under the hood

`createHotkeyRecorder` creates a `HotkeyRecorder` from `@tanstack/hotkeys`, exposes its state as signals, and cleans it up with the owning reactive scope.
