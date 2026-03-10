---
id: getIsKeyHeld
title: getIsKeyHeld
---

# Function: getIsKeyHeld()

```ts
function getIsKeyHeld(key): SvelteHeldKeyState;
```

Defined in: [packages/svelte-hotkeys/src/getIsKeyHeld.svelte.ts:66](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/getIsKeyHeld.svelte.ts#L66)

Svelte function that returns reactive access to whether a specific key is currently being held.

This function uses the global KeyStateTracker and updates whenever keys are pressed
or released.

## Parameters

### key

`HeldKey`

The key to check (e.g., 'Shift', 'Control', 'A')

## Returns

[`SvelteHeldKeyState`](../interfaces/SvelteHeldKeyState.md)

Object with a reactive `held` property

## Examples

```svelte
<script>
  import { getIsKeyHeld } from '@tanstack/svelte-hotkeys'

  const isShiftHeld = getIsKeyHeld('Shift')
</script>

<div>
  {isShiftHeld.held ? 'Shift is pressed!' : 'Press Shift'}
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
  <span style:opacity={isCtrlHeld.held ? 1 : 0.3}>Ctrl</span>
  <span style:opacity={isShiftHeld.held ? 1 : 0.3}>Shift</span>
  <span style:opacity={isAltHeld.held ? 1 : 0.3}>Alt</span>
</div>
```
