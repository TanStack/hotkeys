---
id: getHeldKeyCodesMap
title: getHeldKeyCodesMap
---

# Function: getHeldKeyCodesMap()

```ts
function getHeldKeyCodesMap(): object;
```

Defined in: [packages/svelte-hotkeys/src/getHeldKeyCodesMap.svelte.ts:30](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/getHeldKeyCodesMap.svelte.ts#L30)

Svelte function that returns a reactive reference to the map of currently held key names
to their physical `event.code` values.

This is useful for debugging which physical key was pressed (e.g. distinguishing
left vs right Shift via "ShiftLeft" / "ShiftRight").
Use `$derived(getHeldKeyCodesMap().current)` for reactive access in templates.

## Returns

`object`

Object with `current` property containing the held key codes map

```svelte
<script>
  import { getHeldKeyCodesMap } from '@tanstack/svelte-hotkeys'
  const heldKeyCodesMapRef = getHeldKeyCodesMap()
  const heldKeyCodesMap = $derived(heldKeyCodesMapRef.current)
</script>

<div>
  {Object.entries(heldKeyCodesMap).map(([key, code]) => (
     <kbd key={key}>
         {key} <small>{code}</small>
     </kbd>
   ))}
 </div>
```

### current

```ts
readonly current: Record<string, string>;
```
