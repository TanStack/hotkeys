---
title: Track Held Keys and Modifier State in Solid
id: held-key-state-helpers
description: Track which keys are held down in Solid, tell left and right modifiers apart, and change your UI while a key is held.
redirect_from:
  - framework/solid/guides/key-state-tracking
---

These primitives track which keys the user is currently holding down. They're optional UI helpers for displaying live key indicators or swapping button labels while `Shift` is held. To reveal shortcut hints when a modifier is held, see [Hotkey Hints](./hotkey-hints).

Each primitive returns an accessor, so call it to read the current value.

## Show which keys are held

`createHeldKeys` returns the held keys in press order, such as `['Control', 'Shift', 'A']`:

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

To format held keys consistently (`Shift` to `⇧` on macOS, `Escape` to `Esc`), pass `{ key }` to the function from `createFormatForDisplay`. Wrapping in `{ key }` accepts raw browser key names outside the strict `Key` type.

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

Letters match case-insensitively (`'a'` and `'A'` are identical), while named keys are case-sensitive (`'Shift'`, `'Escape'`).

## Tell left and right modifiers apart

`createHeldKeyCodes` maps each held key name to its physical `event.code`:

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

To inspect held keys inside a click or canvas handler without tracking them, read the shared tracker from `getKeyStateTracker()`:

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

- Call `getKeyStateTracker()` when the component is created so it starts listening *before* the user holds any keys.
- The tracker also exposes `getHeldKeys()` and `areAllKeysHeld(keys)`. Never destroy the shared tracker when a component unmounts, because every primitive shares the same instance.
- For mouse or wheel handlers, `event.shiftKey`, `altKey`, `metaKey`, and `ctrlKey` already exist on the event. Browsers also set `ctrlKey` during trackpad pinch gestures.

Held keys reset automatically on window blur, tab switch, or macOS `Command` release so keys never stay stuck. See [Held keys reset when the window loses focus](../../../guides/sensible-defaults.md#held-keys-reset-when-the-window-loses-focus).

Held keys clear when the window loses focus, so a key released after switching apps doesn't stay held. See [Held keys reset when the window loses focus](../../../guides/sensible-defaults.md#held-keys-reset-when-the-window-loses-focus) for the cases the tracker handles.

See the [createHeldKeys example](../examples/createHeldKeys) and [createKeyHold example](../examples/createKeyHold).
