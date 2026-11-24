---
title: Track Held Keys and Modifier State in Svelte
id: held-key-state-helpers
description: Track which keys are held down in Svelte, tell left and right modifiers apart, and change your UI while a key is held.
redirect_from:
  - framework/svelte/guides/key-state-tracking
---

These functions track which keys the user is currently holding down. They're optional UI helpers for displaying live key indicators or swapping button labels while `Shift` is held. To reveal shortcut hints when a modifier is held, see [Hotkey Hints](./hotkey-hints).

Each function returns an object with a reactive getter. Read the getter where you need the value, instead of destructuring it once.

## Show which keys are held

`getHeldKeys().keys` holds the held keys in the order they were pressed, such as `['Control', 'Shift', 'A']`:

```svelte
<script lang="ts">
  import { getHeldKeys } from '@tanstack/svelte-hotkeys'

  const heldKeys = getHeldKeys()
</script>

<div>
  {heldKeys.keys.length > 0 ? `Held: ${heldKeys.keys.join(' + ')}` : 'No keys held'}
</div>
```

To format held keys consistently (`Shift` to `⇧` on macOS, `Escape` to `Esc`), pass `{ key }` to the function from `getFormatForDisplay`. Wrapping in `{ key }` accepts raw browser key names outside the strict `Key` type.

## Check whether a key is held

`getIsKeyHeld(key).held` tells you whether one key is held. An effect that reads it runs again whenever any key is pressed or released:

```svelte
<script lang="ts">
  import { getIsKeyHeld } from '@tanstack/svelte-hotkeys'

  let { file }: { file: File } = $props()
  const shift = getIsKeyHeld('Shift')
</script>

<div>
  <span>{file.name}</span>
  {#if shift.held}
    <button onclick={() => permanentlyDelete(file)}>Delete permanently</button>
  {:else}
    <button onclick={() => moveToTrash(file)}>Move to trash</button>
  {/if}
</div>
```

Letters match case-insensitively (`'a'` and `'A'` are identical), while named keys are case-sensitive (`'Shift'`, `'Escape'`).

## Tell left and right modifiers apart

`getHeldKeyCodesMap().codes` maps each held key to the physical key that's down, from `event.code`:

```svelte
<script lang="ts">
  import { getHeldKeyCodesMap } from '@tanstack/svelte-hotkeys'

  const heldCodes = getHeldKeyCodesMap() // e.g. codes: { Shift: 'ShiftLeft', Control: 'ControlRight' }
</script>

{#if heldCodes.codes.Shift === 'ShiftRight'}
  <p>Right Shift is held</p>
{/if}
```

## Read held keys in an event handler

To inspect held keys inside a click or canvas handler without tracking them, read the shared tracker from `getKeyStateTracker()`:

```svelte
<script lang="ts">
  import { getKeyStateTracker } from '@tanstack/svelte-hotkeys'

  const tracker = getKeyStateTracker()

  function onClick() {
    if (tracker.isKeyHeld('Space')) startPanning()
    else if (tracker.isAnyKeyHeld(['Shift', 'Control'])) addToSelection()
    else select()
  }
</script>

<canvas onclick={onClick}></canvas>
```

- Call `getKeyStateTracker()` in the component's script so it starts listening before the user holds any keys.
- The tracker also exposes `getHeldKeys()` and `areAllKeysHeld(keys)`. Never destroy the shared tracker when a component unmounts, because every helper shares the same instance.
- For mouse or wheel handlers, `event.shiftKey`, `altKey`, `metaKey`, and `ctrlKey` already exist on the event. Browsers also set `ctrlKey` during trackpad pinch gestures, so it doesn't always mean Control is held.

Held keys reset automatically when the window loses focus, so a key released after switching apps never stays stuck. See [Held keys reset when the window loses focus](../../../guides/sensible-defaults.md#held-keys-reset-when-the-window-loses-focus).

See the [get-held-keys example](../examples/get-held-keys) and the [get-is-key-held example](../examples/get-is-key-held).
