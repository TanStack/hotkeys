---
id: createHotkeySequences
title: createHotkeySequences
---

# Function: createHotkeySequences()

```ts
function createHotkeySequences(sequences, commonOptions): void;
```

Defined in: [createHotkeySequences.ts:61](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeySequences.ts#L61)

SolidJS primitive for registering multiple keyboard shortcut sequences at once (Vim-style).

Uses the singleton SequenceManager. Accepts a dynamic array of definitions, or accessors,
so you can react to variable-length lists.

Options are merged in this order:
HotkeysProvider defaults < commonOptions < per-definition options

Definitions with an empty `sequence` are skipped (no registration).

## Parameters

### sequences

Array of sequence definitions, or accessor returning them

[`CreateHotkeySequenceDefinition`](../interfaces/CreateHotkeySequenceDefinition.md)[] | () => [`CreateHotkeySequenceDefinition`](../interfaces/CreateHotkeySequenceDefinition.md)[]

### commonOptions

Shared options for all sequences, or accessor

[`CreateHotkeySequenceOptions`](../interfaces/CreateHotkeySequenceOptions.md) | () => [`CreateHotkeySequenceOptions`](../interfaces/CreateHotkeySequenceOptions.md)

## Returns

`void`

## Examples

```tsx
function VimPalette() {
  createHotkeySequences([
    { sequence: ['G', 'G'], callback: () => scrollToTop() },
    { sequence: ['D', 'D'], callback: () => deleteLine() },
  ])
}
```

```tsx
function Dynamic(props) {
  createHotkeySequences(
    () => props.items.map((item) => ({
      sequence: item.chords,
      callback: item.action,
      options: { enabled: item.enabled },
    })),
    { preventDefault: true },
  )
}
```
