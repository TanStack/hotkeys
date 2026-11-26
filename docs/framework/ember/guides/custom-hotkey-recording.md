---
title: Record Custom Hotkeys with useHotkeyRecorder in Ember
id: custom-hotkey-recording
description: Let users choose their own keyboard shortcuts in Ember by pressing the keys they want, with validation, conflict checks, and sequences.
redirect_from:
  - framework/ember/guides/hotkey-recording
---

`useHotkeyRecorder` lets users choose a hotkey by pressing it, as shortcut editors in system settings and IDEs do. Use it only when users can change the app's hotkeys. To save their choices and list them in a cheat sheet, pair it with [app hotkeys](./app-hotkeys).

While any recorder is listening, registered hotkeys don't fire, so pressing `Mod+S` to record it doesn't also save. The app doesn't need to disable them.

## Record a chord

```gts
import Component from '@glimmer/component'
import { on } from '@ember/modifier'
import { useFormatForDisplay, useHotkeyRecorder } from '@tanstack/ember-hotkeys'

export default class ShortcutRecorder extends Component {
  formatForDisplay = useFormatForDisplay()
  recorder = useHotkeyRecorder(this, {
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // e.g. 'Mod+Shift+S'
  })

  get label() {
    const { isRecording, recordedHotkey } = this.recorder
    if (isRecording) return 'Press a key combination...'
    return recordedHotkey ? this.formatForDisplay(recordedHotkey) : 'Click to record'
  }

  <template>
    <button type='button' {{on 'click' this.recorder.startRecording}}>{{this.label}}</button>
    {{#if this.recorder.isRecording}}
      <button type='button' {{on 'click' this.recorder.cancelRecording}}>Cancel</button>
    {{/if}}
  </template>
}
```

The recorder writes the hotkey the way you would write it by hand. Command+S on macOS, or Control+S on Windows and Linux, records `Mod+S` on any keyboard layout. It records `Mod` rather than Command or Control, so the hotkey works on every platform. Pass the result straight to `useHotkey`, and label it with `useFormatForDisplay`.

The recorder writes what the user typed, as you would by hand: Shift+/ records `?`, and Ctrl+Shift+/, or Cmd+Shift+/ on the US `/` key, records `Mod+?`. With Control, Command or Alt, a digit-row key records its digit, so AZERTY Ctrl+& records `Mod+1`. For the few presses whose character the browser reports differently by platform, the recorder records the key's position, in brackets: Option+/ on macOS records `Alt+[Slash]`, even though it types `÷`. A recorded character such as `@` fires wherever the layout types it, which can be a different key. [Recording captures what the user pressed](../../../guides/sensible-defaults.md#recording-captures-what-the-user-pressed) lists these cases. Set `recordBy: 'code'` to record every key by position, or `recordBy: 'key'` to record the character every press types. Recording by position needs a physical code, so it rejects a press that has none.

Pass the component as the owner, and the recorder is destroyed with it. The recorder has its state and controls, and its state members are tracked getters:

| Member | Description |
| --- | --- |
| `isRecording` | Whether the recorder is listening |
| `steps` | Chords recorded so far in a sequence recording |
| `recordedHotkey` | The hotkey from the last recording, or `null` after a cancel or clear |
| `startRecording()` | Starts listening |
| `stopRecording()` | Stops listening without calling `onRecord` or `onCancel` |
| `cancelRecording()` | Stops listening and calls `onCancel` |
| `commitRecording()` | Commits the `steps` recorded so far |

## Record a sequence

Set `maxSteps: Infinity` to let users record a sequence. Each chord adds a step, and the recording commits when the user presses Enter or, when `idleTimeoutMs` is configured, after that delay without a new step:

```gts
export default class SequenceRecorder extends Component {
  formatForDisplay = useFormatForDisplay()
  recorder = useHotkeyRecorder(this, {
    maxSteps: Infinity,
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // 'Mod+S' or ['G', 'G']
  })

  get label() {
    const { isRecording, steps, recordedHotkey } = this.recorder
    if (isRecording) return this.formatForDisplay(steps) || 'Press chords, then Enter...'
    return recordedHotkey ? this.formatForDisplay(recordedHotkey) : 'Click to record'
  }

  <template>
    <button type='button' {{on 'click' this.recorder.startRecording}}>{{this.label}}</button>
  </template>
}
```

