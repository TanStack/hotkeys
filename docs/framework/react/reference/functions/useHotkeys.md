---
id: useHotkeys
title: useHotkeys
---

```ts
function useHotkeys(hotkeys, commonOptions?): void;
```

Defined in: [useHotkeys.ts:61](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkeys.ts#L61)

React hook for registering several hotkeys at once: chords, sequences, and
app hotkeys. Accepts a dynamic array, so it is safe to use with
variable-length lists without violating the rules of hooks.

Options merge in this order: provider defaults, app hotkey declaration,
commonOptions, per-hotkey options. Each option applies only to the kinds
that support it. Callbacks and options sync on every render.

Per-row `enabled: false` keeps that registration (visible in devtools) and
only suppresses firing. Unbound app hotkeys and empty sequences register nothing.

## Parameters

### hotkeys

readonly [`UseHotkeyDefinition`](../type-aliases/UseHotkeyDefinition.md)[]

Hotkeys to register

### commonOptions?

[`UseHotkeyCommonOptions`](../type-aliases/UseHotkeyCommonOptions.md) = `{}`

Options applied to every hotkey (overridden by per-hotkey options)

## Returns

`void`

## Examples

```tsx
function Editor() {
  useHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
    { hotkey: 'Escape', callback: () => close() },
  ])
}
```

```tsx
function MenuShortcuts({ items }) {
  // Dynamic hotkeys from data -- safe because it's a single hook call
  useHotkeys(
    items.map((item) => ({
      hotkey: item.shortcut,
      callback: item.action,
      options: { enabled: item.enabled },
    })),
    { preventDefault: true },
  )
}
```
