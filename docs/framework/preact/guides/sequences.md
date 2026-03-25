---
title: Sequences Guide
id: sequences
---

TanStack Hotkeys supports multi-key sequences -- shortcuts where you press keys one after another rather than simultaneously. This is commonly used for Vim-style navigation, cheat codes, or multi-step commands.

## Basic Usage

Use the `useHotkeySequence` hook to register a key sequence:

```tsx
import { useHotkeySequence } from '@tanstack/preact-hotkeys'

function App() {
  // Vim-style: press g then g to scroll to top
  useHotkeySequence(['G', 'G'], () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}
```

The first argument is an array of `Hotkey` strings representing each step in the sequence. The user must press them in order within the timeout window.

## Many sequences at once

When you need several sequences—or a **dynamic** list whose length is not fixed at compile time—use `useHotkeySequences` instead of calling `useHotkeySequence` many times. One hook call keeps you within the rules of hooks while still registering every sequence.

```tsx
import { useHotkeySequences } from '@tanstack/preact-hotkeys'

useHotkeySequences([
  { sequence: ['G', 'G'], callback: () => scrollToTop() },
  { sequence: ['D', 'D'], callback: () => deleteLine(), options: { timeout: 500 } },
])
```

Options merge in the same order as `useHotkeys`: `HotkeysProvider` defaults, then the second-argument `commonOptions`, then each definition’s `options`.

## Sequence Options

The third argument is an options object:

```tsx
useHotkeySequence(['G', 'G'], callback, {
  timeout: 1000,  // Time allowed between keys (ms)
  enabled: true,  // Whether the sequence is active
  target: document, // Or a Preact ref for scoped sequences
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

Disabled sequences **remain registered** and stay visible in devtools; only execution is suppressed.

```tsx
const [isVimMode, setIsVimMode] = useState(true)

useHotkeySequence(['G', 'G'], () => scrollToTop(), { enabled: isVimMode })
```

### `target`

The DOM element to attach the sequence listener to. Defaults to `document`. Can be a Preact ref, DOM element, `document`, or `window` for scoped sequences.

### Global Default Options via Provider

You can set default options for all `useHotkeySequence` calls by wrapping your component tree with `HotkeysProvider`. Per-hook options will override the provider defaults.

```tsx
import { HotkeysProvider } from '@tanstack/preact-hotkeys'

<HotkeysProvider
  defaultOptions={{
    hotkeySequence: { timeout: 1500 },
  }}
>
  <App />
</HotkeysProvider>
```

## Sequences with Modifiers

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

You can repeat the same modifier across consecutive steps—for example `Shift+R` then `Shift+T`:

```tsx
useHotkeySequence(['Shift+R', 'Shift+T'], () => {
  doNextAction()
})
```

### Modifier-only keys between steps

While a sequence is in progress, **modifier-only** keydown events (Shift, Control, Alt, or Meta pressed alone, with no letter or other key) are ignored. They do not advance the sequence and they do **not** reset progress. That way a user can tap Shift (or hold it) between chords such as `Shift+R` and `Shift+T` without breaking the sequence—similar to Vim-style flows where a modifier may be pressed before the next chord.

## Common Sequence Patterns

### Vim-Style Navigation

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

### Multi-Step Commands

```tsx
// Press "h", "e", "l", "p" to open help
useHotkeySequence(['H', 'E', 'L', 'P'], () => openHelp())
```

## How Sequences Work

The `SequenceManager` (singleton) handles all sequence registrations. When a key is pressed:

1. It checks if the key matches the next expected step in any registered sequence
2. If it matches, the sequence advances to the next step
3. If the timeout expires between steps, the sequence resets
4. When all steps are completed, the callback fires
5. Modifier-only keydowns are ignored (they neither advance nor reset the sequence)

### Overlapping Sequences

Multiple sequences can share the same prefix. The manager tracks progress for each sequence independently:

```tsx
// Both share the 'D' prefix
useHotkeySequence(['D', 'D'], () => deleteLine())   // dd
useHotkeySequence(['D', 'W'], () => deleteWord())    // dw
useHotkeySequence(['D', 'I', 'W'], () => deleteInnerWord()) // diw
```

After pressing `D`, the manager waits for the next key to determine which sequence to complete.

## The Sequence Manager

Under the hood, `useHotkeySequence` uses the singleton `SequenceManager`. You can also use the core `createSequenceMatcher` function for standalone sequence matching without the singleton:

```tsx
import { createSequenceMatcher } from '@tanstack/preact-hotkeys'

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
