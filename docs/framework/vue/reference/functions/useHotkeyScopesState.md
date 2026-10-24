---
id: useHotkeyScopesState
title: useHotkeyScopesState
---

```ts
function useHotkeyScopesState(): Ref<HotkeyScopesState>;
```

Defined in: [useHotkeyScopesState.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyScopesState.ts#L26)

Vue composable that returns a ref of the hotkey manager's scope state: the
active scopes, the exclusive scope that owns the keyboard, and the scopes
it allows or suspends. Updates when scopes activate or release.

## Returns

`Ref`\<`HotkeyScopesState`\>

Reactive ref of the current scope state

## Example

```vue
<script setup>
import { useHotkeyScopesState } from '@tanstack/vue-hotkeys'

const scopes = useHotkeyScopesState()
</script>

<template>
  <p v-if="scopes.exclusive">Shortcuts belong to {{ scopes.exclusive }}</p>
</template>
```
