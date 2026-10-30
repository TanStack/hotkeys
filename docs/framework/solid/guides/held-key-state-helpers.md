---
title: Track Held Keys and Modifier State in Solid
id: held-key-state-helpers
description: Track which keys are held down in Solid, tell left and right modifiers apart, and change your UI while a key is held.
redirect_from:
  - framework/solid/guides/key-state-tracking
---

These primitives report which keys the user is holding right now. They're optional helpers for your UI: show which modifiers are down, or change a button while Shift is held. You don't need them to register hotkeys. To show a button's shortcut while the user holds its modifiers, see [Hotkey Hints](./hotkey-hints).

Each primitive returns an accessor, so call it to read the current value.

## Show which keys are held

`createHeldKeys` returns the held keys in the order they were pressed, such as `['Control', 'Shift', 'A']`:

```tsx
import { createHeldKeys } from '@tanstack/solid-hotkeys'

function KeyDisplay() {
  const heldKeys = createHeldKeys()

  return (
    <div>
      {heldKeys().length > 0 ? `Held: ${heldKeys().join(' + ')}` : 'No keys held'}
    </div>
  )
}
```

To label each held key the way hotkeys are labeled, pass it to `formatKeyForDisplay`: `Shift` becomes `⇧` on macOS and `Escape` becomes `Esc`.

## Check whether a key is held

`createKeyHold` returns whether one key is held. It updates only when that key is pressed or released, and accepts an accessor for a key that changes:

```tsx
import { Show } from 'solid-js'
import { createKeyHold } from '@tanstack/solid-hotkeys'

function FileItem(props: { file: File }) {
  const isShiftHeld = createKeyHold('Shift')

  return (
    <div>
      <span>{props.file.name}</span>
      <Show
        when={isShiftHeld()}
        fallback={<button onClick={() => moveToTrash(props.file)}>Move to trash</button>}
      >
        <button onClick={() => permanentlyDelete(props.file)}>Delete permanently</button>
      </Show>
    </div>
  )
}
```

## Tell left and right modifiers apart

`createHeldKeyCodes` maps each held key to the physical key that's down, from `event.code`:

```tsx
import { Show } from 'solid-js'
import { createHeldKeyCodes } from '@tanstack/solid-hotkeys'

function ModifierSides() {
  const heldCodes = createHeldKeyCodes() // e.g. { Shift: 'ShiftLeft', Control: 'ControlRight' }

  return (
    <Show when={heldCodes().Shift === 'ShiftRight'}>
      <p>Right Shift is held</p>
    </Show>
  )
}
```

## Read held keys in an event handler

To read the held keys in an event handler without tracking them, use the shared tracker from `getKeyStateTracker`:

```tsx
import { getKeyStateTracker } from '@tanstack/solid-hotkeys'

function Canvas() {
  const tracker = getKeyStateTracker()

  const onClick = () => {
    if (tracker.isKeyHeld('Space')) startPanning()
    else if (tracker.isAnyKeyHeld(['Shift', 'Control'])) addToSelection()
    else select()
  }

  return <canvas onClick={onClick} />
}
```

The tracker starts listening the first time you get it, so get it when the component is created, before the user presses the keys you care about. Call its methods inside the handler to read the state at that moment. It also has `getHeldKeys()` and `areAllKeysHeld(keys)`. Don't destroy the tracker when a component unmounts, because every primitive shares it.

For a mouse or wheel event, `event.ctrlKey`, `shiftKey`, `altKey`, and `metaKey` already report the modifiers. Browsers also set `ctrlKey` for a trackpad pinch, so it doesn't always mean Control is held.

Held keys clear when the window loses focus, so a key released after switching apps doesn't stay held. [Held keys reset when the window loses focus](../../../guides/sensible-defaults.md#held-keys-reset-when-the-window-loses-focus) covers the cases the tracker handles.

The [createHeldKeys example](../examples/createHeldKeys) shows held keys and their codes, and the [createKeyHold example](../examples/createKeyHold) shows modifier indicators.
