---
title: Multi-Key Sequences and Vim-Style Shortcuts in Octane
id: sequences
description: Register multi-key sequences in Octane, such as G then H, set the time allowed between steps, and show users which keys they've pressed so far.
---

A sequence is a hotkey made of chords pressed one after another, like `G` then `H` to go home, VS Code's `Ctrl+K` then `Ctrl+C`, or Vim commands.

`useHotkey` and `useHotkeys` accept sequences just like chords, with the same options, targets, `enabled`, and `meta`. This guide covers what's specific to sequences.

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

Mix chords and sequences freely in `useHotkeys`:

```tsx
useHotkeys([
  { hotkey: 'Mod+K', callback: () => openSearch() },
  { hotkey: ['G', 'H'], callback: () => goHome() },
  { hotkey: ['G', 'S'], callback: () => goToSettings() },
])
```

In the callback, `context.kind` is `'sequence'` and `context.parsedSequence` holds each parsed step:

```tsx
useHotkey(['Mod+K', 'Mod+C'], (event, context) => {
  console.log(context.hotkey) // ['Mod+K', 'Mod+C']
  console.log(context.parsedSequence.map((step) => step.key)) // ['K', 'C']
})
```

### Write sequence steps

Every step uses the same chord syntax: strings, physical codes, or `RawHotkeyChord` objects.

```tsx
useHotkey(['G', 'H'], () => goHome()) // G then H on any layout
useHotkey(['[KeyG]', '[KeyH]'], () => goHome()) // Physical G and H positions
useHotkey(['Mod+K', 'Mod+C'], () => commentLine()) // Command+K then Command+C on macOS
useHotkey(['G', 'Shift+G'], () => scrollToBottom()) // Separate modifiers per step
useHotkey(['Shift+R', 'Shift+T'], () => runTests()) // Modifiers can stay held between steps
useHotkey([{ key: 'K', mod: true }, 'C'], () => openChat()) // Mix objects and strings
```

