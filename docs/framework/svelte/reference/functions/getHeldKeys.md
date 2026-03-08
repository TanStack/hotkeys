---
id: getHeldKeys
title: getHeldKeys
---

# Function: getHeldKeys()

```ts
function getHeldKeys(): string[];
```

Defined in: [packages/svelte-hotkeys/src/getHeldKeys.svelte.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/getHeldKeys.svelte.ts#L24)

Svelte function that returns an array of currently held keyboard keys.

This function uses the global KeyStateTracker and updates whenever keys are pressed
or released.

## Returns

`string`[]

Array of currently held key names

## Example

```svelte
<script>
  import { getHeldKeys } from '@tanstack/svelte-hotkeys'

  const heldKeys = getHeldKeys()
</script>
<div>
  Currently pressed: {getHeldKeys().join(' + ') || 'None'}
</div>
```
