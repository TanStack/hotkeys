---
title: Show Keyboard Shortcut Hints While a Modifier Is Held in Lit
id: hotkey-hints
description: Reveal keyboard shortcut hints next to buttons in Lit while the user holds a modifier, with HotkeyHintController.
---

Some apps show each button's shortcut only while the user holds a modifier, so the hints are there when the user reaches for the keyboard, and out of the way otherwise. `HotkeyHintController` has a `value` that's `true` while the user holds modifiers that belong to a hotkey that can fire. It's an optional helper, and it doesn't register anything, so use it alongside `@hotkey` or `HotkeyController`.

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
- The hotkey must be able to fire. A hint shows only while a registration of the hotkey is enabled and in an active [scope](./hotkey-manager#activate-a-scope). A hotkey that nothing registers never shows a hint.
- Every registration of the hotkey counts, not only the one in your element. If two elements register the same hotkey and only one is enabled, both show the hint.
- A hotkey bound to an element's `target` shows its hint only while focus is inside that element. A hotkey on `document` or `window` shows it wherever focus is.

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
import { hotkey } from '@tanstack/lit-hotkeys'
import { appHotkeys } from './app-hotkeys'

@customElement('doc-toolbar')
class DocToolbar extends LitElement {
  @hotkey(appHotkeys['doc.save'])
  save() {
    /* ... */
  }

  render() {
    return html`<button @click=${() => this.save()}>Save <shortcut-hint hotkeyId="doc.save"></shortcut-hint></button>`
  }
}
```

## Check held modifiers without the controller

To check outside an element, such as while drawing on a canvas, pass the held keys to `matchesHeldModifiers`. It takes the same options, but it only looks at held keys. To also check that the hotkey can fire, call `hasActiveRegistration` on the hotkey manager:

```ts
import {
  getHotkeyManager,
  getKeyStateTracker,
  matchesHeldModifiers,
} from '@tanstack/lit-hotkeys'

const tracker = getKeyStateTracker()

matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) // true while Mod is held

const showHint =
  matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) &&
  getHotkeyManager().hasActiveRegistration('Mod+S') // Same check as the controller
```

[Held Key State Helpers](./held-key-state-helpers) covers the tracker and the other held-key controllers.

The [Kitchen Sink example](../examples/kitchen-sink) shows hints next to its buttons while Alt or Option is held.