A one-step recording commits as a chord, so the result can always go straight to `useHotkey`. With `maxSteps: Infinity`, `onRecord` and `validate` receive a `Hotkey`, which can be a chord or a sequence. See [Sequences](./sequences) for how sequences match.

Options can also be a getter, such as `useHotkeyRecorder(this, () => ({ maxSteps: Infinity, recordBy: this.mode, onRecord }))`, read during recording and commit.

## Keys the recorder handles

| Key | What it does |
| --- | --- |
| A modifier alone, such as Shift | Waits for a key to go with it |
| A key, with or without modifiers | Records a chord, such as `Mod+S` or `F1` |
| Enter | Commits a sequence recording. With `maxSteps: 1` or `commitKeys: 'none'`, records Enter like any other key. |
| Escape | Cancels the recording and calls `onCancel` |
| Tab or Shift+Tab, without Control, Alt, or Meta | Cancels the recording and calls `onCancel`, and the browser moves focus as usual. In a text field, moves focus without cancelling. With `recordTab: true`, records Tab like any other key. |
| Backspace or Delete, without modifiers | Removes the last step. With no steps, stops recording and calls `onClear`. |

The recorder also cancels and calls `onCancel` when the window loses focus, such as when the user switches apps or tabs, opens browser devtools, or clicks into an iframe. Set `cancelOnBlur: false` to keep recording. While debugging with devtools open, Chrome's **Rendering > Emulate a focused page** setting keeps the page focused.

A click elsewhere on the page doesn't cancel, because the recorder doesn't know which element is your recorder. To cancel on a click outside it, listen for `pointerdown` while recording, for example in a modifier. Don't rely on the button's `blur` event: Safari and Firefox on macOS don't focus a button when it is clicked.

```gts
import { modifier } from 'ember-modifier'

export default class ShortcutRecorder extends Component {
  recorder = useHotkeyRecorder(this, { onRecord })

  // isRecording is an argument, so the modifier runs again when it changes
  cancelOnPointerDownOutside = modifier(
    (element: HTMLElement, [isRecording]: [boolean]) => {
      if (!isRecording) return
      const onPointerDown = (event: PointerEvent) => {
        if (!element.contains(event.target as Node)) this.recorder.cancelRecording()
      }
      document.addEventListener('pointerdown', onPointerDown, true)
      return () => document.removeEventListener('pointerdown', onPointerDown, true)
    },
  )

  <template>
    <div {{this.cancelOnPointerDownOutside this.recorder.isRecording}}>
      <button type='button' {{on 'click' this.recorder.startRecording}}>{{this.label}}</button>
    </div>
  </template>
}
```

Shortcuts that the browser or the operating system keeps, such as `Mod+T`, `Mod+N`, and `Mod+W` in Chrome or most `Win` shortcuts on Windows, never reach the page. The recorder can't see them, so it can't reject them either.

Repeats and IME composition never add a step. `onClear` doesn't change anything on its own, so your app decides whether clearing removes a hotkey or restores its default.

By default, the recorder ignores typing in text fields, so other fields on the page keep working while it listens. Escape still cancels. Set `ignoreInputs: false` to record from inside a text field.

Tab and Shift+Tab end the recording, so keyboard users don't get stuck on the recorder ([WCAG 2.1.2](https://www.w3.org/WAI/WCAG21/Understanding/no-keyboard-trap.html)). Set `recordTab: true` to let users bind Tab, for example in an editor. Escape still cancels, so show it while recording, such as "Press Escape to cancel".

## Validate and check conflicts

### Reject hotkeys you don't want

Pass `validate` to accept or reject each recording before it commits. Return `true` to accept, or `false` or a message to reject:

