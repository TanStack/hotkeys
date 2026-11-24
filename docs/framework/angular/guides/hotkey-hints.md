---
title: Show Keyboard Shortcut Hints While a Modifier Is Held in Angular
id: hotkey-hints
description: Reveal keyboard shortcut hints next to buttons in Angular while the user holds a modifier, with injectHotkeyHint.
---

Some apps hide shortcut badges until the user holds a modifier key, which keeps buttons clean while still making shortcuts discoverable on demand.

`injectHotkeyHint` reports whether the user holds modifiers that belong to a hotkey that can fire. It's an optional display helper and doesn't register a shortcut itself, so pair it with `injectHotkey`.

## Show a hint next to a button

```ts
import { Component } from '@angular/core'
import {
  injectFormatForDisplay,
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
        <kbd>{{ formatForDisplay(saveHotkey) }}</kbd>
      }
    </button>
  `,
})
export class SaveButtonComponent {
  readonly saveHotkey = saveHotkey
  readonly formatForDisplay = injectFormatForDisplay()
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

- **Any matching modifier shows the hint.** For `Alt+Shift+[KeyK]`, holding `Alt`, `Shift`, or both shows it.
- **Extra modifiers hide it.** Holding `Control` and `Alt` shows only the hints for hotkeys that use both.
- **Releases and blur hide it.** Releasing every modifier, or the window losing focus, hides the hint.
- **Other keys are ignored.** `AltGr` never shows hints, because it types characters.
- **Modifier-only requirement.** Hotkeys without modifiers, such as `Escape` or `G`, never show a hint.
- **Only active registrations count.** The hotkey needs at least one enabled registration in an active [scope](./provide-hotkeys-and-scopes). Every mounted registration counts, so if two components register `Mod+S` and one is enabled, both hints appear.
- **Targets follow focus.** An element-targeted hotkey shows its hint only while focus is inside that element. `document` and `window` hotkeys show wherever focus is.

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

Pass an [app hotkey](./app-hotkeys) directly so hints stay in sync when users rebind shortcuts. An app hotkey with no hotkey assigned shows no hint. A small shared component keeps every button's hint consistent:

```ts
import { Component, computed, input } from '@angular/core'
import {
  injectAppHotkeys,
  injectFormatForDisplay,
  injectHotkeyHint,
} from '@tanstack/angular-hotkeys'
import type { AppHotkeyId } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-hint',
  template: `
    @if (showHint() && appHotkey().hotkey; as hotkey) {
      <kbd>{{ formatForDisplay(hotkey) }}</kbd>
    }
  `,
})
export class HintComponent {
  readonly id = input.required<AppHotkeyId>()
  readonly appHotkeys = injectAppHotkeys()
  readonly appHotkey = computed(() => this.appHotkeys()[this.id()])
  readonly showHint = injectHotkeyHint(() => this.appHotkey())
  readonly formatForDisplay = injectFormatForDisplay()
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

Outside components, such as in a canvas draw loop, combine `matchesHeldModifiers` with `getKeyStateTracker()` and `getHotkeyManager().hasActiveRegistration()`:

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

See [Held Keys](./held-key-state-helpers) for more on `getKeyStateTracker`, and the [Kitchen Sink example](../examples/kitchen-sink) for hints on live navigation links and buttons.
