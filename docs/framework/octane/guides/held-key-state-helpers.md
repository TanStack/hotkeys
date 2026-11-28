---
title: Track Held Keys and Modifier State in Octane
id: held-key-state-helpers
description: Track which keys are held down in Octane, tell left and right modifiers apart, and change your UI while a key is held.
redirect_from:
  - framework/octane/guides/key-state-tracking
---

These hooks track which keys the user is currently holding down. They're optional UI helpers for displaying live key indicators or swapping button labels while `Shift` is held. To reveal shortcut hints when a modifier is held, see [Hotkey Hints](./hotkey-hints).

## Show which keys are held

`useHeldKeys()` returns currently held keys in press order, such as `['Control', 'Shift', 'A']`:

```tsx
import { useHeldKeys } from '@tanstack/octane-hotkeys'

function KeyDisplay() @{
  const heldKeys = useHeldKeys()

  <div>{heldKeys.length > 0 ? `Held: ${heldKeys.join(' + ')}` : 'No keys held'}</div>
}
```

To format held keys consistently (`Shift` to `⇧` on macOS, `Escape` to `Esc`), pass `{ key }` to `formatForDisplay`. Wrapping in `{ key }` accepts raw browser key names outside the strict `Key` type.

## Check whether a key is held

`useKeyHold(key)` returns a boolean for one key. The component updates only when that key is pressed or released:

```tsx
import { useKeyHold } from '@tanstack/octane-hotkeys'

function FileItem({ file }: { file: File }) @{
  const isShiftHeld = useKeyHold('Shift')

  <div>
    <span>{file.name}</span>
    @if (isShiftHeld) {
      <button onClick={() => permanentlyDelete(file)}>Delete permanently</button>
    } @else {
      <button onClick={() => moveToTrash(file)}>Move to trash</button>
    }
  </div>
}
```

Letters match case-insensitively (`'a'` and `'A'` are identical), while named keys are case-sensitive (`'Shift'`, `'Escape'`).

## Tell left and right modifiers apart

`useHeldKeyCodes()` maps each held key name to its physical `event.code`:

```tsx
import { useHeldKeyCodes } from '@tanstack/octane-hotkeys'

function ModifierSides() @{
  const heldCodes = useHeldKeyCodes() // e.g. { Shift: 'ShiftLeft', Control: 'ControlRight' }

  @if (heldCodes.Shift === 'ShiftRight') {
    <p>Right Shift is held</p>
  }
}
```

## Read held keys in an event handler

To read the latest held keys in an event handler without updating the component, use the shared tracker from `getKeyStateTracker()`:

```tsx
import { getKeyStateTracker } from '@tanstack/octane-hotkeys'

function Canvas() @{
  const tracker = getKeyStateTracker()

  const onClick = () => {
    if (tracker.isKeyHeld('Space')) startPanning()
    else if (tracker.isAnyKeyHeld(['Shift', 'Control'])) addToSelection()
    else select()
  }

  <canvas onClick={onClick} />
}
```

- Call `getKeyStateTracker()` during render or setup so it starts listening *before* the user holds any keys.
- The tracker also exposes `getHeldKeys()` and `areAllKeysHeld(keys)`. Never destroy the shared tracker on unmount because all hooks share the same instance.
- For mouse or wheel handlers, `event.shiftKey`, `altKey`, `metaKey`, and `ctrlKey` already exist on the event. Note that browsers also set `ctrlKey` during trackpad pinch gestures.

Held keys reset automatically on window blur, tab switch, or macOS `Command` release so keys never stay stuck. See [Held keys reset when the window loses focus](../../../guides/sensible-defaults.md#held-keys-reset-when-the-window-loses-focus).

Held keys clear when the window loses focus, so a key released after switching apps doesn't stay held. See [Held keys reset when the window loses focus](../../../guides/sensible-defaults.md#held-keys-reset-when-the-window-loses-focus) for the cases the tracker handles.

See the [useHeldKeys example](../examples/useHeldKeys) and [useKeyHold example](../examples/useKeyHold).

## Lock keys

Caps Lock, Num Lock, and Scroll Lock toggle instead of being held. `useKeyHold('CapsLock')` is `true` only while the key is down, not while Caps Lock is on. To read whether a lock is on, use `useKeyLockState`:

```tsx
import { useKeyLockState } from '@tanstack/octane-hotkeys'

const capsLock = useKeyLockState('CapsLock') // true, false, or null

<span role="status">{capsLock ? 'Caps Lock is on' : ''}</span>
```

The value is `null` until the browser reports the lock. See [Read lock key state](./key-lock-state) for when that happens and which browsers report each lock.
