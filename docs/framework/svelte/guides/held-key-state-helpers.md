---
title: Track Held Keys and Modifier State in Svelte
id: held-key-state-helpers
description: Track which keys are held down in Svelte, tell left and right modifiers apart, and change your UI while a key is held.
redirect_from:
  - framework/svelte/guides/key-state-tracking
---

These functions report which keys the user is holding right now. They're optional helpers for your UI: show which modifiers are down, or change a button while Shift is held. You don't need them to register hotkeys. To show a button's shortcut while the user holds its modifiers, see [Hotkey Hints](./hotkey-hints).

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

To label each held key the way hotkeys are labeled, pass it to `formatKeyForDisplay`: `Shift` becomes `⇧` on macOS and `Escape` becomes `Esc`.

## Check whether a key is held

`getIsKeyHeld(key).held` tells you whether one key is held. It updates only when that key is pressed or released:

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

To read the held keys in an event handler without tracking them, use the shared tracker from `getKeyStateTracker`:

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

The tracker starts listening the first time you get it, so get it in the component's script, before the user presses the keys you care about. Call its methods inside the handler to read the state at that moment. It also has `getHeldKeys()` and `areAllKeysHeld(keys)`. Don't destroy the tracker when a component unmounts, because every function shares it.

For a mouse or wheel event, `event.ctrlKey`, `shiftKey`, `altKey`, and `metaKey` already report the modifiers. Browsers also set `ctrlKey` for a trackpad pinch, so it doesn't always mean Control is held.

Held keys clear when the window loses focus, so a key released after switching apps doesn't stay held. [Held keys reset when the window loses focus](../../../guides/sensible-defaults.md#held-keys-reset-when-the-window-loses-focus) covers the cases the tracker handles.

The [get-held-keys example](../examples/get-held-keys) shows held keys and their codes, and the [get-is-key-held example](../examples/get-is-key-held) shows modifier indicators.
