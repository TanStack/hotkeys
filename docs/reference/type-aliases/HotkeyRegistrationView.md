---
id: HotkeyRegistrationView
title: HotkeyRegistrationView
---

```ts
type HotkeyRegistrationView = 
  | HotkeyChordRegistrationView
  | HotkeySequenceRegistrationView;
```

Defined in: [hotkey-manager.ts:190](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-manager.ts#L190)

Public view of a hotkey registration for display and introspection.
Narrow with `kind` to read chord- or sequence-specific fields.
