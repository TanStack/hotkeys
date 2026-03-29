---
title: Sequences Guide
id: sequences
---

TanStack Hotkeys supports multi-key sequences -- shortcuts where you press keys one after another rather than simultaneously. This is commonly used for Vim-style navigation, cheat codes, or multi-step commands.

In Lit, registration is **declarative** via the `@hotkeySequence` decorator, or **imperative** via `HotkeySequenceController` when the sequence or options are built at runtime. Both use the same singleton `SequenceManager`.

## Basic Usage

### The `@hotkeySequence` decorator

Decorate a method to run when the user completes the key sequence:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { hotkeySequence } from '@tanstack/lit-hotkeys'

@customElement('vim-view')
class VimView extends LitElement {
  @hotkeySequence(['G', 'G'])
  scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  render() {
    return html`<div>Press g then g to scroll to top</div>`
  }
}
```

The first argument is an array of `Hotkey` strings representing each step in the sequence. The user must press them in order within the timeout window.

The method receives the `KeyboardEvent` and [`HotkeyCallbackContext`](../../../reference/interfaces/HotkeyCallbackContext.md) like `@hotkey`:

```ts
import type { HotkeyCallbackContext } from '@tanstack/lit-hotkeys'

@hotkeySequence(['G', 'G'])
scrollTop(event: KeyboardEvent, context: HotkeyCallbackContext) {
  console.log(context.hotkey)
}
```

### `HotkeySequenceController`

Use the controller when the sequence or callback cannot be expressed as a static decorator (e.g. data-driven shortcuts):

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HotkeySequenceController } from '@tanstack/lit-hotkeys'

@customElement('vim-view')
class VimView extends LitElement {
  private scrollTopSeq = new HotkeySequenceController(
    this,
    ['G', 'G'],
    () => this.scrollTop(),
  )

  constructor() {
    super()
    this.addController(this.scrollTopSeq)
  }

  private scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  render() {
    return html`<div>Press g then g to scroll to top</div>`
  }
}
```

## Many sequences at once

Register several sequences on the same element by applying **multiple** `@hotkeySequence` decorators (one per method), or by adding **multiple** `HotkeySequenceController` instances with `addController`. There is no Lit equivalent to React’s `useHotkeySequences` hook; several decorators on one class are the idiomatic pattern.

```ts
@customElement('vim-navigation')
class VimNavigation extends LitElement {
  @hotkeySequence(['G', 'G'])
  goTop() {
    scrollToTop()
  }

  @hotkeySequence(['G', 'Shift+G'])
  goBottom() {
    scrollToBottom()
  }

  @hotkeySequence(['D', 'D'], { timeout: 500 })
  deleteLine() {
    deleteCurrentLine()
  }

  render() {
    return html`<div></div>`
  }
}
```

## Sequence Options

Pass options as the **second** argument to `@hotkeySequence` (or to `HotkeySequenceController`):

```ts
@hotkeySequence(['G', 'G'], {
  timeout: 1000, // Time allowed between keys (ms)
  enabled: true, // Whether the sequence is active at connect time
})
scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
```

### `timeout`

The maximum time (in milliseconds) allowed between consecutive key presses. If the user takes longer than this between any two keys, the sequence resets. Defaults to `1000` (1 second).

```ts
@hotkeySequence(['D', 'D'], { timeout: 500 })
deleteLine() {
  deleteCurrentLine()
}

@hotkeySequence(['Shift+Z', 'Shift+Z'], { timeout: 2000 })
forceQuit() {
  quitWithoutSaving()
}
```

### `enabled`

Controls whether the sequence is registered when the element connects. Defaults to `true`. If `enabled` is `false` at connection time, registration is skipped. To turn sequences on or off later, reconnect the element, or create a new `HotkeySequenceController` when your state changes.

```ts
@hotkeySequence(['G', 'G'], { enabled: true })
scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
```

### Default options

