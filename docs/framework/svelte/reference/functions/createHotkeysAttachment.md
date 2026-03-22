---
id: createHotkeysAttachment
title: createHotkeysAttachment
---

# Function: createHotkeysAttachment()

```ts
function createHotkeysAttachment(hotkeys, commonOptions): Attachment<HTMLElement>;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeys.svelte.ts:197](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeys.svelte.ts#L197)

Create an attachment for element-scoped multi-hotkey registration.

## Parameters

### hotkeys

`MaybeGetter`\<[`CreateHotkeyDefinition`](../interfaces/CreateHotkeyDefinition.md)[]\>

### commonOptions

`MaybeGetter`\<[`CreateHotkeyOptions`](../interfaces/CreateHotkeyOptions.md)\> = `{}`

## Returns

`Attachment`\<`HTMLElement`\>

## Example

```svelte
<script lang="ts">
  import { createHotkeysAttachment } from '@tanstack/svelte-hotkeys'

  const editorKeys = createHotkeysAttachment([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
  ])
</script>

<div tabindex="0" {@attach editorKeys}>
  Editor content
</div>
```
