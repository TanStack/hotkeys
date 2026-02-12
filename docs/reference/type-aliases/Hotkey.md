---
id: Hotkey
title: Hotkey
---

# Type Alias: Hotkey

```ts
type Hotkey = 
  | Key
  | SingleModifierHotkey
  | TwoModifierHotkey
  | ThreeModifierHotkey
  | FourModifierHotkey;
```

Defined in: [hotkey.ts:283](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey.ts#L283)

A type-safe hotkey string.

Provides autocomplete for:
- All single keys (letters, numbers, function keys, navigation, editing, punctuation)
- Single modifier + common key (Control+S, Mod+A, Mod+/, etc.)
- Two modifiers + common key (Mod+Shift+S, Control+Alt+A, etc.)
- Three modifiers + common key (Control+Alt+Shift+A, Mod+Alt+Shift+S, etc.)
- Four modifiers + common key (Control+Alt+Shift+Meta+A, etc.)

## Modifier Names

Use canonical modifier names:
- `Control` (not Ctrl) - The Control key
- `Alt` (not Option) - The Alt key (Option on macOS)
- `Meta` (not Command/Cmd) - The Meta/Command key (macOS only)
- `Shift` - The Shift key

## Platform-Adaptive `Mod` Modifier

The `Mod` modifier is a special platform-adaptive modifier that automatically resolves
to the "primary modifier" on each platform:

- **macOS**: `Mod` → `Meta` (Command key ⌘)
- **Windows/Linux**: `Mod` → `Control` (Ctrl key)

This enables cross-platform hotkey definitions that work correctly on all platforms
without platform-specific code. The `Mod` modifier is resolved at runtime based on
the detected platform.

**When to use `Mod` vs platform-specific modifiers:**
- Use `Mod` for cross-platform shortcuts (e.g., `Mod+S` for save)
- Use `Meta` or `Control` when you need platform-specific behavior
- Use `Mod` when you want your shortcuts to follow platform conventions automatically

**Limitations:**
- `Mod+Control` and `Mod+Meta` combinations are not allowed (they create duplicate
  modifiers on one platform)
- In four-modifier combinations, only canonical modifiers are allowed (no `Mod`)

## Example

```ts
// Cross-platform shortcuts (recommended)
const save: Hotkey = 'Mod+S'           // Command+S on Mac, Ctrl+S on Windows/Linux
const saveAs: Hotkey = 'Mod+Shift+S'   // Command+Shift+S on Mac, Ctrl+Shift+S elsewhere
const comment: Hotkey = 'Mod+/'       // Command+/ on Mac, Ctrl+/ elsewhere

// Platform-specific shortcuts
const macOnly: Hotkey = 'Meta+S'       // Command+S on Mac only
const windowsOnly: Hotkey = 'Control+S' // Ctrl+S on Windows/Linux only
```
