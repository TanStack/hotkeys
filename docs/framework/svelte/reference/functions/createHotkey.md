---
id: createHotkey
title: createHotkey
---

# Function: createHotkey()

```ts
function createHotkey(
   hotkey, 
   callback, 
   options): void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkey.svelte.ts:84](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkey.svelte.ts#L84)

Svelte function for registering a keyboard hotkey.

Uses the singleton HotkeyManager for efficient event handling.
The callback receives both the keyboard event and a context object
containing the hotkey string and parsed hotkey.

This function syncs the callback and options on every render to avoid
stale closures. This means
callbacks that reference Svelte state will always have access to
the latest values.

## Parameters

### hotkey

`RegisterableHotkey`

### callback

`HotkeyCallback`

### options

[`CreateHotkeyOptions`](../interfaces/CreateHotkeyOptions.md) = `{}`

## Returns

`void`

## Examples

```svelte

<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  let ref = $state<HTMLButtonElement | null>(null)

  createHotkey('Mod+S', () => {
    console.log('Mod+S pressed')
  }, { target: ref })
</script>

<div bind:this={ref}>
  ....
</div>
```

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  let ref = $state<HTMLDivElement | null>(null)
  let count = $state(0)

  createHotkey('Mod+S', () => {
    console.log('Mod+S pressed')
    count++
  }, { target: ref })
</script>

<div bind:this={ref}>
  Count: {count}
</div>
```
