---
id: useAppHotkeys
title: useAppHotkeys
---

```ts
function useAppHotkeys(): () => RegisteredAppHotkeys;
```

Defined in: [appHotkeys.ts:36](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/appHotkeys.ts#L36)

Returns an accessor for the effective app hotkeys from `HotkeysProvider`,
typed by `Register`: each declaration with the user's custom hotkey applied.

## Returns

() => `RegisteredAppHotkeys`

## Example

```tsx
const hotkeys = useAppHotkeys()
createHotkey(() => hotkeys()['doc.save'], () => save())
```
