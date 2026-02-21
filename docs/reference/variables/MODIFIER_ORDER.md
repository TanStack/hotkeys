---
id: MODIFIER_ORDER
title: MODIFIER_ORDER
---

# Variable: MODIFIER\_ORDER

```ts
const MODIFIER_ORDER: CanonicalModifier[];
```

Defined in: [constants.ts:68](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/constants.ts#L68)

Canonical order for modifiers in normalized hotkey strings.

Defines the standard order in which modifiers should appear when formatting
hotkeys. This ensures consistent, predictable output across the library.

Order: Control → Alt → Shift → Meta

## Example

```ts
// Input: 'Shift+Control+Meta+S'
// Normalized: 'Control+Alt+Shift+Meta+S' (following MODIFIER_ORDER)
```
