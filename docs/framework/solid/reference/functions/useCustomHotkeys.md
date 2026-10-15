---
id: useCustomHotkeys
title: useCustomHotkeys
---

```ts
function useCustomHotkeys(): UseCustomHotkeysResult;
```

Defined in: [appHotkeys.ts:88](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/appHotkeys.ts#L88)

Reads and changes the user's custom hotkeys. Changes apply to every
registered app hotkey immediately and are passed to the provider's
`onCustomHotkeysChange`, ready to save.

## Returns

[`UseCustomHotkeysResult`](../interfaces/UseCustomHotkeysResult.md)