A single-item array like `['Escape']` normalizes to a plain chord `'Escape'`. See [Write a chord as a string or an object](./hotkeys#write-a-chord-as-a-string-or-an-object).

## Time between steps

Each step must follow the previous one within `timeout` milliseconds (`1000` by default). Set `timeout` per sequence or globally via `HotkeysProvider`:

```tsx
useHotkey(['D', 'D'], () => deleteLine(), { timeout: 500 }) // Snappier double-tap
useHotkey(['G', 'G'], () => scrollToTop(), { timeout: 2000 }) // More forgiving gap
```

```tsx
<HotkeysProvider defaultOptions={{ hotkey: { timeout: 1500 } }}>
  <App />
</HotkeysProvider>
```

While the user types through a sequence:

- A wrong key resets progress, unless it matches the sequence's first step. If it does, it starts a new attempt immediately, so `G X G G` still triggers `['G', 'G']`.
- Holding a key down doesn't auto-repeat steps. Holding `G` won't trigger `['G', 'G']`.
- Standalone modifier presses (`Shift`), lock keys (`CapsLock`, `NumLock`), `Fn`, and dead keys don't interrupt progress unless they match a step in another sequence.

See [Sequences allow 1 second between steps](../../../guides/sensible-defaults.md#sequences-allow-1-second-between-steps) for details.

## Options for sequences

Most options from [Hotkey options](./hotkeys#hotkey-options) behave identically, with a few sequence-specific details:

- `timeout` applies only to sequences, and `requireReset` applies only to chords. TypeScript rejects each on the wrong kind.
- `preventDefault` runs on every step that advances the sequence, while `stopPropagation` runs only on the final step so earlier keys still reach other listeners.
- `ignoreInputs: 'auto'` checks the first step, so `['G', 'G']` is ignored in inputs while `['Mod+K', 'Mod+C']` still fires. A sequence that starts with a function key, such as `['F2', 'R']`, also works in a text field, and its later keys don't type into the field.
- With a `target`, only key presses inside that element advance the sequence.
- `capture: true` matches every step in the capture phase.

## Sequences that share keys

| Pattern | Example | Behavior |
| --- | --- | --- |
| Shared prefix | `['D', 'D']` and `['D', 'W']` | Both track progress independently until the next key decides (no warning) |
| Prefix of a longer sequence | `['G', 'G']` and `['G', 'G', 'G']` | Shorter fires immediately on step 2, and longer fires on step 3 |
| Chord and sequence on same key | `'G'` and `['G', 'G']` | First `G` fires the chord. Once a sequence is active, continuing keys belong to it |

### Sequences that start the same way

```tsx
useHotkeys([
  { hotkey: ['D', 'D'], callback: () => deleteLine() },
  { hotkey: ['D', 'W'], callback: () => deleteWord() },
  { hotkey: ['D', 'I', 'W'], callback: () => deleteInnerWord() },
])
```

Sharing leading steps is expected and never triggers a duplicate warning. Two sequences are duplicates only if all steps match. See [Handle duplicate hotkeys](./hotkeys#handle-duplicate-hotkeys).

### A sequence that starts a longer one

If one sequence is a strict prefix of another, such as `['G', 'G']` and `['G', 'G', 'G']`, the shorter sequence fires immediately on the second `G` without waiting to see if a third follows. The third `G` fires `['G', 'G', 'G']`, and a fourth fires `['G', 'G']` again.

Prefer non-overlapping sequences such as `['G', 'G']` and `['G', 'B']`. [App Hotkeys](./app-hotkeys) and [Hotkey Recording](./custom-hotkey-recording) (`detectConflicts`) treat prefix overlaps as conflicts.

### Sequences and chords on the same key

Once a sequence is underway, a key that continues it belongs to the sequence and blocks any standalone chord on that key:

```tsx
useHotkeys([
  { hotkey: 'C', callback: () => compose() }, // Standalone C
  { hotkey: ['G', 'C'], callback: () => goToContacts() }, // Pressing G then C won't trigger compose()
])
```

By contrast, the first step doesn't block a chord on the same key because the user might just want the single key:

```tsx
useHotkeys([
  { hotkey: 'G', callback: () => openGoMenu() }, // Runs on first G
  { hotkey: ['G', 'G'], callback: () => scrollToTop() }, // Runs on second G
])
```

Timed-out, disabled, or input-ignored sequences never claim keys. Note that [App Hotkeys](./app-hotkeys) and [Hotkey Recording](./custom-hotkey-recording) check conflicts more strictly and flag `G` versus `['G', 'H']` as colliding.

## Show sequences in your UI

`useFormatForDisplay` formats each step and joins them with spaces by default, customizable via `sequenceSeparator`:

```tsx
formatForDisplay(['Mod+K', 'Mod+C'], { platform: 'mac' }) // '⌘ K ⌘ C'
formatForDisplay(['G', 'H'], { sequenceSeparator: ' then ' }) // 'G then H'
```

See [Formatting & Display](./formatting-display) for keycaps and layout options.

Because the first key of a sequence has no immediate effect, showing pending keys in a status banner (like VS Code after `Ctrl+K`) makes sequences discoverable. Read `matchedStepCount` from `useHotkeyRegistrations`:

```tsx
import {
  useFormatForDisplay,
  useHotkeyRegistrations,
} from '@tanstack/octane-hotkeys'
import type { HotkeySequenceRegistrationView } from '@tanstack/octane-hotkeys'

function PendingKeys() @{
  const formatForDisplay = useFormatForDisplay()
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

`matchedStepCount` resets automatically on completion, mismatch, or timeout, so the status clears itself. See [Cheat Sheets](./cheat-sheet-ui-helpers) for displaying full shortcut lists.

## Letter sequences need an off switch

A sequence made only of letters, numbers, or symbols (like `['G', 'H']`) is treated as a character-key shortcut under accessibility guidelines. Give users a way to turn it off via `enabled` or remap it with [App Hotkeys](./app-hotkeys). See [Single-key shortcuts need an off switch](../../../guides/sensible-defaults.md#single-key-shortcuts-need-an-off-switch).

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

To let users record sequences in settings, see [Hotkey Recording](./custom-hotkey-recording). To match sequences outside the hotkey manager, see [Match a sequence on your own](./hotkey-manager#match-a-sequence-on-your-own).

## Migrating from v0.3 and earlier

> [!NOTE]
> `useHotkeySequence`, `useHotkeySequences`, and `useHotkeySequenceRecorder` were removed in `@tanstack/octane-hotkeys` v0.4.0. Pass sequence arrays directly to `useHotkey` or `useHotkeys`, and pass `maxSteps: Infinity` to `useHotkeyRecorder`.
