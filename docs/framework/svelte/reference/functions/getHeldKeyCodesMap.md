---
id: getHeldKeyCodesMap
title: getHeldKeyCodesMap
---

# Function: getHeldKeyCodesMap()

```ts
function getHeldKeyCodesMap(): SvelteHeldKeyCodesMap;
```

Defined in: [packages/svelte-hotkeys/src/getHeldKeyCodesMap.svelte.ts:42](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/getHeldKeyCodesMap.svelte.ts#L42)

Svelte function that returns reactive access to the map of currently held key names
to their physical `event.code` values.

This is useful for debugging which physical key was pressed (e.g. distinguishing
left vs right Shift via "ShiftLeft" / "ShiftRight").

## Returns

[`SvelteHeldKeyCodesMap`](../interfaces/SvelteHeldKeyCodesMap.md)

Object with a reactive `codes` property

```svelte
<script>
  import { getHeldKeyCodesMap } from '@tanstack/svelte-hotkeys'
  const heldKeyCodesMap = getHeldKeyCodesMap()
</script>

<div>
  {#each Object.entries(heldKeyCodesMap.codes) as [key, code]}
    <kbd>
      {key} <small>{code}</small>
    </kbd>
  {/each}
 </div>
```
