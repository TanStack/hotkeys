---
id: detectPlatform
title: detectPlatform
---

# Function: detectPlatform()

```ts
function detectPlatform(): "mac" | "windows" | "linux";
```

Defined in: [constants.ts:31](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/constants.ts#L31)

Detects the current platform based on browser navigator properties.

Used internally to resolve platform-adaptive modifiers like 'Mod' (Command on Mac,
Control elsewhere) and for platform-specific hotkey formatting.

## Returns

`"mac"` \| `"windows"` \| `"linux"`

The detected platform: 'mac', 'windows', or 'linux'

## Remarks

Defaults to 'linux' in SSR environments where navigator is undefined

## Example

```ts
const platform = detectPlatform() // 'mac' | 'windows' | 'linux'
const modifier = resolveModifier('Mod', platform) // 'Meta' on Mac, 'Control' elsewhere
```
