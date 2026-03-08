---
id: getIsKeyHeld
title: getIsKeyHeld
---

# Function: getIsKeyHeld()

```ts
function getIsKeyHeld(key): boolean;
```

Defined in: [packages/svelte-hotkeys/src/getIsKeyHeld.svelte.ts:45](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/getIsKeyHeld.svelte.ts#L45)

Svelte function that returns whether a specific key is currently being held.

This function uses the global KeyStateTracker and updates whenever keys are pressed
or released.

## Parameters

### key

`HeldKey`

The key to check (e.g., 'Shift', 'Control', 'A')

## Returns

`boolean`

True if the key is currently held down

## Examples

```svelte
<script>
  import { getIsKeyHeld } from '@tanstack/svelte-hotkeys'

  const isShiftHeld = getIsKeyHeld('Shift')
</script>

<div>
  {isShiftHeld ? 'Shift is pressed!' : 'Press Shift'}
</div>
```

```svelte
<script>
  import { getIsKeyHeld } from '@tanstack/svelte-hotkeys'

  const isCtrlHeld = getIsKeyHeld('Control')
  const isShiftHeld = getIsKeyHeld('Shift')
  const isAltHeld = getIsKeyHeld('Alt')
</script>

<div>
  <span style={{ opacity: isCtrlHeld ? 1 : 0.3 }}>Ctrl</span>
  <span style={{ opacity: isShiftHeld ? 1 : 0.3 }}>Shift</span>
  <span style={{ opacity: isAltHeld ? 1 : 0.3 }}>Alt</span>
</div>
```
