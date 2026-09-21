---
title: Sequences Guide
id: sequences
---

TanStack Hotkeys supports multi-key sequences, shortcuts where you press keys one after another rather than together. Think Vim-style navigation, cheat codes, or multi-step commands.

Sequence steps use the same string syntax as single hotkeys. For example, `['[KeyG]', '[KeyG]']` follows a physical position, while `['G', 'G']` follows the logical letter. A sequence can mix forms, such as `['Mod+[KeyK]', 'C']`. Display steps with `sequence.map((step) => formatForDisplay(step)).join(' → ')`.

## Basic usage

Use the `useHotkeySequence` hook to register a key sequence:

```tsx
import { useHotkeySequence } from '@tanstack/react-hotkeys'

function App() {
  // Vim-style: press g then g to scroll to top
  useHotkeySequence(['G', 'G'], () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}
```

The first argument is an array of `Hotkey` strings representing each step in the sequence. The user must press them in order within the timeout window.

## Many sequences at once

When you need several sequences, or a dynamic list whose length isn't fixed at compile time, use `useHotkeySequences` instead of calling `useHotkeySequence` many times. One hook call keeps you within the rules of hooks while still registering every sequence.

```tsx
import { useHotkeySequences } from '@tanstack/react-hotkeys'

useHotkeySequences([
  { sequence: ['G', 'G'], callback: () => scrollToTop() },
  { sequence: ['D', 'D'], callback: () => deleteLine(), options: { timeout: 500 } },
])
```

Options merge in the same order as `useHotkeys`: `HotkeysProvider` defaults, then the second-argument `commonOptions`, then each definition's `options`.

## Sequence options

The third argument is an options object:

```tsx
useHotkeySequence(['G', 'G'], callback, {
  timeout: 1000,  // Time allowed between keys (ms)
  enabled: true,  // Whether the sequence is active
})
```

### `timeout`

The maximum time (in milliseconds) allowed between consecutive key presses. If the user takes longer than this between any two keys, the sequence resets. Defaults to `1000` (1 second).

```tsx
// Fast sequence - user must type quickly
useHotkeySequence(['D', 'D'], () => deleteLine(), { timeout: 500 })

// Slow sequence - user has more time between keys
useHotkeySequence(['Shift+Z', 'Shift+Z'], () => forceQuit(), { timeout: 2000 })
```

### `enabled`

Controls whether the sequence is active. Defaults to `true`.

Disabled sequences stay registered and visible in devtools; only execution is suppressed.

```tsx
const [isVimMode, setIsVimMode] = useState(true)

useHotkeySequence(['G', 'G'], () => scrollToTop(), { enabled: isVimMode })
```

### Global defaults via provider

You can set default options for all `useHotkeySequence` calls by wrapping your component tree with `HotkeysProvider`. Per-hook options override the provider defaults.

```tsx
import { HotkeysProvider } from '@tanstack/react-hotkeys'

<HotkeysProvider
  defaultOptions={{
    hotkeySequence: { timeout: 1500 },
  }}
>
  <App />
</HotkeysProvider>
```

### `meta`

Sequences support the same `meta` option as hotkeys. Attach a `name` and `description` for use in shortcut palettes and devtools.

```tsx
useHotkeySequence(['G', 'G'], () => scrollToTop(), {
  meta: { name: 'Go to Top', description: 'Scroll to the top of the page' },
})
```

See the [Hotkeys Guide](./hotkeys.md#metadata-name--description) for details on declaration merging and introspecting registrations.

## Sequences with modifiers

Each step in a sequence can include modifiers:

```tsx
// Ctrl+K followed by Ctrl+C (VS Code-style comment)
useHotkeySequence(['Mod+K', 'Mod+C'], () => {
  commentSelection()
})

// g then Shift+G (go to bottom, Vim-style)
useHotkeySequence(['G', 'Shift+G'], () => {
  scrollToBottom()
})
```

## Chained modifier chords

This example follows physical R and T positions. Brackets retain those positions even when the keys produce different letters. Other sequences can continue using logical characters.

You can repeat the same modifier across consecutive steps, for example `Shift+R` then `Shift+T`:

```tsx
useHotkeySequence(['Shift+[KeyR]', 'Shift+[KeyT]'], () => {
  doNextAction()
})
```

### Modifier-only keys between steps

While a sequence is in progress, modifier-only keydown events (Shift, Control, Alt, or Meta pressed alone, with no other key) are ignored. They neither advance the sequence nor reset progress. A user can tap Shift, or hold it, between chords like `Shift+R` and `Shift+T` without breaking the sequence, matching Vim-style flows where a modifier goes down before the next chord.

## Common sequence patterns

### Vim-style navigation

```tsx
function VimNavigation() {
  useHotkeySequence(['G', 'G'], () => scrollToTop())
  useHotkeySequence(['G', 'Shift+G'], () => scrollToBottom())
  useHotkeySequence(['D', 'D'], () => deleteLine())
  useHotkeySequence(['D', 'W'], () => deleteWord())
  useHotkeySequence(['C', 'I', 'W'], () => changeInnerWord())
}
```

### Konami Code

```tsx
useHotkeySequence(
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

### Multi-step commands

```tsx
// Press "h", "e", "l", "p" to open help
useHotkeySequence(['H', 'E', 'L', 'P'], () => openHelp())
```

## How sequences work

Both `SequenceManager` and `createSequenceMatcher` ignore modifier-only events, IME composition, and automatic keydown repeats. These events neither advance the sequence nor refresh its timeout: holding G does not complete a two-press G sequence. The manager prefers exact matches over weaker logical-key fallbacks while preserving equally strong matches.

The `SequenceManager` (singleton) handles all sequence registrations. When a key is pressed:

1. It checks if the key matches the next expected step in any registered sequence
2. If it matches, the sequence advances to the next step
3. If the timeout expires between steps, the sequence resets
4. When all steps are completed, the callback fires
5. Modifier-only keydowns are ignored (they neither advance nor reset the sequence)

### Overlapping sequences

Multiple sequences can share the same prefix. The manager tracks progress for each sequence independently:

```tsx
// Both share the 'D' prefix
useHotkeySequence(['D', 'D'], () => deleteLine())   // dd
useHotkeySequence(['D', 'W'], () => deleteWord())    // dw
useHotkeySequence(['D', 'I', 'W'], () => deleteInnerWord()) // diw
```

After pressing `D`, the manager waits for the next key to determine which sequence to complete.

### Conflicting registrations

For the same target, duplicate detection compares resolved steps: modifier aliases, modifier order, and logical key casing do not create separate bindings. `conflictBehavior` applies to equivalent sequences without rewriting their stored strings. Physical and logical identities remain distinct, and a shared prefix alone is not a duplicate registration. Recorder conflict detection also checks prefixes and observed physical/logical overlap.

## The sequence manager

Under the hood, `useHotkeySequence` uses the singleton `SequenceManager`. For standalone sequence matching without the singleton, use the core `createSequenceMatcher` function:

```tsx
import { createSequenceMatcher } from '@tanstack/react-hotkeys'

const matcher = createSequenceMatcher(['G', 'G'], {
  timeout: 1000,
})

document.addEventListener('keydown', (e) => {
  if (matcher.match(e)) {
    console.log('Sequence completed!')
  }
  console.log('Progress:', matcher.getProgress()) // e.g., 1/2
})
```
