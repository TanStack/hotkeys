---
title: Track Held Keys and Modifier State in React
id: held-key-state-helpers
description: Track which keys are held down in React, tell left and right modifiers apart, and change your UI while a key is held.
redirect_from:
  - framework/react/guides/key-state-tracking
---

These hooks report which keys the user is holding right now. They're optional helpers for your UI: show which modifiers are down, or change a button while Shift is held. You don't need them to register hotkeys. To show a button's shortcut while the user holds its modifiers, see [Hotkey Hints](./hotkey-hints).

## Show which keys are held

`useHeldKeys` returns the held keys in the order they were pressed, such as `['Control', 'Shift', 'A']`:

```tsx
import { useHeldKeys } from '@tanstack/react-hotkeys'

function KeyDisplay() {
  const heldKeys = useHeldKeys()

  return (
    <div>
      {heldKeys.length > 0 ? `Held: ${heldKeys.join(' + ')}` : 'No keys held'}
    </div>
  )
}
```

To label each held key the way hotkeys are labeled, pass it to `formatForDisplay` as `{ key }`: `Shift` becomes `⇧` on macOS and `Escape` becomes `Esc`. Held keys come from the browser and can be outside the key types, which the `{ key }` form accepts.

## Check whether a key is held

`useKeyHold` returns whether one key is held. The component re-renders only when that key is pressed or released:

```tsx
import { useKeyHold } from '@tanstack/react-hotkeys'

function FileItem({ file }: { file: File }) {
  const isShiftHeld = useKeyHold('Shift')

  return (
    <div>
      <span>{file.name}</span>
      {isShiftHeld ? (
        <button onClick={() => permanentlyDelete(file)}>Delete permanently</button>
      ) : (
        <button onClick={() => moveToTrash(file)}>Move to trash</button>
      )}
    </div>
  )
}
```

## Tell left and right modifiers apart

`useHeldKeyCodes` maps each held key to the physical key that's down, from `event.code`:

```tsx
import { useHeldKeyCodes } from '@tanstack/react-hotkeys'

function ModifierSides() {
  const heldCodes = useHeldKeyCodes() // e.g. { Shift: 'ShiftLeft', Control: 'ControlRight' }

  return heldCodes.Shift === 'ShiftRight' ? <p>Right Shift is held</p> : null
}
```

## Read held keys in an event handler

The hooks return the held keys for the current render. To read the latest held keys in an event handler without re-rendering, use the shared tracker from `getKeyStateTracker`:

```tsx
import { getKeyStateTracker } from '@tanstack/react-hotkeys'

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

The tracker starts listening the first time you get it, so get it while the component renders, before the user presses the keys you care about. Call its methods inside the handler to read the state at that moment. It also has `getHeldKeys()` and `areAllKeysHeld(keys)`. Don't destroy the tracker when a component unmounts, because every hook shares it.

For a mouse or wheel event, `event.ctrlKey`, `shiftKey`, `altKey`, and `metaKey` already report the modifiers. Browsers also set `ctrlKey` for a trackpad pinch, so it doesn't always mean Control is held.

Held keys clear when the window loses focus, so a key released after switching apps doesn't stay held. [Held keys reset when the window loses focus](../../../guides/sensible-defaults.md#held-keys-reset-when-the-window-loses-focus) covers the cases the tracker handles.

The [useHeldKeys example](../examples/useHeldKeys) shows held keys and their codes, and the [useKeyHold example](../examples/useKeyhold) shows modifier indicators.
