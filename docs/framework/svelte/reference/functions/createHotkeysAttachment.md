---
id: createHotkeysAttachment
title: createHotkeysAttachment
---

```ts
function createHotkeysAttachment(hotkeys, commonOptions?): Attachment<HTMLElement>;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeys.svelte.ts:152](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeys.svelte.ts#L152)

Create an attachment for element-scoped hotkeys: chords, sequences, and app
hotkeys listen on the attached element.

## Parameters

### hotkeys

`MaybeGetter`\<readonly [`CreateHotkeyDefinition`](../type-aliases/CreateHotkeyDefinition.md)[]\>

### commonOptions?

`MaybeGetter`\<[`CreateHotkeyCommonOptions`](../type-aliases/CreateHotkeyCommonOptions.md)\> = `{}`

## Returns

`Attachment`\<`HTMLElement`\>

## Example

```svelte
<script lang="ts">
  const editorKeys = createHotkeysAttachment([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: ['G', 'G'], callback: () => scrollToTop() },
  ])
</script>

<div tabindex="0" {@attach editorKeys}>Editor content</div>
```
