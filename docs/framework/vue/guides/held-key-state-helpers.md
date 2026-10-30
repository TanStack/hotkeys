---
title: Track Held Keys and Modifier State in Vue
id: held-key-state-helpers
description: Track which keys are held down in Vue, tell left and right modifiers apart, and change your UI while a key is held.
redirect_from:
  - framework/vue/guides/key-state-tracking
---

These composables report which keys the user is holding right now. They're optional helpers for your UI: show which modifiers are down, or change a button while Shift is held. You don't need them to register hotkeys. To show a button's shortcut while the user holds its modifiers, see [Hotkey Hints](./hotkey-hints).

Each composable returns a ref, which templates unwrap for you.

## Show which keys are held

`useHeldKeys` returns the held keys in the order they were pressed, such as `['Control', 'Shift', 'A']`:

```vue
<script setup lang="ts">
import { useHeldKeys } from '@tanstack/vue-hotkeys'

const heldKeys = useHeldKeys()
</script>

<template>
  <div>
    {{ heldKeys.length > 0 ? `Held: ${heldKeys.join(' + ')}` : 'No keys held' }}
  </div>
</template>
```

To label each held key the way hotkeys are labeled, pass it to `formatForDisplay` as `{ key }`: `Shift` becomes `⇧` on macOS and `Escape` becomes `Esc`. Held keys come from the browser and can be outside the key types, which the `{ key }` form accepts.

## Check whether a key is held

`useKeyHold` returns whether one key is held. It updates only when that key is pressed or released, and accepts a ref or getter for a key that changes:

```vue
<script setup lang="ts">
import { useKeyHold } from '@tanstack/vue-hotkeys'

const props = defineProps<{ file: File }>()
const isShiftHeld = useKeyHold('Shift')
</script>

<template>
  <div>
    <span>{{ file.name }}</span>
    <button v-if="isShiftHeld" @click="permanentlyDelete(file)">Delete permanently</button>
    <button v-else @click="moveToTrash(file)">Move to trash</button>
  </div>
</template>
```

## Tell left and right modifiers apart

`useHeldKeyCodes` maps each held key to the physical key that's down, from `event.code`:

```vue
<script setup lang="ts">
import { useHeldKeyCodes } from '@tanstack/vue-hotkeys'

const heldCodes = useHeldKeyCodes() // e.g. { Shift: 'ShiftLeft', Control: 'ControlRight' }
</script>

<template>
  <p v-if="heldCodes.Shift === 'ShiftRight'">Right Shift is held</p>
</template>
```

## Read held keys in an event handler

To read the held keys in an event handler without tracking them, use the shared tracker from `getKeyStateTracker`:

```vue
<script setup lang="ts">
import { getKeyStateTracker } from '@tanstack/vue-hotkeys'

const tracker = getKeyStateTracker()

function onClick() {
  if (tracker.isKeyHeld('Space')) startPanning()
  else if (tracker.isAnyKeyHeld(['Shift', 'Control'])) addToSelection()
  else select()
}
</script>

<template>
  <canvas @click="onClick" />
</template>
```

The tracker starts listening the first time you get it, so get it in `setup`, before the user presses the keys you care about. Call its methods inside the handler to read the state at that moment. It also has `getHeldKeys()` and `areAllKeysHeld(keys)`. Don't destroy the tracker when a component unmounts, because every composable shares it.

For a mouse or wheel event, `event.ctrlKey`, `shiftKey`, `altKey`, and `metaKey` already report the modifiers. Browsers also set `ctrlKey` for a trackpad pinch, so it doesn't always mean Control is held.

Held keys clear when the window loses focus, so a key released after switching apps doesn't stay held. [Held keys reset when the window loses focus](../../../guides/sensible-defaults.md#held-keys-reset-when-the-window-loses-focus) covers the cases the tracker handles.

The [useHeldKeys example](../examples/useHeldKeys) shows held keys and their codes, and the [useKeyHold example](../examples/useKeyhold) shows modifier indicators.
