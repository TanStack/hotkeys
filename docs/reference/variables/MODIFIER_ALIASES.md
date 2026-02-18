---
id: MODIFIER_ALIASES
title: MODIFIER_ALIASES
---

# Variable: MODIFIER\_ALIASES

```ts
const MODIFIER_ALIASES: Record<string, CanonicalModifier | "Mod">;
```

Defined in: [constants.ts:102](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/constants.ts#L102)

Maps modifier key aliases to their canonical form or platform-adaptive 'Mod'.

This map allows users to write hotkeys using various aliases (e.g., 'Ctrl', 'Cmd', 'Option')
which are then normalized to canonical names ('Control', 'Meta', 'Alt') or the
platform-adaptive 'Mod' token.

The 'Mod' and 'CommandOrControl' aliases are resolved at runtime via `resolveModifier()`
based on the detected platform (Command on Mac, Control elsewhere).

## Remarks

Case-insensitive lookups are supported via lowercase variants

## Example

```ts
MODIFIER_ALIASES['Ctrl'] // 'Control'
MODIFIER_ALIASES['Cmd'] // 'Meta'
MODIFIER_ALIASES['Mod'] // 'Mod' (resolved at runtime)
```
