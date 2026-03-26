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

Defined in: [packages/svelte-hotkeys/src/createHotkey.svelte.ts:56](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkey.svelte.ts#L56)

Register a global hotkey for the current component.

## Parameters

### hotkey

`MaybeGetter`\<`RegisterableHotkey`\>

### callback

`HotkeyCallback`

### options

`MaybeGetter`\<[`CreateHotkeyOptions`](../interfaces/CreateHotkeyOptions.md)\> = `{}`

## Returns

`void`

## Example

```svelte
<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'

  createHotkey('Mod+S', () => {
    console.log('Mod+S pressed')
  })
</script>
```
