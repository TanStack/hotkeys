---
id: MAC_MODIFIER_SYMBOLS
title: MAC_MODIFIER_SYMBOLS
---

# Variable: MAC\_MODIFIER\_SYMBOLS

```ts
const MAC_MODIFIER_SYMBOLS: Record<CanonicalModifier, string>;
```

Defined in: [constants.ts:459](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/constants.ts#L459)

Modifier key symbols for macOS display.

Used by formatting functions to display hotkeys with macOS-style symbols
(e.g., ⌘ for Command, ⌃ for Control) instead of text labels. This provides
a native macOS look and feel in hotkey displays.

## Example

```ts
MAC_MODIFIER_SYMBOLS['Meta'] // '⌘'
MAC_MODIFIER_SYMBOLS['Control'] // '⌃'
MAC_MODIFIER_SYMBOLS['Alt'] // '⌥'
MAC_MODIFIER_SYMBOLS['Shift'] // '⇧'
```
