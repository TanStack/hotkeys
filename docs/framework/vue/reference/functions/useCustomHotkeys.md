---
id: useCustomHotkeys
title: useCustomHotkeys
---

```ts
function useCustomHotkeys(): UseCustomHotkeysResult;
```

Defined in: [useAppHotkeys.ts:87](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useAppHotkeys.ts#L87)

Reads and changes the user's custom hotkeys. Changes apply to every
registered app hotkey immediately and are emitted by the provider as
`custom-hotkeys-change`, ready to save.

## Returns

[`UseCustomHotkeysResult`](../interfaces/UseCustomHotkeysResult.md)
