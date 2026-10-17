---
title: Show Keyboard Shortcut Hints While a Modifier Is Held in Lit
id: hotkey-hints
description: Reveal keyboard shortcut hints next to buttons in Lit while the user holds a modifier, with HotkeyHintController.
---

Some apps show each button's shortcut only while the user holds a modifier, so the hints are there when the user reaches for the keyboard, and out of the way otherwise. `HotkeyHintController` has a `value` that's `true` while the user holds modifiers that belong to a hotkey. It's an optional helper, and it doesn't register anything, so use it alongside `@hotkey` or `HotkeyController`.

## Show a hint next to a button

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import {
  HotkeyHintController,
  formatForDisplay,
  hotkey,
} from '@tanstack/lit-hotkeys'

const saveHotkey = 'Mod+S'

@customElement('save-button')
class SaveButton extends LitElement {
  private hint = new HotkeyHintController(this, saveHotkey)

  @hotkey(saveHotkey)
  save() {
    /* ... */
  }

  render() {
    return html`
      <button @click=${() => this.save()}>
        Save ${this.hint.value ? html`<kbd>${formatForDisplay(saveHotkey)}</kbd>` : ''}
      </button>
    `
  }
}
```

The controller requests an update only when the hint appears or disappears. While the user holds Command on macOS, or Control elsewhere, the button reads "Save ⌘ S" or "Save Ctrl+S". [Formatting & Display](./formatting-display) covers labels and keycaps.

## When a hint shows

- Holding any of the hotkey's modifiers shows the hint. For `Alt+Shift+[KeyK]`, holding Alt, Shift, or both shows it.
- Holding a modifier the hotkey doesn't use hides the hint, so holding Control and Alt shows only the hints for hotkeys that use both.
- Releasing every modifier, or the window losing focus, hides the hint.
- Other held keys don't matter. AltGr never shows hints, because it types characters.
- A hotkey without modifiers, such as `Escape` or `G`, never shows a hint.

To show a hint only while every modifier is held, pass `exact`:

```ts
private hint = new HotkeyHintController(this, 'Alt+Shift+[KeyK]', { exact: true }) // Needs Alt and Shift
```

If the hotkey sets `platform`, pass the same `platform` to the controller, so `Mod` resolves the same way. The hotkey and the options can also be getters that read the element's properties.

## Hints for sequences

A sequence shows its hint while the user holds the modifiers of its first step:

```ts
private hint = new HotkeyHintController(this, ['Mod+K', 'Mod+C']) // true while Mod is held
```

## Hints for app hotkeys

Pass an [app hotkey](./app-hotkeys) to show the user's current hotkey, including one they changed. An app hotkey with no hotkey assigned shows no hint. A small element keeps every button's hint the same:

```ts
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import {
  AppHotkeysController,
  HotkeyHintController,
  formatForDisplay,
} from '@tanstack/lit-hotkeys'
import type { AppHotkeyId } from '@tanstack/lit-hotkeys'

@customElement('shortcut-hint')
class ShortcutHint extends LitElement {
  @property() hotkeyId!: AppHotkeyId
  private app = new AppHotkeysController(this)
  private hint = new HotkeyHintController(this, () => this.app.appHotkeys[this.hotkeyId])

  render() {
    const { hotkey } = this.app.appHotkeys[this.hotkeyId]
    return this.hint.value && hotkey ? html`<kbd>${formatForDisplay(hotkey)}</kbd>` : ''
  }
}
```

```ts
html`<button @click=${this.save}>Save <shortcut-hint hotkeyId="doc.save"></shortcut-hint></button>`
```

## Hide hints for hotkeys that can't fire

`HotkeyHintController` only looks at held keys. It doesn't know whether the hotkey is enabled, its scope is active, or its target has focus. When a hotkey can be off, combine the hint with the same state:

```ts
@property({ type: Boolean }) dirty = false
private hint = new HotkeyHintController(this, saveHotkey)

constructor() {
  super()
  this.addController(
    new HotkeyController(this, saveHotkey, () => this.save(), () => ({
      enabled: this.dirty,
    })),
  )
}

render() {
  const showHint = this.hint.value && this.dirty
  // ...
}
```

## Check held modifiers without the controller

To check outside an element, such as while drawing on a canvas, pass the held keys to `matchesHeldModifiers`. It takes the same options:

```ts
import { getKeyStateTracker, matchesHeldModifiers } from '@tanstack/lit-hotkeys'

const tracker = getKeyStateTracker()

matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) // true while Mod is held
```

[Held Key State Helpers](./held-key-state-helpers) covers the tracker and the other held-key controllers.

The [Kitchen Sink example](../examples/kitchen-sink) shows hints next to its buttons while Alt or Option is held.
