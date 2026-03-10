---
id: createHotkeySequenceAttachment
title: createHotkeySequenceAttachment
---

# Function: createHotkeySequenceAttachment()

```ts
function createHotkeySequenceAttachment(
   sequence, 
   callback, 
options): Attachment<HTMLElement>;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeySequence.svelte.ts:113](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeySequence.svelte.ts#L113)

Create an attachment for element-scoped keyboard sequences.

## Parameters

### sequence

`MaybeGetter`\<`HotkeySequence`\>

### callback

`HotkeyCallback`

### options

`MaybeGetter`\<[`CreateHotkeySequenceOptions`](../interfaces/CreateHotkeySequenceOptions.md)\> = `{}`

## Returns

`Attachment`\<`HTMLElement`\>

## Example

```svelte
<script lang="ts">
  import { createHotkeySequenceAttachment } from '@tanstack/svelte-hotkeys'

  const vimKeys = createHotkeySequenceAttachment(['G', 'G'], () => {
    scrollToTop()
  })
</script>

<div tabindex="0" {@attach vimKeys}>
  Focus here and press g then g
</div>
```
