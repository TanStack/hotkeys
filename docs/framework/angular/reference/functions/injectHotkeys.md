---
id: injectHotkeys
title: injectHotkeys
---

```ts
function injectHotkeys(hotkeys, commonOptions?): void;
```

Defined in: [injectHotkeys.ts:36](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeys.ts#L36)

Angular inject-based API for registering several hotkeys at once: chords,
sequences, and app hotkeys. Pass a getter for a reactive list.

Options merge in this order: provider defaults, app hotkey declaration,
commonOptions, per-hotkey options. Each option applies only to the kinds
that support it. Unbound app hotkeys and empty sequences register nothing.
A `null` target skips registration until it is set.

## Parameters

### hotkeys

  \| readonly [`InjectHotkeyDefinition`](../type-aliases/InjectHotkeyDefinition.md)[]
  \| (() => readonly [`InjectHotkeyDefinition`](../type-aliases/InjectHotkeyDefinition.md)[])

### commonOptions?

  \| [`InjectHotkeyCommonOptions`](../type-aliases/InjectHotkeyCommonOptions.md)
  \| (() => [`InjectHotkeyCommonOptions`](../type-aliases/InjectHotkeyCommonOptions.md))

## Returns

`void`

## Example

```ts
injectHotkeys([
  { hotkey: 'Mod+S', callback: () => this.save() },
  { hotkey: ['G', 'G'], callback: () => this.scrollToTop(), options: { timeout: 500 } },
])
```
