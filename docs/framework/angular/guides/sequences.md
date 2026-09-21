---
title: Sequences Guide
id: sequences
---

TanStack Hotkeys supports multi-key sequences in Angular, where keys are pressed one after another rather than simultaneously.

Sequence steps use the same string syntax as single hotkeys. For example, `['[KeyG]', '[KeyG]']` follows a physical position, while `['G', 'G']` follows the logical letter. A sequence can mix forms, such as `['Mod+[KeyK]', 'C']`. Display steps with `sequence.map((step) => formatForDisplay(step)).join(' → ')`.

## Basic usage

```ts
import { Component } from '@angular/core'
import { injectHotkeySequence } from '@tanstack/angular-hotkeys'

@Component({ standalone: true, template: `` })
export class AppComponent {
  constructor() {
    injectHotkeySequence(['G', 'G'], () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }
}
```

## Many sequences at once

Use `injectHotkeySequences` when you want several sequences (or a list built from data) in one injection context, instead of many `injectHotkeySequence` calls.

```ts
import { Component } from '@angular/core'
import { injectHotkeySequences } from '@tanstack/angular-hotkeys'

@Component({ standalone: true, template: `` })
export class AppComponent {
  constructor() {
    injectHotkeySequences([
      {
        sequence: ['G', 'G'],
        callback: () =>
          window.scrollTo({ top: 0, behavior: 'smooth' }),
      },
      {
        sequence: ['D', 'D'],
        callback: () => console.log('delete line'),
        options: { timeout: 500 },
      },
    ])
  }
}
```

Options merge like `injectHotkeys`: `provideHotkeys` defaults, then `commonOptions`, then each definition's `options`.

## Matching steps

Both `SequenceManager` and `createSequenceMatcher` ignore modifier-only events, IME composition, and automatic keydown repeats. These events neither advance the sequence nor refresh its timeout: holding G does not complete a two-press G sequence. The manager prefers exact matches over weaker logical-key fallbacks while preserving equally strong matches.

## Sequence options

```ts
injectHotkeySequence(['G', 'G'], callback, {
  timeout: 1000,
  enabled: true,
})
```

### Reactive `enabled`

When disabled, the sequence stays registered (visible in devtools); only execution is suppressed.

```ts
import { Component, signal } from '@angular/core'
import { injectHotkeySequence } from '@tanstack/angular-hotkeys'

@Component({ standalone: true, template: `` })
export class VimModeComponent {
  readonly isVimMode = signal(true)

  constructor() {
    injectHotkeySequence(['G', 'G'], () => scrollToTop(), () => ({
      enabled: this.isVimMode(),
    }))
  }
}
```

## Global defaults via provider

```ts
import { ApplicationConfig } from '@angular/core'
import { provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [
    provideHotkeys({
      hotkeySequence: { timeout: 1500 },
    }),
  ],
}
```

### `meta`

Sequences support the same `meta` option as hotkeys. Attach a `name` and `description` to surface in shortcut palettes and devtools.

```ts
injectHotkeySequence(['G', 'G'], () => scrollToTop(), {
  meta: { name: 'Go to Top', description: 'Scroll to the top of the page' },
})
```

See the [Hotkeys Guide](./hotkeys.md#metadata-name--description) for details on declaration merging and introspecting registrations.

## Chained modifier chords

This example follows physical R and T positions. Brackets retain those positions even when the keys produce different letters. Other sequences can continue using logical characters.

You can repeat the same modifier across consecutive steps:

```ts
injectHotkeySequence(['Shift+[KeyR]', 'Shift+[KeyT]'], () => doNextAction())
```

While a sequence is in progress, the matcher ignores modifier-only keydown events (Shift, Control, Alt, or Meta pressed alone): they do not advance the sequence and do not reset progress, so a user can press Shift alone between chords without breaking the sequence.

## Common patterns

### Vim-style navigation

```ts
injectHotkeySequence(['G', 'G'], () => scrollToTop())
injectHotkeySequence(['G', 'Shift+G'], () => scrollToBottom())
injectHotkeySequence(['D', 'D'], () => deleteLine())
injectHotkeySequence(['D', 'W'], () => deleteWord())
injectHotkeySequence(['C', 'I', 'W'], () => changeInnerWord())
```

### Konami Code

```ts
injectHotkeySequence(
  ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'B', 'A'],
  () => enableEasterEgg(),
  { timeout: 2000 },
)
```

## Under the hood

`injectHotkeySequence` uses the singleton `SequenceManager`. You can also access it directly:

```ts
import {
  createSequenceMatcher,
  getSequenceManager,
} from '@tanstack/angular-hotkeys'

const manager = getSequenceManager()
const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 })
```

### Conflicting registrations

For the same target, duplicate detection compares resolved steps: modifier aliases, modifier order, and logical key casing do not create separate bindings. `conflictBehavior` applies to equivalent sequences without rewriting their stored strings. Physical and logical identities remain distinct, and a shared prefix alone is not a duplicate registration. Recorder conflict detection also checks prefixes and observed physical/logical overlap.
