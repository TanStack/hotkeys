---
id: getCustomHotkeys
title: getCustomHotkeys
---

```ts
function getCustomHotkeys(): SvelteCustomHotkeys;
```

Defined in: [packages/svelte-hotkeys/src/getAppHotkeys.svelte.ts:101](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/getAppHotkeys.svelte.ts#L101)

Reads and changes the user's custom hotkeys. Changes apply to every
registered app hotkey immediately and are passed to the provider's
`onCustomHotkeysChange`, ready to save.

## Returns

[`SvelteCustomHotkeys`](../interfaces/SvelteCustomHotkeys.md)
