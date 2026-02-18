---
id: KEY_DISPLAY_SYMBOLS
title: KEY_DISPLAY_SYMBOLS
---

# Variable: KEY\_DISPLAY\_SYMBOLS

```ts
const KEY_DISPLAY_SYMBOLS: Record<string, string>;
```

Defined in: [constants.ts:505](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/constants.ts#L505)

Special key symbols for display formatting.

Maps certain keys to their visual symbols for better readability in hotkey displays.
Used by formatting functions to show symbols like ↑ for ArrowUp or ↵ for Enter
instead of text labels.

## Example

```ts
KEY_DISPLAY_SYMBOLS['ArrowUp'] // '↑'
KEY_DISPLAY_SYMBOLS['Enter'] // '↵'
KEY_DISPLAY_SYMBOLS['Escape'] // 'Esc'
KEY_DISPLAY_SYMBOLS['Space'] // '␣'
```
