---
id: useHotkeysContext
title: useHotkeysContext
---

```ts
function useHotkeysContext(): HotkeysContextValue | null;
```

Defined in: [HotkeysProviderContext.ts:194](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProviderContext.ts#L194)

The nearest context, or `null`. Outside a component, such as in a bare
`effectScope`, there is no context to read, so this skips `inject` and its
warning.

## Returns

`HotkeysContextValue` \| `null`
