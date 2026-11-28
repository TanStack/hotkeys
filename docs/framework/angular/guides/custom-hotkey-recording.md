---
title: Record Custom Hotkeys with injectHotkeyRecorder in Angular
id: custom-hotkey-recording
description: Let users choose their own keyboard shortcuts in Angular by pressing the keys they want, with validation, conflict checks, and sequences.
redirect_from:
  - framework/angular/guides/hotkey-recording
---

`injectHotkeyRecorder` lets users customize a shortcut by pressing the keys directly, like the shortcut settings in an IDE or an operating system. It's only needed when users can rebind shortcuts. Pair it with [App Hotkeys](./app-hotkeys) to validate, persist, and list customized bindings app-wide.

While any recorder is listening, registered hotkeys pause automatically so pressing `Mod+S` to record it doesn't also trigger Save.

## Record a chord

```ts
import { Component } from '@angular/core'
import { injectFormatForDisplay, injectHotkeyRecorder } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-shortcut-recorder',
  template: `
    <button (click)="recorder.startRecording()">
      {{
        recorder.isRecording()
          ? 'Press a key combination...'
          : recorder.recordedHotkey()
            ? formatForDisplay(recorder.recordedHotkey()!)
            : 'Click to record'
      }}
    </button>
    @if (recorder.isRecording()) {
      <button (click)="recorder.cancelRecording()">Cancel</button>
    }
  `,
})
export class ShortcutRecorderComponent {
  readonly formatForDisplay = injectFormatForDisplay()
  readonly recorder = injectHotkeyRecorder({
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // e.g. 'Mod+Shift+S'
  })
}
```

