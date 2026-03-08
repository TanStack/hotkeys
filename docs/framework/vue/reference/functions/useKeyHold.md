---
id: useKeyHold
title: useKeyHold
---

# Function: useKeyHold()

```ts
function useKeyHold(key): Ref<boolean>;
```

Defined in: [packages/vue-hotkeys/src/useKeyHold.ts:51](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useKeyHold.ts#L51)

Vue composable that returns a reactive ref indicating whether a specific key is currently being held.

This composable uses `useStore` from `@tanstack/vue-store` to subscribe
to the global KeyStateTracker and uses a selector to determine if
the specified key is held.

## Parameters

### key

`MaybeRefOrGetter`\<`HeldKey`\>

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
