---
title: Sequences Guide
id: sequences
---

TanStack Hotkeys supports multi-key sequences: shortcuts where you press keys one after another rather than simultaneously. Common uses are Vim-style navigation, cheat codes, and multi-step commands.

Sequence steps use the same string syntax as single hotkeys. For example, `['[KeyG]', '[KeyG]']` follows a physical position, while `['G', 'G']` follows the logical letter. A sequence can mix forms, such as `['Mod+[KeyK]', 'C']`. Display steps with `sequence.map((step) => formatForDisplay(step)).join(' → ')`.

## Basic usage

Use the `createHotkeySequence` primitive to register a key sequence:

```tsx
import { createHotkeySequence } from '@tanstack/solid-hotkeys'

function App() {
  // Vim-style: press g then g to scroll to top
  createHotkeySequence(['G', 'G'], () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}
```

The first argument is an array of `Hotkey` strings representing each step in the sequence. The user must press them in order within the timeout window.

## Many sequences at once

For several sequences or a dynamic list, use `createHotkeySequences` instead of many `createHotkeySequence` calls. Pass a plain array or an accessor that returns definitions.

```tsx
import { createHotkeySequences } from '@tanstack/solid-hotkeys'

createHotkeySequences([
  { sequence: ['G', 'G'], callback: () => scrollToTop() },
  { sequence: ['D', 'D'], callback: () => deleteLine(), options: { timeout: 500 } },
])
```

Options merge like `createHotkeys`: `HotkeysProvider` defaults, then `commonOptions`, then each definition's `options`. For element-scoped multi-sequence registration, use `createHotkeySequencesAttachment`.

## Reactive options

Solid's `createHotkeySequence` accepts accessor functions for reactive sequence and options:

```tsx
const [isVimMode, setIsVimMode] = createSignal(true)
const [sequence] = createSignal(['G', 'G'] as const)

createHotkeySequence(
  sequence,
  () => scrollToTop(),
  () => ({ enabled: isVimMode(), timeout: 1500 }),
)
```

## Sequence options

The third argument is an options object (or accessor returning options):

```tsx
createHotkeySequence(['G', 'G'], callback, {
  timeout: 1000,  // Time allowed between keys (ms)
  enabled: true,  // Whether the sequence is active
  target: document, // Or from an accessor for scoped sequences
})
```

### `timeout`

The maximum time (in milliseconds) allowed between consecutive key presses. Defaults to `1000` (1 second).

```tsx
createHotkeySequence(['D', 'D'], () => deleteLine(), { timeout: 500 })
createHotkeySequence(['Shift+Z', 'Shift+Z'], () => forceQuit(), { timeout: 2000 })
```

### `enabled`

Controls whether the sequence is active. Defaults to `true`. Use an accessor for reactive control.

Disabled sequences remain registered and stay visible in devtools; only execution is suppressed.

```tsx
const [isVimMode, setIsVimMode] = createSignal(true)

createHotkeySequence(['G', 'G'], () => scrollToTop(), () => ({
  enabled: isVimMode(),
}))
```

### `target`

The DOM element to attach the sequence listener to. Defaults to `document`. Can be from an accessor when the target becomes available after mount.

### Global defaults via provider

```tsx
import { HotkeysProvider } from '@tanstack/solid-hotkeys'

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
createHotkeySequence(['G', 'G'], () => scrollToTop(), {
  meta: { name: 'Go to Top', description: 'Scroll to the top of the page' },
})
```

See the [Hotkeys Guide](./hotkeys.md#metadata-name--description) for details on declaration merging and introspecting registrations.

## Sequences with modifiers

Each step in a sequence can include modifiers:

```tsx
createHotkeySequence(['Mod+K', 'Mod+C'], () => commentSelection())
createHotkeySequence(['G', 'Shift+G'], () => scrollToBottom())
```

## Chained modifier chords

This example follows physical R and T positions. Brackets retain those positions even when the keys produce different letters. Other sequences can continue using logical characters.

You can repeat the same modifier across consecutive steps, for example `Shift+R` then `Shift+T`:

```tsx
createHotkeySequence(['Shift+[KeyR]', 'Shift+[KeyT]'], () => {
  doNextAction()
})
```

### Modifier-only keys between steps

While a sequence is in progress, modifier-only keydown events (Shift, Control, Alt, or Meta pressed alone, with no letter or other key) are ignored. They neither advance the sequence nor reset progress, so a user can tap or hold Shift between chords without breaking the sequence.

## Common sequence patterns

### Vim-style navigation

```tsx
function VimNavigation() {
  createHotkeySequence(['G', 'G'], () => scrollToTop())
  createHotkeySequence(['G', 'Shift+G'], () => scrollToBottom())
  createHotkeySequence(['D', 'D'], () => deleteLine())
  createHotkeySequence(['D', 'W'], () => deleteWord())
  createHotkeySequence(['C', 'I', 'W'], () => changeInnerWord())
}
```

### Konami Code

```tsx
createHotkeySequence(
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
createHotkeySequence(['H', 'E', 'L', 'P'], () => openHelp())
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
createHotkeySequence(['D', 'D'], () => deleteLine())
createHotkeySequence(['D', 'W'], () => deleteWord())
createHotkeySequence(['D', 'I', 'W'], () => deleteInnerWord())
```

### Conflicting registrations

For the same target, duplicate detection compares resolved steps: modifier aliases, modifier order, and logical key casing do not create separate bindings. `conflictBehavior` applies to equivalent sequences without rewriting their stored strings. Physical and logical identities remain distinct, and a shared prefix alone is not a duplicate registration. Recorder conflict detection also checks prefixes and observed physical/logical overlap.

## The sequence manager

Under the hood, `createHotkeySequence` uses the singleton `SequenceManager`. You can also use the core `createSequenceMatcher` function for standalone sequence matching:

```tsx
import { createSequenceMatcher } from '@tanstack/solid-hotkeys'

const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 })

document.addEventListener('keydown', (e) => {
  if (matcher.match(e)) {
    console.log('Sequence completed!')
  }
  console.log('Progress:', matcher.getProgress())
})
```
