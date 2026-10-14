---
id: getAppHotkeys
title: getAppHotkeys
---

```ts
function getAppHotkeys(): SvelteAppHotkeys;
```

Defined in: packages/svelte-hotkeys/src/getAppHotkeys.svelte.ts:41

Returns reactive access to the effective app hotkeys from `HotkeysProvider`,
typed by `Register`.

## Returns

[`SvelteAppHotkeys`](../interfaces/SvelteAppHotkeys.md)

## Example

```svelte
<script lang="ts">
  const hotkeys = getAppHotkeys()
  createHotkey(() => hotkeys.current['doc.save'], () => save())
</script>
```
