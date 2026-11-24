---
title: Record Custom Hotkeys with useHotkeyRecorder in Preact
id: custom-hotkey-recording
description: Let users choose their own keyboard shortcuts in Preact by pressing the keys they want, with validation, conflict checks, and sequences.
redirect_from:
  - framework/preact/guides/hotkey-recording
---

`useHotkeyRecorder` lets users customize a shortcut by pressing the keys directly, just like IDE or operating system settings panels. You only need it when users can rebind shortcuts. Pair it with [App Hotkeys](./app-hotkeys) to validate, persist, and list customized bindings app-wide.

While any recorder is listening, registered hotkeys pause automatically so pressing `Mod+S` to record it doesn't also trigger Save.

## Record a chord

```tsx
import { useFormatForDisplay, useHotkeyRecorder } from '@tanstack/preact-hotkeys'

function ShortcutRecorder() {
  const formatForDisplay = useFormatForDisplay()
  const { isRecording, recordedHotkey, startRecording, cancelRecording } =
    useHotkeyRecorder({
      onRecord: (hotkey) => console.log('Recorded:', hotkey), // e.g. 'Mod+Shift+S'
    })

  return (
    <div>
      <button onClick={startRecording}>
        {isRecording
          ? 'Press a key combination...'
          : recordedHotkey
            ? formatForDisplay(recordedHotkey)
            : 'Click to record'}
      </button>
      {isRecording && <button onClick={cancelRecording}>Cancel</button>}
    </div>
  )
}
```

