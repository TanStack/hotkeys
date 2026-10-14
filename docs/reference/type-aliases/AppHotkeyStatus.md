---
id: AppHotkeyStatus
title: AppHotkeyStatus
---

```ts
type AppHotkeyStatus = "active" | "disabled" | "inactive" | "unbound";
```

Defined in: [app-hotkeys.ts:304](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L304)

Status of an app hotkey in the running app.
- `'active'`: at least one enabled registration
- `'disabled'`: registered, but every registration has `enabled: false`
- `'inactive'`: has a hotkey, but nothing has registered it
- `'unbound'`: no hotkey assigned
