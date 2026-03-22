---
id: createHotkeys
title: createHotkeys
---

# Function: createHotkeys()

```ts
function createHotkeys(hotkeys, commonOptions): void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeys.svelte.ts:77](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeys.svelte.ts#L77)

Register multiple global hotkeys for the current component.

## Parameters

### hotkeys

`MaybeGetter`\<[`CreateHotkeyDefinition`](../interfaces/CreateHotkeyDefinition.md)[]\>

### commonOptions

`MaybeGetter`\<[`CreateHotkeyOptions`](../interfaces/CreateHotkeyOptions.md)\> = `{}`

## Returns

`void`

## Example

```svelte
<script lang="ts">
  import { createHotkeys } from '@tanstack/svelte-hotkeys'

  createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Escape', callback: () => close() },
  ])
</script>
```
