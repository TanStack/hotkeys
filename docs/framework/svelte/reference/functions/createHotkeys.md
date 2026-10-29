---
id: createHotkeys
title: createHotkeys
---

```ts
function createHotkeys(hotkeys, commonOptions?): void;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeys.svelte.ts:127](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeys.svelte.ts#L127)

Svelte function for registering several hotkeys at once on the document:
chords, sequences, and app hotkeys. Pass getters for reactive values. Use
`createHotkeysAttachment` for element-scoped hotkeys.

Options merge in this order: provider defaults, app hotkey declaration,
commonOptions, per-hotkey options. Each option applies only to the kinds
that support it. Unbound app hotkeys and empty sequences register nothing.

## Parameters

### hotkeys

`MaybeGetter`\<readonly [`CreateHotkeyDefinition`](../type-aliases/CreateHotkeyDefinition.md)[]\>

### commonOptions?

`MaybeGetter`\<[`CreateHotkeyCommonOptions`](../type-aliases/CreateHotkeyCommonOptions.md)\> = `{}`

## Returns

`void`

## Example

```svelte
<script lang="ts">
  createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
  ])
</script>
```
