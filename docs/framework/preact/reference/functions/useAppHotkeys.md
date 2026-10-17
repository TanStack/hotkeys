---
id: useAppHotkeys
title: useAppHotkeys
---

```ts
function useAppHotkeys(): RegisteredAppHotkeys;
```

Defined in: [useAppHotkeys.ts:35](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useAppHotkeys.ts#L35)

Returns the effective app hotkeys from `HotkeysProvider`, typed by
`Register`: each declaration with the user's custom hotkey applied.
Pass an entry to `useHotkey` or `useHotkeys` to register it.

## Returns

`RegisteredAppHotkeys`

## Example

```tsx
const appHotkeys = useAppHotkeys()
useHotkey(appHotkeys['doc.save'], () => save())
```
