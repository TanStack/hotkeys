---
title: Sequences Guide
id: sequences
---

> [!IMPORTANT]
> `scope.createHotkeySequence`, `scope.createHotkeySequences`, and `scope.createHotkeySequenceRecorder` were removed in `@tanstack/alpine-hotkeys` v0.3.0. Pass a sequence to `scope.createHotkey` or `scope.createHotkeys` instead, and record one with `scope.createHotkeyRecorder` and `maxSteps`.

A sequence is a hotkey made of chords pressed one after another rather than together. Think Vim-style navigation, cheat codes, or multi-step commands. Sequences are ordinary hotkeys: register them with `scope.createHotkey` and `scope.createHotkeys`, list them with `scope.createHotkeyRegistrations`, record them with `scope.createHotkeyRecorder`, and format them with `formatForDisplay`.

Sequence steps use the same syntax as chords. For example, `['[KeyG]', '[KeyG]']` follows a physical position, while `['G', 'G']` follows the logical letter. A sequence can mix forms, such as `['Mod+[KeyK]', 'C']`.

## Basic usage

Pass an array of chords wherever you pass a hotkey:

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'

class Editor {
  scope = createHotkeysScope()

  init() {
    // Vim-style: press g then g to scroll to top
    this.scope.createHotkey(['G', 'G'], () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  destroy() {
    this.scope.destroy()
  }
}

Alpine.data('editor', () => new Editor())
```

The user must press the steps in order, each within the timeout window. A one-step array such as `['Escape']` is the chord `'Escape'`.

## Many sequences at once

`scope.createHotkeys` registers chords and sequences together, including dynamic lists:

```ts
this.scope.createHotkeys([
  { hotkey: ['G', 'G'], callback: () => this.scrollToTop() },
  { hotkey: ['D', 'D'], callback: () => this.deleteLine(), options: { timeout: 500 } },
  { hotkey: 'Mod+S', callback: () => this.save() },
])
```

## Sequence options

Sequences accept the same options as chords, except `requireReset`, plus `timeout`.

### `timeout`

The maximum time (in milliseconds) allowed between consecutive steps. If the user takes longer than this between any two steps, the sequence resets. Defaults to `1000` (1 second).

```ts
// Fast sequence - user must type quickly
this.scope.createHotkey(['D', 'D'], () => this.deleteLine(), { timeout: 500 })

// Slow sequence - user has more time between keys
this.scope.createHotkey(['Shift+Z', 'Shift+Z'], () => this.forceQuit(), { timeout: 2000 })
```

`timeout` is only accepted when the hotkey is a sequence. Set a default for every sequence with `createHotkeysScope`:

```ts
scope = createHotkeysScope({ hotkey: { timeout: 1500 } })
```

### `enabled` and `meta`

These work exactly as they do for chords. Disabled sequences stay registered and visible in devtools, and `meta` flows to registrations, devtools, and cheat sheets. See the [Hotkeys Guide](./hotkeys).

```ts
this.scope.createHotkey(['G', 'G'], () => this.scrollToTop(), () => ({
  enabled: this.vimMode,
  meta: { name: 'Go to top', description: 'Scroll to the top of the page' },
}))
```

## Capture phase

Sequences accept `capture: true` with the same [event propagation behavior as chords](./hotkeys.md#capture-phase). The default is `false`. Each step is matched in the selected phase, but `preventDefault` and `stopPropagation` apply only when the full sequence completes. Earlier steps still reach descendant widgets. Changing `capture` preserves partial progress and the existing timeout.

## Sequences with modifiers

Each step in a sequence can include modifiers, and consecutive steps can repeat the same modifier:

```ts
// Ctrl+K followed by Ctrl+C (VS Code-style comment)
this.scope.createHotkey(['Mod+K', 'Mod+C'], () => this.commentSelection())

// Physical R then T positions, both with Shift
this.scope.createHotkey(['Shift+[KeyR]', 'Shift+[KeyT]'], () => this.doNextAction())
```

Brackets retain physical positions even when the keys produce different letters. While a sequence is in progress, modifier-only keydown events (Shift, Control, Alt, or Meta pressed alone) are ignored. They neither advance the sequence nor reset progress, so a user can tap or hold Shift between `Shift+R` and `Shift+T`.

## Vim-style navigation

```ts
this.scope.createHotkeys([
  { hotkey: ['G', 'G'], callback: () => this.scrollToTop() },
  { hotkey: ['G', 'Shift+G'], callback: () => this.scrollToBottom() },
  { hotkey: ['D', 'D'], callback: () => this.deleteLine() },
  { hotkey: ['D', 'W'], callback: () => this.deleteWord() },
  { hotkey: ['C', 'I', 'W'], callback: () => this.changeInnerWord() },
])
```

## Displaying sequences

`formatForDisplay` formats each step and joins them with `sequenceSeparator`, a space by default:

```ts
formatForDisplay(['Mod+K', 'Mod+C'], { platform: 'mac' }) // '⌘ K ⌘ C'
formatForDisplay(['G', 'G'], { sequenceSeparator: ' then ' }) // 'G then G'
```

Registration views report each sequence's progress in `matchedStepCount`, so a help panel can show how far the user has typed. See the [Hotkeys Guide](./hotkeys).

## How sequences work

The `HotkeyManager` tracks progress for every sequence registration. When a key is pressed:

1. It checks whether the key matches the next expected step of each sequence
2. If it matches, that sequence advances
3. If the timeout expires between steps, the sequence resets
4. When all steps are completed, the callback fires

Modifier-only events, IME composition, and automatic keydown repeats neither advance a sequence nor refresh its timeout: holding G does not complete a two-press G sequence. Exact matches take priority over weaker logical-key fallbacks.

Multiple sequences can share a prefix, such as `['D', 'D']`, `['D', 'W']`, and `['D', 'I', 'W']`. Progress is tracked for each sequence independently, so after pressing `D` the manager waits for the next key to determine which sequence completes.

### Conflicting registrations

For the same target, duplicate detection compares resolved steps: modifier aliases, modifier order, and logical key casing do not create separate hotkeys. Physical and logical identities remain distinct, and a shared prefix alone is not a duplicate registration. Recorder conflict detection and app hotkey conflicts are stricter: there, a sequence also conflicts with a chord equal to its first step and with any sequence it starts.

## Standalone matching

For sequence matching without the singleton manager, use `createSequenceMatcher`:

```ts
import { createSequenceMatcher } from '@tanstack/alpine-hotkeys'

const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 })

document.addEventListener('keydown', (e) => {
  if (matcher.match(e)) {
    console.log('Sequence completed!')
  }
  console.log('Progress:', matcher.getProgress()) // e.g., 1
})
```
