---
title: Record Custom Hotkeys with useHotkeyRecorder in Octane
id: custom-hotkey-recording
description: Let users choose their own keyboard shortcuts in Octane by pressing the keys they want, with validation, conflict checks, and sequences.
redirect_from:
  - framework/octane/guides/hotkey-recording
---

`useHotkeyRecorder` lets users choose a hotkey by pressing it, as shortcut editors in system settings and IDEs do. You only need it if users can change your app's hotkeys. To save their choices and list them in a cheat sheet, pair it with [app hotkeys](./app-hotkeys).

While any recorder is listening, registered hotkeys don't fire, so pressing `Mod+S` to record it doesn't also save. You don't need to disable them yourself.

## Record a chord

```tsx
import { formatForDisplay, useHotkeyRecorder } from '@tanstack/octane-hotkeys'

function ShortcutRecorder() @{
  const recorder = useHotkeyRecorder({
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // e.g. 'Mod+Shift+S'
  })

  <div>
    <button onClick={recorder.startRecording}>
      {recorder.isRecording
        ? 'Press a key combination...'
        : recorder.recordedHotkey
          ? formatForDisplay(recorder.recordedHotkey)
          : 'Click to record'}
    </button>
    @if (recorder.isRecording) {
      <button onClick={recorder.cancelRecording}>Cancel</button>
    }
  </div>
}
```

The recorder writes the hotkey the way you would write it by hand. Command+S on macOS, or Control+S on Windows and Linux, records `Mod+S` on any keyboard layout. It records `Mod` rather than Command or Control, so the hotkey works on every platform. Pass the result straight to `useHotkey`, and label it with `formatForDisplay`.

Some presses have no name that means the same thing on every platform. The recorder records those by the key's position, in brackets: Shift+/ records `Shift+[Slash]`, and Option+1 on macOS records `Alt+[Digit1]`, even though it types `¡`. [Recording captures what the user pressed](../../../guides/sensible-defaults.md#recording-captures-what-the-user-pressed) lists these cases. Set `recordBy: 'code'` to record every key by position, or `recordBy: 'key'` to record the character every press types. Recording by position needs a physical code, so it rejects a press that has none.

The hook returns the recorder's state and controls:

| Property | Description |
| --- | --- |
| `isRecording` | Whether the recorder is listening |
| `steps` | Chords recorded so far in a sequence recording |
| `recordedHotkey` | The hotkey from the last recording, or `null` after a cancel or clear |
| `startRecording()` | Starts listening |
| `stopRecording()` | Stops listening without calling `onRecord` or `onCancel` |
| `cancelRecording()` | Stops listening and calls `onCancel` |
| `commitRecording()` | Commits the `steps` recorded so far |

## Record a sequence

Set `maxSteps: Infinity` to let users record a sequence. Each chord adds a step, and the recording commits when the user presses Enter, or after `idleTimeoutMs` without a new step:

```tsx
function SequenceRecorder() @{
  const recorder = useHotkeyRecorder({
    maxSteps: Infinity,
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // 'Mod+S' or ['G', 'G']
  })

  <button onClick={recorder.startRecording}>
    {recorder.isRecording
      ? formatForDisplay(recorder.steps) || 'Press chords, then Enter...'
      : recorder.recordedHotkey
        ? formatForDisplay(recorder.recordedHotkey)
        : 'Click to record'}
  </button>
}
```

A one-step recording commits as a chord, so the result can always go straight to `useHotkey`. With `maxSteps: Infinity`, `onRecord` and `validate` receive a `Hotkey`, which can be a chord or a sequence. See [Sequences](./sequences) for how sequences match.

## Keys the recorder handles

| Key | What it does |
| --- | --- |
| A modifier alone, such as Shift | Waits for a key to go with it |
| A key, with or without modifiers | Records a chord, such as `Mod+S` or `F1` |
| Enter | Commits a sequence recording. With `maxSteps: 1` or `commitKeys: 'none'`, records Enter like any other key. |
| Escape | Cancels the recording and calls `onCancel` |
| Tab or Shift+Tab, without Control, Alt, or Meta | Cancels the recording and calls `onCancel`, and the browser moves focus as usual. In a text field, moves focus without cancelling. With `recordTab: true`, records Tab like any other key. |
| Backspace or Delete, without modifiers | Removes the last step. With no steps, stops recording and calls `onClear`. |

Repeats and IME composition never add a step. `onClear` doesn't change anything on its own, so your app decides whether clearing removes a hotkey or restores its default.

By default, the recorder ignores typing in text fields, so other fields on the page keep working while it listens. Escape still cancels. Set `ignoreInputs: false` to record from inside a text field.

Tab and Shift+Tab end the recording, so keyboard users don't get stuck on the recorder ([WCAG 2.1.2](https://www.w3.org/WAI/WCAG21/Understanding/no-keyboard-trap.html)). Set `recordTab: true` to let users bind Tab, for example in an editor. Escape still cancels, so show it while recording, such as "Press Escape to cancel".

## Validate and check conflicts

### Reject hotkeys you don't want

Pass `validate` to accept or reject each recording before it commits. Return `true` to accept, or `false` or a message to reject:

