---
id: Register
title: Register
---

Defined in: app-hotkeys.ts:141

Register your app hotkeys to type `useAppHotkeys()` and `CustomHotkeys`.

## Example

```ts
declare module '@tanstack/react-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}
```
