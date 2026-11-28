---
title: Track Held Keys and Modifier State in Vue
id: held-key-state-helpers
description: Track which keys are held down in Vue, tell left and right modifiers apart, and change your UI while a key is held.
redirect_from:
  - framework/vue/guides/key-state-tracking
---

These composables track which keys the user is currently holding down. They're optional UI helpers for displaying live key indicators or swapping button labels while `Shift` is held. To reveal shortcut hints when a modifier is held, see [Hotkey Hints](./hotkey-hints).

Each composable returns a ref, which templates unwrap for you.

## Show which keys are held

`useHeldKeys()` returns currently held keys in press order, such as `['Control', 'Shift', 'A']`:

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

To format held keys consistently (`Shift` to `⇧` on macOS, `Escape` to `Esc`), pass `{ key }` to the function from `useFormatForDisplay`. Wrapping in `{ key }` accepts raw browser key names outside the strict `Key` type.

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

Letters match case-insensitively (`'a'` and `'A'` are identical), while named keys are case-sensitive (`'Shift'`, `'Escape'`).

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

To inspect held keys inside a click or canvas handler without tracking them, read the shared tracker from `getKeyStateTracker()`:

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

- Call `getKeyStateTracker()` in `setup` so it starts listening before the user holds any keys.
- The tracker also exposes `getHeldKeys()` and `areAllKeysHeld(keys)`. Never destroy the shared tracker when a component unmounts, because every helper shares the same instance.
- For mouse or wheel handlers, `event.shiftKey`, `altKey`, `metaKey`, and `ctrlKey` already exist on the event. Browsers also set `ctrlKey` during trackpad pinch gestures, so it doesn't always mean Control is held.

Held keys reset automatically when the window loses focus, so a key released after switching apps never stays stuck. See [Held keys reset when the window loses focus](../../../guides/sensible-defaults.md#held-keys-reset-when-the-window-loses-focus).

See the [useHeldKeys example](../examples/useHeldKeys) and the [useKeyHold example](../examples/useKeyhold).

## Lock keys

Caps Lock, Num Lock, and Scroll Lock toggle instead of being held. `useKeyHold('CapsLock').value` is `true` only while the key is down, not while Caps Lock is on. To read whether a lock is on, use `useKeyLockState`:

```vue
<script setup lang="ts">
import { useKeyLockState } from '@tanstack/vue-hotkeys'

const capsLock = useKeyLockState('CapsLock') // value: true, false, or null
</script>

<template>
  <span role="status">{{ capsLock ? 'Caps Lock is on' : '' }}</span>
</template>
```

The value is `null` until the browser reports the lock. See [Read lock key state](./key-lock-state) for when that happens and which browsers report each lock.
