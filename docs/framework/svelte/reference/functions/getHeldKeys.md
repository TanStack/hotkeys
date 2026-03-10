---
id: getHeldKeys
title: getHeldKeys
---

# Function: getHeldKeys()

```ts
function getHeldKeys(): SvelteHeldKeys;
```

Defined in: [packages/svelte-hotkeys/src/getHeldKeys.svelte.ts:38](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/getHeldKeys.svelte.ts#L38)

Svelte function that returns reactive access to currently held keyboard keys.

This function uses the global KeyStateTracker and updates whenever keys are pressed
or released.

## Returns

[`SvelteHeldKeys`](../interfaces/SvelteHeldKeys.md)

Object with a reactive `keys` property

## Example

```svelte
<script>
  import { getHeldKeys } from '@tanstack/svelte-hotkeys'

  const heldKeys = getHeldKeys()
</script>
<div>
  Currently pressed: {heldKeys.keys.join(' + ') || 'None'}
</div>
```
