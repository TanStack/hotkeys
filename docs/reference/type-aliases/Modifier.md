---
id: Modifier
title: Modifier
---

# Type Alias: Modifier

```ts
type Modifier = 
  | "Control"
  | "Ctrl"
  | "Shift"
  | "Alt"
  | "Option"
  | "Command"
  | "Cmd"
  | "CommandOrControl"
  | "Mod";
```

Defined in: [hotkey.ts:9](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey.ts#L9)

All supported modifier key names, including aliases.
- Control/Ctrl: The Control key
- Shift: The Shift key
- Alt/Option: The Alt key (Option on macOS)
- Command/Cmd: The Command key (macOS only)
- CommandOrControl/Mod: Command on macOS, Control on other platforms
