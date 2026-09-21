---
id: HotkeyConflict
title: HotkeyConflict
---

```ts
type HotkeyConflict = 
  | {
  registration: HotkeyRegistrationView;
  type: "hotkey";
}
  | {
  registration: SequenceRegistrationView;
  type: "sequence";
};
```

Defined in: [conflicts.ts:11](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/conflicts.ts#L11)
