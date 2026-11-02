---
title: Multi-Key Sequences and Vim-Style Shortcuts in Lit
id: sequences
description: Register multi-key sequences in Lit, such as G then H, set the time allowed between steps, and show users which keys they've pressed so far.
---

> [!IMPORTANT]
> `@hotkeySequence`, `HotkeySequenceController`, and `HotkeySequenceRecorderController` were removed in `@tanstack/lit-hotkeys` v0.15.0. Pass a sequence to `@hotkey` or `HotkeyController` instead, and record one with `HotkeyRecorderController` and `maxSteps: Infinity`.

A sequence is a hotkey made of chords pressed one after another, such as `G` then `H` to go home. Vim-style navigation, two-step commands such as VS Code's `Ctrl+K` then `Ctrl+C`, and cheat codes are all sequences.

Sequences are ordinary hotkeys. You register them with `@hotkey` and `HotkeyController`, and options, targets, `enabled`, and `meta` work as they do in [Hotkeys](./hotkeys). This guide covers what is different about sequences.

## Register a sequence

Pass an array of chords to `@hotkey`:

```ts
import { LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { hotkey } from '@tanstack/lit-hotkeys'

@customElement('my-app')
class MyApp extends LitElement {
  @hotkey(['G', 'H']) // Press G, then H
  goHome() {
    navigateHome()
  }
}
```

Chords and sequences can sit side by side on the same element:

```ts
@hotkey('Mod+K')
openSearch() {}

@hotkey(['G', 'H'])
goHome() {}

@hotkey(['G', 'S'])
goToSettings() {}
```

The method's `context` has `kind: 'sequence'`, the registered `hotkey` array, and `parsedSequence`, with each step parsed. Type it as `HotkeySequenceCallbackContext`:

```ts
@hotkey(['Mod+K', 'Mod+C'])
commentLine(event: KeyboardEvent, context: HotkeySequenceCallbackContext) {
  console.log(context.hotkey) // ['Mod+K', 'Mod+C']
  console.log(context.parsedSequence.map((step) => step.key)) // ['K', 'C']
}
```

### Write sequence steps

Each step is a chord, written the same way as any other chord:

```ts
@hotkey(['G', 'H']) // The G key, then the H key, on any layout
goHome() {}

@hotkey(['[KeyG]', '[KeyH]']) // The G and H positions, whatever they type
goHomeByPosition() {}

@hotkey(['Mod+K', 'Mod+C']) // Command+K then Command+C on macOS, Control elsewhere
commentLine() {}

@hotkey(['G', 'Shift+G']) // Each step has its own modifiers
scrollToBottom() {}

@hotkey(['Shift+R', 'Shift+T']) // Shift can stay held between steps
runTests() {}

@hotkey([{ key: 'K', mod: true }, 'C']) // A step can be a chord object
openChat() {}
```

