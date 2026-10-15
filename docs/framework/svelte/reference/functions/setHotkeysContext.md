---
id: setHotkeysContext
title: setHotkeysContext
---

```ts
function setHotkeysContext(options?): HotkeysContextValue;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:74](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L74)

Sets the hotkeys context for descendants. `HotkeysProvider` calls this; call
it directly in a root component's script instead of rendering the provider.

## Parameters

### options?

[`HotkeysContextOptions`](../interfaces/HotkeysContextOptions.md) = `{}`

## Returns

`HotkeysContextValue`

## Example

```svelte
<script lang="ts">
  setHotkeysContext({
    appHotkeys,
    customHotkeys: JSON.parse(localStorage.getItem('hotkeys') ?? '{}'),
    onCustomHotkeysChange: (custom) =>
      localStorage.setItem('hotkeys', JSON.stringify(custom)),
  })
</script>
```
