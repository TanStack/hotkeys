---
id: RegisteredAppHotkeys
title: RegisteredAppHotkeys
---

```ts
type RegisteredAppHotkeys = Register extends object ? T : AppHotkeys;
```

Defined in: app-hotkeys.ts:144

The app hotkeys type from `Register`, or a generic map when none is registered.
