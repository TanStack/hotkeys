---
id: CustomHotkeys
title: CustomHotkeys
---

```ts
type CustomHotkeys<T> = { -readonly [K in keyof T]?: Hotkey | null };
```

Defined in: app-hotkeys.ts:157

The user's hotkeys that differ from the declared defaults, keyed by app
hotkey id. This is the shape to save. `null` means the user unbound it.

## Type Parameters

### T

`T` *extends* [`AppHotkeys`](AppHotkeys.md) = [`RegisteredAppHotkeys`](RegisteredAppHotkeys.md)