```ts
recorder = useHotkeyRecorder(this, {
  validate: (_hotkey, { parsedChord }) =>
    parsedChord.modifiers.length > 0 || 'Include a modifier.',
  onReject: ({ message }) => setError(message ?? 'Try another shortcut.'),
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

The second argument has the `event` that recorded the chord and `parsedChord`, with `Mod` resolved. `onRecord` receives the same second argument. With `maxSteps: Infinity`, a recording can be a chord or a sequence, so check `kind` first. A sequence's context has `events` and `parsedSequence`, with one entry per step:

```ts
recorder = useHotkeyRecorder(this, {
  maxSteps: Infinity,
  validate: (_hotkey, context) =>
    context.kind === 'sequence' ||
    context.parsedChord.modifiers.length > 0 ||
    'A single chord needs a modifier.',
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

A rejected recording keeps listening, so the user can try again. A rejected sequence recording keeps its steps, so the user can edit them with Backspace.

### Save hotkeys that work on another platform

A recorded hotkey's modifiers mean the same keys on every platform when they are `Mod`, `Shift`, and `Alt`. A recorded character such as `@` follows the layout, so it can sit on a different key, while a bracketed code such as `[Slash]` stays on the same physical key. The recorder writes Command on macOS and Control elsewhere as `Mod`. The other two modifiers stay platform-specific: Control+S recorded on a Mac is `Control+S`, which on Windows is the same press as `Mod+S`, and the Windows key recorded on Windows is `Meta`, which on a Mac is Command.

If your app syncs hotkeys between machines, pick one rule:

- Store each hotkey with the platform it was recorded on, and use it only there. `context.platform` names it.
- Reject the platform-specific modifiers, so every saved hotkey's modifiers work on every platform:

```ts
recorder = useHotkeyRecorder(this, {
  validate: (_hotkey, { parsedChord, platform }) =>
    !(platform === 'mac' ? parsedChord.ctrl : parsedChord.meta) ||
    'Use Ctrl or Cmd, Shift, and Alt.',
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

### Check for conflicts

Set `detectConflicts: true` to reject a hotkey that's already registered:

```ts
recorder = useHotkeyRecorder(this, {
  detectConflicts: true,
  onReject: ({ reason }) => {
    if (reason === 'conflict') setError('That shortcut is already in use.')
  },
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

By default, the check compares the recording with every enabled `keydown` hotkey on the page, in every [scope](./hotkey-manager#activate-a-scope). A recorded chord conflicts with a sequence that starts with it, and a recorded sequence conflicts with a chord equal to its first step. Pass an object instead of `true` to change what's checked:

```ts
detectConflicts: {
  excludeIds: [registration.id], // Skip the hotkey being changed
  target: panelElement, // Only hotkeys on this element, inside it, or around it (pass scope: 'all' instead to check every element)
  eventType: 'keyup', // Check keyup hotkeys instead
  includeDisabled: true, // Include disabled hotkeys
  exclude: (registration) => registration.options.scope === 'vim', // Skip one hotkey scope
}
```

Two hotkeys can be written differently and still fire for the same key press. On a US keyboard, `Shift+[Slash]`, recorded by code or saved by an earlier version, and a registered `?` are the same press. The check also tests each registered hotkey against the key presses that made the recording, so it finds these.

A conflict check finds hotkeys that could collide. It can't promise which callback a key press would run, because propagation, typing in fields, other listeners, and pages that haven't rendered all affect that. To check app hotkeys, including ones on pages that haven't rendered, use `findConflicts` from [app hotkeys](./app-hotkeys#change-hotkeys) instead.

`onReject` doesn't generate user-facing copy. Map `reason`, along with the optional `hotkey`, `conflicts`, and `message`, to your own UI strings:

| `reason` | When it happens |
| --- | --- |
| `'conflict'` | Collides with a registered hotkey (`conflicts` lists the matches) |
| `'validation'` | Rejected by your `validate` callback (`message` holds your return string) |
| `'whitespace'` | The user pressed a whitespace character that can't be recorded |
| `'missing-code'` | The key press had no physical `code`, and the recorder can't record it another way |
| `'alt-graph'` | The user pressed an `AltGr` combination that typed no character to record, or any `AltGr` combination with `recordBy: 'code'`. Windows reports `AltGr` with a key it doesn't change, such as `Home`, as Control+Alt instead, so that press isn't rejected: it records `Mod+Alt+Home`, or `Mod+Alt+[Home]` with `recordBy: 'code'` |

`findHotkeyConflicts(hotkey, options)` runs the same conflict check outside a recording and returns `HotkeyConflict` objects (`{ registration }`) wrapping matching [registration views](./cheat-sheet-ui-helpers#list-the-hotkeys-on-screen).

## Build a shortcut settings screen

For an app-wide settings screen, declare your hotkeys as [app hotkeys](./app-hotkeys), and save each recording with `setCustomHotkey`. That keeps cheat sheets, conflict checks, and saved choices in one place. [Change hotkeys](./app-hotkeys#change-hotkeys) shows a settings row built that way.

For a few hotkeys in one component, tracked state is enough:

```gts
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { fn } from '@ember/helper'
import { on } from '@ember/modifier'
import {
  useFormatForDisplay,
  useHotkeyRecorder,
  useHotkeys,
} from '@tanstack/ember-hotkeys'
import type { EmberHotkeyDefinition, Hotkey } from '@tanstack/ember-hotkeys'

type Action = 'save' | 'undo' | 'search'

export default class ShortcutSettings extends Component {
  formatForDisplay = useFormatForDisplay()
  @tracked shortcuts: Record<Action, Hotkey> = {
    save: 'Mod+S',
    undo: 'Mod+Z',
    search: ['G', 'S'],
  }
  @tracked editing: Action | null = null

  recorder = useHotkeyRecorder(this, {
    maxSteps: Infinity,
    onRecord: (hotkey) => {
      if (this.editing) this.shortcuts = { ...this.shortcuts, [this.editing]: hotkey }
      this.editing = null
    },
    onCancel: () => (this.editing = null),
  })

  // Register each action with its current hotkey
  get definitions(): Array<EmberHotkeyDefinition> {
    return Object.entries(this.shortcuts).map(([action, hotkey]) => ({
      hotkey,
      callback: () => this.run(action as Action),
    }))
  }

  get entries() {
    return Object.entries(this.shortcuts).map(([action, hotkey]) => ({
      action: action as Action,
      label:
        this.editing === action && this.recorder.isRecording
          ? 'Press keys...'
          : this.formatForDisplay(hotkey),
    }))
  }

  edit = (action: Action) => {
    this.editing = action
    this.recorder.startRecording()
  }

  run(action: Action) {
    /* ... */
  }

  <template>
    {{useHotkeys this.definitions}}
    {{#each this.entries as |entry|}}
      <button type='button' {{on 'click' (fn this.edit entry.action)}}>
        {{entry.action}}: {{entry.label}}
      </button>
    {{/each}}
  </template>
}
```

## Recorder options

| Option | Default | Description |
| --- | --- | --- |
| `onRecord` | Required | Called with the recorded hotkey when a recording commits, and with the same context as `validate` |
| `onCancel` | None | Called when the user presses Escape, Tab, or Shift+Tab, when the window loses focus, or when you call `cancelRecording()` |
| `cancelOnBlur` | `true` | Cancels the recording when the window loses focus. Set `false` to keep recording. |
| `onClear` | None | Called when the user presses Backspace or Delete with nothing recorded |
| `maxSteps` | `1` | `1` records a chord. `Infinity` records a sequence. |
| `commitKeys` | `'enter'` | With `maxSteps: Infinity`, whether plain Enter commits (`'enter'`) or records as a step (`'none'`) |
| `idleTimeoutMs` | None | With `maxSteps: Infinity`, commits after this many milliseconds without a new step. The timer starts after the first chord. |
| `recordBy` | `'auto'` | Records what the key typed, written as by hand, and by position where that changes with the platform or layout (`'auto'`), always by position (`'code'`), or always by the character it types (`'key'`) |
| `ignoreInputs` | `true` | Lets typing in text fields pass through while recording |
| `recordTab` | `false` | Records Tab and Shift+Tab instead of letting them cancel and move focus |
| `validate` | None | Accepts or rejects a recording. See [Reject hotkeys you don't want](#reject-hotkeys-you-dont-want). |
| `detectConflicts` | `false` | Rejects a recording that collides with a registered hotkey. See [Check for conflicts](#check-for-conflicts). |
| `onReject` | None | Called with the reason when a recording is rejected |
| `platform` | Detected | The platform that decides what `Mod` means |

To change the defaults for several recorders, pass `hotkeyRecorder` options to `createHotkeysScope`, and pass the scope as the third argument: `useHotkeyRecorder(this, options, createHotkeysScope({ hotkeyRecorder: { idleTimeoutMs: 2000 } }))`. Options you pass to `useHotkeyRecorder` take precedence. The [`useHotkeyRecorder` reference](../reference/functions/useHotkeyRecorder.md) lists the types.

The [useHotkeyRecorder example](../examples/useHotkeyRecorder) records chords, and the [sequences example](../examples/useHotkeyRecorder-sequences) records sequences.

## Migrating from v0.8 and earlier

> [!NOTE]
> `createHotkeysScope(...).useHotkeyRecorder` was removed in `@tanstack/ember-hotkeys` v0.9.0, so apps that set defaults but don't record hotkeys don't ship the recorder. Pass the scope as the third argument instead: `useHotkeyRecorder(this, options, this.hotkeys)`.
