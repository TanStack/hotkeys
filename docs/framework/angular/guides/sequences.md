---
title: Sequences Guide
id: sequences
---

TanStack Hotkeys supports multi-key sequences in Angular, where keys are pressed one after another rather than simultaneously.

## Basic Usage

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

Options merge like `injectHotkeys`: `provideHotkeys` defaults, then `commonOptions`, then each definition’s `options`.

## Sequence Options

```ts
injectHotkeySequence(['G', 'G'], callback, {
  timeout: 1000,
  enabled: true,
})
```

### Reactive `enabled`

When disabled, the sequence **stays registered** (visible in devtools); only execution is suppressed.

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

## Global Default Options via Provider

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

## Chained modifier chords

You can repeat the same modifier across consecutive steps:

```ts
injectHotkeySequence(['Shift+R', 'Shift+T'], () => doNextAction())
```

While a sequence is in progress, **modifier-only** keydown events (Shift, Control, Alt, or Meta pressed alone) are ignored: they do not advance the sequence and do not reset progress, so a user can press Shift alone between chords without breaking the sequence.

## Common Patterns

### Vim-Style Navigation

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

## Under the Hood

`injectHotkeySequence` uses the singleton `SequenceManager`. You can also access it directly:

```ts
import {
  createSequenceMatcher,
  getSequenceManager,
} from '@tanstack/angular-hotkeys'

const manager = getSequenceManager()
const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 })
```