With the default `recordBy: 'auto'`, the recorder outputs portable strings, written like a hand-typed string. Command+S on macOS and Control+S on Windows and Linux both record `Mod+S`. It records what the press typed, such as `?` for Shift+/ and `Mod+1` for AZERTY Ctrl+&. For the few presses whose character the browser reports differently by platform, it falls back to physical bracketed codes, such as `Alt+[Slash]` for macOS Option+/. A recorded character such as `@` fires wherever the layout types it, which can be a different key. See [Recording captures what the user pressed](../../../guides/sensible-defaults.md#recording-captures-what-the-user-pressed) for the full rules. Set `recordBy: 'code'` to always record the physical key, or `recordBy: 'key'` to always record the typed character. Pass the result straight to `injectHotkey`, and label it with `injectFormatForDisplay`.

`injectHotkeyRecorder` returns the recorder's state and controls. State members are signals:

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

```ts
@Component({
  selector: 'app-sequence-recorder',
  template: `
    <button (click)="recorder.startRecording()">
      {{
        recorder.isRecording()
          ? formatForDisplay(recorder.steps()) || 'Press chords, then Enter...'
          : recorder.recordedHotkey()
            ? formatForDisplay(recorder.recordedHotkey()!)
            : 'Click to record'
      }}
    </button>
  `,
})
export class SequenceRecorderComponent {
  readonly formatForDisplay = injectFormatForDisplay()
  readonly recorder = injectHotkeyRecorder({
    maxSteps: Infinity,
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // 'Mod+S' or ['G', 'G']
  })
}
```

If the user commits after a single chord, `injectHotkeyRecorder` simplifies it to a chord string instead of a one-element array, so the result can always go straight to `injectHotkey`. With `maxSteps: Infinity`, `onRecord` and `validate` receive a `Hotkey`, which is a chord or a sequence. See [Sequences](./sequences) for how sequences match.

Options can also be a getter, such as `injectHotkeyRecorder(() => ({ maxSteps: Infinity, recordBy: this.mode(), onRecord }))`, so the recorder follows signals.

## Keys the recorder handles

| Key | Behavior while recording |
| --- | --- |
| Standalone modifier, such as `Shift` or `Control` | Waits for a non-modifier key |
| Key press, with or without modifiers | Captures a chord such as `Mod+S` or `F1` |
| `Enter` | Commits a sequence. With `maxSteps: 1` or `commitKeys: 'none'`, records `Enter` instead. |
| `Escape` | Cancels recording and calls `onCancel` |
| `Tab` or `Shift+Tab` without `Control`, `Alt`, or `Meta` | Cancels and lets focus move normally, so keyboard users never get stuck on the recorder ([WCAG 2.1.2](https://www.w3.org/WAI/WCAG21/Understanding/no-keyboard-trap.html)). In a text field, `Tab` moves focus without cancelling. Set `recordTab: true` to record `Tab` instead, and show "Press Escape to cancel". |
| `Backspace` or `Delete` without modifiers | Removes the last sequence step, or stops and calls `onClear` when empty |

The recorder also cancels and calls `onCancel` when the window loses focus, such as when the user switches apps or tabs, opens browser devtools, or clicks into an iframe. Set `cancelOnBlur: false` to keep recording. While debugging with devtools open, Chrome's **Rendering > Emulate a focused page** setting keeps the page focused.

To record in another window, such as a Picture-in-Picture window that holds the recorder's button, pass that window or its document as `target`. The recorder reads `target` when recording starts, listens only in that window, and cancels when that window loses focus or closes. A closed window doesn't start recording.

A click elsewhere on the page doesn't cancel, because the recorder doesn't know which element is your recorder. To cancel on a click outside it, listen for `pointerdown` while recording. Don't rely on the button's `blur` event: Safari and Firefox on macOS don't focus a button when it is clicked.

```ts
export class ShortcutRecorderComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef)
  readonly recorder = injectHotkeyRecorder({ onRecord })

  constructor() {
    effect((onCleanup) => {
      if (!this.recorder.isRecording()) return
      const onPointerDown = (event: PointerEvent) => {
        if (!this.host.nativeElement.contains(event.target as Node)) {
          this.recorder.cancelRecording()
        }
      }
      document.addEventListener('pointerdown', onPointerDown, true)
      onCleanup(() => document.removeEventListener('pointerdown', onPointerDown, true))
    })
  }
}
```

Shortcuts that the browser or the operating system keeps, such as `Mod+T`, `Mod+N`, and `Mod+W` in Chrome or most `Win` shortcuts on Windows, never reach the page. The recorder can't see them, so it can't reject them either.

Key auto-repeats and IME compositions never add steps. Typing inside other text fields passes through while recording, and `Escape` still cancels. Pass `ignoreInputs: false` to record inside inputs. `onClear` doesn't delete anything on its own, so decide in your callback whether clearing unbinds the shortcut or resets its default.

## Validate and check conflicts

### Reject hotkeys you don't want

Return `true` from `validate` to accept a recording, or `false` or an error string to reject it:

```ts
injectHotkeyRecorder({
  validate: (_hotkey, { parsedChord }) =>
    parsedChord.modifiers.length > 0 || 'Include a modifier.',
  onReject: ({ message }) => setError(message ?? 'Try another shortcut.'),
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

The second argument holds the `event` that recorded the chord and `parsedChord`, with `Mod` resolved. A sequence context holds `events` and `parsedSequence`. With `maxSteps: Infinity`, check `context.kind` first. `onRecord` receives the same `context`:

```ts
injectHotkeyRecorder({
  maxSteps: Infinity,
  validate: (_hotkey, context) =>
    context.kind === 'sequence' ||
    context.parsedChord.modifiers.length > 0 ||
    'A single chord needs a modifier.',
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

Rejected recordings keep the recorder active, and rejected sequences keep their captured `steps` so users can edit them with `Backspace`.

### Save hotkeys that work on another platform

A recorded hotkey's modifiers mean the same keys on every platform when they are `Mod`, `Shift`, and `Alt`. A recorded character such as `@` follows the layout, so it can sit on a different key, while a bracketed code such as `[Slash]` stays on the same physical key. The recorder writes Command on macOS and Control elsewhere as `Mod`. The other two modifiers stay platform-specific: Control+S recorded on a Mac is `Control+S`, which on Windows is the same press as `Mod+S`, and the Windows key recorded on Windows is `Meta`, which on a Mac is Command.

If your app syncs hotkeys between machines, pick one rule:

- Store each hotkey with the platform it was recorded on, and use it only there. `context.platform` names it.
- Reject the platform-specific modifiers, so every saved hotkey's modifiers work on every platform:

```ts
injectHotkeyRecorder({
  validate: (_hotkey, { parsedChord, platform }) =>
    !(platform === 'mac' ? parsedChord.ctrl : parsedChord.meta) ||
    'Use Ctrl or Cmd, Shift, and Alt.',
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

### Check for conflicts

Pass `detectConflicts: true` to reject bindings already registered on the page:

```ts
injectHotkeyRecorder({
  detectConflicts: true,
  onReject: ({ reason }) => {
    if (reason === 'conflict') setError('That shortcut is already in use.')
  },
  onRecord: (hotkey) => saveHotkey(hotkey),
})
```

By default, `detectConflicts` checks every enabled `keydown` registration across all [scopes](./provide-hotkeys-and-scopes). It treats chords and sequences that share a prefix as colliding, and compares the underlying key presses, so `Shift+[Slash]`, recorded by code, catches a registered `?`. Pass an options object to narrow the check:

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
| `'alt-graph'` | An `AltGr` combination that typed no character to record, or, with `recordBy: 'code'`, any other `AltGr` combination. On Windows, the recorder treats `AltGr` with a key it doesn't change, such as `Home`, as Control+Alt, so no mode rejects that press: it records `Mod+Alt+Home`, or `Mod+Alt+[Home]` with `recordBy: 'code'` |

`findHotkeyConflicts(hotkey, options)` runs the same conflict check outside a recording and returns `HotkeyConflict` objects (`{ registration }`) wrapping matching [registration views](./cheat-sheet-ui-helpers#list-the-hotkeys-on-screen).

## Build a shortcut settings screen

For app-wide settings, pair [App Hotkeys](./app-hotkeys#change-hotkeys) with `setCustomHotkey` so cheat sheets, persistence, and conflict checks for unmounted routes stay in one place.

For a few hotkeys in one component, signals are enough:

```ts
import { Component, signal } from '@angular/core'
import {
  injectFormatForDisplay,
  injectHotkeyRecorder,
  injectHotkeys,
} from '@tanstack/angular-hotkeys'
import type { Hotkey } from '@tanstack/angular-hotkeys'

type Action = 'save' | 'undo' | 'search'

@Component({
  selector: 'app-shortcut-settings',
  template: `
    @for (entry of entries(); track entry[0]) {
      <button (click)="edit(entry[0])">
        {{ entry[0] }}:
        {{ editing() === entry[0] && recorder.isRecording() ? 'Press keys...' : formatForDisplay(entry[1]) }}
      </button>
    }
  `,
})
export class ShortcutSettingsComponent {
  readonly formatForDisplay = injectFormatForDisplay()
  readonly shortcuts = signal<Record<Action, Hotkey>>({
    save: 'Mod+S',
    undo: 'Mod+Z',
    search: ['G', 'S'],
  })
  readonly editing = signal<Action | null>(null)
  readonly entries = () => Object.entries(this.shortcuts()) as Array<[Action, Hotkey]>

  readonly recorder = injectHotkeyRecorder({
    maxSteps: Infinity,
    onRecord: (hotkey) => {
      const action = this.editing()
      if (action) this.shortcuts.update((prev) => ({ ...prev, [action]: hotkey }))
      this.editing.set(null)
    },
    onCancel: () => this.editing.set(null),
  })

  constructor() {
    // Register each action with its current hotkey
    injectHotkeys(() =>
      this.entries().map(([action, hotkey]) => ({
        hotkey,
        callback: () => this.run(action),
      })),
    )
  }

  edit(action: Action) {
    this.editing.set(action)
    this.recorder.startRecording()
  }

  run(action: Action) {
    /* ... */
  }
}
```

## Recorder options

| Option | Default | Description |
| --- | --- | --- |
| `onRecord` | Required | Called with the recorded `hotkey` and `context` when a recording commits |
| `onCancel` | None | Called on `Escape`, `Tab`, `Shift+Tab`, the window losing focus, or `cancelRecording()` |
| `cancelOnBlur` | `true` | Cancels when the window loses focus. Set `false` to keep recording |
| `target` | `window` | The window, or its document, to record in, such as a Picture-in-Picture window |
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

Set defaults for all recorders with `hotkeyRecorder` in the `defaultOptions` of `provideHotkeys`. See [Set default options](./provide-hotkeys-and-scopes#set-default-options) and the [`injectHotkeyRecorder` reference](../reference/functions/injectHotkeyRecorder.md).

Try the [injectHotkeyRecorder example](../examples/injectHotkeyRecorder) or the [sequences recorder example](../examples/injectHotkeyRecorder-sequences).