With the default `recordBy: 'auto'`, the recorder outputs portable strings just like you write by hand: `Mod+S` for Command+S on macOS or Control+S on Windows and Linux. It falls back to physical bracketed codes (`Shift+[Slash]`, `Alt+[Digit1]`) for presses whose characters vary across OSes or layouts. See [Recording captures what the user pressed](../../../guides/sensible-defaults.md#recording-captures-what-the-user-pressed) for the full rules, or set `recordBy: 'code'` (always physical) or `recordBy: 'key'` (always typed character).

| Property or method | Description |
| --- | --- |
| `isRecording` | Whether the recorder is currently listening |
| `steps` | Chords captured so far during a sequence recording |
| `recordedHotkey` | Last committed hotkey, or `null` after cancel or clear |
| `startRecording()` | Starts listening |
| `stopRecording()` | Stops listening without triggering `onRecord` or `onCancel` |
| `cancelRecording()` | Stops listening and calls `onCancel` |
| `commitRecording()` | Commits the current `steps` immediately |

## Record a sequence

Set `maxSteps: Infinity` to capture multi-step sequences. Each chord appends a step, and the recording commits when the user presses `Enter` or, when `idleTimeoutMs` is configured, stops typing for that duration:

```tsx
function SequenceRecorder() {
  const formatForDisplay = useFormatForDisplay()
  const recorder = useHotkeyRecorder({
    maxSteps: Infinity,
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // 'Mod+S' or ['G', 'G']
  })

  return (
    <button onClick={recorder.isRecording ? recorder.cancelRecording : recorder.startRecording}>
      {recorder.isRecording
        ? formatForDisplay(recorder.steps) || 'Press chords, then Enter...'
        : recorder.recordedHotkey
          ? formatForDisplay(recorder.recordedHotkey)
          : 'Click to record'}
    </button>
  )
}
```

If the user commits after a single chord, `useHotkeyRecorder` simplifies it to a chord string rather than a 1-element array. With `maxSteps: Infinity`, `onRecord` and `validate` receive a `Hotkey` (`HotkeyChord | HotkeySequence`). See [Sequences](./sequences) for how sequence bindings work.

## Keys the recorder handles

| Key | Behavior while recording |
| --- | --- |
| Standalone modifier, such as `Shift` or `Control` | Waits for a non-modifier key |
| Key press (with or without modifiers) | Captures a chord (`Mod+S`, `F1`) |
| `Enter` | Commits a sequence. With `maxSteps: 1` or `commitKeys: 'none'`, records `Enter` instead. |
| `Escape` | Cancels recording and calls `onCancel` |
| `Tab` or `Shift+Tab` (without `Control`, `Alt`, or `Meta`) | Cancels and lets focus move normally. In a text field, `Tab` moves focus without cancelling. Set `recordTab: true` to record `Tab` instead, and show "Press Escape to cancel" for keyboard accessibility. |
| `Backspace` or `Delete` (no modifiers) | Removes the last sequence step, or stops and calls `onClear` when empty |

Key auto-repeats and IME compositions never add steps. Typing inside other text fields passes through while recording (`Escape` still cancels), unless you pass `ignoreInputs: false` to record inside inputs. Note that `onClear` doesn't delete anything on its own. Decide in your callback whether clearing unbinds the shortcut or resets its default.

## Validate and check conflicts

### Reject hotkeys you don't want

Return `true` from `validate` to accept a recording, or `false` or an error string to reject it:

```tsx
useHotkeyRecorder({
  validate: (_hotkey, { parsedChord }) =>
    parsedChord.modifiers.length > 0 || 'Include a modifier.',
  onReject: ({ message }) => setError(message ?? 'Try another shortcut.'),
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

With `maxSteps: Infinity`, check `context.kind` before reading `parsedChord` or `parsedSequence` (both `validate` and `onRecord` receive the same `context`):

```tsx
useHotkeyRecorder({
  maxSteps: Infinity,
  validate: (_hotkey, context) =>
    context.kind === 'sequence' ||
    context.parsedChord.modifiers.length > 0 ||
    'A single chord needs a modifier.',
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

Rejected recordings keep the recorder active, and rejected sequences keep their captured `steps` so users can edit with `Backspace`.

### Check for conflicts

Pass `detectConflicts: true` to reject bindings already registered on the page:

```tsx
useHotkeyRecorder({
  detectConflicts: true,
  onReject: ({ reason }) => {
    if (reason === 'conflict') setError('That shortcut is already in use.')
  },
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

By default, `detectConflicts` checks every enabled `keydown` registration across all scopes. A recorded chord conflicts with a sequence that starts with it, and a recorded sequence conflicts with a chord equal to its first step (so `['G', 'H']` and `['G', 'S']` do not conflict). It compares underlying keypresses so `Shift+[Slash]` catches `?`. Pass an options object to narrow the check:

```tsx
detectConflicts: {
  excludeIds: [registration.id], // Ignore the registration being edited
  target: panelElement, // Check only overlapping elements (pass scope: 'all' instead to check every target)
  eventType: 'keyup',
  includeDisabled: true,
  exclude: (registration) => registration.options.scope === 'vim', // Skip a hotkey scope
}
```

> [!NOTE]
> Live conflict checks inspect only mounted registrations. If you use [App Hotkeys](./app-hotkeys#change-hotkeys), use `findConflicts` inside `validate` so shortcuts on unmounted routes are checked too.

`onReject` doesn't generate user-facing copy. Map `reason` (along with optional `hotkey`, `conflicts`, and `message`) to your own UI strings:

| `reason` | When it happens |
| --- | --- |
| `'conflict'` | Collides with an active registration (`conflicts` lists the matches) |
| `'validation'` | Rejected by your `validate` callback (`message` holds your return string) |
| `'whitespace'` | User pressed a whitespace character that can't be recorded |
| `'missing-code'` | Key event had no physical `code` when needed |
| `'alt-graph'` | Unrecordable `AltGr` combination |

`findHotkeyConflicts(hotkey, options)` runs the same conflict check outside a recording and returns `HotkeyConflict` objects (`{ registration }`) wrapping matching [registration views](./cheat-sheet-ui-helpers#list-the-hotkeys-on-screen).

## Build a shortcut settings screen

For app-wide settings, pair [App Hotkeys](./app-hotkeys#change-hotkeys) with `setCustomHotkey` so cheat sheets, persistence, and unmounted-route conflict checks stay unified.

For local shortcuts inside a single component, Preact state is enough:

```tsx
import { useState } from 'preact/hooks'
import {
  useFormatForDisplay,
  useHotkeyRecorder,
  useHotkeys,
} from '@tanstack/preact-hotkeys'
import type { Hotkey } from '@tanstack/preact-hotkeys'

const actions = { save, undo, search }
type Action = keyof typeof actions

function ShortcutSettings() {
  const formatForDisplay = useFormatForDisplay()
  const [shortcuts, setShortcuts] = useState<Record<Action, Hotkey>>({
    save: 'Mod+S',
    undo: 'Mod+Z',
    search: ['G', 'S'],
  })
  const [editing, setEditing] = useState<Action | null>(null)

  const recorder = useHotkeyRecorder({
    maxSteps: Infinity,
    onRecord: (hotkey) => {
      if (editing) setShortcuts((prev) => ({ ...prev, [editing]: hotkey }))
      setEditing(null)
    },
    onCancel: () => setEditing(null),
  })

  // Register each action with its current hotkey
  useHotkeys(
    Object.entries(shortcuts).map(([action, hotkey]) => ({
      hotkey,
      callback: actions[action as Action],
    })),
  )

  return (
    <div>
      {Object.entries(shortcuts).map(([action, hotkey]) => (
        <button
          key={action}
          onClick={() => {
            setEditing(action as Action)
            recorder.startRecording()
          }}
        >
          {action}:{' '}
          {editing === action && recorder.isRecording
            ? 'Press keys...'
            : formatForDisplay(hotkey)}
        </button>
      ))}
    </div>
  )
}
```

## Recorder options

| Option | Default | Description |
| --- | --- | --- |
| `onRecord` | Required | Called with the recorded `hotkey` and `context` when committed |
| `onCancel` | None | Called on `Escape`, `Tab`, `Shift+Tab`, or `cancelRecording()` |
| `onClear` | None | Called when `Backspace` or `Delete` is pressed with no recorded steps |
| `maxSteps` | `1` | `1` for chords, `Infinity` for sequences |
| `commitKeys` | `'enter'` | With `maxSteps: Infinity`, whether `Enter` commits (`'enter'`) or records (`'none'`) |
| `idleTimeoutMs` | None | With `maxSteps: Infinity`, auto-commits after idle ms following the first chord |
| `recordBy` | `'auto'` | `'auto'` (portable names and physical fallbacks), `'code'` (physical), or `'key'` (typed char) |
| `ignoreInputs` | `true` | Lets typing in text fields pass through while recording |
| `recordTab` | `false` | Records `Tab` and `Shift+Tab` instead of cancelling and moving focus |
| `validate` | None | Custom validator returning `true`, `false`, or an error message |
| `detectConflicts` | `false` | Rejects conflicts with registered hotkeys |
| `onReject` | None | Called with `{ reason, hotkey?, conflicts?, message? }` when rejected |
| `platform` | Detected | Override `'mac'`, `'windows'`, or `'linux'` for `Mod` output |

Set defaults for all recorders via `HotkeysProvider` using `hotkeyRecorder` in `defaultOptions`. See [Set default options](./hotkeys-provider-and-scopes#set-default-options) and [`useHotkeyRecorder`](../reference/functions/useHotkeyRecorder.md).

Try the [useHotkeyRecorder example](../examples/useHotkeyRecorder) or [sequences recorder example](../examples/useHotkeyRecorder-sequences).
