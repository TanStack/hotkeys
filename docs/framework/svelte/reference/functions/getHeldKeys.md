---
id: getHeldKeys
title: getHeldKeys
---

# Function: getHeldKeys()

```ts
function getHeldKeys(): object;
```

Defined in: [packages/svelte-hotkeys/src/getHeldKeys.svelte.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/getHeldKeys.svelte.ts#L25)

Svelte function that returns a reactive reference to currently held keyboard keys.

This function uses the global KeyStateTracker and updates whenever keys are pressed
or released. Use `$derived(getHeldKeys().current)` for reactive access in templates.

## Returns

`object`

Object with `current` property containing the array of held key names

### current

```ts
readonly current: string[];
```

## Example

```svelte
<script>
  import { getHeldKeys } from '@tanstack/svelte-hotkeys'

  const heldKeysRef = getHeldKeys()
  const heldKeys = $derived(heldKeysRef.current)
</script>
<div>
  Currently pressed: {heldKeys.join(' + ') || 'None'}
</div>
```
