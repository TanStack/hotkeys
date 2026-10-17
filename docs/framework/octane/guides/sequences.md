---
title: Multi-Key Sequences and Vim-Style Shortcuts in Octane
id: sequences
description: Register multi-key sequences in Octane, such as G then H, set the time allowed between steps, and show users which keys they've pressed so far.
---

> [!IMPORTANT]
> `useHotkeySequence`, `useHotkeySequences`, and `useHotkeySequenceRecorder` were removed in `@tanstack/octane-hotkeys` v0.4.0. Pass a sequence to `useHotkey` or `useHotkeys` instead, and record one with `useHotkeyRecorder` and `maxSteps: Infinity`.

A sequence is a hotkey made of chords pressed one after another, such as `G` then `H` to go home. Vim-style navigation, two-step commands such as VS Code's `Ctrl+K` then `Ctrl+C`, and cheat codes are all sequences.

Sequences are ordinary hotkeys. You register them with `useHotkey` and `useHotkeys`, and options, targets, `enabled`, and `meta` work as they do in [Hotkeys](./hotkeys). This guide covers what is different about sequences.

## Register a sequence

Pass an array of chords to `useHotkey`:

```tsx
import { useHotkey } from '@tanstack/octane-hotkeys'

function App() @{
  // Press G, then H
  useHotkey(['G', 'H'], () => goHome())

  <main>...</main>
}
```

`useHotkeys` registers chords and sequences in the same array:

```tsx
useHotkeys([
  { hotkey: 'Mod+K', callback: () => openSearch() },
  { hotkey: ['G', 'H'], callback: () => goHome() },
  { hotkey: ['G', 'S'], callback: () => goToSettings() },
])
```

The callback's `context` has `kind: 'sequence'`, the registered `hotkey` array, and `parsedSequence`, with each step parsed:

```tsx
useHotkey(['Mod+K', 'Mod+C'], (event, context) => {
  console.log(context.hotkey) // ['Mod+K', 'Mod+C']
  console.log(context.parsedSequence.map((step) => step.key)) // ['K', 'C']
})
```

### Write sequence steps

Each step is a chord, written the same way as any other chord:

```tsx
useHotkey(['G', 'H'], () => goHome()) // The G key, then the H key, on any layout
useHotkey(['[KeyG]', '[KeyH]'], () => goHome()) // The G and H positions, whatever they type
useHotkey(['Mod+K', 'Mod+C'], () => commentLine()) // Command+K then Command+C on macOS, Control elsewhere
useHotkey(['G', 'Shift+G'], () => scrollToBottom()) // Each step has its own modifiers
useHotkey(['Shift+R', 'Shift+T'], () => runTests()) // Shift can stay held between steps
useHotkey([{ key: 'K', mod: true }, 'C'], () => openChat()) // A step can be a chord object
```

