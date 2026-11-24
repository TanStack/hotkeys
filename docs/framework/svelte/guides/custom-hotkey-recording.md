---
title: Record Custom Hotkeys with createHotkeyRecorder in Svelte
id: custom-hotkey-recording
description: Let users choose their own keyboard shortcuts in Svelte by pressing the keys they want, with validation, conflict checks, and sequences.
redirect_from:
  - framework/svelte/guides/hotkey-recording
---

`createHotkeyRecorder` lets users customize a shortcut by pressing the keys directly, like the shortcut settings in an IDE or an operating system. It's only needed when users can rebind shortcuts. Pair it with [App Hotkeys](./app-hotkeys) to validate, persist, and list customized bindings app-wide.

While any recorder is listening, registered hotkeys pause automatically so pressing `Mod+S` to record it doesn't also trigger Save.

## Record a chord

```svelte
<script lang="ts">
  import { createHotkeyRecorder, getFormatForDisplay } from '@tanstack/svelte-hotkeys'

  const formatForDisplay = getFormatForDisplay()
  const recorder = createHotkeyRecorder({
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // e.g. 'Mod+Shift+S'
  })
</script>

<div>
  <button onclick={recorder.startRecording}>
    {recorder.isRecording
      ? 'Press a key combination...'
      : recorder.recordedHotkey
        ? formatForDisplay(recorder.recordedHotkey)
        : 'Click to record'}
  </button>
  {#if recorder.isRecording}
    <button onclick={recorder.cancelRecording}>Cancel</button>
  {/if}
</div>
```

