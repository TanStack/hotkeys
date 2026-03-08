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

## Sequence Options

```ts
injectHotkeySequence(['G', 'G'], callback, {
  timeout: 1000,
  enabled: true,
})
```

### Reactive `enabled`

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
