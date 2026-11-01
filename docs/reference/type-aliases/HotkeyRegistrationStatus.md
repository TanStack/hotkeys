---
id: HotkeyRegistrationStatus
title: HotkeyRegistrationStatus
---

```ts
type HotkeyRegistrationStatus = "active" | "suspended" | "disabled";
```

Defined in: [hotkey-manager.ts:206](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L206)

Whether a registration is on. Focus isn't checked: a registration on an
element also needs focus inside that element to fire.
- `'active'`: enabled, and its scope is active
- `'suspended'`: enabled, but its scope is inactive or suspended by an exclusive scope
- `'disabled'`: registered with `enabled: false`
