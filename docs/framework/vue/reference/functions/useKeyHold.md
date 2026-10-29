---
id: useKeyHold
title: useKeyHold
---

```ts
function useKeyHold(key): Ref<boolean>;
```

Defined in: [useKeyHold.ts:49](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useKeyHold.ts#L49)

Vue composable that returns a reactive ref indicating whether a specific key is currently being held.

Reads the held keys from the global KeyStateTracker. The key may be a ref
or getter; the result follows it without waiting for a key event.

## Parameters

### key

`MaybeRefOrGetter`\<`IndividualKey`\>

The key to check (e.g., 'Shift', 'Control', 'A')

## Returns

`Ref`\<`boolean`\>

Reactive ref that is true if the key is currently held down

## Examples

```vue
<script setup>
import { useKeyHold } from '@tanstack/vue-hotkeys'

const isShiftHeld = useKeyHold('Shift')
</script>

<template>
  <div :style="{ opacity: isShiftHeld ? 1 : 0.5 }">
    {{ isShiftHeld ? 'Shift is pressed!' : 'Press Shift' }}
  </div>
</template>
```

```vue
<script setup>
import { useKeyHold } from '@tanstack/vue-hotkeys'

const ctrl = useKeyHold('Control')
const shift = useKeyHold('Shift')
const alt = useKeyHold('Alt')
</script>

<template>
  <div>
    <span :style="{ opacity: ctrl ? 1 : 0.3 }">Ctrl</span>
    <span :style="{ opacity: shift ? 1 : 0.3 }">Shift</span>
    <span :style="{ opacity: alt ? 1 : 0.3 }">Alt</span>
  </div>
</template>
```
