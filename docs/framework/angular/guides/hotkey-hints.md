---
title: Show Keyboard Shortcut Hints While a Modifier Is Held in Angular
id: hotkey-hints
description: Reveal keyboard shortcut hints next to buttons in Angular while the user holds a modifier, with injectHotkeyHint.
---

Some apps show each button's shortcut only while the user holds a modifier, so the hints are there when the user reaches for the keyboard, and out of the way otherwise. `injectHotkeyHint` returns a signal that's `true` while the user holds modifiers that belong to a hotkey that can fire. It's an optional helper, and it doesn't register anything, so use it alongside `injectHotkey`.

## Show a hint next to a button

```ts
import { Component } from '@angular/core'
import {
  formatForDisplay,
  injectHotkey,
  injectHotkeyHint,
} from '@tanstack/angular-hotkeys'

const saveHotkey = 'Mod+S'

@Component({
  selector: 'app-save-button',
  template: `
    <button (click)="save()">
      Save
      @if (showHint()) {
        <kbd>{{ label }}</kbd>
      }
    </button>
  `,
})
export class SaveButtonComponent {
  readonly label = formatForDisplay(saveHotkey)
  readonly showHint = injectHotkeyHint(saveHotkey)

  constructor() {
    injectHotkey(saveHotkey, () => this.save())
  }

  save() {
    /* ... */
  }
}
```

While the user holds Command on macOS, or Control elsewhere, the button reads "Save ⌘ S" or "Save Ctrl+S". [Formatting & Display](./formatting-display) covers labels and keycaps.

## When a hint shows

- Holding any of the hotkey's modifiers shows the hint. For `Alt+Shift+[KeyK]`, holding Alt, Shift, or both shows it.
- Holding a modifier the hotkey doesn't use hides the hint, so holding Control and Alt shows only the hints for hotkeys that use both.
- Releasing every modifier, or the window losing focus, hides the hint.
- Other held keys don't matter. AltGr never shows hints, because it types characters.
- A hotkey without modifiers, such as `Escape` or `G`, never shows a hint.
- The hotkey must be able to fire. A hint shows only while a registration of the hotkey is enabled and in an active [scope](./provide-hotkeys-and-scopes). A hotkey that nothing registers never shows a hint.
- Every registration of the hotkey counts, not only the one in your component. If two components register the same hotkey and only one is enabled, both show the hint.
- A hotkey bound to an element's `target` shows its hint only while focus is inside that element. A hotkey on `document` or `window` shows it wherever focus is.

To show a hint only while every modifier is held, pass `exact`:

```ts
readonly showHint = injectHotkeyHint('Alt+Shift+[KeyK]', { exact: true }) // Needs Alt and Shift
```

If the hotkey sets `platform`, pass the same `platform` to `injectHotkeyHint`, so `Mod` resolves the same way. The hotkey and the options can also be getters.

## Hints for sequences

A sequence shows its hint while the user holds the modifiers of its first step:

```ts
readonly showHint = injectHotkeyHint(['Mod+K', 'Mod+C']) // true while Mod is held
```

## Hints for app hotkeys

Pass an [app hotkey](./app-hotkeys) to show the user's current hotkey, including one they changed. An app hotkey with no hotkey assigned shows no hint. A small component keeps every button's hint the same:

```ts
import { Component, computed, input } from '@angular/core'
import {
  formatForDisplay,
  injectAppHotkeys,
  injectHotkeyHint,
} from '@tanstack/angular-hotkeys'
import type { AppHotkeyId } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-hint',
  template: `
    @if (showHint() && appHotkey().hotkey; as hotkey) {
      <kbd>{{ format(hotkey) }}</kbd>
    }
  `,
})
export class HintComponent {
  readonly id = input.required<AppHotkeyId>()
  readonly appHotkeys = injectAppHotkeys()
  readonly appHotkey = computed(() => this.appHotkeys()[this.id()])
  readonly showHint = injectHotkeyHint(() => this.appHotkey())
  readonly format = formatForDisplay
}
```

```ts
@Component({
  selector: 'app-toolbar',
  imports: [HintComponent],
  template: `<button (click)="save()">Save <app-hint id="doc.save" /></button>`,
})
export class ToolbarComponent {
  readonly appHotkeys = injectAppHotkeys()

  constructor() {
    injectHotkey(() => this.appHotkeys()['doc.save'], () => this.save())
  }

  save() {
    /* ... */
  }
}
```

## Check held modifiers without the helper

To check outside a component, such as while drawing on a canvas, pass the held keys to `matchesHeldModifiers`. It takes the same options, but it only looks at held keys. To also check that the hotkey can fire, call `hasActiveRegistration` on the hotkey manager:

```ts
import {
  getHotkeyManager,
  getKeyStateTracker,
  matchesHeldModifiers,
} from '@tanstack/angular-hotkeys'

const tracker = getKeyStateTracker()

matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) // true while Mod is held

const showHint =
  matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) &&
  getHotkeyManager().hasActiveRegistration('Mod+S') // Same check as the helper
```

[Held Key State Helpers](./held-key-state-helpers) covers the tracker and the other held-key functions.

The [Kitchen Sink example](../examples/kitchen-sink) shows hints next to its navigation links and buttons while Alt or Option is held.
