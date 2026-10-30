---
id: Register
title: Register
---

Defined in: [app-hotkeys.ts:147](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L147)

Register your app hotkeys to type `useAppHotkeys()` and `CustomHotkeys`.

## Example

```ts
declare module '@tanstack/react-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}
```
