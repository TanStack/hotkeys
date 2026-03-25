---
id: createHotkeySequencesAttachment
title: createHotkeySequencesAttachment
---

# Function: createHotkeySequencesAttachment()

```ts
function createHotkeySequencesAttachment(definitions, commonOptions): Attachment<HTMLElement>;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeySequences.svelte.ts:184](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequences.svelte.ts#L184)

Create an attachment for element-scoped multi-sequence registration.

## Parameters

### definitions

`MaybeGetter`\<[`CreateHotkeySequenceDefinition`](../interfaces/CreateHotkeySequenceDefinition.md)[]\>

### commonOptions

`MaybeGetter`\<[`CreateHotkeySequenceOptions`](../interfaces/CreateHotkeySequenceOptions.md)\> = `{}`

## Returns

`Attachment`\<`HTMLElement`\>

## Example

```svelte
<script lang="ts">
  import { createHotkeySequencesAttachment } from '@tanstack/svelte-hotkeys'

  const vim = createHotkeySequencesAttachment([
    { sequence: ['G', 'G'], callback: () => scrollToTop() },
    { sequence: ['D', 'D'], callback: () => deleteLine() },
  ])
</script>

<div tabindex="0" {@attach vim}>Editor</div>
```
