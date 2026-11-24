---
title: Track Held Keys and Modifier State in Angular
id: held-key-state-helpers
description: Track which keys are held down in Angular, tell left and right modifiers apart, and change your UI while a key is held.
redirect_from:
  - framework/angular/guides/key-state-tracking
---

These functions track which keys the user is currently holding down. They're optional UI helpers for displaying live key indicators or swapping button labels while `Shift` is held. To reveal shortcut hints when a modifier is held, see [Hotkey Hints](./hotkey-hints).

Each function returns a signal. Call them in an injection context, such as a field initializer or a constructor.

## Show which keys are held

`injectHeldKeys()` returns currently held keys in press order, such as `['Control', 'Shift', 'A']`:

```ts
import { Component } from '@angular/core'
import { injectHeldKeys } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-key-display',
  template: `
    <div>
      {{ heldKeys().length > 0 ? 'Held: ' + heldKeys().join(' + ') : 'No keys held' }}
    </div>
  `,
})
export class KeyDisplayComponent {
  readonly heldKeys = injectHeldKeys()
}
```

To format held keys consistently (`Shift` to `⇧` on macOS, `Escape` to `Esc`), pass `{ key }` to the function from `injectFormatForDisplay`. Wrapping in `{ key }` accepts raw browser key names outside the strict `Key` type.

## Check whether a key is held

`injectKeyHold` returns whether one key is held. It updates only when that key is pressed or released, and accepts a getter for a key that changes:

```ts
import { Component, input } from '@angular/core'
import { injectKeyHold } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-file-item',
  template: `
    <span>{{ file().name }}</span>
    @if (isShiftHeld()) {
      <button (click)="permanentlyDelete(file())">Delete permanently</button>
    } @else {
      <button (click)="moveToTrash(file())">Move to trash</button>
    }
  `,
})
export class FileItemComponent {
  readonly file = input.required<File>()
  readonly isShiftHeld = injectKeyHold('Shift')
}
```

Letters match case-insensitively (`'a'` and `'A'` are identical), while named keys are case-sensitive (`'Shift'`, `'Escape'`).

## Tell left and right modifiers apart

`injectHeldKeyCodes` maps each held key to the physical key that's down, from `event.code`:

```ts
import { Component } from '@angular/core'
import { injectHeldKeyCodes } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-modifier-sides',
  template: `
    @if (heldCodes()['Shift'] === 'ShiftRight') {
      <p>Right Shift is held</p>
    }
  `,
})
export class ModifierSidesComponent {
  readonly heldCodes = injectHeldKeyCodes() // e.g. { Shift: 'ShiftLeft', Control: 'ControlRight' }
}
```

## Read held keys in an event handler

To inspect held keys inside a click or canvas handler without tracking them, read the shared tracker from `getKeyStateTracker()`:

```ts
import { Component } from '@angular/core'
import { getKeyStateTracker } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-canvas',
  template: `<canvas (click)="onClick()"></canvas>`,
})
export class CanvasComponent {
  private readonly tracker = getKeyStateTracker()

  onClick() {
    if (this.tracker.isKeyHeld('Space')) this.startPanning()
    else if (this.tracker.isAnyKeyHeld(['Shift', 'Control'])) this.addToSelection()
    else this.select()
  }
}
```

- Call `getKeyStateTracker()` when the component is created so it starts listening before the user holds any keys.
- The tracker also exposes `getHeldKeys()` and `areAllKeysHeld(keys)`. Never destroy the shared tracker when a component unmounts, because every helper shares the same instance.
- For mouse or wheel handlers, `event.shiftKey`, `altKey`, `metaKey`, and `ctrlKey` already exist on the event. Browsers also set `ctrlKey` during trackpad pinch gestures, so it doesn't always mean Control is held.

Held keys reset automatically when the window loses focus, so a key released after switching apps never stays stuck. See [Held keys reset when the window loses focus](../../../guides/sensible-defaults.md#held-keys-reset-when-the-window-loses-focus).

See the [injectHeldKeys example](../examples/injectHeldKeys) and the [injectKeyHold example](../examples/injectKeyHold).