```tsx
useHotkeyRecorder({
  validate: (_hotkey, { parsedChord }) =>
    parsedChord.modifiers.length > 0 || 'Include a modifier.',
  onReject: ({ message }) => setError(message ?? 'Try another shortcut.'),
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

The second argument has the `event` that recorded the chord and `parsedChord`, with `Mod` resolved. `onRecord` receives the same second argument. With `maxSteps: Infinity`, a recording can be a chord or a sequence, so check `kind` first. A sequence's context has `events` and `parsedSequence`, with one entry per step:

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

A rejected recording keeps listening, so the user can try again. A rejected sequence recording keeps its steps, so the user can edit them with Backspace.

### Check for conflicts

Set `detectConflicts: true` to reject a hotkey that's already registered:

```tsx
useHotkeyRecorder({
  detectConflicts: true,
  onReject: ({ reason }) => {
    if (reason === 'conflict') setError('That shortcut is already in use.')
  },
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

By default, the check compares the recording with every enabled `keydown` hotkey on the page, in every [scope](./hotkeys-provider-and-scopes). A recorded chord conflicts with a sequence that starts with it, and a recorded sequence conflicts with a chord equal to its first step. Pass an object instead of `true` to change what's checked:

```tsx
detectConflicts: {
  excludeIds: [registration.id], // Skip the hotkey being changed
  target: panelElement, // Only hotkeys on this element, inside it, or around it
  scope: 'all', // Ignore target and check hotkeys on every element. Unrelated to hotkey scopes.
  eventType: 'keyup', // Check keyup hotkeys instead
  includeDisabled: true, // Include disabled hotkeys
  exclude: (registration) => registration.options.scope === 'vim', // Skip one hotkey scope
}
```

Two hotkeys can be written differently and still fire for the same key press. On a US keyboard, a recorded `Shift+[Slash]` and a registered `?` are the same press. The check also tests each registered hotkey against the key presses that made the recording, so it finds these.

A conflict check finds hotkeys that could collide. It can't promise which callback a key press would run, because propagation, typing in fields, other listeners, and pages that haven't rendered all affect that. To check app hotkeys, including ones on pages that haven't rendered, use `findConflicts` from [app hotkeys](./app-hotkeys#change-hotkeys) instead.

`onReject` receives a `reason`: `'conflict'`, `'validation'`, `'whitespace'` for a whitespace character, `'missing-code'` for a key press with no physical code that can't be recorded another way, or `'alt-graph'` for an AltGr press it can't record. It also receives the rejected `hotkey` when there is one, the `conflicts` for a conflict, and the `message` your `validate` callback returned. The recorder sends no text of its own, so map each `reason` to your app's wording.

To check a hotkey outside a recording, call `findHotkeyConflicts(hotkey, options)`. It takes the same options, and returns [registration views](./cheat-sheet-ui-helpers#list-the-hotkeys-on-screen).

## Build a shortcut settings screen

For an app-wide settings screen, declare your hotkeys as [app hotkeys](./app-hotkeys), and save each recording with `setCustomHotkey`. That keeps cheat sheets, conflict checks, and saved choices in one place. [Change hotkeys](./app-hotkeys#change-hotkeys) shows a settings row built that way.

For a few hotkeys in one component, state is enough:

```tsx
import { useState } from 'octane'
import {
  formatForDisplay,
  useHotkeyRecorder,
  useHotkeys,
} from '@tanstack/octane-hotkeys'
import type { Hotkey } from '@tanstack/octane-hotkeys'

const actions = { save, undo, search }
type Action = keyof typeof actions

function ShortcutSettings() @{
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

  <div>
    @for (const [action, hotkey] of Object.entries(shortcuts); key action) {
      <button
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
    }
  </div>
}
```

## Recorder options

| Option | Default | Description |
| --- | --- | --- |
| `onRecord` | Required | Called with the recorded hotkey when a recording commits, and with the same context as `validate` |
| `onCancel` | None | Called when the user presses Escape, Tab, or Shift+Tab, or you call `cancelRecording()` |
| `onClear` | None | Called when the user presses Backspace or Delete with nothing recorded |
| `maxSteps` | `1` | `1` records a chord. `Infinity` records a sequence. |
| `commitKeys` | `'enter'` | With `maxSteps: Infinity`, whether plain Enter commits (`'enter'`) or records as a step (`'none'`) |
| `idleTimeoutMs` | None | With `maxSteps: Infinity`, commits after this many milliseconds without a new step. The timer starts after the first chord. |
| `recordBy` | `'auto'` | Records the key by name where it has one and by position otherwise (`'auto'`), always by position (`'code'`), or always by the character it types (`'key'`) |
| `ignoreInputs` | `true` | Lets typing in text fields pass through while recording |
| `recordTab` | `false` | Records Tab and Shift+Tab instead of letting them cancel and move focus |
| `validate` | None | Accepts or rejects a recording. See [Reject hotkeys you don't want](#reject-hotkeys-you-dont-want). |
| `detectConflicts` | `false` | Rejects a recording that collides with a registered hotkey. See [Check for conflicts](#check-for-conflicts). |
| `onReject` | None | Called with the reason when a recording is rejected |
| `platform` | Detected | The platform that decides what `Mod` means |

To change the defaults for every recorder, pass `hotkeyRecorder` options to `HotkeysProvider`. See [Set default options](./hotkeys-provider-and-scopes#set-default-options). The [`useHotkeyRecorder` reference](../reference/functions/useHotkeyRecorder.md) lists the types.

The [useHotkeyRecorder example](../examples/useHotkeyRecorder) records chords, and the [sequences example](../examples/useHotkeyRecorder-sequences) records sequences.
