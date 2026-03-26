---
title: Formatting & Display Guide
id: formatting-display
---

TanStack Hotkeys provides several utilities for formatting hotkey strings into human-readable display text. These utilities handle platform differences automatically, so your UI shows the right symbols and labels for each operating system.

## `formatForDisplay`

The primary formatting function. Returns a platform-aware string using symbols on macOS and text labels on Windows/Linux.

```tsx
import { formatForDisplay } from '@tanstack/solid-hotkeys'

// On macOS (symbols separated by spaces):
formatForDisplay('Mod+S')         // "⌘ S"
formatForDisplay('Mod+Shift+Z')   // "⌘ ⇧ Z"
formatForDisplay('Control+Alt+D') // "⌃ ⌥ D"

// On Windows/Linux:
formatForDisplay('Mod+S')         // "Ctrl+S"
formatForDisplay('Mod+Shift+Z')   // "Ctrl+Shift+Z"
formatForDisplay('Control+Alt+D') // "Ctrl+Alt+D"
```

### Options

```ts
formatForDisplay('Mod+S', {
  platform: 'mac',
  useSymbols: true,
})
```

On macOS, modifier order matches canonical normalization (same as `formatWithLabels`), with **spaces** between symbol segments.

## `formatWithLabels`

Returns human-readable text labels (e.g., "Cmd" instead of the symbol).

```tsx
import { formatWithLabels } from '@tanstack/solid-hotkeys'

formatWithLabels('Mod+S', { platform: 'mac' }) // "Cmd+S"
formatWithLabels('Mod+S', { platform: 'windows' }) // "Ctrl+S"
formatWithLabels('Mod+Shift+Z', { platform: 'mac' }) // "Cmd+Shift+Z"
formatWithLabels('Mod+Shift+Z', { platform: 'windows' }) // "Ctrl+Shift+Z"
```

## Using Formatted Hotkeys in Solid

### Keyboard Shortcut Badges

```tsx
import { formatForDisplay } from '@tanstack/solid-hotkeys'

function ShortcutBadge(props: { hotkey: string }) {
  return <kbd class="shortcut-badge">{formatForDisplay(props.hotkey)}</kbd>
}
```

### Menu Items with Hotkeys

```tsx
import { createHotkey, formatForDisplay } from '@tanstack/solid-hotkeys'

function MenuItem(props: {
  label: string
  hotkey: string
  onAction: () => void
}) {
  createHotkey(props.hotkey, () => props.onAction())

  return (
    <div class="menu-item">
      <span>{props.label}</span>
      <span class="menu-shortcut">{formatForDisplay(props.hotkey)}</span>
    </div>
  )
}
```

### Command Palette Items

```tsx
import { formatForDisplay } from '@tanstack/solid-hotkeys'
import type { Hotkey } from '@tanstack/solid-hotkeys'

interface Command {
  id: string
  label: string
  hotkey?: Hotkey
  action: () => void
}

function CommandPaletteItem(props: { command: Command }) {
  return (
    <div class="command-item" onClick={props.command.action}>
      <span>{props.command.label}</span>
      <Show when={props.command.hotkey}>
        <kbd>{formatForDisplay(props.command.hotkey!)}</kbd>
      </Show>
    </div>
  )
}
```

## Platform Symbols Reference

| Modifier | Mac Symbol | Windows/Linux Label |
|----------|-----------|-------------------|
| Meta (Cmd) | `⌘` | `Win` / `Super` |
| Control | `⌃` | `Ctrl` |
| Alt/Option | `⌥` | `Alt` |
| Shift | `⇧` | `Shift` |

## Parsing and Normalization

### `parseHotkey`

```ts
import { parseHotkey } from '@tanstack/solid-hotkeys'

const parsed = parseHotkey('Mod+Shift+S')
// { key: 'S', ctrl: false, shift: true, alt: false, meta: true, modifiers: [...] }
```

### `normalizeHotkey` and `normalizeRegisterableHotkey`

Core helpers produce a **canonical** hotkey string for storage and registration. When the platform allows `Mod`, the output uses `Mod` and **Mod-first** order.

```ts
import { normalizeHotkey, normalizeRegisterableHotkey } from '@tanstack/solid-hotkeys'

normalizeHotkey('Cmd+S', 'mac')           // 'Mod+S'
normalizeHotkey('Ctrl+Shift+s', 'windows') // 'Mod+Shift+S'

normalizeRegisterableHotkey({ key: 'S', mod: true, shift: true }, 'mac') // 'Mod+Shift+S'
```

Solid primitives normalize registerable hotkeys automatically via `normalizeRegisterableHotkey`.

## Validation

Use `validateHotkey` to check if a hotkey string is valid and get warnings about potential platform issues:

```ts
import { validateHotkey } from '@tanstack/solid-hotkeys'

const result = validateHotkey('Alt+A')
// {
//   valid: true,
//   warnings: ['Alt+letter combinations may not work on macOS due to special characters'],
//   errors: []
// }

const result2 = validateHotkey('InvalidKey+S')
// {
//   valid: false,
//   warnings: [],
//   errors: ['Unknown key: InvalidKey']
// }
```

