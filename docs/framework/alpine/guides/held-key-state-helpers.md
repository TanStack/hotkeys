---
title: Track Held Keys and Modifier State in Alpine
id: held-key-state-helpers
description: Track which keys are held down in Alpine, tell left and right modifiers apart, and change your UI while a key is held.
redirect_from:
  - framework/alpine/guides/key-state-tracking
---

These functions report which keys the user is holding right now. They're optional helpers for your UI: show which modifiers are down, or change a button while Shift is held. You don't need them to register hotkeys. To show a button's shortcut while the user holds its modifiers, see [Hotkey Hints](./hotkey-hints).

Create them on an owner from `createHotkeysScope`. Each returns an object with a reactive `value`, so read `value` where you need it. Call `create*` in `x-init` or `init()`, and read `.value` anywhere. In a reactive expression such as `x-text`, each evaluation calls `create*` again and adds a new subscription.

## Show which keys are held

`createHeldKeys` holds the held keys in the order they were pressed, such as `['Control', 'Shift', 'A']`:

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'

Alpine.data('keyDisplay', () => {
  const hotkeys = createHotkeysScope()
  const heldKeys = hotkeys.createHeldKeys()

  return {
    get label() {
      return heldKeys.value.length > 0 ? `Held: ${heldKeys.value.join(' + ')}` : 'No keys held'
    },
    destroy() {
      hotkeys.destroy()
    },
  }
})
```

To label each held key the way hotkeys are labeled, pass it to `formatForDisplay` as `{ key }`: `Shift` becomes `⇧` on macOS and `Escape` becomes `Esc`. Held keys come from the browser and can be outside the key types, which the `{ key }` form accepts.

```html
<div x-data="keyDisplay" x-text="label"></div>
```

## Check whether a key is held

`createKeyHold` tracks whether one key is held. Its value changes only when that key is pressed or released, and it accepts a getter for a key that changes:

```ts
Alpine.data('fileItem', (file: File) => {
  const hotkeys = createHotkeysScope()
  const shift = hotkeys.createKeyHold('Shift')

  return {
    file,
    get isShiftHeld() {
      return shift.value
    },
    destroy() {
      hotkeys.destroy()
    },
  }
})
```

```html
<div x-data="fileItem(file)">
  <span x-text="file.name"></span>
  <button x-show="isShiftHeld" @click="permanentlyDelete(file)">Delete permanently</button>
  <button x-show="!isShiftHeld" @click="moveToTrash(file)">Move to trash</button>
</div>
```

## Tell left and right modifiers apart

`createHeldKeyCodes` maps each held key to the physical key that's down, from `event.code`:

```ts
Alpine.data('modifierSides', () => {
  const hotkeys = createHotkeysScope()
  const heldCodes = hotkeys.createHeldKeyCodes() // e.g. value: { Shift: 'ShiftLeft', Control: 'ControlRight' }

  return {
    get rightShift() {
      return heldCodes.value.Shift === 'ShiftRight'
    },
    destroy() {
      hotkeys.destroy()
    },
  }
})
```

```html
<p x-data="modifierSides" x-show="rightShift">Right Shift is held</p>
```

## Read held keys in an event handler

To read the held keys in an event handler without tracking them, use the shared tracker from `getKeyStateTracker`:

```ts
import { getKeyStateTracker } from '@tanstack/alpine-hotkeys'

Alpine.data('canvas', () => {
  const tracker = getKeyStateTracker()

  return {
    onClick() {
      if (tracker.isKeyHeld('Space')) startPanning()
      else if (tracker.isAnyKeyHeld(['Shift', 'Control'])) addToSelection()
      else select()
    },
  }
})
```

```html
<canvas x-data="canvas" @click="onClick()"></canvas>
```

The tracker starts listening the first time you get it, so get it when the component is created, before the user presses the keys you care about. Call its methods inside the handler to read the state at that moment. It also has `getHeldKeys()` and `areAllKeysHeld(keys)`. Don't destroy the tracker when a component is destroyed, because every owner shares it.

For a mouse or wheel event, `event.ctrlKey`, `shiftKey`, `altKey`, and `metaKey` already report the modifiers. Browsers also set `ctrlKey` for a trackpad pinch, so it doesn't always mean Control is held.

Held keys clear when the window loses focus, so a key released after switching apps doesn't stay held. [Held keys reset when the window loses focus](../../../guides/sensible-defaults.md#held-keys-reset-when-the-window-loses-focus) covers the cases the tracker handles.

The [createHeldKeys example](../examples/createHeldKeys) shows held keys and their codes, and the [createKeyHold example](../examples/createKeyHold) shows modifier indicators.
