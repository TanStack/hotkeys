---
id: createHotkeys
title: createHotkeys
---

```ts
function createHotkeys(hotkeys, commonOptions?): void;
```

Defined in: [createHotkeys.ts:40](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeys.ts#L40)

Solid primitive for registering several hotkeys at once: chords, sequences,
and app hotkeys. Pass an accessor for a reactive list.

Options merge in this order: provider defaults, app hotkey declaration,
commonOptions, per-hotkey options. Each option applies only to the kinds
that support it. Unbound app hotkeys, empty sequences, and `undefined`,
`null`, or `''` hotkeys register nothing.
A `null` target skips registration until it is set.

## Parameters

### hotkeys

  \| readonly [`CreateHotkeyDefinition`](../type-aliases/CreateHotkeyDefinition.md)[]
  \| (() => readonly [`CreateHotkeyDefinition`](../type-aliases/CreateHotkeyDefinition.md)[])

### commonOptions?

  \| [`CreateHotkeyCommonOptions`](../type-aliases/CreateHotkeyCommonOptions.md)
  \| (() => [`CreateHotkeyCommonOptions`](../type-aliases/CreateHotkeyCommonOptions.md))

## Returns

`void`

## Example

```tsx
createHotkeys([
  { hotkey: 'Mod+S', callback: () => save() },
  { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
])
```