When you omit options, the library uses the same defaults as the core [`SequenceOptions`](../../../reference/interfaces/SequenceOptions.md): `timeout: 1000`, `preventDefault` / `stopPropagation` enabled, smart `ignoreInputs`, and platform auto-detection. If you omit `target`, the Lit adapter resolves it to `document` when the controller connects in the browser.

### `meta`

Sequences support the same `meta` option as hotkeys, allowing you to attach a `name` and `description` for use in shortcut palettes and devtools.

```ts
@hotkeySequence(['G', 'G'], { meta: { name: 'Go to Top', description: 'Scroll to the top of the page' } })
scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }

// Or with HotkeySequenceController:
new HotkeySequenceController(this, ['G', 'G'], () => this.scrollTop(), {
  meta: { name: 'Go to Top', description: 'Scroll to the top of the page' },
})
```

See the [Hotkeys Guide](./hotkeys.md#metadata-name--description) for details on declaration merging and introspecting registrations.

## Sequences with Modifiers

Each step in a sequence can include modifiers:

```ts
@hotkeySequence(['Mod+K', 'Mod+C'])
commentSelection() {
  commentSelection()
}

@hotkeySequence(['G', 'Shift+G'])
scrollBottom() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
}
```

## Chained modifier chords

You can repeat the same modifier across consecutive steps — for example `Shift+R` then `Shift+T`:

```ts
@hotkeySequence(['Shift+R', 'Shift+T'])
chordSequence() {
  runAfterChords()
}
```

### Modifier-only keys between steps

While a sequence is in progress, **modifier-only** keydown events (Shift, Control, Alt, or Meta pressed alone, with no letter or other key) are ignored. They do not advance the sequence and they do **not** reset progress. That way a user can tap Shift (or hold it) between chords such as `Shift+R` and `Shift+T` without breaking the sequence — similar to Vim-style flows where a modifier may be pressed before the next chord.

## Common Sequence Patterns

### Vim-style navigation

```ts
@customElement('vim-navigation')
class VimNavigation extends LitElement {
  @hotkeySequence(['G', 'G'])
  goTop() {
    scrollToTop()
  }

  @hotkeySequence(['G', 'Shift+G'])
  goBottom() {
    scrollToBottom()
  }

  @hotkeySequence(['D', 'D'])
  deleteLine() {
    deleteCurrentLine()
  }

  @hotkeySequence(['D', 'W'])
  deleteWord() {
    deleteCurrentWord()
  }

  @hotkeySequence(['C', 'I', 'W'])
  changeInnerWord() {
    changeInnerWordImpl()
  }

  render() {
    return html`<div></div>`
  }
}
```

### Konami code

```ts
@hotkeySequence(
  [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'B',
    'A',
  ],
  { timeout: 2000 },
)
enableEasterEgg() {
  showEasterEgg()
}
```

### Multi-step commands

```ts
@hotkeySequence(['H', 'E', 'L', 'P'])
openHelp() {
  showHelp()
}
```

## How sequences work

The `SequenceManager` (singleton) handles all sequence registrations. When a key is pressed:

1. It checks if the key matches the next expected step in any registered sequence
2. If it matches, the sequence advances to the next step
3. If the timeout expires between steps, the sequence resets
4. When all steps are completed, the callback fires
5. Modifier-only keydowns are ignored (they neither advance nor reset the sequence)

### Overlapping sequences

Multiple sequences can share the same prefix. The manager tracks progress for each sequence independently:

```ts
@hotkeySequence(['D', 'D'])
dd() {
  deleteLine()
}

@hotkeySequence(['D', 'W'])
dw() {
  deleteWord()
}

@hotkeySequence(['D', 'I', 'W'])
diw() {
  deleteInnerWord()
}
```

After pressing `D`, the manager waits for the next key to determine which sequence to complete.

## The sequence manager

Under the hood, `@hotkeySequence` and `HotkeySequenceController` use the singleton `SequenceManager`. You can also use the core `createSequenceMatcher` function for standalone sequence matching without the singleton:

```ts
import { createSequenceMatcher } from '@tanstack/lit-hotkeys'

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
