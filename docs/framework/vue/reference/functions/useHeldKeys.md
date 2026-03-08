---
id: useHeldKeys
title: useHeldKeys
---

# Function: useHeldKeys()

```ts
function useHeldKeys(): Ref<string[]>;
```

Defined in: [packages/vue-hotkeys/src/useHeldKeys.ts:29](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHeldKeys.ts#L29)

Vue composable that returns a reactive ref of currently held keyboard keys.

This composable uses `useStore` from `@tanstack/vue-store` to subscribe
to the global KeyStateTracker and updates whenever keys are pressed
or released.

## Returns

`Ref`\<`string`[]\>

Reactive ref containing array of currently held key names

## Example

```vue
<script setup>
import { useHeldKeys } from '@tanstack/vue-hotkeys'

const heldKeys = useHeldKeys()
</script>

<template>
  <div>
    Currently pressed: {{ heldKeys.join(' + ') || 'None' }}
  </div>
</template>
```
