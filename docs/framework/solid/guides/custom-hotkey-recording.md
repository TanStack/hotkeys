---
title: Record Custom Hotkeys with createHotkeyRecorder in Solid
id: custom-hotkey-recording
description: Let users choose their own keyboard shortcuts in Solid by pressing the keys they want, with validation, conflict checks, and sequences.
redirect_from:
  - framework/solid/guides/hotkey-recording
---

`createHotkeyRecorder` lets users customize a shortcut by pressing the keys directly, as shortcut editors in system settings and IDEs do. It's needed only when users can rebind shortcuts. Pair it with [App Hotkeys](./app-hotkeys) to validate, persist, and list customized bindings app-wide.

While any recorder is listening, registered hotkeys pause automatically so pressing `Mod+S` to record it doesn't also trigger Save.

## Record a chord

```tsx
import { Show } from 'solid-js'
import { createFormatForDisplay, createHotkeyRecorder } from '@tanstack/solid-hotkeys'

function ShortcutRecorder() {
  const formatForDisplay = createFormatForDisplay()
  const recorder = createHotkeyRecorder({
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // e.g. 'Mod+Shift+S'
  })

  const label = () => {
    if (recorder.isRecording()) return 'Press a key combination...'
    const hotkey = recorder.recordedHotkey()
    return hotkey ? formatForDisplay(hotkey) : 'Click to record'
  }

  return (
    <div>
      <button onClick={recorder.startRecording}>{label()}</button>
      <Show when={recorder.isRecording()}>
        <button onClick={recorder.cancelRecording}>Cancel</button>
      </Show>
    </div>
  )
}
```

