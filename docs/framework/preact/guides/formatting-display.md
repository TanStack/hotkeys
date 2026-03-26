---
title: Formatting & Display Guide
id: formatting-display
---

TanStack Hotkeys provides several utilities for formatting hotkey strings into human-readable display text. These utilities handle platform differences automatically, so your UI shows the right symbols and labels for each operating system.

## `formatForDisplay`

The primary formatting function. Returns a platform-aware string using symbols on macOS and text labels on Windows/Linux.

```tsx
import { formatForDisplay } from '@tanstack/preact-hotkeys'

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

On macOS, modifier order matches canonical normalization (same as `formatWithLabels`), and symbols are joined with **spaces** (e.g., `⌘ ⇧ Z`). On Windows and Linux, modifiers are joined with `+` (e.g., `Ctrl+Shift+Z`).

## `formatWithLabels`

Returns human-readable text labels (e.g., "Cmd" instead of the symbol). Useful when you want readable text rather than symbols.

```tsx
import { formatWithLabels } from '@tanstack/preact-hotkeys'

// On macOS:
formatWithLabels('Mod+S', { platform: 'mac' }) // "Cmd+S"
formatWithLabels('Mod+Shift+Z', { platform: 'mac' }) // "Cmd+Shift+Z"

// On Windows/Linux:
formatWithLabels('Mod+S', { platform: 'windows' }) // "Ctrl+S"
formatWithLabels('Mod+Shift+Z', { platform: 'windows' }) // "Ctrl+Shift+Z"
```

Modifier order matches canonical normalization from the core package.

## Using Formatted Hotkeys in Preact

### Keyboard Shortcut Badges

```tsx
import { formatForDisplay } from '@tanstack/preact-hotkeys'

function ShortcutBadge({ hotkey }: { hotkey: string }) {
  return <kbd className="shortcut-badge">{formatForDisplay(hotkey)}</kbd>
}

// Usage
<ShortcutBadge hotkey="Mod+S" />      // Renders: ⌘ S (Mac) or Ctrl+S (Windows)
<ShortcutBadge hotkey="Mod+Shift+P" /> // Renders: ⌘ ⇧ P (Mac) or Ctrl+Shift+P (Windows)
```

### Menu Items with Hotkeys

```tsx
import { useHotkey, formatForDisplay } from '@tanstack/preact-hotkeys'

function MenuItem({
  label,
  hotkey,
  onAction,
}: {
  label: string
  hotkey: string
  onAction: () => void
}) {
  useHotkey(hotkey, () => onAction())

  return (
    <div className="menu-item">
      <span>{label}</span>
      <span className="menu-shortcut">{formatForDisplay(hotkey)}</span>
    </div>
  )
}

// Usage
<MenuItem label="Save" hotkey="Mod+S" onAction={save} />
<MenuItem label="Undo" hotkey="Mod+Z" onAction={undo} />
<MenuItem label="Find" hotkey="Mod+F" onAction={openFind} />
```

### Command Palette Items

```tsx
import { formatForDisplay } from '@tanstack/preact-hotkeys'
import type { Hotkey } from '@tanstack/preact-hotkeys'

interface Command {
  id: string
  label: string
  hotkey?: Hotkey
  action: () => void
}

function CommandPaletteItem({ command }: { command: Command }) {
  return (
    <div className="command-item" onClick={command.action}>
      <span>{command.label}</span>
      {command.hotkey && (
        <kbd>{formatForDisplay(command.hotkey)}</kbd>
      )}
    </div>
  )
}
```

## Platform Symbols Reference

On macOS, modifiers are displayed as symbols:

| Modifier | Mac Symbol | Windows/Linux Label |
|----------|-----------|-------------------|
| Meta (Cmd) | `⌘` | `Win` / `Super` |
| Control | `⌃` | `Ctrl` |
| Alt/Option | `⌥` | `Alt` |
| Shift | `⇧` | `Shift` |

Special keys also have display symbols:

| Key | Display |
|-----|---------|
| Escape | `Esc` |
| Backspace | `⌫` (Mac) / `Backspace` |
| Delete | `⌦` (Mac) / `Del` |
| Enter | `↵` |
| Tab | `⇥` |
| ArrowUp | `↑` |
| ArrowDown | `↓` |
| ArrowLeft | `←` |
| ArrowRight | `→` |
| Space | `Space` |

## Parsing and Normalization

TanStack Hotkeys also provides utilities for parsing and normalizing hotkey strings:

### `parseHotkey`

Parse a hotkey string into its component parts:

```ts
import { parseHotkey } from '@tanstack/preact-hotkeys'

const parsed = parseHotkey('Mod+Shift+S')
// {
//   key: 'S',
//   ctrl: false,   // true on Windows/Linux
//   shift: true,
//   alt: false,
//   meta: true,    // true on Mac
//   modifiers: ['Shift', 'Meta']  // or ['Control', 'Shift'] on Windows
// }
```

### `normalizeHotkey` and `normalizeRegisterableHotkey`

Core helpers produce a **canonical** hotkey string for storage and registration. When the platform allows `Mod` (Command on Mac without Control; Control on Windows/Linux without Meta), the output uses `Mod` and **Mod-first** modifier order (`Mod+Shift+E`), not expanded `Meta`/`Control`.

```ts
import { normalizeHotkey, normalizeRegisterableHotkey } from '@tanstack/preact-hotkeys'

normalizeHotkey('Cmd+S', 'mac')           // 'Mod+S'
normalizeHotkey('Ctrl+Shift+s', 'windows') // 'Mod+Shift+S'
normalizeHotkey('Shift+Meta+E', 'mac')    // 'Mod+Shift+E'

// String or RawHotkey — same string adapters use internally:
normalizeRegisterableHotkey({ key: 'S', mod: true, shift: true }, 'mac') // 'Mod+Shift+S'
```

Framework hooks normalize registerable hotkeys automatically via `normalizeRegisterableHotkey`.

## Validation

Use `validateHotkey` to check if a hotkey string is valid and get warnings about potential platform issues:

```ts
import { validateHotkey } from '@tanstack/preact-hotkeys'

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

