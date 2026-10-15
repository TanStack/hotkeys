---
id: DefinedAppHotkeys
title: DefinedAppHotkeys
---

```ts
type DefinedAppHotkeys<T> = { readonly [K in keyof T & string]: AppHotkey<K, AppHotkeyDefaultKind<T[K]["hotkey"]>> };
```

Defined in: [app-hotkeys.ts:123](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L123)

The app hotkeys returned by `defineAppHotkeys` for a declaration object.

## Type Parameters

### T

`T` *extends* `Record`\<`string`, [`AppHotkeyInput`](../interfaces/AppHotkeyInput.md)\>