With the default `recordBy: 'auto'`, the recorder outputs portable strings like those written by hand: `Mod+S` for Command+S on macOS or Control+S on Windows and Linux. It records what the press typed (`?` for Shift+/, `Mod+1` for AZERTY Ctrl+&), and falls back to physical bracketed codes for the few presses whose character the browser reports differently by platform, such as `Alt+[Slash]` for macOS Option+/. A recorded character such as `@` fires wherever the layout types it, which can be a different key. See [Recording captures what the user pressed](../../../guides/sensible-defaults.md#recording-captures-what-the-user-pressed) for the full rules, or set `recordBy: 'code'` (always physical) or `recordBy: 'key'` (always typed character). Recording by position rejects a press that has no physical code.

Pass the result straight to `createHotkey`, and label it with `createFormatForDisplay`. `createHotkeyRecorder` returns the recorder's state and controls. Each state member is an accessor:

| Member | Description |
| --- | --- |
| `isRecording()` | Whether the recorder is currently listening |
| `steps()` | Chords captured so far during a sequence recording |
| `recordedHotkey()` | Last committed hotkey, or `null` after cancel or clear |
| `startRecording()` | Starts listening |
| `stopRecording()` | Stops listening without triggering `onRecord` or `onCancel` |
| `cancelRecording()` | Stops listening and calls `onCancel` |
| `commitRecording()` | Commits the current `steps` immediately |

## Record a sequence

Set `maxSteps: Infinity` to capture multi-step sequences. Each chord appends a step, and the recording commits when the user presses `Enter` or, when `idleTimeoutMs` is configured, stops typing for that duration:

```tsx
function SequenceRecorder() {
  const formatForDisplay = createFormatForDisplay()
  const recorder = createHotkeyRecorder({
    maxSteps: Infinity,
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // 'Mod+S' or ['G', 'G']
  })

  const label = () => {
    if (recorder.isRecording()) {
      return formatForDisplay(recorder.steps()) || 'Press chords, then Enter...'
    }
    const hotkey = recorder.recordedHotkey()
    return hotkey ? formatForDisplay(hotkey) : 'Click to record'
  }

  return <button onClick={recorder.startRecording}>{label()}</button>
}
```

If the user commits after a single chord, `createHotkeyRecorder` simplifies it to a chord string rather than a 1-element array. With `maxSteps: Infinity`, `onRecord` and `validate` receive a `Hotkey` (`HotkeyChord | HotkeySequence`). See [Sequences](./sequences) for how sequence bindings work.

Options can also be an accessor, such as `createHotkeyRecorder(() => ({ maxSteps: Infinity, recordBy: mode(), onRecord }))`, so the recorder follows signals.

## Keys the recorder handles

| Key | Behavior while recording |
| --- | --- |
| Standalone modifier, such as `Shift` or `Control` | Waits for a non-modifier key |
| Key press (with or without modifiers) | Captures a chord (`Mod+S`, `F1`) |
| `Enter` | Commits a sequence. With `maxSteps: 1` or `commitKeys: 'none'`, records `Enter` instead. |
| `Escape` | Cancels recording and calls `onCancel` |
| `Tab` or `Shift+Tab` (without `Control`, `Alt`, or `Meta`) | Cancels and lets focus move normally. In a text field, `Tab` moves focus without cancelling. Set `recordTab: true` to record `Tab` instead, and show "Press Escape to cancel" for keyboard accessibility. |
| `Backspace` or `Delete` (no modifiers) | Removes the last sequence step, or stops and calls `onClear` when empty |

The recorder also cancels and calls `onCancel` when the window loses focus, such as when the user switches apps or tabs, opens browser devtools, or clicks into an iframe. Set `cancelOnBlur: false` to keep recording. While debugging with devtools open, Chrome's **Rendering > Emulate a focused page** setting keeps the page focused.

To record in another window, such as a Picture-in-Picture window that holds the recorder's button, pass that window or its document as `target`. The recorder reads `target` when recording starts, listens only in that window, and cancels when that window loses focus or closes. A closed window doesn't start recording.

A click elsewhere on the page doesn't cancel, because the recorder doesn't know which element is your recorder. To cancel on a click outside it, listen for `pointerdown` while recording. Don't rely on the button's `blur` event: Safari and Firefox on macOS don't focus a button when it is clicked.

```tsx
let button: HTMLButtonElement | undefined

createEffect(recorder.isRecording, (recording) => {
  if (!recording) return
  const onPointerDown = (event: PointerEvent) => {
    if (!button?.contains(event.target as Node)) recorder.cancelRecording()
  }
  document.addEventListener('pointerdown', onPointerDown, true)
  return () => document.removeEventListener('pointerdown', onPointerDown, true)
})

// <button ref={button} onClick={recorder.startRecording}>...</button>
```

Shortcuts that the browser or the operating system keeps, such as `Mod+T`, `Mod+N`, and `Mod+W` in Chrome or most `Win` shortcuts on Windows, never reach the page. The recorder can't see them, so it can't reject them either.

Key auto-repeats and IME compositions never add steps. Typing inside other text fields passes through while recording (`Escape` still cancels), unless you pass `ignoreInputs: false` to record inside inputs. Note that `onClear` doesn't delete anything on its own. Decide in your callback whether clearing unbinds the shortcut or resets its default.

## Validate and check conflicts

### Reject hotkeys you don't want

Return `true` from `validate` to accept a recording, or `false` or an error string to reject it:

```tsx
createHotkeyRecorder({
  validate: (_hotkey, { parsedChord }) =>
    parsedChord.modifiers.length > 0 || 'Include a modifier.',
  onReject: ({ message }) => setError(message ?? 'Try another shortcut.'),
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

With `maxSteps: Infinity`, check `context.kind` before reading `parsedChord` or `parsedSequence` (both `validate` and `onRecord` receive the same `context`):

```tsx
createHotkeyRecorder({
  maxSteps: Infinity,
  validate: (_hotkey, context) =>
    context.kind === 'sequence' ||
    context.parsedChord.modifiers.length > 0 ||
    'A single chord needs a modifier.',
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

Rejected recordings keep the recorder active, and rejected sequences keep their captured `steps` so users can edit with `Backspace`.

### Save hotkeys that work on another platform

A recorded hotkey's modifiers mean the same keys on every platform when they are `Mod`, `Shift`, and `Alt`. A recorded character such as `@` follows the layout, so it can sit on a different key, while a bracketed code such as `[Slash]` stays on the same physical key. The recorder writes Command on macOS and Control elsewhere as `Mod`. The other two modifiers stay platform-specific: Control+S recorded on a Mac is `Control+S`, which on Windows is the same press as `Mod+S`, and the Windows key recorded on Windows is `Meta`, which on a Mac is Command.

If your app syncs hotkeys between machines, pick one rule:

- Store each hotkey with the platform it was recorded on, and use it only there. `context.platform` names it.
- Reject the platform-specific modifiers, so every saved hotkey's modifiers work on every platform:

```tsx
createHotkeyRecorder({
  validate: (_hotkey, { parsedChord, platform }) =>
    !(platform === 'mac' ? parsedChord.ctrl : parsedChord.meta) ||
    'Use Ctrl or Cmd, Shift, and Alt.',
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

### Check for conflicts

Pass `detectConflicts: true` to reject bindings already registered on the page:

```tsx
createHotkeyRecorder({
  detectConflicts: true,
  onReject: ({ reason }) => {
    if (reason === 'conflict') setError('That shortcut is already in use.')
  },
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

By default, `detectConflicts` checks every enabled `keydown` registration across all scopes. A recorded chord conflicts with a sequence that starts with it, and a recorded sequence conflicts with a chord equal to its first step (so `['G', 'H']` and `['G', 'S']` do not conflict). It compares underlying keypresses so `Shift+[Slash]`, recorded by code, catches `?`. Pass an options object to narrow the check:

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
| `'alt-graph'` | `AltGr` combination that typed no character, or, with `recordBy: 'code'`, any other. On Windows, the recorder treats `AltGr` with a key it doesn't change, such as `Home`, as Control+Alt, which no mode rejects. It records `Mod+Alt+Home`, or `Mod+Alt+[Home]` with `recordBy: 'code'` |

`findHotkeyConflicts(hotkey, options)` runs the same conflict check outside a recording and returns `HotkeyConflict` objects (`{ registration }`) wrapping matching [registration views](./cheat-sheet-ui-helpers#list-the-hotkeys-on-screen).

## Build a shortcut settings screen

For app-wide settings, pair [App Hotkeys](./app-hotkeys#change-hotkeys) with `setCustomHotkey` so cheat sheets, persistence, and unmounted-route conflict checks stay unified.

For a few hotkeys in one component, signals are enough:

```tsx
import { For, createSignal } from 'solid-js'
import {
  createFormatForDisplay,
  createHotkeyRecorder,
  createHotkeys,
} from '@tanstack/solid-hotkeys'
import type { Hotkey } from '@tanstack/solid-hotkeys'

const actions = { save, undo, search }
type Action = keyof typeof actions

function ShortcutSettings() {
  const formatForDisplay = createFormatForDisplay()
  const [shortcuts, setShortcuts] = createSignal<Record<Action, Hotkey>>({
    save: 'Mod+S',
    undo: 'Mod+Z',
    search: ['G', 'S'],
  })
  const [editing, setEditing] = createSignal<Action | null>(null)

  const recorder = createHotkeyRecorder({
    maxSteps: Infinity,
    onRecord: (hotkey) => {
      const action = editing()
      if (action) setShortcuts((prev) => ({ ...prev, [action]: hotkey }))
      setEditing(null)
    },
    onCancel: () => setEditing(null),
  })

  // Register each action with its current hotkey
  createHotkeys(() =>
    Object.entries(shortcuts()).map(([action, hotkey]) => ({
      hotkey,
      callback: actions[action as Action],
    })),
  )

  return (
    <div>
      <For each={Object.entries(shortcuts())}>
        {([action, hotkey]) => (
          <button
            onClick={() => {
              setEditing(action as Action)
              recorder.startRecording()
            }}
          >
            {action}:{' '}
            {editing() === action && recorder.isRecording()
              ? 'Press keys...'
              : formatForDisplay(hotkey)}
          </button>
        )}
      </For>
    </div>
  )
}
```

## Recorder options

| Option | Default | Description |
| --- | --- | --- |
| `onRecord` | Required | Called with the recorded `hotkey` and `context` when committed |
| `onCancel` | None | Called on `Escape`, `Tab`, `Shift+Tab`, the window losing focus, or `cancelRecording()` |
| `cancelOnBlur` | `true` | Cancels when the window loses focus. Set `false` to keep recording |
| `target` | `window` | The window, or its document, to record in, such as a Picture-in-Picture window |
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

Set defaults for all recorders through `HotkeysProvider` using `hotkeyRecorder` in `defaultOptions`. See [Set default options](./hotkeys-provider-and-scopes#set-default-options) and [`createHotkeyRecorder`](../reference/functions/createHotkeyRecorder.md).

Try the [createHotkeyRecorder example](../examples/createHotkeyRecorder) or [sequences recorder example](../examples/createHotkeyRecorder-sequences).
