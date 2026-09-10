---
id: useHeldKeyCodes
title: useHeldKeyCodes
---

# Function: useHeldKeyCodes()

```ts
function useHeldKeyCodes(): Ref<Record<string, string>>;
```

Defined in: [packages/vue-hotkeys/src/useHeldKeyCodes.ts:31](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHeldKeyCodes.ts#L31)

Vue composable that returns a reactive ref mapping currently held key names to their physical `event.code` values.

This is useful for debugging which physical key was pressed (e.g. distinguishing
left vs right Shift via "ShiftLeft" / "ShiftRight").

## Returns

`Ref`\<`Record`\<`string`, `string`\>\>

Reactive ref containing record mapping normalized key names to their `event.code` values

## Example

```vue
<script setup>
import { useHeldKeys, useHeldKeyCodes } from '@tanstack/vue-hotkeys'

const heldKeys = useHeldKeys()
const heldCodes = useHeldKeyCodes()
</script>

<template>
  <div>
    <kbd v-for="key in heldKeys" :key="key">
      {{ key }} <small>{{ heldCodes[key] }}</small>
    </kbd>
  </div>
</template>
```
