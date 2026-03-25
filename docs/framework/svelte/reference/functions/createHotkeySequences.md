---
id: createHotkeySequences
title: createHotkeySequences
---

# Function: createHotkeySequences()

```ts
function createHotkeySequences(definitions, commonOptions): void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeySequences.svelte.ts:60](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequences.svelte.ts#L60)

Register multiple global keyboard shortcut sequences for the current component.

## Parameters

### definitions

`MaybeGetter`\<[`CreateHotkeySequenceDefinition`](../interfaces/CreateHotkeySequenceDefinition.md)[]\>

### commonOptions

`MaybeGetter`\<[`CreateHotkeySequenceOptions`](../interfaces/CreateHotkeySequenceOptions.md)\> = `{}`

## Returns

`void`

## Example

```svelte
<script lang="ts">
  import { createHotkeySequences } from '@tanstack/svelte-hotkeys'

  createHotkeySequences([
    { sequence: ['G', 'G'], callback: () => scrollToTop() },
    { sequence: ['D', 'D'], callback: () => deleteLine() },
  ])
</script>
```