With the default `recordBy: 'auto'`, the recorder outputs portable strings, written like a hand-typed string. Command+S on macOS and Control+S on Windows and Linux both record `Mod+S`. For presses whose characters vary across platforms or layouts, it falls back to physical bracketed codes, such as `Shift+[Slash]` and `Alt+[Digit1]`. See [Recording captures what the user pressed](../../../guides/sensible-defaults.md#recording-captures-what-the-user-pressed) for the full rules. Set `recordBy: 'code'` to always record the physical key, or `recordBy: 'key'` to always record the typed character. Pass the result straight to `createHotkey`, and label it with `getFormatForDisplay`.

`createHotkeyRecorder` returns the recorder's state and controls. State members are reactive getters, so read them from the recorder object instead of destructuring them once:

| Member | Description |
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

```svelte
<script lang="ts">
  import { createHotkeyRecorder, getFormatForDisplay } from '@tanstack/svelte-hotkeys'

  const formatForDisplay = getFormatForDisplay()
  const recorder = createHotkeyRecorder({
    maxSteps: Infinity,
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // 'Mod+S' or ['G', 'G']
  })
</script>

<button onclick={recorder.startRecording}>
  {recorder.isRecording
    ? formatForDisplay(recorder.steps) || 'Press chords, then Enter...'
    : recorder.recordedHotkey
      ? formatForDisplay(recorder.recordedHotkey)
      : 'Click to record'}
</button>
```

If the user commits after a single chord, `createHotkeyRecorder` simplifies it to a chord string instead of a one-element array, so the result can always go straight to `createHotkey`. With `maxSteps: Infinity`, `onRecord` and `validate` receive a `Hotkey`, which is a chord or a sequence. See [Sequences](./sequences) for how sequences match.

Options can also be a getter, such as `createHotkeyRecorder(() => ({ maxSteps: Infinity, recordBy: mode, onRecord }))`, so the recorder follows `$state`.

## Keys the recorder handles

| Key | Behavior while recording |
| --- | --- |
| Standalone modifier, such as `Shift` or `Control` | Waits for a non-modifier key |
| Key press, with or without modifiers | Captures a chord such as `Mod+S` or `F1` |
| `Enter` | Commits a sequence. With `maxSteps: 1` or `commitKeys: 'none'`, records `Enter` instead. |
| `Escape` | Cancels recording and calls `onCancel` |
| `Tab` or `Shift+Tab` without `Control`, `Alt`, or `Meta` | Cancels and lets focus move normally, so keyboard users never get stuck on the recorder ([WCAG 2.1.2](https://www.w3.org/WAI/WCAG21/Understanding/no-keyboard-trap.html)). In a text field, `Tab` moves focus without cancelling. Set `recordTab: true` to record `Tab` instead, and show "Press Escape to cancel". |
| `Backspace` or `Delete` without modifiers | Removes the last sequence step, or stops and calls `onClear` when empty |

Key auto-repeats and IME compositions never add steps. Typing inside other text fields passes through while recording, and `Escape` still cancels. Pass `ignoreInputs: false` to record inside inputs. `onClear` doesn't delete anything on its own, so decide in your callback whether clearing unbinds the shortcut or resets its default.

## Validate and check conflicts

### Reject hotkeys you don't want

Return `true` from `validate` to accept a recording, or `false` or an error string to reject it:

```ts
createHotkeyRecorder({
  validate: (_hotkey, { parsedChord }) =>
    parsedChord.modifiers.length > 0 || 'Include a modifier.',
  onReject: ({ message }) => setError(message ?? 'Try another shortcut.'),
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

The second argument holds the `event` that recorded the chord and `parsedChord`, with `Mod` resolved. A sequence context holds `events` and `parsedSequence`. With `maxSteps: Infinity`, check `context.kind` first. `onRecord` receives the same `context`:

```ts
createHotkeyRecorder({
  maxSteps: Infinity,
  validate: (_hotkey, context) =>
    context.kind === 'sequence' ||
    context.parsedChord.modifiers.length > 0 ||
    'A single chord needs a modifier.',
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

Rejected recordings keep the recorder active, and rejected sequences keep their captured `steps` so users can edit them with `Backspace`.

### Check for conflicts

Pass `detectConflicts: true` to reject bindings already registered on the page:

```ts
createHotkeyRecorder({
  detectConflicts: true,
  onReject: ({ reason }) => {
    if (reason === 'conflict') setError('That shortcut is already in use.')
  },
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

By default, `detectConflicts` checks every enabled `keydown` registration across all [scopes](./hotkeys-provider-and-scopes). It treats chords and sequences that share a prefix as colliding, and compares the underlying key presses, so a recorded `Shift+[Slash]` catches a registered `?`. Pass an options object to narrow the check:

```ts
detectConflicts: {
  excludeIds: [registration.id], // Skip the hotkey being changed
  target: panelElement, // Only hotkeys on this element, inside it, or around it (pass scope: 'all' instead to check every element)
  eventType: 'keyup', // Check keyup hotkeys instead
  includeDisabled: true, // Include disabled hotkeys
  exclude: (registration) => registration.options.scope === 'vim', // Skip one hotkey scope
}
```

> [!NOTE]
> Live conflict checks inspect only registered hotkeys. With [App Hotkeys](./app-hotkeys#change-hotkeys), call `findConflicts` inside `validate` so shortcuts on routes that haven't rendered are checked too.

`onReject` doesn't generate user-facing copy. Map `reason`, along with the optional `hotkey`, `conflicts`, and `message`, to your own UI strings:

| `reason` | When it happens |
| --- | --- |
| `'conflict'` | Collides with a registered hotkey (`conflicts` lists the matches) |
| `'validation'` | Rejected by your `validate` callback (`message` holds your return value) |
| `'whitespace'` | The user pressed a whitespace character, which can't be recorded |
| `'missing-code'` | The key press had no physical `code` when one was needed |
| `'alt-graph'` | An `AltGr` combination that can't be recorded |

`findHotkeyConflicts(hotkey, options)` runs the same conflict check outside a recording and returns `HotkeyConflict` objects (`{ registration }`) wrapping matching [registration views](./cheat-sheet-ui-helpers#list-the-hotkeys-on-screen).

## Build a shortcut settings screen

For app-wide settings, pair [App Hotkeys](./app-hotkeys#change-hotkeys) with `setCustomHotkey` so cheat sheets, persistence, and conflict checks for unmounted routes stay in one place.

For a few hotkeys in one component, `$state` is enough:

```svelte
<script lang="ts">
  import {
    createHotkeyRecorder,
    createHotkeys,
    getFormatForDisplay,
  } from '@tanstack/svelte-hotkeys'
  import type { Hotkey } from '@tanstack/svelte-hotkeys'

  const actions = { save, undo, search }
  type Action = keyof typeof actions

  const formatForDisplay = getFormatForDisplay()
  let shortcuts = $state<Record<Action, Hotkey>>({
    save: 'Mod+S',
    undo: 'Mod+Z',
    search: ['G', 'S'],
  })
  let editing = $state<Action | null>(null)

  const recorder = createHotkeyRecorder({
    maxSteps: Infinity,
    onRecord: (hotkey) => {
      if (editing) shortcuts = { ...shortcuts, [editing]: hotkey }
      editing = null
    },
    onCancel: () => (editing = null),
  })

  // Register each action with its current hotkey
  createHotkeys(() =>
    Object.entries(shortcuts).map(([action, hotkey]) => ({
      hotkey,
      callback: actions[action as Action],
    })),
  )
</script>

<div>
  {#each Object.entries(shortcuts) as [action, hotkey] (action)}
    <button
      onclick={() => {
        editing = action as Action
        recorder.startRecording()
      }}
    >
      {action}:
      {editing === action && recorder.isRecording ? 'Press keys...' : formatForDisplay(hotkey)}
    </button>
  {/each}
</div>
```

## Recorder options

| Option | Default | Description |
| --- | --- | --- |
| `onRecord` | Required | Called with the recorded `hotkey` and `context` when a recording commits |
| `onCancel` | None | Called on `Escape`, `Tab`, `Shift+Tab`, or `cancelRecording()` |
| `onClear` | None | Called when `Backspace` or `Delete` is pressed with no recorded steps |
| `maxSteps` | `1` | `1` for chords, `Infinity` for sequences |
| `commitKeys` | `'enter'` | With `maxSteps: Infinity`, whether `Enter` commits (`'enter'`) or records as a step (`'none'`) |
| `idleTimeoutMs` | None | With `maxSteps: Infinity`, commits after this many milliseconds without a new step, counted from the first chord |
| `recordBy` | `'auto'` | `'auto'` (portable names with physical fallbacks), `'code'` (physical), or `'key'` (typed character) |
| `ignoreInputs` | `true` | Lets typing in text fields pass through while recording |
| `recordTab` | `false` | Records `Tab` and `Shift+Tab` instead of cancelling and moving focus |
| `validate` | None | Custom validator returning `true`, `false`, or an error message. See [Reject hotkeys you don't want](#reject-hotkeys-you-dont-want). |
| `detectConflicts` | `false` | Rejects recordings that collide with registered hotkeys. See [Check for conflicts](#check-for-conflicts). |
| `onReject` | None | Called with `{ reason, hotkey?, conflicts?, message? }` when a recording is rejected |
| `platform` | Detected | Override `'mac'`, `'windows'`, or `'linux'` for `Mod` output |

Set defaults for all recorders with `hotkeyRecorder` in the `defaultOptions` of `HotkeysProvider`. See [Set default options](./hotkeys-provider-and-scopes#set-default-options) and the [`createHotkeyRecorder` reference](../reference/functions/createHotkeyRecorder.md).

Try the [create-hotkey-recorder example](../examples/create-hotkey-recorder) or the [sequences recorder example](../examples/create-hotkey-recorder-sequences).
