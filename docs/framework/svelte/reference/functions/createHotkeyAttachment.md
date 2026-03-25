---
id: createHotkeyAttachment
title: createHotkeyAttachment
---

# Function: createHotkeyAttachment()

```ts
function createHotkeyAttachment(
   hotkey, 
   callback, 
options): Attachment<HTMLElement>;
```

Defined in: [packages/svelte-hotkeys/src/createHotkey.svelte.ts:136](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkey.svelte.ts#L136)

Create an attachment for element-scoped hotkeys.

## Parameters

### hotkey

`MaybeGetter`\<`RegisterableHotkey`\>

### callback

`HotkeyCallback`

### options

`MaybeGetter`\<[`CreateHotkeyOptions`](../interfaces/CreateHotkeyOptions.md)\> = `{}`

## Returns

`Attachment`\<`HTMLElement`\>

## Example

```svelte
<script lang="ts">
  import { createHotkeyAttachment } from '@tanstack/svelte-hotkeys'

  let count = $state(0)
  const saveHotkey = createHotkeyAttachment('Mod+S', () => {
    count++
  })

</script>

<div tabindex="0" {@attach saveHotkey}>
  Count: {count}
</div>
```
