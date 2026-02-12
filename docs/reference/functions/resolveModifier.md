---
id: resolveModifier
title: resolveModifier
---

# Function: resolveModifier()

```ts
function resolveModifier(modifier, platform): CanonicalModifier;
```

Defined in: [constants.ts:153](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/constants.ts#L153)

Resolves the platform-adaptive 'Mod' modifier to the appropriate canonical modifier.

The 'Mod' token represents the "primary modifier" on each platform:
- macOS: 'Meta' (Command key ⌘)
- Windows/Linux: 'Control' (Ctrl key)

This enables cross-platform hotkey definitions like 'Mod+S' that automatically
map to Command+S on Mac and Ctrl+S on Windows/Linux.

## Parameters

### modifier

The modifier to resolve. If 'Mod', resolves based on platform.

`"Mod"` | [`CanonicalModifier`](../type-aliases/CanonicalModifier.md)

### platform

The target platform. Defaults to auto-detection.

`"mac"` | `"windows"` | `"linux"`

## Returns

[`CanonicalModifier`](../type-aliases/CanonicalModifier.md)

The canonical modifier name ('Control', 'Shift', 'Alt', or 'Meta')

## Example

```ts
resolveModifier('Mod', 'mac') // 'Meta'
resolveModifier('Mod', 'windows') // 'Control'
resolveModifier('Control', 'mac') // 'Control' (unchanged)
```
