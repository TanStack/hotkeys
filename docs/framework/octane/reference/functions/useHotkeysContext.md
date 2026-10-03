---
id: useHotkeysContext
title: useHotkeysContext
---

```ts
function useHotkeysContext():
  | {
  defaultOptions: DefaultHotkeysOptions;
}
  | null;
```

Defined in: HotkeysProvider.ts:26

Reads the nearest provider, or null outside a provider.

## Returns

  \| \{
  `defaultOptions`: [`DefaultHotkeysOptions`](../interfaces/DefaultHotkeysOptions.md);
\}
  \| `null`
