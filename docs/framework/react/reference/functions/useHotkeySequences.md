---
id: useHotkeySequences
title: useHotkeySequences
---

# Function: useHotkeySequences()

```ts
function useHotkeySequences(definitions, commonOptions): void;
```

Defined in: useHotkeySequences.ts:65

React hook for registering multiple keyboard shortcut sequences at once (Vim-style).

Uses the singleton SequenceManager. Accepts a dynamic array of definitions so you can
register variable-length lists without violating the rules of hooks.

Options are merged in this order:
HotkeysProvider defaults < commonOptions < per-definition options

Callbacks and options are synced on every render to avoid stale closures.

Definitions with an empty `sequence` are skipped (no registration).

## Parameters

### definitions

[`UseHotkeySequenceDefinition`](../interfaces/UseHotkeySequenceDefinition.md)[]

Array of sequence definitions to register

### commonOptions

[`UseHotkeySequenceOptions`](../interfaces/UseHotkeySequenceOptions.md) = `{}`

Shared options applied to all sequences (overridden by per-definition options)

## Returns

`void`

## Examples

```tsx
function VimPalette() {
  useHotkeySequences([
    { sequence: ['G', 'G'], callback: () => scrollToTop() },
    { sequence: ['D', 'D'], callback: () => deleteLine() },
    { sequence: ['C', 'I', 'W'], callback: () => changeInnerWord(), options: { timeout: 500 } },
  ])
}
```

```tsx
function DynamicSequences({ items }) {
  useHotkeySequences(
    items.map((item) => ({
      sequence: item.chords,
      callback: item.action,
      options: { enabled: item.enabled },
    })),
    { preventDefault: true },
  )
}
```