A one-step array, such as `['Escape']`, registers as the chord `'Escape'`. [Write a chord as a string or an object](./hotkeys#write-a-chord-as-a-string-or-an-object) covers chord syntax.

## Time between steps

Each step must follow the previous one within `timeout` milliseconds, 1000 by default. Set it for one sequence:

```tsx
useHotkey(['D', 'D'], () => deleteLine(), { timeout: 500 }) // A quick double press
useHotkey(['G', 'G'], () => scrollToTop(), { timeout: 2000 }) // More time between steps
```

To change it for every sequence, set it in `HotkeysProvider` default options: `defaultOptions={{ hotkey: { timeout: 1500 } }}`.

While the user works through a sequence:

- A key that doesn't continue the sequence starts it over. If that key is the sequence's first step, it begins a new attempt, so `G X G G` completes `['G', 'G']`.
- Holding a key doesn't count as pressing it again, so holding `G` doesn't complete `['G', 'G']`.
- Pressing a modifier alone, such as Shift, neither advances the sequence nor starts it over.

[Sequences allow 1 second between steps](../../../guides/sensible-defaults.md#sequences-allow-1-second-between-steps) explains the default.

## Options for sequences

Sequences take the same options as chords, listed in [Hotkey options](./hotkeys#hotkey-options), with these differences:

- `timeout` applies only to sequences, and `requireReset` only to chords. TypeScript rejects each one on the other kind.
- Every step that advances a sequence calls `preventDefault`, so in `['Mod+K', 'Mod+C']`, the browser doesn't act on `Mod+K`. `stopPropagation` applies only on the last step, so earlier steps still reach other listeners, such as a focused widget.
- With the default `ignoreInputs: 'auto'`, the first step decides whether a sequence works while the user types in a text field. `['G', 'G']` doesn't, and `['Mod+K', 'Mod+C']` does.
- A sequence with a `target` advances only on key presses inside the target.
- With `capture: true`, every step is matched in the capture phase.

`enabled`, `scope`, and `meta` work as they do for chords. A disabled sequence ignores its steps.

## Sequences that share keys

### Sequences that start the same way

Sequences can share their first steps. Each one tracks its own progress, and the next key decides which one completes:

```tsx
useHotkeys([
  { hotkey: ['D', 'D'], callback: () => deleteLine() },
  { hotkey: ['D', 'W'], callback: () => deleteWord() },
  { hotkey: ['D', 'I', 'W'], callback: () => deleteInnerWord() },
])
```

Sharing first steps isn't a duplicate, so TanStack Hotkeys doesn't warn. Two sequences with all the same steps are duplicates. See [Handle duplicate hotkeys](./hotkeys#handle-duplicate-hotkeys).

### Sequences and chords on the same key

A key that continues a sequence belongs to the sequence, so a chord on the same key doesn't run:

```tsx
useHotkeys([
  { hotkey: 'C', callback: () => compose() }, // C on its own
  { hotkey: ['G', 'C'], callback: () => goToContacts() }, // G, then C. compose() doesn't run.
])
```

A sequence's first step doesn't belong to it yet, because the user may not be starting the sequence:

```tsx
useHotkeys([
  { hotkey: 'G', callback: () => openGoMenu() }, // Runs on the first G
  { hotkey: ['G', 'G'], callback: () => scrollToTop() }, // Runs on the second G
])
```

A sequence that has timed out, is disabled, or skips the focused text field doesn't claim the key.

The [hotkey recorder](./custom-hotkey-recording) and [app hotkeys](./app-hotkeys) check conflicts more strictly. There, a hotkey conflicts with any sequence that starts with it, so `G` conflicts with `['G', 'H']`, and `['G', 'H']` conflicts with `['G', 'H', 'J']`.

## Show sequences in your UI

`formatForDisplay` formats each step and joins them with a space:

```tsx
formatForDisplay(['Mod+K', 'Mod+C'], { platform: 'mac' }) // '⌘ K ⌘ C'
formatForDisplay(['G', 'H'], { sequenceSeparator: ' then ' }) // 'G then H'
```

[Formatting & Display](./formatting-display) covers labels and keycaps.

A sequence's first steps have no visible effect, so show users what they've pressed so far, as VS Code does after `Ctrl+K`. Registration views report each sequence's progress in `matchedStepCount`:

```tsx
import {
  formatForDisplay,
  useHotkeyRegistrations,
} from '@tanstack/octane-hotkeys'
import type { HotkeySequenceRegistrationView } from '@tanstack/octane-hotkeys'

function PendingKeys() @{
  const registrations = useHotkeyRegistrations()
  const longest = registrations.hotkeys
    .filter(
      (reg): reg is HotkeySequenceRegistrationView =>
        reg.kind === 'sequence' && reg.matchedStepCount > 0,
    )
    .sort((a, b) => b.matchedStepCount - a.matchedStepCount)[0]

  @if (longest) {
    <p role="status">
      <kbd>{formatForDisplay(longest.hotkey.slice(0, longest.matchedStepCount))}</kbd>{' '}
      was pressed. Waiting for the next key.
    </p>
  }
}
```

Progress clears when the sequence completes, when the user presses a key that doesn't continue it, and when the timeout passes, so the message goes away on its own. When several sequences are in progress, the one with the most matched steps shows the most of what the user pressed. [Cheat Sheet UI Helpers](./cheat-sheet-ui-helpers) covers listing hotkeys.

## Letter sequences need an off switch

A sequence made only of letter, number, or symbol keys, such as `G` then `H`, counts as a character key shortcut for accessibility, just like a single-key hotkey. Speech input can type it by accident. Let users turn such sequences off with `enabled`, or change them with [app hotkeys](./app-hotkeys). See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch).

## Common patterns

### Vim-style navigation

```tsx
useHotkeys([
  { hotkey: ['G', 'G'], callback: () => scrollToTop() },
  { hotkey: ['G', 'Shift+G'], callback: () => scrollToBottom() },
  { hotkey: ['D', 'D'], callback: () => deleteLine() },
  { hotkey: ['D', 'W'], callback: () => deleteWord() },
  { hotkey: ['C', 'I', 'W'], callback: () => changeInnerWord() },
])
```

### Konami code

```tsx
useHotkey(
  [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'B', 'A',
  ],
  () => enableEasterEgg(),
  { timeout: 2000 },
)
```

To record a sequence the user presses, see [Custom Hotkey Recording](./custom-hotkey-recording). To match a sequence without the hotkey manager, see [Match a sequence on your own](./hotkey-manager#match-a-sequence-on-your-own).
