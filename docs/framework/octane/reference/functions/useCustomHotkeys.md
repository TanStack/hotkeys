---
id: useCustomHotkeys
title: useCustomHotkeys
---

```ts
function useCustomHotkeys(): UseCustomHotkeysResult;
```

Defined in: [useAppHotkeys.ts:59](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/useAppHotkeys.ts#L59)

Reads and changes the user's custom hotkeys. Changes apply to every
registered app hotkey immediately and are passed to the provider's
`onCustomHotkeysChange`, ready to save.

## Returns

[`UseCustomHotkeysResult`](../interfaces/UseCustomHotkeysResult.md)
