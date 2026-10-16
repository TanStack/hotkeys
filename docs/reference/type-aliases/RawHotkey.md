---
id: RawHotkey
title: RawHotkey
---

```ts
type RawHotkey = 
  | object & RawModifiers
  | object & RawModifiers;
```

Defined in: [hotkey.types.ts:198](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L198)

A raw hotkey object for programmatic registration.

Like `ParsedHotkey` but without `modifiers` (derived from booleans)
and with optional modifier booleans (default to `false` when omitted).
Use with `HotkeyManager.register()` and `useHotkey()` when you prefer
object form over a string.

The `mod` modifier is platform-adaptive: Command on macOS, Control on Windows/Linux.
Pass `platform` when converting to ParsedHotkey (e.g., via `options.platform`).

## Example

```ts
useHotkey({ key: 'S', mod: true }, handler)             // Mod+S (cross-platform)
useHotkey({ key: 'S', ctrl: true }, handler)            // Control+S
useHotkey({ key: 'Escape' }, handler)                   // Escape (no modifiers)
useHotkey({ key: 'A', shift: true, meta: true }, handler) // Shift+Meta+A
useHotkey({ key: 'S', mod: true, shift: true }, handler)  // Mod+Shift+S
useHotkey({ code: 'KeyW', mod: true }, handler)           // Physical Mod+KeyW
useHotkey({ code: 'NumpadAdd', mod: true }, handler)      // Physical numpad plus
```
