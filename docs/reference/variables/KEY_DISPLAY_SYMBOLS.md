---
id: KEY_DISPLAY_SYMBOLS
title: KEY_DISPLAY_SYMBOLS
---

# Variable: KEY\_DISPLAY\_SYMBOLS

```ts
const KEY_DISPLAY_SYMBOLS: object;
```

Defined in: [constants.ts:589](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/constants.ts#L589)

Special key symbols for display formatting.

Maps certain keys to their visual symbols for better readability in hotkey displays.
Used by formatting functions to show symbols like ↑ for ArrowUp or ↵ for Enter
instead of text labels.

## Type Declaration

### ArrowDown

```ts
readonly ArrowDown: "↓" = '↓';
```

### ArrowLeft

```ts
readonly ArrowLeft: "←" = '←';
```

### ArrowRight

```ts
readonly ArrowRight: "→" = '→';
```

### ArrowUp

```ts
readonly ArrowUp: "↑" = '↑';
```

### Backspace

```ts
readonly Backspace: "⌫" = '⌫';
```

### Delete

```ts
readonly Delete: "⌦" = '⌦';
```

### Enter

```ts
readonly Enter: "↵" = '↵';
```

### Escape

```ts
readonly Escape: "Esc" = 'Esc';
```

### Space

```ts
readonly Space: "␣" = '␣';
```

### Tab

```ts
readonly Tab: "⇥" = '⇥';
```

## Example

```ts
KEY_DISPLAY_SYMBOLS['ArrowUp'] // '↑'
KEY_DISPLAY_SYMBOLS['Enter'] // '↵'
KEY_DISPLAY_SYMBOLS['Escape'] // 'Esc'
KEY_DISPLAY_SYMBOLS['Space'] // '␣'
```
