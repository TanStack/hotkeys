---
title: Track Held Keys and Modifier State in Ember
id: held-key-state-helpers
description: Track which keys are held down in Ember, tell left and right modifiers apart, and change your UI while a key is held.
redirect_from:
  - framework/ember/guides/key-state-tracking
---

These utilities report which keys the user is holding right now. They're optional helpers for your UI: show which modifiers are down, or change a button while Shift is held. You don't need them to register hotkeys. To show a button's shortcut while the user holds its modifiers, see [Hotkey Hints](./hotkey-hints).

Pass the component as the owner of each one. Each returns an object with a tracked `value`, and stops tracking when its owner is destroyed.

## Show which keys are held

`useHeldKeys` holds the held keys in the order they were pressed, such as `['Control', 'Shift', 'A']`:

```gts
import Component from '@glimmer/component'
import { useHeldKeys } from '@tanstack/ember-hotkeys'

export default class KeyDisplay extends Component {
  heldKeys = useHeldKeys(this)

  get label() {
    const keys = this.heldKeys.value
    return keys.length > 0 ? `Held: ${keys.join(' + ')}` : 'No keys held'
  }

  <template>
    <div>{{this.label}}</div>
  </template>
}
```

To label each held key the way hotkeys are labeled, pass it to `formatKeyForDisplay`: `Shift` becomes `⇧` on macOS and `Escape` becomes `Esc`.

## Check whether a key is held

`useKeyHold` tracks whether one key is held. It updates only when that key is pressed or released, and accepts a getter for a key that changes:

```gts
import Component from '@glimmer/component'
import { fn } from '@ember/helper'
import { on } from '@ember/modifier'
import { useKeyHold } from '@tanstack/ember-hotkeys'

export default class FileItem extends Component<{ Args: { file: File } }> {
  shift = useKeyHold(this, 'Shift')

  <template>
    <span>{{@file.name}}</span>
    {{#if this.shift.value}}
      <button type='button' {{on 'click' (fn permanentlyDelete @file)}}>Delete permanently</button>
    {{else}}
      <button type='button' {{on 'click' (fn moveToTrash @file)}}>Move to trash</button>
    {{/if}}
  </template>
}
```

## Tell left and right modifiers apart

`useHeldKeyCodes` maps each held key to the physical key that's down, from `event.code`:

```gts
import Component from '@glimmer/component'
import { useHeldKeyCodes } from '@tanstack/ember-hotkeys'

export default class ModifierSides extends Component {
  heldCodes = useHeldKeyCodes(this) // e.g. value: { Shift: 'ShiftLeft', Control: 'ControlRight' }

  get rightShift() {
    return this.heldCodes.value.Shift === 'ShiftRight'
  }

  <template>
    {{#if this.rightShift}}<p>Right Shift is held</p>{{/if}}
  </template>
}
```

## Read held keys in an event handler

To read the held keys in an event handler without tracking them, use the shared tracker from `getKeyStateTracker`:

```gts
import Component from '@glimmer/component'
import { on } from '@ember/modifier'
import { getKeyStateTracker } from '@tanstack/ember-hotkeys'

export default class Canvas extends Component {
  tracker = getKeyStateTracker()

  onClick = () => {
    if (this.tracker.isKeyHeld('Space')) startPanning()
    else if (this.tracker.isAnyKeyHeld(['Shift', 'Control'])) addToSelection()
    else select()
  }

  <template>
    <canvas {{on 'click' this.onClick}}></canvas>
  </template>
}
```

The tracker starts listening the first time you get it, so get it when the component is created, before the user presses the keys you care about. Call its methods inside the handler to read the state at that moment. It also has `getHeldKeys()` and `areAllKeysHeld(keys)`. Don't destroy the tracker when a component is destroyed, because every utility shares it.

For a mouse or wheel event, `event.ctrlKey`, `shiftKey`, `altKey`, and `metaKey` already report the modifiers. Browsers also set `ctrlKey` for a trackpad pinch, so it doesn't always mean Control is held.

Held keys clear when the window loses focus, so a key released after switching apps doesn't stay held. [Held keys reset when the window loses focus](../../../guides/sensible-defaults.md#held-keys-reset-when-the-window-loses-focus) covers the cases the tracker handles.

The [useHeldKeys example](../examples/useHeldKeys) shows held keys and their codes, and the [useKeyHold example](../examples/useKeyHold) shows modifier indicators.
