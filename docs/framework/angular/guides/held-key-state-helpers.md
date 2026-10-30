---
title: Track Held Keys and Modifier State in Angular
id: held-key-state-helpers
description: Track which keys are held down in Angular, tell left and right modifiers apart, and change your UI while a key is held.
redirect_from:
  - framework/angular/guides/key-state-tracking
---

These functions report which keys the user is holding right now. They're optional helpers for your UI: show which modifiers are down, or change a button while Shift is held. You don't need them to register hotkeys. To show a button's shortcut while the user holds its modifiers, see [Hotkey Hints](./hotkey-hints).

Each function returns a signal. Call them in an injection context, such as a field initializer or a constructor.

## Show which keys are held

`injectHeldKeys` returns the held keys in the order they were pressed, such as `['Control', 'Shift', 'A']`:

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

To label each held key the way hotkeys are labeled, pass it to `formatForDisplay` as `{ key }`: `Shift` becomes `⇧` on macOS and `Escape` becomes `Esc`. Held keys come from the browser and can be outside the key types, which the `{ key }` form accepts.

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

To read the held keys in an event handler without tracking them, use the shared tracker from `getKeyStateTracker`:

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

The tracker starts listening the first time you get it, so get it when the component is created, before the user presses the keys you care about. Call its methods inside the handler to read the state at that moment. It also has `getHeldKeys()` and `areAllKeysHeld(keys)`. Don't destroy the tracker when a component is destroyed, because every function shares it.

For a mouse or wheel event, `event.ctrlKey`, `shiftKey`, `altKey`, and `metaKey` already report the modifiers. Browsers also set `ctrlKey` for a trackpad pinch, so it doesn't always mean Control is held.

Held keys clear when the window loses focus, so a key released after switching apps doesn't stay held. [Held keys reset when the window loses focus](../../../guides/sensible-defaults.md#held-keys-reset-when-the-window-loses-focus) covers the cases the tracker handles.

The [injectHeldKeys example](../examples/injectHeldKeys) shows held keys and their codes, and the [injectKeyHold example](../examples/injectKeyHold) shows modifier indicators.