A one-step array, such as `['Escape']`, registers as the chord `'Escape'`. [Write a chord as a string or an object](./hotkeys#write-a-chord-as-a-string-or-an-object) covers chord syntax.

## Time between steps

Each step must follow the previous one within `timeout` milliseconds, 1000 by default. Set it for one sequence:

```ts
@hotkey(['D', 'D'], { timeout: 500 }) // A quick double press
deleteLine() {}

@hotkey(['G', 'G'], { timeout: 2000 }) // More time between steps
scrollToTop() {}
```

Lit has no provider for shared defaults, so pass `timeout` to each sequence, or share an options object. See [Share options](./hotkeys#share-options).

While the user works through a sequence:

- A key that doesn't continue the sequence starts it over. If that key is the sequence's first step, it begins a new attempt, so `G X G G` completes `['G', 'G']`.
- Holding a key doesn't count as pressing it again, so holding `G` doesn't complete `['G', 'G']`.
- Pressing a modifier alone, such as Shift, neither advances the sequence nor starts it over.

[Sequences allow 1 second between steps](../../../guides/sensible-defaults.md#sequences-allow-1-second-between-steps) explains the default.

## Options for sequences

Sequences take the same options as chords, listed in [Hotkey options](./hotkeys#hotkey-options), with these differences:

- `timeout` applies only to sequences, and `requireReset` only to chords. The decorator's option types reject each one on the other kind.
- Every step that advances a sequence calls `preventDefault`, so in `['Mod+K', 'Mod+C']`, the browser doesn't act on `Mod+K`. `stopPropagation` applies only on the last step, so earlier steps still reach other listeners, such as a focused widget.
- With the default `ignoreInputs: 'auto'`, the first step decides whether a sequence works while the user types in a text field. `['G', 'G']` doesn't, and `['Mod+K', 'Mod+C']` does.
- A sequence with a `target` advances only on key presses inside the target.
- With `capture: true`, every step is matched in the capture phase.

`enabled`, `scope`, and `meta` work as they do for chords. A disabled sequence ignores its steps.

## Sequences that share keys

### Sequences that start the same way

Sequences can share their first steps. Each one tracks its own progress, and the next key decides which one completes:

```ts
@hotkey(['D', 'D'])
deleteLine() {}

@hotkey(['D', 'W'])
deleteWord() {}

@hotkey(['D', 'I', 'W'])
deleteInnerWord() {}
```

Sharing first steps isn't a duplicate, so TanStack Hotkeys doesn't warn. Two sequences with all the same steps are duplicates. See [Handle duplicate hotkeys](./hotkeys#handle-duplicate-hotkeys).

### A sequence that starts a longer one

When one sequence is the start of another, such as `['G', 'G']` and `['G', 'G', 'G']`, the shorter one doesn't wait to see whether the user is typing the longer one. It runs as soon as its last key is pressed:

- The second G runs `['G', 'G']`.
- The third G runs `['G', 'G', 'G']`. The user gets both actions.
- A fourth G runs `['G', 'G']` again, because each sequence tracks its own progress.

TanStack Hotkeys doesn't warn about this. Choose sequences where neither one starts the other, such as `['G', 'G']` and `['G', 'B']`. [App hotkeys](./app-hotkeys) report these pairs as conflicts, and so does the [hotkey recorder](./custom-hotkey-recording) with `detectConflicts` on.

### Sequences and chords on the same key

A key that continues a sequence belongs to the sequence, so a chord on the same key doesn't run:

```ts
@hotkey('C') // C on its own
compose() {}

@hotkey(['G', 'C']) // G, then C. compose() doesn't run.
goToContacts() {}
```

A sequence's first step doesn't belong to it yet, because the user may not be starting the sequence:

```ts
@hotkey('G') // Runs on the first G
openGoMenu() {}

@hotkey(['G', 'G']) // Runs on the second G
scrollToTop() {}
```

A sequence that has timed out, is disabled, or skips the focused text field doesn't claim the key.

The [hotkey recorder](./custom-hotkey-recording) and [app hotkeys](./app-hotkeys) check conflicts more strictly. There, a hotkey conflicts with any sequence that starts with it, so `G` conflicts with `['G', 'H']`, and `['G', 'H']` conflicts with `['G', 'H', 'J']`.

## Show sequences in your UI

`formatForDisplay` formats each step and joins them with a space:

```ts
formatForDisplay(['Mod+K', 'Mod+C'], { platform: 'mac' }) // '⌘ K ⌘ C'
formatForDisplay(['G', 'H'], { sequenceSeparator: ' then ' }) // 'G then H'
```

[Formatting & Display](./formatting-display) covers labels and keycaps.

A sequence's first steps have no visible effect, so show users what they've pressed so far, as VS Code does after `Ctrl+K`. Registration views report each sequence's progress in `matchedStepCount`:

```ts
import { LitElement, html, nothing } from 'lit'
import { customElement } from 'lit/decorators.js'
import {
  HotkeyRegistrationsController,
  formatForDisplay,
} from '@tanstack/lit-hotkeys'
import type { HotkeySequenceRegistrationView } from '@tanstack/lit-hotkeys'

@customElement('pending-keys')
class PendingKeys extends LitElement {
  private registrations = new HotkeyRegistrationsController(this)

  render() {
    const longest = this.registrations.hotkeys
      .filter(
        (reg): reg is HotkeySequenceRegistrationView =>
          reg.kind === 'sequence' && reg.matchedStepCount > 0,
      )
      .sort((a, b) => b.matchedStepCount - a.matchedStepCount)[0]
    if (!longest) return nothing

    const pressed = longest.hotkey.slice(0, longest.matchedStepCount)

    return html`<p role="status">
      <kbd>${formatForDisplay(pressed)}</kbd> was pressed. Waiting for the next
      key.
    </p>`
  }
}
```

Progress clears when the sequence completes, when the user presses a key that doesn't continue it, and when the timeout passes, so the message goes away on its own. When several sequences are in progress, the one with the most matched steps shows the most of what the user pressed. [Cheat Sheet UI Helpers](./cheat-sheet-ui-helpers) covers listing hotkeys.

## Letter sequences need an off switch

A sequence made only of letter, number, or symbol keys, such as `G` then `H`, counts as a character key shortcut for accessibility, just like a single-key hotkey. Speech input can type it by accident. Let users turn such sequences off with `enabled`, or change them with [app hotkeys](./app-hotkeys). See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch).

## Common patterns

### Vim-style navigation

```ts
@customElement('vim-navigation')
class VimNavigation extends LitElement {
  @hotkey(['G', 'G'])
  scrollToTop() {}

  @hotkey(['G', 'Shift+G'])
  scrollToBottom() {}

  @hotkey(['D', 'D'])
  deleteLine() {}

  @hotkey(['D', 'W'])
  deleteWord() {}

  @hotkey(['C', 'I', 'W'])
  changeInnerWord() {}
}
```

### Konami code

```ts
@hotkey(
  [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'B', 'A',
  ],
  { timeout: 2000 },
)
enableEasterEgg() {}
```

To record a sequence the user presses, see [Custom Hotkey Recording](./custom-hotkey-recording). To match a sequence without the hotkey manager, see [Match a sequence on your own](./hotkey-manager#match-a-sequence-on-your-own).
