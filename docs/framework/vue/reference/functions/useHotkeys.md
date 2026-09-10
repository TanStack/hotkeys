---
id: useHotkeys
title: useHotkeys
---

# Function: useHotkeys()

```ts
function useHotkeys(hotkeys, commonOptions): void;
```

Defined in: [packages/vue-hotkeys/src/useHotkeys.ts:73](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeys.ts#L73)

Vue composable for registering multiple keyboard hotkeys at once.

Uses the singleton HotkeyManager for efficient event handling.
Accepts a dynamic array of hotkey definitions, making it safe to use
with variable-length lists.

Options are merged in this order:
HotkeysProvider defaults < commonOptions < per-definition options

## Parameters

### hotkeys

`MaybeRefOrGetter`\<[`UseHotkeyDefinition`](../interfaces/UseHotkeyDefinition.md)[]\>

Array of hotkey definitions to register, or a getter/ref

### commonOptions

`MaybeRefOrGetter`\<[`UseHotkeyOptions`](../interfaces/UseHotkeyOptions.md)\> = `{}`

Shared options applied to all hotkeys (overridden by per-definition options)

## Returns

`void`

## Examples

```vue
<script setup>
import { useHotkeys } from '@tanstack/vue-hotkeys'

useHotkeys([
  { hotkey: 'Mod+S', callback: () => save() },
  { hotkey: 'Mod+Z', callback: () => undo() },
  { hotkey: 'Escape', callback: () => close() },
])
</script>
```

```vue
<script setup>
import { computed } from 'vue'
import { useHotkeys } from '@tanstack/vue-hotkeys'

const items = computed(() => [...])
// Dynamic hotkeys from reactive data
useHotkeys(
  () => items.value.map((item) => ({
    hotkey: item.shortcut,
    callback: item.action,
    options: { enabled: item.enabled },
  })),
  { preventDefault: true },
)
</script>
```
