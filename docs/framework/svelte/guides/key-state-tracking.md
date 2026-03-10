---
title: Key State Tracking Guide
id: key-state-tracking
---

TanStack Hotkeys provides three Svelte functions for tracking live keyboard state: `getHeldKeys`, `getHeldKeyCodesMap`, and `getIsKeyHeld`.

## `getHeldKeys`

```svelte
<script lang="ts">
  import { getHeldKeys } from '@tanstack/svelte-hotkeys'

  const heldKeys = getHeldKeys()
</script>

<div>{heldKeys.keys.length > 0 ? heldKeys.keys.join(' + ') : 'No keys held'}</div>
```

## `getHeldKeyCodesMap`

```svelte
<script lang="ts">
  import { getHeldKeyCodesMap } from '@tanstack/svelte-hotkeys'

  const heldCodes = getHeldKeyCodesMap()
</script>

<pre>{JSON.stringify(heldCodes.codes, null, 2)}</pre>
```

## `getIsKeyHeld`

```svelte
<script lang="ts">
  import { getIsKeyHeld } from '@tanstack/svelte-hotkeys'

  const isShiftHeld = getIsKeyHeld('Shift')
</script>

<span class:active={isShiftHeld.held}>Shift</span>
```

## Common Patterns

### Hold-to-Reveal UI

```svelte
<script lang="ts">
  import { getIsKeyHeld } from '@tanstack/svelte-hotkeys'

  const isShiftHeld = getIsKeyHeld('Shift')
</script>

{#if isShiftHeld.held}
  <button>Permanently Delete</button>
{:else}
  <button>Move to Trash</button>
{/if}
```

### Debugging Key Display

```svelte
<script lang="ts">
  import {
    formatKeyForDebuggingDisplay,
    getHeldKeyCodesMap,
    getHeldKeys,
  } from '@tanstack/svelte-hotkeys'

  const heldKeys = getHeldKeys()
  const heldCodes = getHeldKeyCodesMap()
</script>

<div>
  {#each heldKeys.keys as key}
    <kbd>
      {formatKeyForDebuggingDisplay(key)}:
      {heldCodes.codes[key]
        ? formatKeyForDebuggingDisplay(heldCodes.codes[key], { source: 'code' })
        : 'unknown'}
    </kbd>
  {/each}
</div>
```

## Under the Hood

All three functions subscribe to the singleton `KeyStateTracker`:

```ts
import { getKeyStateTracker } from '@tanstack/svelte-hotkeys'

const tracker = getKeyStateTracker()
tracker.getHeldKeys()
tracker.isKeyHeld('Shift')
```
