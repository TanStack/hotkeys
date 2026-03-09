---
id: getIsKeyHeld
title: getIsKeyHeld
---

# Function: getIsKeyHeld()

```ts
function getIsKeyHeld(key): object;
```

Defined in: [packages/svelte-hotkeys/src/getIsKeyHeld.svelte.ts:46](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/getIsKeyHeld.svelte.ts#L46)

Svelte function that returns a reactive reference to whether a specific key is currently being held.

This function uses the global KeyStateTracker and updates whenever keys are pressed
or released. Use `$derived(getIsKeyHeld('Shift').current)` for reactive access in templates.

## Parameters

### key

`HeldKey`

The key to check (e.g., 'Shift', 'Control', 'A')

## Returns

`object`

Object with `current` property - true if the key is currently held down

### current

```ts
readonly current: boolean;
```

## Examples

```svelte
<script>
  import { getIsKeyHeld } from '@tanstack/svelte-hotkeys'

  const isShiftHeldRef = getIsKeyHeld('Shift')
  const isShiftHeld = $derived(isShiftHeldRef.current)
</script>

<div>
  {isShiftHeld ? 'Shift is pressed!' : 'Press Shift'}
</div>
```

```svelte
<script>
  import { getIsKeyHeld } from '@tanstack/svelte-hotkeys'

  const isCtrlHeld = $derived(getIsKeyHeld('Control').current)
  const isShiftHeld = $derived(getIsKeyHeld('Shift').current)
  const isAltHeld = $derived(getIsKeyHeld('Alt').current)
</script>

<div>
  <span style={{ opacity: isCtrlHeld ? 1 : 0.3 }}>Ctrl</span>
  <span style={{ opacity: isShiftHeld ? 1 : 0.3 }}>Shift</span>
  <span style={{ opacity: isAltHeld ? 1 : 0.3 }}>Alt</span>
</div>
```
