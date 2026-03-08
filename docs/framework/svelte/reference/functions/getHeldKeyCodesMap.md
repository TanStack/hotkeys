---
id: getHeldKeyCodesMap
title: getHeldKeyCodesMap
---

# Function: getHeldKeyCodesMap()

```ts
function getHeldKeyCodesMap(): Record<string, string>;
```

Defined in: [packages/svelte-hotkeys/src/getHeldKeyCodesMap.svelte.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/getHeldKeyCodesMap.svelte.ts#L27)

Svelte function that returns a map of currently held key names to their physical `event.code` values.

This is useful for debugging which physical key was pressed (e.g. distinguishing
left vs right Shift via "ShiftLeft" / "ShiftRight").

## Returns

`Record`\<`string`, `string`\>

Record mapping normalized key names to their `event.code` values

```svelte
<script>
  import { getHeldKeyCodesMap } from '@tanstack/svelte-hotkeys'
  const heldKeyCodesMap = getHeldKeyCodesMap()
</script>

<div>
  {Object.entries(heldKeyCodesMap).map(([key, code]) => (
     <kbd key={key}>
         {key} <small>{code}</small>
     </kbd>
   ))}
 </div>
```
