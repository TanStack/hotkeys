---
id: setHotkeysContext
title: setHotkeysContext
---

```ts
function setHotkeysContext(options?): HotkeysContextValue;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:100](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L100)

Sets the hotkeys context for descendants. `HotkeysProvider` calls this; call
it directly in a component's script instead of rendering the provider.

Nest contexts to create hotkey scopes. A nested context inherits app
hotkeys and merges default options. With `scope`, its hotkeys fire only
while the component is mounted and enabled; with `exclusive`, only its
hotkeys fire.

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
